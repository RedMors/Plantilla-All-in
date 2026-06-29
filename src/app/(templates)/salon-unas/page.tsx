import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { Star, Calendar, Award, ShieldCheck, Scissors, ArrowRight, Images, MessageCircle, Phone } from 'lucide-react'
import { getServices, getRatingStats } from '@/lib/salon/queries'
import SearchBar from './SearchBar'
import { BRAND } from './constants'

export const dynamic = 'force-dynamic'

const STATIC_STATS = [
  { Icon: Calendar,    label: 'Lun – Sáb',          sub: '8:00 am – 7:00 pm' },
  { Icon: Award,       label: '5 años',              sub: 'de experiencia' },
  { Icon: ShieldCheck, label: 'Higiene garantizada', sub: 'Materiales desechables' },
]

const SECTION_CARDS = [
  { href: '/salon-unas/servicios', Icon: Scissors,       title: 'Servicios',  desc: 'Manicure, pedicure, nail art y más. Elige lo que más te gusta.' },
  { href: '/salon-unas/galeria',   Icon: Images,          title: 'Galería',    desc: 'Mira nuestros trabajos más recientes hechos por Mariela.' },
  { href: '/salon-unas/opiniones', Icon: MessageCircle,   title: 'Opiniones',  desc: 'Lo que dicen nuestras clientas sobre cada visita.' },
  { href: '/salon-unas/contacto',  Icon: Phone,           title: 'Contacto',   desc: 'Escríbenos para agendar o resolver cualquier duda.' },
]

export default async function SalonUnasHome() {
  const [featured, ratingStats] = await Promise.all([
    getServices(3),
    getRatingStats(),
  ])

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="relative h-[480px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1400&q=85&fit=crop&crop=center"
            alt="Salón de uñas Nails by Mariela"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/55" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-3">
              San Salvador · Col. Escalón
            </p>
            <h1
              className="font-bold text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(30px, 5.5vw, 56px)', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}
            >
              Uñas que te hacen sentir
              <br />en tu mejor versión
            </h1>
            <p className="text-white/85 text-lg mb-8 max-w-xl leading-relaxed">
              En Nails by Mariela cuidamos cada detalle para que salgas impecable.
              Precios reales. Resultados que duran.
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link
                href="/salon-unas/contacto"
                className="px-7 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: BRAND }}
              >
                Reservar ahora
              </Link>
              <Link
                href="/salon-unas/servicios"
                className="px-7 py-3 rounded-full text-sm font-semibold bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25 transition-colors"
              >
                Ver servicios
              </Link>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="border-b border-[#ebebeb]">
          <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {ratingStats && (
              <div className="flex flex-col items-center gap-1">
                <Star size={20} color={BRAND} strokeWidth={1.8} />
                <p className="text-sm font-semibold text-[#222222]">{ratingStats.avg} / 5</p>
                <p className="text-xs text-[#6a6a6a]">{ratingStats.count} reseñas</p>
              </div>
            )}
            {STATIC_STATS.map(({ Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon size={20} color={BRAND} strokeWidth={1.8} />
                <p className="text-sm font-semibold text-[#222222]">{label}</p>
                <p className="text-xs text-[#6a6a6a]">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH */}
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Suspense fallback={<div className="h-14 rounded-full bg-[#f7f7f7] animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>
      </section>

      {/* FEATURED SERVICES */}
      {featured.length > 0 && (
        <section className="py-14 px-6 bg-[#f7f7f7]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#222222]">Servicios populares</h2>
                <p className="text-sm text-[#6a6a6a] mt-1">Los favoritos de nuestras clientas</p>
              </div>
              <Link
                href="/salon-unas/servicios"
                className="flex items-center gap-1.5 text-sm font-semibold hover:underline"
                style={{ color: BRAND }}
              >
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {featured.map(s => (
                <Link
                  key={s.slug}
                  href={`/salon-unas/servicios/${s.slug}`}
                  className="bg-white rounded-2xl overflow-hidden group"
                  style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
                >
                  <div className="relative h-36 w-full bg-[#f7f7f7]">
                    {s.image_url ? (
                      <Image
                        src={s.image_url}
                        alt={s.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <div
                        className="h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${s.gradient_from ?? '#fda4af'}, ${s.gradient_to ?? '#fb7185'})` }}
                      >
                        <Scissors size={28} className="text-white/70" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#222222] text-sm mb-1 group-hover:underline">{s.name}</h3>
                    <p className="text-xs text-[#6a6a6a] line-clamp-2 mb-3">{s.tagline}</p>
                    <p className="font-bold text-sm" style={{ color: BRAND }}>Desde ${s.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION CARDS */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#222222] text-center mb-2">Explora el salón</h2>
          <p className="text-sm text-[#6a6a6a] text-center mb-10">Todo lo que necesitas en un solo lugar</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SECTION_CARDS.map(({ href, Icon, title, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-start gap-4 p-5 rounded-2xl border border-[#ebebeb] hover:border-[#222] hover:shadow-sm transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ background: BRAND }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-[#222222] text-sm group-hover:underline">{title}</p>
                  <p className="text-xs text-[#6a6a6a] mt-1 leading-relaxed">{desc}</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-[#ccc] group-hover:text-[#222] transition-colors shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
