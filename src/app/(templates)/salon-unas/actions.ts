'use server'

import { adminDb } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { config } from './template.config'
import { createWompiPaymentLink } from '@/lib/payments/wompi'
import { createLightningInvoice, getLightningStatus } from '@/lib/payments/lightning'

const APPOINTMENTS_TABLE = `${config.prefix}_appointments` as const
const PAYMENTS_TABLE     = `${config.prefix}_payments`     as const
const SERVICES_TABLE     = `${config.prefix}_services`     as const
const VARIANTS_TABLE     = `${config.prefix}_service_variants` as const

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export type BookingResult =
  | { success: true; method: 'cash';      refCode: string }
  | { success: true; method: 'card';      refCode: string; redirectUrl: string }
  | { success: true; method: 'lightning'; refCode: string; paymentId: string; bolt11: string; expiresAt: string }
  | { error: string }

function generateRef(date: string): string {
  const d = date.replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${config.prefix.toUpperCase()}-${d}-${rand}`
}

export async function bookAppointment(formData: FormData): Promise<BookingResult> {
  const serviceId  = formData.get('service_id')      as string
  const variantId  = formData.get('variant_id')      as string
  const date       = formData.get('date')            as string
  const time       = formData.get('time')            as string
  const name       = (formData.get('customer_name')  as string)?.trim()
  const phone      = (formData.get('customer_phone') as string)?.trim()
  const email      = (formData.get('customer_email') as string | null)?.trim() || null
  const payMethodRaw = (formData.get('payment_method') as string) || 'cash'
  const message      = formData.get('message') as string | null

  if (!serviceId || !date || !time || !name || !phone) {
    return { error: 'Completa todos los campos requeridos.' }
  }

  const VALID_METHODS = ['cash', 'card', 'lightning'] as const
  type PayMethod = typeof VALID_METHODS[number]
  if (!VALID_METHODS.includes(payMethodRaw as PayMethod)) {
    return { error: 'Método de pago inválido.' }
  }
  const payMethod = payMethodRaw as PayMethod

  // Solo se ofrecen los métodos habilitados en la config de la plantilla
  if (!config.methods.includes(payMethod)) {
    return { error: 'Ese método de pago no está disponible.' }
  }

  const db = adminDb()

  // Rate limiting: máximo 2 citas pending por número de teléfono
  const { count: pendingByPhone } = await db
    .from(APPOINTMENTS_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('customer_phone', phone)
    .eq('status', 'pending')

  if ((pendingByPhone ?? 0) >= 2) {
    return { error: 'Ya tienes 2 citas pendientes. Espera a que sean confirmadas.' }
  }

  const { count } = await db
    .from(APPOINTMENTS_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('service_id', serviceId)
    .eq('appointment_date', date)
    .eq('appointment_time', time + ':00')
    .in('status', ['pending', 'confirmed'])

  if (count && count > 0) {
    return { error: 'Este horario ya fue reservado. Elige otro.' }
  }

  // Fetch precio + nombre (la variante manda sobre el precio base del servicio)
  let amount = 0
  let serviceName = config.name
  const { data: svc } = await db
    .from(SERVICES_TABLE)
    .select('name, price')
    .eq('id', serviceId)
    .single()
  if (svc) {
    serviceName = svc.name ?? serviceName
    amount = svc.price ?? 0
  }
  if (variantId) {
    const { data: variant } = await db
      .from(VARIANTS_TABLE)
      .select('name, price')
      .eq('id', variantId)
      .single()
    if (variant?.price) amount = variant.price
    if (variant?.name)  serviceName = `${serviceName} — ${variant.name}`
  }

  // Pagos en línea (Wompi / Lightning) requieren un monto real
  if (payMethod !== 'cash' && amount <= 0) {
    return { error: 'Este servicio no tiene precio configurado para pago en línea.' }
  }

  const { data: appt, error } = await db
    .from(APPOINTMENTS_TABLE)
    .insert({
      service_id:       serviceId,
      variant_id:       variantId || null,
      appointment_date: date,
      appointment_time: time + ':00',
      customer_name:    name,
      customer_phone:   phone,
      customer_email:   email,
      message:          message || null,
      status:           'pending',
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505')
      return { error: 'Este horario ya fue reservado. Elige otro.' }
    return { error: 'No se pudo guardar tu cita. Intenta de nuevo.' }
  }

  const refCode = generateRef(date)

  const { data: payRow, error: payError } = await db
    .from(PAYMENTS_TABLE)
    .insert({
      appointment_id:    appt.id,
      method:            payMethod,
      status:            'pending',
      amount:            amount > 0 ? amount : 0.01,
      confirmation_code: refCode,
    })
    .select('id')
    .single()

  if (payError || !payRow) {
    console.error('[bookAppointment] payments insert failed:', payError?.message)
    // La cita ya fue creada — no la revertimos. Tratamos como efectivo sin código.
    revalidatePath('/salon-unas', 'layout')
    return { success: true, method: 'cash', refCode: '' }
  }

  // ── Efectivo: nada que cobrar en línea ──────────────────────────────────────
  if (payMethod === 'cash') {
    revalidatePath('/salon-unas', 'layout')
    return { success: true, method: 'cash', refCode }
  }

  // ── Tarjeta (Wompi) / Lightning (Blink): iniciar el cobro ───────────────────
  try {
    if (payMethod === 'card') {
      const { urlEnlace, idEnlace } = await createWompiPaymentLink({
        prefix:      config.prefix,
        reference:   appt.id,                       // = identificadorEnlaceComercio en el webhook
        amountUsd:   amount,
        productName: `${config.name} — ${serviceName}`,
        redirectUrl: `${APP_URL}/salon-unas/servicios?pago=ok`,
        webhookUrl:  `${APP_URL}/api/payments/wompi/webhook`,
      })
      await db
        .from(PAYMENTS_TABLE)
        .update({ provider_reference: appt.id, provider_url: urlEnlace, provider_payload: { idEnlace } })
        .eq('id', payRow.id)

      revalidatePath('/salon-unas', 'layout')
      return { success: true, method: 'card', refCode, redirectUrl: urlEnlace }
    }

    // lightning
    const invoice = await createLightningInvoice({
      prefix:      config.prefix,
      amountCents: Math.round(amount * 100),
      memo:        `${config.name} — ${serviceName}`,
    })
    await db
      .from(PAYMENTS_TABLE)
      .update({
        provider_reference: invoice.paymentHash,
        provider_payload:   { bolt11: invoice.bolt11, expiresAt: invoice.expiresAt },
      })
      .eq('id', payRow.id)

    revalidatePath('/salon-unas', 'layout')
    return {
      success:   true,
      method:    'lightning',
      refCode,
      paymentId: payRow.id,
      bolt11:    invoice.bolt11,
      expiresAt: invoice.expiresAt,
    }
  } catch (e) {
    console.error('[bookAppointment] payment init failed:', e)
    // El cobro no arrancó: borramos la cita para liberar el horario (el pago cae por cascade).
    // Si no, la cita 'pending' bloquearía ese slot aunque nunca se generó un enlace/invoice.
    await db.from(APPOINTMENTS_TABLE).delete().eq('id', appt.id)
    return { error: 'No se pudo iniciar el pago. Intenta de nuevo o elige otro método.' }
  }
}

/**
 * Polling de un pago Lightning desde el cliente (fallback fiable al webhook de Blink).
 * Si Blink confirma el pago, marca el payment 'paid' y la cita 'confirmed'.
 */
export async function checkLightningPayment(
  paymentId: string,
): Promise<{ status: 'pending' | 'paid' | 'expired' } | { error: string }> {
  if (!paymentId) return { error: 'Falta paymentId.' }
  const db = adminDb()

  const { data: pay } = await db
    .from(PAYMENTS_TABLE)
    .select('id, status, appointment_id, provider_payload')
    .eq('id', paymentId)
    .single()

  if (!pay) return { error: 'Pago no encontrado.' }
  if (pay.status === 'paid')    return { status: 'paid' }
  if (pay.status === 'expired') return { status: 'expired' }

  const bolt11 = (pay.provider_payload as { bolt11?: string } | null)?.bolt11
  if (!bolt11) return { error: 'Invoice no disponible.' }

  let status: 'PENDING' | 'PAID' | 'EXPIRED'
  try {
    status = await getLightningStatus(config.prefix, bolt11)
  } catch (e) {
    console.error('[checkLightningPayment] Blink status error:', e)
    return { status: 'pending' }
  }

  if (status === 'PAID') {
    await db.from(PAYMENTS_TABLE).update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', pay.id)
    await db.from(APPOINTMENTS_TABLE).update({ status: 'confirmed' }).eq('id', pay.appointment_id)
    revalidatePath('/salon-unas', 'layout')
    return { status: 'paid' }
  }
  if (status === 'EXPIRED') {
    await db.from(PAYMENTS_TABLE).update({ status: 'expired' }).eq('id', pay.id)
    return { status: 'expired' }
  }
  return { status: 'pending' }
}
