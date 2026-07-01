import { getStoreProducts, getStoreCategories, type NailProduct, type NailProductCategory } from '@/lib/salon/store'
import { BRAND, INK, CREAM, STONE, MUTED } from '../constants'
import AddToCartButton from './AddToCartButton'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tienda — Nails by Mariela',
  description: 'Esmaltes, kits y accesorios de Nails by Mariela.',
}

export default async function TiendaPage() {
  let products: NailProduct[] = []
  let categories: NailProductCategory[] = []
  try {
    ;[products, categories] = await Promise.all([getStoreProducts(), getStoreCategories()])
  } catch {
    // La migración de la tienda aún no está aplicada — mostramos estado vacío.
    products = []
    categories = []
  }

  // Agrupar por categoría (respetando el orden de categorías); "Sin categoría" al final
  const byCategory = new Map<string, NailProduct[]>()
  for (const p of products) {
    const key = p.category_id ?? '__none__'
    if (!byCategory.has(key)) byCategory.set(key, [])
    byCategory.get(key)!.push(p)
  }
  const orderedGroups = [
    ...categories.map(c => ({ name: c.name, items: byCategory.get(c.id) ?? [] })),
    { name: 'Otros', items: byCategory.get('__none__') ?? [] },
  ].filter(g => g.items.length > 0)

  return (
    <main className="max-w-6xl mx-auto px-6 py-14">
      {/* Encabezado */}
      <header className="mb-12">
        <p className="text-[11px] font-semibold tracking-[0.25em] uppercase mb-2" style={{ color: BRAND }}>
          Tienda
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: INK, fontFamily: 'var(--font-cormorant), serif' }}>
          Productos & esmaltes
        </h1>
        <p className="mt-3 text-sm max-w-xl" style={{ color: MUTED }}>
          Todo lo que usamos en el estudio, disponible para llevar.
        </p>
      </header>

      {orderedGroups.length === 0 ? (
        <div className="border border-dashed rounded-xl py-20 text-center" style={{ borderColor: STONE, color: MUTED }}>
          <p className="text-sm">Aún no hay productos en la tienda.</p>
          <p className="text-xs mt-1">El administrador puede agregarlos desde el panel.</p>
        </div>
      ) : (
        <div className="space-y-14">
          {orderedGroups.map(group => (
            <section key={group.name}>
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase mb-5" style={{ color: MUTED }}>
                {group.name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {group.items.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}

function ProductCard({ product: p }: { product: NailProduct }) {
  const soldOut = p.stock <= 0
  return (
    <article className="group" style={{ background: CREAM, border: `1px solid ${STONE}` }}>
      <div className="relative aspect-square overflow-hidden" style={{ background: '#F1ECE4' }}>
        {p.image_url ? (
          // URLs arbitrarias pegadas por el admin — <img> evita el allowlist de next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt={p.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[11px]" style={{ color: MUTED }}>
            Sin imagen
          </div>
        )}
        {p.is_featured && !soldOut && (
          <span className="absolute top-2 left-2 text-[9px] font-semibold tracking-[0.15em] uppercase px-2 py-1 text-white" style={{ background: BRAND }}>
            Destacado
          </span>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: INK }}>Agotado</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold leading-snug" style={{ color: INK }}>{p.name}</h3>
        {p.description && (
          <p className="text-xs mt-1 line-clamp-2" style={{ color: MUTED }}>{p.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold" style={{ color: BRAND }}>${p.price.toFixed(2)}</span>
          {!soldOut && p.stock <= 5 && (
            <span className="text-[10px]" style={{ color: MUTED }}>Quedan {p.stock}</span>
          )}
        </div>
        <AddToCartButton product={{ id: p.id, name: p.name, price: p.price, image_url: p.image_url, stock: p.stock }} />
      </div>
    </article>
  )
}
