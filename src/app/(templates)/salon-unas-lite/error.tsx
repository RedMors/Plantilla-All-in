'use client'

import { useEffect } from 'react'
import { BRAND } from './constants'

export default function SalonError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[salon-unas] error:', error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <p className="text-4xl mb-4">✦</p>
      <h2 className="text-xl font-bold text-[#3A2A2E] mb-2">Algo salió mal</h2>
      <p className="text-sm text-[#8A7176] mb-6 max-w-sm">
        No pudimos cargar esta página. Por favor intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        style={{ background: BRAND }}
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
