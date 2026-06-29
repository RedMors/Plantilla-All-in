'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

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
    <form onSubmit={submit} className="flex items-center border-b border-[#D4CCC0] pb-2 gap-3 max-w-xl mx-auto">
      <Search size={16} className="text-[#6B6560] shrink-0" strokeWidth={1.5} />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Busca un servicio..."
        className="flex-1 bg-transparent outline-none text-sm text-[#1A1A1A] placeholder-[#B0A89E] min-w-0"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="text-[#B0A89E] hover:text-[#1A1A1A] shrink-0 transition-colors"
          aria-label="Limpiar"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      )}
      <button
        type="submit"
        className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#C4965A] hover:text-[#B8864E] shrink-0 transition-colors"
      >
        Buscar
      </button>
    </form>
  )
}
