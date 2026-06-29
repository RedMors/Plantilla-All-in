import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { getServices } from '@/lib/salon/queries'
import SearchBar from '../SearchBar'
import { BRAND, INK, CREAM } from '../constants'
import ServiceImage from '@/components/salon/ServiceImage'

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
    <div style={{ background: CREAM }} className="min-h-screen">
      {/* Header de sección */}
      <div className="border-b border-[#EDE9E3] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: BRAND }}>
            Nails by Mariela
          </p>
          <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: INK }}>
            {query ? `Resultados para "${q}"` : 'Nuestros servicios'}
          </h1>
          <p className="text-[#6B6560]">
            {query
              ? `${services.length} servicio${services.length !== 1 ? 's' : ''} encontrado${services.length !== 1 ? 's' : ''}`
              : 'Atención personalizada. Materiales de calidad. Resultados que duran.'}
          </p>
          {query && (
            <Link
              href="/salon-unas/servicios"
              className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-semibold tracking-[0.1em] uppercase"
              style={{ color: BRAND }}
            >
              ← Todos los servicios
            </Link>
          )}

          <div className="mt-8 max-w-md">
            <Suspense fallback={<div className="h-8 bg-[#EDE9E3] animate-pulse" />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        {services.length === 0 ? (
          <div className="text-center py-24">
            <Search size={36} strokeWidth={1} className="mx-auto mb-5 text-[#D4CCC0]" />
            <p className="text-xl font-bold tracking-tight mb-2" style={{ color: INK }}>
              Sin resultados para &ldquo;{q}&rdquo;
            </p>
            <p className="text-sm text-[#6B6560] mb-8">
              Prueba con &quot;manicure&quot;, &quot;pedicure&quot; o &quot;nail art&quot;
            </p>
            <Link
              href="/salon-unas/servicios"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-7 py-3.5"
              style={{ background: BRAND }}
            >
              Ver todos los servicios
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EDE9E3]">
            {services.map(service => (
              <Link
                key={service.slug}
                href={`/salon-unas/servicios/${service.slug}`}
                className="group bg-white flex flex-col overflow-hidden hover:bg-[#FAF9F6] transition-colors"
              >
                {/* Imagen o gradiente */}
                <div className="relative h-52 overflow-hidden">
                  {service.image_url ? (
                    <ServiceImage
                      src={service.image_url}
                      alt={service.name}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      gradientFrom={service.gradient_from}
                      gradientTo={service.gradient_to}
                    />
                  ) : (
                    <div
                      className="h-full w-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${service.gradient_from ?? '#E8E2D9'}, ${service.gradient_to ?? '#D4CCC0'})`,
                      }}
                    >
                      <span className="text-3xl" style={{ color: 'rgba(255,255,255,0.4)' }}>✦</span>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-7 flex flex-col flex-1 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1.5" style={{ color: BRAND }}>
                      {service.tagline}
                    </p>
                    <h2 className="text-lg font-bold tracking-tight group-hover:text-[#C4965A] transition-colors" style={{ color: INK }}>
                      {service.name}
                    </h2>
                  </div>
                  <p className="text-sm text-[#6B6560] leading-relaxed flex-1 line-clamp-3">
                    {service.description ?? service.tagline}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#EDE9E3]">
                    <div>
                      <p className="text-[10px] text-[#B0A89E] uppercase tracking-wide">Desde</p>
                      <p className="text-xl font-bold tracking-tight" style={{ color: INK }}>${service.price}</p>
                    </div>
                    <span
                      className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all group-hover:gap-2.5"
                      style={{ color: BRAND }}
                    >
                      Ver <ArrowRight size={12} strokeWidth={1.5} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
