'use server'

import { adminDb } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function revalidateStore() {
  revalidatePath('/salon-unas/admin/tienda')
  revalidatePath('/salon-unas/tienda')
  revalidatePath('/salon-unas', 'layout')
}

// ── Productos ─────────────────────────────────────────────────────────────────

function parseProduct(formData: FormData) {
  const name        = (formData.get('name') as string)?.trim()
  const price       = parseFloat(formData.get('price') as string)
  const stock       = parseInt(formData.get('stock') as string) || 0
  const category_id = (formData.get('category_id') as string) || null
  const description = (formData.get('description') as string)?.trim() || null
  const image_url   = (formData.get('image_url') as string)?.trim() || null
  const sort_order  = parseInt(formData.get('sort_order') as string) || 0
  const is_featured = formData.get('is_featured') === 'on' || formData.get('is_featured') === 'true'
  const is_active   = formData.get('is_active') !== 'false' && formData.get('is_active') !== null
  return { name, price, stock, category_id, description, image_url, sort_order, is_featured, is_active }
}

export async function createProduct(formData: FormData) {
  const p = parseProduct(formData)
  const slug = (formData.get('slug') as string)?.trim() || slugify(p.name)
  if (!p.name || isNaN(p.price) || p.price < 0) return { error: 'Nombre y precio son requeridos.' }
  if (!slug) return { error: 'Slug inválido.' }
  if (p.stock < 0) return { error: 'El stock no puede ser negativo.' }

  const db = adminDb()
  const { error } = await db.from('nail_products').insert({ ...p, slug })
  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un producto con ese slug.' }
    return { error: 'No se pudo crear el producto.' }
  }
  revalidateStore()
  return { success: true }
}

export async function updateProduct(formData: FormData) {
  const id = formData.get('id') as string
  const p = parseProduct(formData)
  const slug = (formData.get('slug') as string)?.trim() || slugify(p.name)
  if (!id || !p.name || isNaN(p.price) || p.price < 0) return { error: 'Datos inválidos.' }

  const db = adminDb()
  const { error } = await db
    .from('nail_products')
    .update({ ...p, slug, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un producto con ese slug.' }
    return { error: 'No se pudo actualizar el producto.' }
  }
  revalidateStore()
  return { success: true }
}

export async function toggleProductActive(id: string, is_active: boolean) {
  const db = adminDb()
  const { error } = await db.from('nail_products').update({ is_active }).eq('id', id)
  if (error) return { error: 'No se pudo cambiar el estado.' }
  revalidateStore()
  return { success: true }
}

export async function deleteProduct(id: string) {
  const db = adminDb()
  const { error } = await db.from('nail_products').delete().eq('id', id)
  if (error) return { error: 'No se pudo eliminar el producto.' }
  revalidateStore()
  return { success: true }
}

// ── Categorías ────────────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const sort_order = parseInt(formData.get('sort_order') as string) || 0
  if (!name) return { error: 'El nombre es requerido.' }

  const db = adminDb()
  const { error } = await db
    .from('nail_product_categories')
    .insert({ name, slug: slugify(name), sort_order })
  if (error) {
    if (error.code === '23505') return { error: 'Ya existe una categoría con ese nombre.' }
    return { error: 'No se pudo crear la categoría.' }
  }
  revalidateStore()
  return { success: true }
}

export async function deleteCategory(id: string) {
  // Los productos de la categoría quedan con category_id = null (ON DELETE SET NULL).
  const db = adminDb()
  const { error } = await db.from('nail_product_categories').delete().eq('id', id)
  if (error) return { error: 'No se pudo eliminar la categoría.' }
  revalidateStore()
  return { success: true }
}
