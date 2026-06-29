'use server'

import { adminDb } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { config } from './template.config'

const APPOINTMENTS_TABLE = `${config.prefix}_appointments` as const

export type BookingResult = { success: true } | { error: string }

export async function bookAppointment(formData: FormData): Promise<BookingResult> {
  const serviceId = formData.get('service_id') as string
  const variantId = formData.get('variant_id') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const name = (formData.get('customer_name') as string)?.trim()
  const phone = (formData.get('customer_phone') as string)?.trim()
  const message = formData.get('message') as string | null

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

  const { error } = await db.from(APPOINTMENTS_TABLE).insert({
    service_id: serviceId,
    variant_id: variantId || null,
    appointment_date: date,
    appointment_time: time + ':00',
    customer_name: name,
    customer_phone: phone,
    message: message || null,
    status: 'pending',
  })

  if (error) {
    if (error.code === '23505')
      return { error: 'Este horario ya fue reservado. Elige otro.' }
    return { error: 'No se pudo guardar tu cita. Intenta de nuevo.' }
  }

  // Invalida toda la sub-ruta del template (slots en servicios/[slug] incluidos)
  revalidatePath('/salon-unas', 'layout')
  return { success: true }
}
