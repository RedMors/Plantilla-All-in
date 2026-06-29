import type { Metadata } from 'next'
import Link from 'next/link'
import MobileNav from './MobileNav'
import { BRAND, NAV_LINKS } from './constants'

export const metadata: Metadata = {
  title: 'Nails by Mariela — San Salvador',
  description: 'Salón de uñas profesional en San Salvador. Manicure, pedicure, nail art y más.',
}

export default function SalonUnasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      className="min-h-screen bg-white text-[#222222] flex flex-col"
    >
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#ebebeb]">
        {/* relative aquí —  NO en el sticky — evita bug de containing block en Safari/Firefox */}
        <div className="relative">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/salon-unas-lite" className="flex items-center gap-2.5 shrink-0">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: BRAND }}
            >
              N
            </span>
            <span className="font-semibold text-[#222222] hidden sm:block">Nails by Mariela</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-[#3f3f3f] hover:text-[#222222] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <MobileNav />
            <Link
              href="/salon-unas-lite/contacto"
              className="shrink-0 px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: BRAND }}
            >
              Reservar cita
            </Link>
          </div>
        </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#222222] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/salon-unas-lite" className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: BRAND }}
            >
              N
            </span>
            <span className="font-semibold text-white text-sm">Nails by Mariela</span>
          </Link>

          <nav className="flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="text-xs text-[#929292] hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-[#6a6a6a]">© {new Date().getFullYear()} · San Salvador, El Salvador</p>
        </div>
      </footer>
    </div>
  )
}
