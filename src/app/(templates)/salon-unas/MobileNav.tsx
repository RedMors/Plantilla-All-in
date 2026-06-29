'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from './constants'

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="md:hidden w-9 h-9 flex items-center justify-center text-[#1A1A1A] hover:text-[#6B6560] transition-colors"
        aria-label="Menú"
      >
        {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#FAF9F6] border-b border-[#EDE9E3] z-50">
          <nav className="flex flex-col max-w-6xl mx-auto px-6 py-4 gap-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`py-3 text-[11px] font-medium tracking-[0.12em] uppercase border-b border-[#EDE9E3] last:border-0 transition-colors ${
                  pathname === l.href
                    ? 'text-[#C4965A]'
                    : 'text-[#6B6560] hover:text-[#1A1A1A]'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 pb-2">
              <Link
                href="/salon-unas/contacto"
                onClick={() => setOpen(false)}
                className="block w-full text-center py-3 text-[11px] font-semibold tracking-[0.12em] uppercase bg-[#C4965A] text-white hover:bg-[#B8864E] transition-colors"
              >
                Reservar cita
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
