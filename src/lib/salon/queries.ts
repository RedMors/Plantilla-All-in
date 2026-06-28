import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'

const db = cache(() =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
)

export type NailService = {
  id: string
  slug: string
  emoji: string
  name: string
  tagline: string
  description: string
  price: number
  image_url: string | null
  gradient_from: string
  gradient_to: string
  includes: string[]
  faqs: { q: string; a: string }[]
  related_slugs: string[]
  active: boolean
  sort_order: number
}

export type NailVariant = {
  id: string
  service_id: string
  name: string
  price: number
  duration: string
  description: string | null
  sort_order: number
}

export type NailGallery = {
  id: string
  image_url: string
  alt_text: string | null
}

export type NailTestimonial = {
  id: string
  customer_name: string
  text: string
  stars: number
}

const SERVICE_COLS = 'id,slug,emoji,name,tagline,description,price,image_url,gradient_from,gradient_to,includes,faqs,related_slugs,active,sort_order'

export async function getServices(): Promise<NailService[]> {
  const { data, error } = await db()
    .from('nail_services')
    .select(SERVICE_COLS)
    .eq('active', true)
    .order('sort_order')
  if (error) throw new Error(`[nail_services] ${error.message}`)
  return data ?? []
}

export async function getServiceBySlug(slug: string): Promise<NailService | null> {
  const { data, error } = await db()
    .from('nail_services')
    .select(SERVICE_COLS)
    .eq('slug', slug)
    .eq('active', true)
    .single()
  if (error && error.code !== 'PGRST116') throw new Error(`[nail_services] ${error.message}`)
  return data ?? null
}

export async function getVariants(serviceId: string): Promise<NailVariant[]> {
  const { data, error } = await db()
    .from('nail_service_variants')
    .select('id,service_id,name,price,duration,description,sort_order')
    .eq('service_id', serviceId)
    .order('sort_order')
  if (error) throw new Error(`[nail_service_variants] ${error.message}`)
  return data ?? []
}

export async function getRelatedServices(slugs: string[]): Promise<NailService[]> {
  if (!slugs.length) return []
  const { data, error } = await db()
    .from('nail_services')
    .select(SERVICE_COLS)
    .in('slug', slugs)
    .eq('active', true)
  if (error) throw new Error(`[nail_services related] ${error.message}`)
  return data ?? []
}

export async function getGallery(): Promise<NailGallery[]> {
  const { data, error } = await db()
    .from('nail_gallery')
    .select('id,image_url,alt_text')
    .eq('active', true)
    .order('sort_order')
    .limit(48)
  if (error) throw new Error(`[nail_gallery] ${error.message}`)
  return data ?? []
}

export async function getTestimonials(): Promise<NailTestimonial[]> {
  const { data, error } = await db()
    .from('nail_testimonials')
    .select('id,customer_name,text,stars')
    .eq('active', true)
    .limit(30)
  if (error) throw new Error(`[nail_testimonials] ${error.message}`)
  return data ?? []
}

export async function getTakenSlots(
  serviceId: string,
  days = 30
): Promise<Record<string, string[]>> {
  const from = new Date().toISOString().split('T')[0]
  const to = new Date(Date.now() + days * 86400000).toISOString().split('T')[0]

  const { data, error } = await db()
    .from('nail_appointments')
    .select('appointment_date, appointment_time')
    .eq('service_id', serviceId)
    .gte('appointment_date', from)
    .lte('appointment_date', to)
    .in('status', ['pending', 'confirmed'])
  if (error) throw new Error(`[nail_appointments slots] ${error.message}`)

  const map: Record<string, string[]> = {}
  for (const row of data ?? []) {
    const d = String(row.appointment_date)
    const t = String(row.appointment_time).slice(0, 5)
    if (!map[d]) map[d] = []
    map[d].push(t)
  }
  return map
}
