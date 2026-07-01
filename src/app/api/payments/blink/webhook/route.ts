import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/supabase/admin'
import { verifyBlinkSecret } from '@/lib/payments/lightning'
import { config } from '@/app/(templates)/salon-unas/template.config'

const PAYMENTS_TABLE     = `${config.prefix}_payments`     as const
const APPOINTMENTS_TABLE = `${config.prefix}_appointments` as const
const ORDERS_TABLE       = `${config.prefix}_orders`       as const

/**
 * Webhook de Blink (Lightning).
 * Registrar en Blink como: {APP_URL}/api/payments/blink/webhook?secret=<BLINK_WEBHOOK_SECRET>
 *
 * Payload: { type: 'transaction.ln.receive', data: { paymentHash, status } }
 * Guardamos `paymentHash` en provider_reference al crear el invoice → lookup directo.
 * El polling de checkLightningPayment() es el fallback fiable si el webhook no llega.
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (!verifyBlinkSecret(config.prefix, searchParams.get('secret'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType   = String(payload?.type ?? '')
  const paymentHash = payload?.data?.paymentHash ?? payload?.data?.payment_hash ?? ''
  const status      = String(payload?.data?.status ?? '')

  // Solo eventos de recepción Lightning con hash
  if (!eventType.includes('ln') || !eventType.includes('receive') || !paymentHash) {
    return NextResponse.json({ ok: true })
  }
  // Nunca marcar pagado sin un estado de éxito explícito
  if (status !== 'SUCCESS' && status !== 'PAID') {
    return NextResponse.json({ ok: true })
  }

  try {
    const db = adminDb()

    // ── 1) ¿Es el pago de una CITA? (nail_payments) ──────────────────────────
    const { data: pay } = await db
      .from(PAYMENTS_TABLE)
      .select('id, status, appointment_id')
      .eq('provider_reference', paymentHash)
      .eq('method', 'lightning')
      .maybeSingle()

    if (pay) {
      if (pay.status === 'paid') return NextResponse.json({ ok: true, info: 'already_paid' })
      await db.from(PAYMENTS_TABLE).update({ status: 'paid', paid_at: new Date().toISOString(), provider_payload: payload }).eq('id', pay.id)
      await db.from(APPOINTMENTS_TABLE).update({ status: 'confirmed' }).eq('id', pay.appointment_id)
      return NextResponse.json({ ok: true, kind: 'appointment', paid: true })
    }

    // ── 2) ¿Es un PEDIDO de la tienda? (nail_orders) ─────────────────────────
    const { data: order } = await db
      .from(ORDERS_TABLE)
      .select('id, status')
      .eq('provider_reference', paymentHash)
      .maybeSingle()

    if (order && order.status !== 'paid') {
      await db.from(ORDERS_TABLE).update({ status: 'paid', paid_at: new Date().toISOString(), provider_payload: payload }).eq('id', order.id)
      await db.rpc('nail_apply_order_stock', { p_order_id: order.id })  // descuenta stock (idempotente)
      return NextResponse.json({ ok: true, kind: 'order', paid: true })
    }

    return NextResponse.json({ ok: true, info: 'not_found_or_already_paid' })
  } catch (err) {
    console.error('[Blink webhook] error inesperado:', err)
    return NextResponse.json({ ok: true, error: 'internal_error' })
  }
}
