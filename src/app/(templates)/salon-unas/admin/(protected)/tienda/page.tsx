import { adminDb } from '@/lib/supabase/admin'
import StoreAdminClient, { type AdminProduct, type AdminCategory } from './StoreAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminTiendaPage() {
  const db = adminDb()
  // Si la migración de la tienda aún no está aplicada, error !== null y data === null.
  const [productsRes, categoriesRes] = await Promise.all([
    db.from('nail_products').select('*').order('sort_order'),
    db.from('nail_product_categories').select('*').order('sort_order'),
  ])

  const migrationMissing = !!productsRes.error || !!categoriesRes.error

  return (
    <StoreAdminClient
      products={(productsRes.data as AdminProduct[]) ?? []}
      categories={(categoriesRes.data as AdminCategory[]) ?? []}
      migrationMissing={migrationMissing}
    />
  )
}
