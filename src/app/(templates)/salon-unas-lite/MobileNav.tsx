'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { BRAND, SHADOW, NAV_LINKS } from './constants'

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-[#3A2A2E] hover:bg-[#F7E8E6] transition-colors"
        aria-label="Menú"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#EFE0DD] z-50" style={{ boxShadow: SHADOW.soft }}>
          <nav className="flex flex-col py-2">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-6 py-3.5 text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? 'text-[#3A2A2E] bg-[#F7E8E6]'
                    : 'text-[#8A7176] hover:text-[#3A2A2E] hover:bg-[#F7E8E6]'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="px-6 py-3">
              <Link
                href="/salon-unas-lite/contacto"
                onClick={() => setOpen(false)}
                className="block w-full text-center py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: BRAND }}
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
