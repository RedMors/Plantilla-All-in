import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { ArrowRight, Star } from 'lucide-react'
import { getServices, getRatingStats } from '@/lib/salon/queries'
import SearchBar from './SearchBar'
import { BRAND, INK, CREAM } from './constants'

export const dynamic = 'force-dynamic'

const PILLARS = [
  { num: '5+', label: 'Años de experiencia' },
  { num: '800+', label: 'Clientas atendidas' },
  { num: '100%', label: 'Materiales premium' },
  { num: 'Lun–Sáb', label: '8:00 am – 7:00 pm' },
]

const SECTION_LINKS = [
  { href: '/salon-unas/servicios', label: 'Servicios', desc: 'Manicure, pedicure, nail art, acrílicas y más.' },
  { href: '/salon-unas/galeria',   label: 'Galería',   desc: 'Trabajos reales, resultados que hablan solos.' },
  { href: '/salon-unas/opiniones', label: 'Opiniones', desc: 'Lo que dicen quienes ya nos visitaron.' },
  { href: '/salon-unas/contacto',  label: 'Contacto',  desc: 'Reserva tu cita o escríbenos.' },
]

export default async function SalonUnasHome() {
  const [featured, ratingStats] = await Promise.all([
    getServices(3),
    getRatingStats(),
  ])

  return (
    <>
      {/* HERO — editorial oscuro */}
      <section className="relative bg-[#0B0B0B] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1600&q=85&fit=crop&crop=center"
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/80 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 min-h-[92vh] flex flex-col justify-end pb-20 pt-32">
          <div className="max-w-2xl">
            <p
              className="text-[11px] font-semibold tracking-[0.35em] uppercase mb-8"
              style={{ color: BRAND }}
            >
              Nail Studio · San Salvador · Col. Escalón
            </p>

            <h1
              className="text-white leading-[0.95] font-bold mb-8 tracking-tight"
              style={{ fontSize: 'clamp(52px, 8vw, 96px)' }}
            >
              Uñas que<br />hablan<br />
              <span style={{ color: BRAND }}>por ti.</span>
            </h1>

            <p className="text-white/55 text-lg leading-relaxed mb-10 max-w-md">
              Materiales premium. Atención personalizada. Resultados que duran semanas.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/salon-unas/contacto"
                className="inline-flex items-center gap-3 text-white text-sm font-semibold tracking-wide px-8 py-4 hover:opacity-90 transition-opacity"
                style={{ background: BRAND }}
              >
                Reservar cita
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>
              <Link
                href="/salon-unas/servicios"
                className="inline-flex items-center gap-2 border border-white/25 text-white/80 text-sm font-medium px-8 py-4 hover:border-white/60 hover:text-white transition-all"
              >
                Ver servicios
              </Link>
            </div>
          </div>

          {ratingStats && (
            <div className="absolute bottom-8 right-6 hidden lg:flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={13} fill={BRAND} color={BRAND} />
                ))}
              </div>
              <span className="text-sm font-semibold text-white">{ratingStats.avg}</span>
              <span className="text-xs text-white/50">· {ratingStats.count} reseñas</span>
            </div>
          )}
        </div>
      </section>

      {/* CIFRAS */}
      <section className="border-b border-[#EDE9E3]" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#EDE9E3]">
            {PILLARS.map(({ num, label }) => (
              <div key={label} className="py-8 px-6 text-center">
                <p className="text-2xl font-bold tracking-tight mb-1" style={{ color: INK }}>{num}</p>
                <p className="text-xs text-[#6B6560] tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS DESTACADOS — bento grid */}
      {featured.length > 0 && (
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: BRAND }}>
                  Lo más popular
                </p>
                <h2 className="text-3xl font-bold tracking-tight" style={{ color: INK }}>
                  Servicios destacados
                </h2>
              </div>
              <Link
                href="/salon-unas/servicios"
                className="hidden sm:flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#6B6560] hover:text-[#1A1A1A] transition-colors"
              >
                Ver todos <ArrowRight size={13} strokeWidth={1.5} />
              </Link>
            </div>

            {/* Bento grid: 1 card grande + 2 pequeñas */}
            <div className="grid md:grid-cols-5 gap-4 auto-rows-[220px]">
              {featured[0] && (
                <Link
                  href={`/salon-unas/servicios/${featured[0].slug}`}
                  className="md:col-span-3 md:row-span-2 group relative overflow-hidden flex flex-col justify-end p-8"
                  style={{ background: INK, minHeight: '220px' }}
                >
                  {featured[0].image_url ? (
                    <Image
                      src={featured[0].image_url}
                      alt={featured[0].name}
                      fill
                      className="object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                      sizes="60vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ background: `linear-gradient(135deg, ${featured[0].gradient_from}, ${featured[0].gradient_to})` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="relative">
                    <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-2" style={{ color: BRAND }}>
                      {featured[0].tagline}
                    </p>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#C4965A] transition-colors">
                      {featured[0].name}
                    </h3>
                    <p className="text-white/60 text-sm mb-4 line-clamp-2 max-w-sm">
                      {featured[0].description ?? featured[0].tagline}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                      Desde ${featured[0].price}
                      <ArrowRight size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              )}

              {featured[1] && (
                <Link
                  href={`/salon-unas/servicios/${featured[1].slug}`}
                  className="md:col-span-2 group relative overflow-hidden flex flex-col justify-end p-6"
                  style={{ background: '#F5EFE8' }}
                >
                  {featured[1].image_url && (
                    <Image
                      src={featured[1].image_url}
                      alt={featured[1].name}
                      fill
                      className="object-cover opacity-25 transition-transform duration-700 group-hover:scale-105"
                      sizes="40vw"
                    />
                  )}
                  <div className="relative">
                    <p className="text-xs font-semibold" style={{ color: BRAND }}>Desde ${featured[1].price}</p>
                    <h3 className="text-lg font-bold group-hover:text-[#C4965A] transition-colors" style={{ color: INK }}>
                      {featured[1].name}
                    </h3>
                  </div>
                </Link>
              )}

              {featured[2] && (
                <Link
                  href={`/salon-unas/servicios/${featured[2].slug}`}
                  className="md:col-span-2 group relative overflow-hidden flex flex-col justify-end p-6 border border-[#EDE9E3]"
                  style={{ background: CREAM }}
                >
                  {featured[2].image_url && (
                    <Image
                      src={featured[2].image_url}
                      alt={featured[2].name}
                      fill
                      className="object-cover opacity-15 transition-transform duration-700 group-hover:scale-105"
                      sizes="40vw"
                    />
                  )}
                  <div className="relative">
                    <p className="text-xs font-semibold" style={{ color: BRAND }}>Desde ${featured[2].price}</p>
                    <h3 className="text-lg font-bold group-hover:text-[#C4965A] transition-colors" style={{ color: INK }}>
                      {featured[2].name}
                    </h3>
                  </div>
                </Link>
              )}
            </div>

            <div className="mt-6 sm:hidden text-center">
              <Link
                href="/salon-unas/servicios"
                className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: BRAND }}
              >
                Ver todos los servicios <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* BÚSQUEDA */}
      <section className="py-16 px-6 border-y border-[#EDE9E3]" style={{ background: CREAM }}>
        <div className="max-w-xl mx-auto text-center mb-8">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: BRAND }}>
            Encuentra tu servicio
          </p>
          <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: INK }}>
            ¿Qué servicio estás buscando?
          </h2>
        </div>
        <Suspense fallback={<div className="h-8 max-w-xl mx-auto bg-[#EDE9E3] animate-pulse" />}>
          <SearchBar />
        </Suspense>
      </section>

      {/* NAV SECTIONS */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#EDE9E3] border border-[#EDE9E3]">
            {SECTION_LINKS.map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="group p-8 flex flex-col gap-4 hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-[0.25em] uppercase" style={{ color: BRAND }}>
                    {label}
                  </span>
                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    className="text-[#D4CCC0] transition-all group-hover:text-[#C4965A] group-hover:translate-x-1"
                  />
                </div>
                <div className="w-8 h-[2px]" style={{ background: '#D4CCC0' }} />
                <p className="text-sm text-[#6B6560] leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING — dark strip */}
      <section className="py-20 px-6 text-center" style={{ background: INK }}>
        <div className="max-w-xl mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: BRAND }}>
            Te esperamos
          </p>
          <h2
            className="text-white font-bold leading-tight tracking-tight mb-6"
            style={{ fontSize: 'clamp(28px, 4vw, 46px)' }}
          >
            Tu próxima cita,<br />a un clic.
          </h2>
          <Link
            href="/salon-unas/contacto"
            className="inline-flex items-center gap-3 text-white text-sm font-semibold px-8 py-4 hover:opacity-85 transition-opacity"
            style={{ background: BRAND }}
          >
            Reservar ahora
            <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </>
  )
}
