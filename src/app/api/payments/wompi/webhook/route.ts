import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/supabase/admin'
import { verifyWompiWebhook } from '@/lib/payments/wompi'
import { config } from '@/app/(templates)/salon-unas/template.config'

const PAYMENTS_TABLE     = `${config.prefix}_payments`     as const
const APPOINTMENTS_TABLE = `${config.prefix}_appointments` as const

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

    const db = adminDb()
    const { data: pay } = await db
      .from(PAYMENTS_TABLE)
      .select('id, status, appointment_id')
      .eq('provider_reference', reference)
      .eq('method', 'card')
      .maybeSingle()

    if (!pay) {
      console.warn(`[Wompi webhook] pago no encontrado para reference=${reference}`)
      return NextResponse.json({ received: true, warning: 'payment_not_found' })
    }

    if (pay.status === 'paid') {
      return NextResponse.json({ received: true, info: 'already_paid' })
    }

    if (approved) {
      await db
        .from(PAYMENTS_TABLE)
        .update({ status: 'paid', paid_at: new Date().toISOString(), provider_payload: payload })
        .eq('id', pay.id)
      await db
        .from(APPOINTMENTS_TABLE)
        .update({ status: 'confirmed' })
        .eq('id', pay.appointment_id)
    } else {
      await db
        .from(PAYMENTS_TABLE)
        .update({ status: 'failed', provider_payload: payload })
        .eq('id', pay.id)
    }

    return NextResponse.json({ received: true, paid: approved })
  } catch (err) {
    console.error('[Wompi webhook] error inesperado:', err)
    // 200 igual — evita reintentos infinitos de Wompi
    return NextResponse.json({ received: true, error: 'internal_error' })
  }
}
