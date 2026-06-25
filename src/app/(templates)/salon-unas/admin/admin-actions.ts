'use server'

import { adminDb } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(id: string, status: 'confirmed' | 'completed' | 'cancelled') {
  const db = adminDb()
  const { error } = await db
    .from('nail_appointments')
    .update({ status })
    .eq('id', id)

  if (error) return { error: 'No se pudo actualizar el estado.' }
  revalidatePath('/salon-unas/admin')
  revalidatePath('/salon-unas/admin/citas')
  return { success: true }
}

export async function addManualSale(formData: FormData) {
  const description = (formData.get('description') as string)?.trim()
  const amount = parseFloat(formData.get('amount') as string)
  const payment_method = formData.get('payment_method') as string
  const sale_date = formData.get('sale_date') as string
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!description || isNaN(amount) || amount <= 0) {
    return { error: 'Descripción y monto son requeridos.' }
  }

  const db = adminDb()
  const { error } = await db.from('nail_manual_sales').insert({
    description,
    amount,
    payment_method,
    sale_date: sale_date || new Date().toISOString().split('T')[0],
    notes,
  })

  if (error) return { error: 'No se pudo guardar la venta.' }
  revalidatePath('/salon-unas/admin')
  revalidatePath('/salon-unas/admin/ventas')
  return { success: true }
}
