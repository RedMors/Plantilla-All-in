import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { Scissors, Search } from 'lucide-react'
import { getServices } from '@/lib/salon/queries'
import SearchBar from '../SearchBar'
import { BRAND } from '../constants'

export const dynamic = 'force-dynamic'

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim().toLowerCase() ?? ''

  const services = await getServices(undefined, query || undefined)

  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#222222] mb-2">
            {query ? `Resultados para "${q}"` : 'Nuestros servicios'}
          </h1>
          <p className="text-[#6a6a6a]">
            {query
              ? `${services.length} servicio${services.length !== 1 ? 's' : ''} encontrado${services.length !== 1 ? 's' : ''}`
              : 'Cada servicio incluye atención personalizada y materiales de calidad'}
          </p>
          {query && (
            <Link href="/salon-unas-lite/servicios" className="inline-block mt-2 text-sm underline" style={{ color: BRAND }}>
              ← Ver todos
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-10">
          <Suspense fallback={<div className="h-14 rounded-full bg-[#f7f7f7] animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Empty state */}
        {services.length === 0 && (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto mb-4 text-[#ccc]" />
            <p className="text-lg font-semibold text-[#222222] mb-2">Sin resultados para &ldquo;{q}&rdquo;</p>
            <p className="text-sm text-[#6a6a6a] mb-6">Prueba con &quot;manicure&quot;, &quot;pedicure&quot; o &quot;nail art&quot;</p>
            <Link href="/salon-unas-lite/servicios" className="px-6 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: BRAND }}>
              Ver todos los servicios
            </Link>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div
              key={service.slug}
              className="bg-white rounded-2xl overflow-hidden flex flex-col border border-[#ebebeb]"
              style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
            >
              <div className="relative h-44 w-full overflow-hidden bg-[#f7f7f7]">
                {service.image_url ? (
                  <Image
                    src={service.image_url}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div
                    className="h-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${service.gradient_from ?? '#fda4af'}, ${service.gradient_to ?? '#fb7185'})` }}
                  >
                    <Scissors size={36} className="text-white/70" />
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1 gap-2">
                <h2 className="font-bold text-[#222222] text-base">{service.name}</h2>
                <p className="text-sm text-[#6a6a6a] leading-relaxed flex-1 line-clamp-3">
                  {service.description ?? service.tagline}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-[#ebebeb] mt-1">
                  <div>
                    <p className="text-xs text-[#929292]">Desde</p>
                    <p className="font-bold text-lg" style={{ color: BRAND }}>${service.price}</p>
                  </div>
                  <Link
                    href={`/salon-unas-lite/servicios/${service.slug}`}
                    className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: BRAND }}
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
