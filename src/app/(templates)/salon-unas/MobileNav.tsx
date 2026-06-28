'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

const BRAND = '#ff385c'

const LINKS = [
  { href: '/salon-unas/servicios', label: 'Servicios' },
  { href: '/salon-unas/galeria',   label: 'Galería' },
  { href: '/salon-unas/opiniones', label: 'Opiniones' },
  { href: '/salon-unas/contacto',  label: 'Contacto' },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-[#222] hover:bg-[#f7f7f7] transition-colors"
        aria-label="Menú"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#ebebeb] shadow-sm z-50">
          <nav className="flex flex-col py-2">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-6 py-3.5 text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? 'text-[#222] bg-[#f7f7f7]'
                    : 'text-[#3f3f3f] hover:text-[#222] hover:bg-[#f7f7f7]'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="px-6 py-3">
              <Link
                href="/salon-unas/contacto"
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
