'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { BRAND } from './constants'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/salon-unas/servicios?q=${encodeURIComponent(q)}` : '/salon-unas/servicios')
  }

  function clear() {
    setValue('')
    router.push('/salon-unas/servicios')
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center bg-white border border-[#dddddd] rounded-full shadow-md overflow-hidden max-w-xl mx-auto px-2 py-2 gap-2"
    >
      <span className="pl-3 text-[#6a6a6a] shrink-0">
        <Search size={18} />
      </span>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="¿Qué servicio buscas?"
        className="flex-1 bg-transparent outline-none text-[#222222] placeholder-[#6a6a6a] text-sm px-2 min-w-0"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="text-[#929292] hover:text-[#222222] shrink-0 transition-colors p-1"
          aria-label="Limpiar"
        >
          <X size={16} />
        </button>
      )}
      <button
        type="submit"
        className="px-5 py-2 rounded-full text-sm font-semibold text-white shrink-0 transition-opacity hover:opacity-90"
        style={{ background: BRAND }}
      >
        Buscar
      </button>
    </form>
  )
}
