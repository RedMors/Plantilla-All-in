'use server'

import { adminDb } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { createWompiPaymentLink } from '@/lib/payments/wompi'
import { createLightningInvoice, getLightningStatus } from '@/lib/payments/lightning'
import type { TemplatePaymentConfig } from '@/lib/payments/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Ambos skins (full/lite) comparten datos — revalidar los dos siempre, sin importar
// desde cuál se originó el pedido, porque un cambio en uno se refleja en el otro.
const ALL_SKIN_BASE_PATHS = ['/salon-unas', '/salon-unas-lite'] as const

export type CheckoutInput = {
  basePath: string   // '/salon-unas' | '/salon-unas-lite' — para el redirect de vuelta tras pagar
  items: { id: string; quantity: number }[]
  name: string
  phone: string
  email?: string
  method: 'cash' | 'card' | 'lightning'
}

export type CheckoutResult =
  | { success: true; method: 'cash';      orderId: string; confirmationCode: string }
  | { success: true; method: 'card';      orderId: string; redirectUrl: string }
  | { success: true; method: 'lightning'; orderId: string; bolt11: string; expiresAt: string }
  | { error: string }

function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return 'TIENDA-' + Array.from(bytes, b => chars[b % chars.length]).join('')
}

export async function createOrder(config: TemplatePaymentConfig, input: CheckoutInput): Promise<CheckoutResult> {
  const ORDERS      = `${config.prefix}_orders`      as const
  const ORDER_ITEMS = `${config.prefix}_order_items` as const
  const PRODUCTS     = `${config.prefix}_products`    as const

  const name  = input.name?.trim()
  const phone = input.phone?.trim()
  const email = input.email?.trim() || null

  if (!name || !phone) return { error: 'Nombre y teléfono son requeridos.' }
  if (!input.items?.length) return { error: 'Tu carrito está vacío.' }
  if (!config.methods.includes(input.method)) return { error: 'Método de pago no disponible.' }

  const db = adminDb()

  // Precios y stock SIEMPRE desde la DB — nunca confiar en lo que manda el cliente
  const ids = [...new Set(input.items.map(i => i.id))]
  const { data: products, error: prodErr } = await db
    .from(PRODUCTS)
    .select('id, name, price, stock, is_active')
    .in('id', ids)

  if (prodErr) return { error: 'No se pudo validar el carrito. Intenta de nuevo.' }

  const map = new Map((products ?? []).map(p => [p.id, p]))
  let total = 0
  const lines: { product_id: string; product_name: string; unit_price: number; quantity: number }[] = []

  for (const item of input.items) {
    const p = map.get(item.id)
    const qty = Math.floor(item.quantity)
    if (!p || !p.is_active) return { error: 'Un producto ya no está disponible. Actualiza tu carrito.' }
    if (qty <= 0) return { error: 'Cantidad inválida.' }
    if (p.stock < qty) return { error: `"${p.name}" solo tiene ${p.stock} en stock.` }
    total += Number(p.price) * qty
    lines.push({ product_id: p.id, product_name: p.name, unit_price: Number(p.price), quantity: qty })
  }

  if (total <= 0) return { error: 'El total del pedido es inválido.' }

  // Crear pedido
  const code = genCode()
  const { data: order, error: orderErr } = await db
    .from(ORDERS)
    .insert({
      customer_name: name, customer_phone: phone, customer_email: email,
      status: 'pending', total, method: input.method, confirmation_code: code,
    })
    .select('id')
    .single()

  if (orderErr || !order) return { error: 'No se pudo crear el pedido. Intenta de nuevo.' }

  // Líneas del pedido
  const { error: itemsErr } = await db
    .from(ORDER_ITEMS)
    .insert(lines.map(l => ({ ...l, order_id: order.id })))
  if (itemsErr) {
    await db.from(ORDERS).delete().eq('id', order.id)
    return { error: 'No se pudo registrar el pedido. Intenta de nuevo.' }
  }

  // Efectivo: nada que cobrar en línea
  if (input.method === 'cash') {
    for (const p of ALL_SKIN_BASE_PATHS) revalidatePath(`${p}/admin/tienda`)
    return { success: true, method: 'cash', orderId: order.id, confirmationCode: code }
  }

  // Tarjeta / Lightning: iniciar cobro (reusa la lib de pagos)
  try {
    if (input.method === 'card') {
      const { urlEnlace, idEnlace } = await createWompiPaymentLink({
        prefix:      config.prefix,
        reference:   order.id,
        amountUsd:   total,
        productName: `${config.name} — Tienda`,
        redirectUrl: `${APP_URL}${input.basePath}/tienda?pago=ok`,
        webhookUrl:  `${APP_URL}/api/payments/wompi/webhook`,
      })
      await db.from(ORDERS)
        .update({ provider_reference: order.id, provider_url: urlEnlace, provider_payload: { idEnlace } })
        .eq('id', order.id)
      return { success: true, method: 'card', orderId: order.id, redirectUrl: urlEnlace }
    }

    const invoice = await createLightningInvoice({
      prefix:      config.prefix,
      amountCents: Math.round(total * 100),
      memo:        `${config.name} — Tienda`,
    })
    await db.from(ORDERS)
      .update({ provider_reference: invoice.paymentHash, provider_payload: { bolt11: invoice.bolt11, expiresAt: invoice.expiresAt } })
      .eq('id', order.id)
    return { success: true, method: 'lightning', orderId: order.id, bolt11: invoice.bolt11, expiresAt: invoice.expiresAt }
  } catch (e) {
    console.error('[createOrder] payment init failed:', e)
    await db.from(ORDERS).delete().eq('id', order.id)  // libera el pedido (cascade borra líneas)
    return { error: 'No se pudo iniciar el pago. Intenta de nuevo o elige otro método.' }
  }
}

/**
 * Polling del pago Lightning de un pedido (fallback al webhook de Blink).
 * Si Blink confirma, marca el pedido pagado y descuenta stock (idempotente vía RPC).
 */
export async function checkOrderPayment(
  config: TemplatePaymentConfig,
  orderId: string,
): Promise<{ status: 'pending' | 'paid' | 'expired' } | { error: string }> {
  if (!orderId) return { error: 'Falta orderId.' }
  const ORDERS = `${config.prefix}_orders` as const
  const db = adminDb()

  const { data: order } = await db
    .from(ORDERS)
    .select('id, status, provider_payload')
    .eq('id', orderId)
    .single()

  if (!order) return { error: 'Pedido no encontrado.' }
  if (order.status === 'paid')    return { status: 'paid' }
  if (order.status === 'expired') return { status: 'expired' }

  const bolt11 = (order.provider_payload as { bolt11?: string } | null)?.bolt11
  if (!bolt11) return { error: 'Invoice no disponible.' }

  let status: 'PENDING' | 'PAID' | 'EXPIRED'
  try {
    status = await getLightningStatus(config.prefix, bolt11)
  } catch (e) {
    console.error('[checkOrderPayment] Blink status error:', e)
    return { status: 'pending' }
  }

  if (status === 'PAID') {
    await db.from(ORDERS).update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', order.id)
    await db.rpc('nail_apply_order_stock', { p_order_id: order.id })
    for (const p of ALL_SKIN_BASE_PATHS) revalidatePath(`${p}/tienda`)
    return { status: 'paid' }
  }
  if (status === 'EXPIRED') {
    await db.from(ORDERS).update({ status: 'expired' }).eq('id', order.id)
    return { status: 'expired' }
  }
  return { status: 'pending' }
}
