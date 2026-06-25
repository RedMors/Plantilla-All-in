'use client'

import { useState, useTransition } from 'react'
import { signIn } from '../auth-actions'

const BRAND = '#ff385c'

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
      className="min-h-screen flex items-center justify-center bg-[#f7f7f7]"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#dddddd] shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ background: BRAND }}
          >
            N
          </span>
          <div>
            <p className="font-bold text-[#222222] text-sm">Nails by Mariela</p>
            <p className="text-xs text-[#929292]">Panel de administración</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#222222] mb-1">Bienvenida</h1>
        <p className="text-sm text-[#6a6a6a] mb-6">Ingresa para ver tus citas y ventas.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">
              Correo
            </label>
            <input
              name="email"
              type="email"
              required
              defaultValue="admin@akatrek.com"
              className="w-full border border-[#dddddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#222222] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full border border-[#dddddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#222222] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
            style={{ background: BRAND }}
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
