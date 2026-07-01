import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'

// Cliente anónimo (RLS: solo lee productos activos + categorías)
const db = cache(() =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
)

export type NailProductCategory = {
  id: string
  name: string
  slug: string
  sort_order: number
}

export type NailProduct = {
  id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  is_featured: boolean
  is_active: boolean
  sort_order: number
}

const PRODUCT_COLS =
  'id,category_id,name,slug,description,price,image_url,stock,is_featured,is_active,sort_order'

export async function getStoreCategories(): Promise<NailProductCategory[]> {
  const { data, error } = await db()
    .from('nail_product_categories')
    .select('id,name,slug,sort_order')
    .order('sort_order')
  if (error) throw new Error(`[nail_product_categories] ${error.message}`)
  return data ?? []
}

// Productos activos, destacados primero, luego por sort_order. Límite para no crecer sin control.
export async function getStoreProducts(): Promise<NailProduct[]> {
  const { data, error } = await db()
    .from('nail_products')
    .select(PRODUCT_COLS)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('sort_order')
    .limit(200)
  if (error) throw new Error(`[nail_products] ${error.message}`)
  return data ?? []
}

export async function getProductBySlug(slug: string): Promise<NailProduct | null> {
  const { data, error } = await db()
    .from('nail_products')
    .select(PRODUCT_COLS)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error && error.code !== 'PGRST116') throw new Error(`[nail_products] ${error.message}`)
  return data ?? null
}
