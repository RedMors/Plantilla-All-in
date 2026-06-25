'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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

  const { count } = await db
    .from('nail_appointments')
    .select('id', { count: 'exact', head: true })
    .eq('service_id', serviceId)
    .eq('appointment_date', date)
    .eq('appointment_time', time + ':00')
    .in('status', ['pending', 'confirmed'])

  if (count && count > 0) {
    return { error: 'Este horario ya fue reservado. Elige otro.' }
  }

  const { error } = await db.from('nail_appointments').insert({
    service_id: serviceId,
    variant_id: variantId || null,
    appointment_date: date,
    appointment_time: time + ':00',
    customer_name: name,
    customer_phone: phone,
    message: message || null,
    status: 'pending',
  })

  if (error) return { error: 'No se pudo guardar tu cita. Intenta de nuevo.' }

  revalidatePath('/salon-unas')
  return { success: true }
}
