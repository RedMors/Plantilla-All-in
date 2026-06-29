'use client'

import { useState, useTransition } from 'react'
import { signIn } from '../auth-actions'

const BRAND = '#C4965A'
const INK   = '#0B0B0B'
const STONE = '#EDE9E3'
const CREAM = '#FAF9F6'
const MUTED = '#6B6560'

export default function AdminLoginPage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signIn(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: CREAM, fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl p-8" style={{ border: `1px solid ${STONE}` }}>
        <div className="flex items-center gap-3 mb-8">
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ background: INK }}
          >
            N
          </span>
          <div>
            <p className="font-bold text-sm" style={{ color: INK }}>Nails by Mariela</p>
            <p className="text-xs" style={{ color: MUTED }}>Panel de administración</p>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-1" style={{ color: INK }}>Bienvenida</h1>
        <p className="text-sm mb-6" style={{ color: MUTED }}>Ingresa para ver tus citas y ventas.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: MUTED }}>
              Correo
            </label>
            <input
              name="email"
              type="email"
              required
              defaultValue="admin@akatrek.com"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              style={{ border: `1px solid ${STONE}`, color: INK }}
              onFocus={e => (e.target.style.borderColor = BRAND)}
              onBlur={e => (e.target.style.borderColor = STONE)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: MUTED }}>
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              style={{ border: `1px solid ${STONE}`, color: INK }}
              onFocus={e => (e.target.style.borderColor = BRAND)}
              onBlur={e => (e.target.style.borderColor = STONE)}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-85 disabled:opacity-60 mt-2"
            style={{ background: INK }}
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="text-center pt-1">
            <div className="inline-block w-4 h-px" style={{ background: BRAND }} />
            <span className="mx-2 text-[10px] font-semibold tracking-widest uppercase" style={{ color: BRAND }}>
              Studio Élite
            </span>
            <div className="inline-block w-4 h-px" style={{ background: BRAND }} />
          </div>
        </form>
      </div>
    </div>
  )
}
