import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminDb } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await adminDb()
    .from('nail_services')
    .select('id,slug,emoji,name,tagline,description,price,sort_order,includes,active')
    .order('sort_order')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
