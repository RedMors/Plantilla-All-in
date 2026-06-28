'use client'

import { useState, useTransition } from 'react'
import { addManualSale } from '../../admin-actions'

const BRAND = '#ff385c'

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
}

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#222222]">Ventas manuales</h1>
        <p className="text-sm text-[#6a6a6a] mt-1">Registra ventas hechas en el salón que no pasan por el sistema.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#dddddd] p-6">
        <h2 className="font-semibold text-[#222222] mb-5">Nueva venta</h2>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">
              Descripción *
            </label>
            <input
              name="description"
              type="text"
              required
              placeholder="Ej: Manicure francesa, gel rosa"
              className="w-full border border-[#dddddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#222222] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">
              Monto ($) *
            </label>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              className="w-full border border-[#dddddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#222222] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">
              Método de pago
            </label>
            <select
              name="payment_method"
              defaultValue="efectivo"
              className="w-full border border-[#dddddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#222222] transition-colors bg-white"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">
              Fecha
            </label>
            <input
              name="sale_date"
              type="date"
              defaultValue={today}
              max={today}
              className="w-full border border-[#dddddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#222222] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">
              Notas (opcional)
            </label>
            <input
              name="notes"
              type="text"
              placeholder="Notas adicionales..."
              className="w-full border border-[#dddddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#222222] transition-colors"
            />
          </div>

          {error && (
            <div className="sm:col-span-2">
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
            </div>
          )}
          {success && (
            <div className="sm:col-span-2">
              <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-xl">Venta guardada correctamente.</p>
            </div>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: BRAND }}
            >
              {isPending ? 'Guardando...' : 'Guardar venta'}
            </button>
          </div>
        </form>
      </div>

      <p className="text-xs text-[#929292] text-center">
        El historial completo de ventas lo podrás ver aquí próximamente.
      </p>
    </div>
  )
}
