'use server'

import { adminDb } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// _formData es requerido como último param para que .bind(null, id, status) deje
// la firma (formData: FormData) => Promise<void> — patrón Next.js 15+ con bind
export async function updateAppointmentStatus(
  id: string,
  status: 'confirmed' | 'completed' | 'cancelled',
  _formData: FormData
): Promise<void> {
  const db = adminDb()
  const { error } = await db
    .from('nail_appointments')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('[admin] updateAppointmentStatus:', error.message)
    return
  }
  revalidatePath('/salon-unas/admin')
  revalidatePath('/salon-unas/admin/citas')
  revalidatePath('/salon-unas', 'layout')
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

async function uploadServiceImage(file: File, slug: string): Promise<string | null> {
  const db = adminDb()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `salon/${slug}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await db.storage.from('servicios').upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  })
  if (error) return null

  const { data } = db.storage.from('servicios').getPublicUrl(path)
  return data.publicUrl
}

export async function createService(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const slug = (formData.get('slug') as string)?.trim() || slugify(name)
  const tagline = (formData.get('tagline') as string)?.trim() || null
  const description = (formData.get('description') as string)?.trim() || null
  const price = parseFloat(formData.get('price') as string)
  const sort_order = parseInt(formData.get('sort_order') as string) || 0
  const includesRaw = (formData.get('includes') as string)?.trim()
  const includes = includesRaw ? includesRaw.split('\n').map(s => s.trim()).filter(Boolean) : []
  const imageFile = formData.get('image') as File | null

  if (!name || isNaN(price) || price < 0) return { error: 'Nombre y precio son requeridos.' }
  if (!slug) return { error: 'Slug inválido.' }

  let image_url: string | null = null
  if (imageFile && imageFile.size > 0) {
    image_url = await uploadServiceImage(imageFile, slug)
  }

  const db = adminDb()
  const { error } = await db.from('nail_services').insert({
    name, slug, tagline, description, price, sort_order, includes, image_url, active: true,
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
  const tagline = (formData.get('tagline') as string)?.trim() || null
  const description = (formData.get('description') as string)?.trim() || null
  const price = parseFloat(formData.get('price') as string)
  const sort_order = parseInt(formData.get('sort_order') as string) || 0
  const includesRaw = (formData.get('includes') as string)?.trim()
  const includes = includesRaw ? includesRaw.split('\n').map(s => s.trim()).filter(Boolean) : []
  const imageFile = formData.get('image') as File | null
  const existingUrl = (formData.get('image_url') as string) || null

  if (!id || !name || isNaN(price) || price < 0) return { error: 'Datos inválidos.' }

  let image_url = existingUrl
  if (imageFile && imageFile.size > 0) {
    image_url = await uploadServiceImage(imageFile, slug)
  }

  const db = adminDb()
  const { error } = await db.from('nail_services').update({
    name, slug, tagline, description, price, sort_order, includes, image_url,
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
