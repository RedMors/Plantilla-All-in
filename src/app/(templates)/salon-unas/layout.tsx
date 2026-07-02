import type { Metadata } from 'next'
import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'
import MobileNav from './MobileNav'
import { NAV_LINKS } from './constants'
import { CartProvider } from '@/components/salon/CartContext'
import CartIndicator from '@/components/salon/CartIndicator'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nails by Mariela — San Salvador',
  description: 'Nail studio profesional en San Salvador. Manicure, pedicure, nail art y más.',
}

export default function SalonUnasLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
    <div
      className={`${cormorant.variable} min-h-screen bg-[#FAF9F6] text-[#1A1A1A] flex flex-col`}
      style={{ fontFamily: 'var(--font-geist-sans, system-ui), sans-serif' }}
    >
      <header className="sticky top-0 z-50 bg-[#FAF9F6]/97 backdrop-blur-sm border-b border-[#EDE9E3]">
        <div className="relative">
          <div className="max-w-6xl mx-auto px-6 h-[66px] flex items-center justify-between gap-4">
            <Link href="/salon-unas" className="shrink-0 flex items-center gap-3 group">
              <span className="w-[3px] h-5 bg-[#C4965A] transition-all group-hover:h-7" />
              <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#1A1A1A]">
                Nails by Mariela
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-9">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#6B6560] hover:text-[#1A1A1A] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <CartIndicator />
              <MobileNav />
              <Link
                href="/salon-unas/contacto"
                className="hidden sm:inline-flex items-center gap-2 border border-[#C4965A] text-[#C4965A] text-[11px] font-semibold tracking-[0.12em] uppercase px-5 py-2.5 rounded-full hover:bg-[#C4965A] hover:text-white active:scale-[0.97] transition-all duration-300"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
              >
                Reservar
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#0B0B0B] py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-[3px] h-4 bg-[#C4965A]" />
              <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-white">
                Nails by Mariela
              </span>
            </div>
            <p className="text-sm text-[#6B6560] leading-relaxed max-w-xs">
              Nail studio profesional en San Salvador. Resultados de alta calidad con materiales premium.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C4965A] mb-5">
              Secciones
            </p>
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-[#6B6560] hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C4965A] mb-5">
              Contacto
            </p>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[#6B6560]">Col. Escalón, San Salvador</p>
              <a href="tel:+50378901234" className="text-sm text-[#6B6560] hover:text-white transition-colors">
                +503 7890-1234
              </a>
              <p className="text-sm text-[#6B6560]">Lun – Sáb · 8:00 am – 7:00 pm</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-[#1F1F1F] flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-[#3F3A38]">
            © {new Date().getFullYear()} Nails by Mariela · San Salvador, El Salvador
          </p>
          <p className="text-xs text-[#3F3A38]">Hecho con cuidado</p>
        </div>
      </footer>
    </div>
    </CartProvider>
  )
}
