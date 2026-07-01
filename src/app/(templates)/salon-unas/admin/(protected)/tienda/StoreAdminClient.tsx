'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, X } from 'lucide-react'
import {
  createProduct, updateProduct, toggleProductActive, deleteProduct,
  createCategory, deleteCategory,
} from '../../store-actions'

const INK = '#0B0B0B'
const BRAND = '#C4965A'
const STONE = '#EDE9E3'
const MUTED = '#6B6560'

export type AdminProduct = {
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

export type AdminCategory = { id: string; name: string; slug: string; sort_order: number }

type FormState = {
  id?: string
  name: string; price: string; stock: string; category_id: string
  image_url: string; description: string; sort_order: string
  is_featured: boolean; is_active: boolean
}

const EMPTY: FormState = {
  name: '', price: '', stock: '0', category_id: '', image_url: '',
  description: '', sort_order: '0', is_featured: false, is_active: true,
}

const input = 'w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-[#C4965A] transition-colors'
const label = 'block text-[11px] font-semibold tracking-wide uppercase mb-1 text-[#6B6560]'

export default function StoreAdminClient({
  products, categories, migrationMissing,
}: {
  products: AdminProduct[]
  categories: AdminCategory[]
  migrationMissing: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState<FormState | null>(null)
  const [err, setErr] = useState('')
  const [catName, setCatName] = useState('')

  const catName_ = (id: string | null) => categories.find(c => c.id === id)?.name ?? '—'

  function openNew() { setErr(''); setForm({ ...EMPTY }) }
  function openEdit(p: AdminProduct) {
    setErr('')
    setForm({
      id: p.id, name: p.name, price: String(p.price), stock: String(p.stock),
      category_id: p.category_id ?? '', image_url: p.image_url ?? '',
      description: p.description ?? '', sort_order: String(p.sort_order),
      is_featured: p.is_featured, is_active: p.is_active,
    })
  }

  function saveProduct() {
    if (!form) return
    const fd = new FormData()
    if (form.id) fd.set('id', form.id)
    fd.set('name', form.name)
    fd.set('price', form.price)
    fd.set('stock', form.stock)
    fd.set('category_id', form.category_id)
    fd.set('image_url', form.image_url)
    fd.set('description', form.description)
    fd.set('sort_order', form.sort_order)
    fd.set('is_featured', form.is_featured ? 'on' : 'false')
    fd.set('is_active', form.is_active ? 'on' : 'false')
    startTransition(async () => {
      const res = form.id ? await updateProduct(fd) : await createProduct(fd)
      if (res?.error) { setErr(res.error); return }
      setForm(null); router.refresh()
    })
  }

  function toggle(p: AdminProduct) {
    startTransition(async () => { await toggleProductActive(p.id, !p.is_active); router.refresh() })
  }
  function remove(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    startTransition(async () => { await deleteProduct(id); router.refresh() })
  }
  function addCategory() {
    if (!catName.trim()) return
    const fd = new FormData(); fd.set('name', catName)
    startTransition(async () => {
      const res = await createCategory(fd)
      if (res?.error) { setErr(res.error); return }
      setCatName(''); router.refresh()
    })
  }
  function removeCategory(id: string) {
    if (!confirm('¿Eliminar categoría? Los productos quedan sin categoría.')) return
    startTransition(async () => { await deleteCategory(id); router.refresh() })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: INK }}>Tienda</h1>
          <p className="text-sm" style={{ color: MUTED }}>
            {products.length} producto{products.length !== 1 ? 's' : ''} · {categories.length} categoría{categories.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openNew} disabled={migrationMissing}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold disabled:opacity-40"
          style={{ background: BRAND }}>
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      {migrationMissing && (
        <div className="mb-6 rounded-lg border p-4 text-sm" style={{ borderColor: '#E0B4B4', background: '#FBF0F0', color: '#8A4A4A' }}>
          La tabla de la tienda no existe todavía. Aplica la migración <code>0005_nail_store.sql</code> en Supabase para activar la tienda.
        </div>
      )}

      {/* Categorías */}
      <section className="mb-8 rounded-xl border p-5" style={{ borderColor: STONE, background: 'white' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: INK }}>Categorías</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.length === 0 && <span className="text-xs" style={{ color: MUTED }}>Sin categorías todavía.</span>}
          {categories.map(c => (
            <span key={c.id} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: STONE }}>
              {c.name}
              <button onClick={() => removeCategory(c.id)} className="text-[#B0A89E] hover:text-red-500"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="Nueva categoría (ej. Esmaltes)"
            className={input} style={{ borderColor: STONE, maxWidth: 280 }} />
          <button onClick={addCategory} disabled={pending || migrationMissing}
            className="px-4 py-2 rounded-md text-sm border disabled:opacity-40" style={{ borderColor: STONE, color: INK }}>
            Agregar
          </button>
        </div>
      </section>

      {/* Lista de productos */}
      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm" style={{ borderColor: STONE, color: MUTED }}>
          No hay productos. Crea el primero con “Nuevo producto”.
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: STONE, background: 'white' }}>
          {products.map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 p-4"
              style={{ borderTop: i ? `1px solid ${STONE}` : 'none', opacity: p.is_active ? 1 : 0.5 }}>
              <div className="w-12 h-12 rounded-md bg-[#F1ECE4] bg-cover bg-center shrink-0"
                style={{ backgroundImage: p.image_url ? `url(${p.image_url})` : undefined }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate" style={{ color: INK }}>{p.name}</span>
                  {p.is_featured && <Star size={13} style={{ color: BRAND, fill: BRAND }} />}
                </div>
                <p className="text-xs" style={{ color: MUTED }}>{catName_(p.category_id)} · Stock: {p.stock}</p>
              </div>
              <span className="text-sm font-bold shrink-0" style={{ color: BRAND }}>${p.price.toFixed(2)}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggle(p)} title={p.is_active ? 'Ocultar' : 'Mostrar'} className="p-2 hover:bg-[#F5EFE8] rounded-md">
                  {p.is_active ? <Eye size={15} style={{ color: MUTED }} /> : <EyeOff size={15} style={{ color: MUTED }} />}
                </button>
                <button onClick={() => openEdit(p)} title="Editar" className="p-2 hover:bg-[#F5EFE8] rounded-md">
                  <Pencil size={15} style={{ color: MUTED }} />
                </button>
                <button onClick={() => remove(p.id)} title="Eliminar" className="p-2 hover:bg-red-50 rounded-md">
                  <Trash2 size={15} style={{ color: '#C87A7A' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario (modal) */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setForm(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: INK }}>{form.id ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={() => setForm(null)}><X size={18} style={{ color: MUTED }} /></button>
            </div>

            {err && <p className="mb-4 text-xs text-red-600 border-l-2 border-red-400 pl-3">{err}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={label}>Nombre</label>
                <input className={input} style={{ borderColor: STONE }} value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={label}>Precio (USD)</label>
                <input className={input} style={{ borderColor: STONE }} type="number" step="0.01" value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className={label}>Stock</label>
                <input className={input} style={{ borderColor: STONE }} type="number" value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div>
                <label className={label}>Categoría</label>
                <select className={input} style={{ borderColor: STONE }} value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Sin categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Orden</label>
                <input className={input} style={{ borderColor: STONE }} type="number" value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className={label}>URL de imagen</label>
                <input className={input} style={{ borderColor: STONE }} placeholder="https://..." value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className={label}>Descripción</label>
                <textarea className={input + ' resize-none'} style={{ borderColor: STONE }} rows={2} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
                Destacado
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: INK }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                Activo (visible)
              </label>
            </div>

            <button onClick={saveProduct} disabled={pending}
              className="mt-6 w-full py-3 rounded-full text-white text-sm font-semibold disabled:opacity-40" style={{ background: BRAND }}>
              {pending ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
