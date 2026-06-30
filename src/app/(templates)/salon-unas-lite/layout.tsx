import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus_Jakarta_Sans } from 'next/font/google'
import MobileNav from './MobileNav'
import { BRAND, BLUSH, PLUM, MAUVE, MAUVE_SOFT, LINE, NAV_LINKS } from './constants'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  title: 'Nails by Mariela — San Salvador',
  description: 'Salón de uñas profesional en San Salvador. Manicure, pedicure, nail art y más.',
}

export default function SalonUnasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${jakarta.variable} min-h-screen flex flex-col`}
      style={{ fontFamily: 'var(--font-jakarta), sans-serif', background: BLUSH, color: PLUM }}
    >
      <header
        className="sticky top-0 z-50 backdrop-blur-sm border-b"
        style={{ background: 'rgba(251,244,241,0.95)', borderColor: LINE }}
      >
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
            <span className="font-semibold hidden sm:block" style={{ color: PLUM }}>Nails by Mariela</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium transition-colors"
                style={{ color: MAUVE }}
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

      <footer className="text-white py-8 px-6" style={{ background: PLUM }}>
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
              <Link key={l.href} href={l.href} className="text-xs text-white/70 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs" style={{ color: MAUVE_SOFT }}>© {new Date().getFullYear()} · San Salvador, El Salvador</p>
        </div>
      </footer>
    </div>
  )
}
