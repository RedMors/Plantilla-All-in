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

  const VALID_PAYMENT_METHODS = ['efectivo', 'transferencia', 'tarjeta']
  if (!description || isNaN(amount) || amount <= 0) {
    return { error: 'Descripción y monto son requeridos.' }
  }
  if (!VALID_PAYMENT_METHODS.includes(payment_method)) {
    return { error: 'Método de pago inválido.' }
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

// ── Servicios CRUD ────────────────────────────────────────────────────────────

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createService(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim() || slugify(name)
  const emoji = (formData.get('emoji') as string)?.trim() || null
  const tagline = (formData.get('tagline') as string)?.trim() || null
  const description = (formData.get('description') as string)?.trim() || null
  const price = parseFloat(formData.get('price') as string)
  const sort_order = parseInt(formData.get('sort_order') as string) || 0
  const includesRaw = (formData.get('includes') as string)?.trim()
  const includes = includesRaw ? includesRaw.split('\n').map(s => s.trim()).filter(Boolean) : []

  if (!name || isNaN(price) || price < 0) return { error: 'Nombre y precio son requeridos.' }
  if (!slug) return { error: 'Slug inválido.' }

  const db = adminDb()
  const { error } = await db.from('nail_services').insert({
    name, slug, emoji, tagline, description, price, sort_order, includes, active: true,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un servicio con ese slug.' }
    return { error: 'No se pudo crear el servicio.' }
  }
  revalidatePath('/salon-unas/admin/servicios')
  revalidatePath('/salon-unas')
  return { success: true }
}

export async function updateService(formData: FormData) {
  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim()
  const emoji = (formData.get('emoji') as string)?.trim() || null
  const tagline = (formData.get('tagline') as string)?.trim() || null
  const description = (formData.get('description') as string)?.trim() || null
  const price = parseFloat(formData.get('price') as string)
  const sort_order = parseInt(formData.get('sort_order') as string) || 0
  const includesRaw = (formData.get('includes') as string)?.trim()
  const includes = includesRaw ? includesRaw.split('\n').map(s => s.trim()).filter(Boolean) : []

  if (!id || !name || isNaN(price) || price < 0) return { error: 'Datos inválidos.' }

  const db = adminDb()
  const { error } = await db.from('nail_services').update({
    name, slug, emoji, tagline, description, price, sort_order, includes,
  }).eq('id', id)

  if (error) return { error: 'No se pudo actualizar el servicio.' }
  revalidatePath('/salon-unas/admin/servicios')
  revalidatePath('/salon-unas')
  return { success: true }
}

export async function toggleServiceActive(id: string, active: boolean) {
  const db = adminDb()
  const { error } = await db.from('nail_services').update({ active }).eq('id', id)
  if (error) return { error: 'No se pudo cambiar el estado.' }
  revalidatePath('/salon-unas/admin/servicios')
  revalidatePath('/salon-unas')
  return { success: true }
}

export async function deleteService(id: string) {
  const db = adminDb()
  const { error } = await db.from('nail_services').delete().eq('id', id)
  if (error) return { error: 'No se pudo eliminar. ¿Tiene citas asociadas?' }
  revalidatePath('/salon-unas/admin/servicios')
  revalidatePath('/salon-unas')
  return { success: true }
}
