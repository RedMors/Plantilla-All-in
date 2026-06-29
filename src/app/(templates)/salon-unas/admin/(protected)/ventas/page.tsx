'use client'

import { useState, useTransition } from 'react'
import { addManualSale } from '../../admin-actions'

const INK   = '#0B0B0B'
const STONE = '#EDE9E3'
const MUTED = '#6B6560'

export default function VentasPage() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addManualSale(fd)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  const inputCls = 'w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors'
  const inputStyle = { border: `1px solid ${STONE}`, color: INK, background: '#fff' }
  const labelStyle = { color: MUTED }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: INK }}>Ventas manuales</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>Registra ventas hechas en el salón que no pasan por el sistema.</p>
      </div>

      <div className="bg-white rounded-2xl p-6" style={{ border: `1px solid ${STONE}` }}>
        <h2 className="font-semibold mb-5" style={{ color: INK }}>Nueva venta</h2>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={labelStyle}>
              Descripción *
            </label>
            <input
              name="description"
              type="text"
              required
              placeholder="Ej: Manicure francesa, gel rosa"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={labelStyle}>
              Monto ($) *
            </label>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={labelStyle}>
              Método de pago
            </label>
            <select
              name="payment_method"
              defaultValue="efectivo"
              className={inputCls}
              style={{ ...inputStyle }}
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={labelStyle}>
              Fecha
            </label>
            <input
              name="sale_date"
              type="date"
              defaultValue={today}
              max={today}
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={labelStyle}>
              Notas (opcional)
            </label>
            <input
              name="notes"
              type="text"
              placeholder="Notas adicionales..."
              className={inputCls}
              style={inputStyle}
            />
          </div>

          {error && (
            <div className="sm:col-span-2">
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
            </div>
          )}
          {success && (
            <div className="sm:col-span-2">
              <p className="text-xs px-3 py-2 rounded-xl" style={{ color: '#3d7a4e', background: '#edf5f0' }}>Venta guardada correctamente.</p>
            </div>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-85 disabled:opacity-60"
              style={{ background: INK }}
            >
              {isPending ? 'Guardando...' : 'Guardar venta'}
            </button>
          </div>
        </form>
      </div>

      <p className="text-xs text-center" style={{ color: MUTED }}>
        El historial completo de ventas lo podrás ver aquí próximamente.
      </p>
    </div>
  )
}
