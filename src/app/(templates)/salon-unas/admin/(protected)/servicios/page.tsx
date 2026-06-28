'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Eye, EyeOff, Pencil, Trash2, Plus, ImagePlus, X } from 'lucide-react'
import { createService, updateService, toggleServiceActive, deleteService } from '../../admin-actions'

const BRAND = '#ff385c'

type Service = {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string | null
  price: number
  sort_order: number
  includes: string[]
  image_url: string | null
  active: boolean
}

type FormState = {
  id?: string
  slug: string
  name: string
  tagline: string
  description: string
  price: string
  sort_order: string
  includes: string
}

const EMPTY_FORM: FormState = {
  slug: '', name: '', tagline: '', description: '', price: '', sort_order: '0', includes: '',
}

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function ImageUpload({
  currentUrl,
  onChange,
}: {
  currentUrl?: string | null
  onChange: (file: File | null) => void
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    onChange(file)
    setPreview(URL.createObjectURL(file))
  }

  function clear() {
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-1">
        Imagen del servicio
      </label>
      {preview ? (
        <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-[#dddddd] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-40 h-28 rounded-lg border-2 border-dashed border-[#dddddd] flex flex-col items-center justify-center gap-2 text-[#6a6a6a] hover:border-[#222] hover:text-[#222] transition-colors"
        >
          <ImagePlus size={20} />
          <span className="text-xs">Subir imagen</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}

function ServiceForm({
  initial,
  onCancel,
  onSave,
}: {
  initial?: Service
  onCancel: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          id: initial.id,
          slug: initial.slug,
          name: initial.name,
          tagline: initial.tagline ?? '',
          description: initial.description ?? '',
          price: String(initial.price),
          sort_order: String(initial.sort_order),
          includes: initial.includes.join('\n'),
        }
      : EMPTY_FORM
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function set(k: keyof FormState, v: string) {
    setForm(f => ({
      ...f,
      [k]: v,
      ...(k === 'name' && !initial ? { slug: slugify(v) } : {}),
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''))
    if (imageFile) fd.append('image', imageFile)
    else if (initial?.image_url) fd.append('image_url', initial.image_url)

    startTransition(async () => {
      const res = await (initial ? updateService(fd) : createService(fd))
      if ('error' in res) { setError(res.error); return }
      onSave()
    })
  }

  const input = 'w-full border border-[#dddddd] rounded-lg px-3 py-2 text-sm text-[#222] focus:outline-none focus:border-[#222] transition-colors'
  const lbl = 'block text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-1'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#dddddd] p-6 space-y-4">
      <h3 className="font-semibold text-[#222] text-base">
        {initial ? 'Editar servicio' : 'Nuevo servicio'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Nombre *</label>
          <input className={input} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Manicure clásica" />
        </div>
        <div>
          <label className={lbl}>Precio ($) *</label>
          <input className={input} type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required placeholder="15.00" />
        </div>
      </div>

      <div>
        <label className={lbl}>Slug (URL) *</label>
        <input className={input} value={form.slug} onChange={e => set('slug', e.target.value)} required placeholder="manicure-clasica" />
      </div>

      <div>
        <label className={lbl}>Tagline</label>
        <input className={input} value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="El clásico que nunca falla" />
      </div>

      <div>
        <label className={lbl}>Descripción</label>
        <textarea className={input + ' resize-none'} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción completa del servicio..." />
      </div>

      <div>
        <label className={lbl}>Qué incluye (una por línea)</label>
        <textarea className={input + ' resize-none'} rows={4} value={form.includes} onChange={e => set('includes', e.target.value)} placeholder={'Esmaltado de color\nLimado y formado\nHidratación de cutícula'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <ImageUpload
          currentUrl={initial?.image_url}
          onChange={setImageFile}
        />
        <div>
          <label className={lbl}>Orden de aparición</label>
          <input className={input + ' w-24'} type="number" min="0" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: BRAND }}
        >
          {pending ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear servicio'}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-full text-sm border border-[#dddddd] text-[#6a6a6a] hover:border-[#222] transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}

function ServiceRow({
  service,
  onEdit,
  onRefresh,
}: {
  service: Service
  onEdit: (s: Service) => void
  onRefresh: () => void
}) {
  const [pending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      await toggleServiceActive(service.id, !service.active)
      onRefresh()
    })
  }

  function remove() {
    if (!confirm(`¿Eliminar "${service.name}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      const res = await deleteService(service.id)
      if ('error' in res) alert(res.error)
      else onRefresh()
    })
  }

  return (
    <div className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-opacity ${!service.active ? 'opacity-50 border-[#eeeeee]' : 'border-[#dddddd]'}`}>
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#f7f7f7] shrink-0 flex items-center justify-center">
        {service.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
        ) : (
          <ImagePlus size={20} className="text-[#ccc]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#222] text-sm">{service.name}</span>
          {!service.active && (
            <span className="text-xs text-[#999] bg-[#f0f0f0] px-2 py-0.5 rounded-full">Inactivo</span>
          )}
        </div>
        {service.tagline && <p className="text-xs text-[#6a6a6a] mt-0.5 truncate">{service.tagline}</p>}
        <p className="text-xs text-[#bbb] mt-0.5">/{service.slug}</p>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="font-bold text-[#222]">${service.price}</p>
        <p className="text-xs text-[#bbb]">orden {service.sort_order}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={toggle}
          disabled={pending}
          title={service.active ? 'Desactivar' : 'Activar'}
          className="w-8 h-8 rounded-full flex items-center justify-center border border-[#dddddd] text-[#6a6a6a] hover:border-[#222] hover:text-[#222] transition-colors"
        >
          {service.active ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={() => onEdit(service)}
          title="Editar"
          className="w-8 h-8 rounded-full flex items-center justify-center border border-[#dddddd] text-[#6a6a6a] hover:border-[#222] hover:text-[#222] transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={remove}
          disabled={pending}
          title="Eliminar"
          className="w-8 h-8 rounded-full flex items-center justify-center border border-[#dddddd] text-[#6a6a6a] hover:border-red-500 hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Service | null | 'new'>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/salon/servicios')
    if (res.ok) setServices(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleSaved() {
    setEditing(null)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">Servicios</h1>
          <p className="text-sm text-[#6a6a6a] mt-0.5">
            {services.length} servicio{services.length !== 1 ? 's' : ''} registrado{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        {editing === null && (
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: BRAND }}
          >
            <Plus size={15} />
            Nuevo servicio
          </button>
        )}
      </div>

      {editing === 'new' && (
        <ServiceForm onCancel={() => setEditing(null)} onSave={handleSaved} />
      )}

      {loading ? (
        <div className="text-sm text-[#6a6a6a] py-8 text-center">Cargando servicios...</div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#dddddd] p-12 text-center">
          <ImagePlus size={40} className="mx-auto text-[#ccc] mb-3" />
          <p className="font-semibold text-[#222]">Sin servicios aún</p>
          <p className="text-sm text-[#6a6a6a] mt-1">Crea tu primer servicio para que aparezca en el sitio.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(s =>
            editing && typeof editing === 'object' && editing.id === s.id ? (
              <ServiceForm key={s.id} initial={editing} onCancel={() => setEditing(null)} onSave={handleSaved} />
            ) : (
              <ServiceRow key={s.id} service={s} onEdit={s => setEditing(s)} onRefresh={load} />
            )
          )}
        </div>
      )}
    </div>
  )
}
