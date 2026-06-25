import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './auth-actions'
import Link from 'next/link'

const BRAND = '#ff385c'

export const metadata = {
  title: 'Admin — Nails by Mariela',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/salon-unas/admin/login')

  return (
    <div
      className="min-h-screen bg-[#f7f7f7]"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <header className="sticky top-0 z-50 bg-white border-b border-[#dddddd]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/salon-unas/admin" className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: BRAND }}
              >
                N
              </span>
              <span className="font-semibold text-[#222222] text-sm">Panel · Nails by Mariela</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm text-[#6a6a6a]">
              <Link href="/salon-unas/admin" className="hover:text-[#222222] transition-colors">Dashboard</Link>
              <Link href="/salon-unas/admin/citas" className="hover:text-[#222222] transition-colors">Citas</Link>
              <Link href="/salon-unas/admin/ventas" className="hover:text-[#222222] transition-colors">Ventas</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/salon-unas"
              target="_blank"
              className="text-xs text-[#6a6a6a] hover:text-[#222222] transition-colors hidden sm:block"
            >
              Ver sitio →
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-xs px-3 py-1.5 rounded-full border border-[#dddddd] text-[#6a6a6a] hover:border-[#222222] hover:text-[#222222] transition-colors"
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
