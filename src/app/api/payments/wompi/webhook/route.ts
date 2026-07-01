import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/supabase/admin'
import { verifyWompiWebhook } from '@/lib/payments/wompi'
import { config } from '@/app/(templates)/salon-unas/template.config'

const PAYMENTS_TABLE     = `${config.prefix}_payments`     as const
const APPOINTMENTS_TABLE = `${config.prefix}_appointments` as const
const ORDERS_TABLE       = `${config.prefix}_orders`       as const

/**
 * Webhook de Wompi SV — POST cuando una transacción de EnlacePago cambia de estado.
 * Payload real (PascalCase). `EnlacePago.IdentificadorEnlaceComercio` = appointmentId
 * que enviamos como `reference` al crear el enlace.
 *
 * Validación: wompi_hash = HMAC_SHA256(rawBody, secret) en hex.
 * Siempre respondemos 200 (salvo firma inválida) para que Wompi no reintente infinito.
 */
export async function POST(req: NextRequest) {
  const rawBody   = await req.text()
  const wompiHash = req.headers.get('wompi_hash') ?? req.headers.get('wompi-hash') ?? ''

  if (!verifyWompiWebhook({ prefix: config.prefix, rawBody, receivedHash: wompiHash })) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    const enlace = (payload.EnlacePago ?? {}) as { IdentificadorEnlaceComercio?: string }
    const reference =
      enlace.IdentificadorEnlaceComercio ??
      (payload.IdentificadorEnlaceComercio as string | undefined) ??
      ''

    if (!reference) {
      console.warn('[Wompi webhook] sin IdentificadorEnlaceComercio — ignorando')
      return NextResponse.json({ received: true, warning: 'no_reference' })
    }

    const resultado = String(payload.ResultadoTransaccion ?? '')
    const approved  = /aprobada/i.test(resultado) || /^exitosa/i.test(resultado)

    const montoPagado = Number(payload.Monto ?? 0)
    const db = adminDb()

    // ── 1) ¿Es el pago de una CITA? (nail_payments) ──────────────────────────
    const { data: pay } = await db
      .from(PAYMENTS_TABLE)
      .select('id, status, appointment_id, amount')
      .eq('provider_reference', reference)
      .eq('method', 'card')
      .maybeSingle()

    if (pay) {
      if (pay.status === 'paid') return NextResponse.json({ received: true, info: 'already_paid' })
      if (approved && Math.abs(montoPagado - Number(pay.amount)) > 0.01) {
        console.error(`[Wompi webhook] cita: monto no coincide (esperado ${pay.amount}, recibido ${montoPagado})`)
        return NextResponse.json({ received: true, warning: 'amount_mismatch' })
      }
      if (approved) {
        await db.from(PAYMENTS_TABLE).update({ status: 'paid', paid_at: new Date().toISOString(), provider_payload: payload }).eq('id', pay.id)
        await db.from(APPOINTMENTS_TABLE).update({ status: 'confirmed' }).eq('id', pay.appointment_id)
      } else {
        await db.from(PAYMENTS_TABLE).update({ status: 'failed', provider_payload: payload }).eq('id', pay.id)
      }
      return NextResponse.json({ received: true, kind: 'appointment', paid: approved })
    }

    // ── 2) ¿Es un PEDIDO de la tienda? (nail_orders) ─────────────────────────
    const { data: order } = await db
      .from(ORDERS_TABLE)
      .select('id, status, total')
      .eq('provider_reference', reference)
      .maybeSingle()

    if (order) {
      if (order.status === 'paid') return NextResponse.json({ received: true, info: 'already_paid' })
      if (approved && Math.abs(montoPagado - Number(order.total)) > 0.01) {
        console.error(`[Wompi webhook] pedido: monto no coincide (esperado ${order.total}, recibido ${montoPagado})`)
        return NextResponse.json({ received: true, warning: 'amount_mismatch' })
      }
      if (approved) {
        await db.from(ORDERS_TABLE).update({ status: 'paid', paid_at: new Date().toISOString(), provider_payload: payload }).eq('id', order.id)
        await db.rpc('nail_apply_order_stock', { p_order_id: order.id })  // descuenta stock (idempotente)
      } else {
        await db.from(ORDERS_TABLE).update({ status: 'failed', provider_payload: payload }).eq('id', order.id)
      }
      return NextResponse.json({ received: true, kind: 'order', paid: approved })
    }

    console.warn(`[Wompi webhook] ni cita ni pedido para reference=${reference}`)
    return NextResponse.json({ received: true, warning: 'not_found' })
  } catch (err) {
    console.error('[Wompi webhook] error inesperado:', err)
    // 200 igual — evita reintentos infinitos de Wompi
    return NextResponse.json({ received: true, error: 'internal_error' })
  }
}
