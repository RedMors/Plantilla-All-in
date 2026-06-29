'use client'

import { useEffect } from 'react'

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
      <h2 className="text-xl font-bold text-[#222222] mb-2">Algo salió mal</h2>
      <p className="text-sm text-[#6a6a6a] mb-6 max-w-sm">
        No pudimos cargar esta página. Por favor intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-[#ff385c] hover:opacity-90 transition-opacity"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
