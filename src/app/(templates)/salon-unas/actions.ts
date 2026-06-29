'use server'

import { adminDb } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { config } from './template.config'

const APPOINTMENTS_TABLE = `${config.prefix}_appointments` as const
const PAYMENTS_TABLE     = `${config.prefix}_payments`     as const
const SERVICES_TABLE     = `${config.prefix}_services`     as const
const VARIANTS_TABLE     = `${config.prefix}_service_variants` as const

export type BookingResult = { success: true; refCode: string } | { error: string }

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
  const payMethod  = (formData.get('payment_method') as string) || 'cash'
  const message    = formData.get('message') as string | null

  if (!serviceId || !date || !time || !name || !phone) {
    return { error: 'Completa todos los campos requeridos.' }
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

  // Fetch price (variant takes precedence over base service price)
  let amount = 0
  if (variantId) {
    const { data: variant } = await db
      .from(VARIANTS_TABLE)
      .select('price')
      .eq('id', variantId)
      .single()
    amount = variant?.price ?? 0
  }
  if (!amount) {
    const { data: svc } = await db
      .from(SERVICES_TABLE)
      .select('price')
      .eq('id', serviceId)
      .single()
    amount = svc?.price ?? 0
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

  // Persiste el pago con el código de referencia
  await db.from(PAYMENTS_TABLE).insert({
    appointment_id:    appt.id,
    method:            payMethod,
    status:            'pending',
    amount:            amount || 0,
    confirmation_code: refCode,
  })

  // Invalida toda la sub-ruta del template (slots en servicios/[slug] incluidos)
  revalidatePath('/salon-unas', 'layout')
  return { success: true, refCode }
}
