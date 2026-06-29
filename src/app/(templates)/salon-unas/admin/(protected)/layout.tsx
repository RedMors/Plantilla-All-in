import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '../auth-actions'
import Link from 'next/link'

const BRAND  = '#C4965A'
const INK    = '#0B0B0B'
const STONE  = '#EDE9E3'
const CREAM  = '#FAF9F6'
const MUTED  = '#6B6560'

export const metadata = {
  title: 'Admin — Nails by Mariela',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/salon-unas/admin/login')

  return (
    <div className="min-h-screen" style={{ background: CREAM, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: STONE }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/salon-unas/admin" className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: INK }}
              >
                N
              </span>
              <span className="font-semibold text-sm" style={{ color: INK }}>Panel · Nails by Mariela</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm" style={{ color: MUTED }}>
              <Link href="/salon-unas/admin" className="transition-colors hover:text-[#1A1A1A]">Dashboard</Link>
              <Link href="/salon-unas/admin/citas" className="transition-colors hover:text-[#1A1A1A]">Citas</Link>
              <Link href="/salon-unas/admin/ventas" className="transition-colors hover:text-[#1A1A1A]">Ventas</Link>
              <Link href="/salon-unas/admin/servicios" className="transition-colors hover:text-[#1A1A1A]">Servicios</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/salon-unas"
              target="_blank"
              className="text-xs transition-colors hidden sm:block"
              style={{ color: BRAND }}
            >
              Ver sitio →
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                style={{ borderColor: STONE, color: MUTED }}
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
