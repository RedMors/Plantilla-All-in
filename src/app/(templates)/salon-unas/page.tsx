import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { Star, Calendar, Award, ShieldCheck, MapPin, Phone, Clock, Camera, Scissors } from 'lucide-react'
import { getServices, getGallery, getTestimonials } from '@/lib/salon/queries'
import SearchBar from './SearchBar'
import MobileNav from './MobileNav'

export const dynamic = 'force-dynamic'

const BRAND = '#ff385c'

const STATS = [
  { Icon: Star,         label: '4.9 / 5',             sub: '280+ reseñas' },
  { Icon: Calendar,     label: 'Lun – Sáb',           sub: '8:00 am – 7:00 pm' },
  { Icon: Award,        label: '5 años',               sub: 'de experiencia' },
  { Icon: ShieldCheck,  label: 'Higiene garantizada',  sub: 'Materiales desechables' },
]

const CONTACT = [
  { Icon: MapPin,    label: 'Dirección',           value: 'Col. Escalón, San Salvador, El Salvador', href: undefined },
  { Icon: Phone,     label: 'Teléfono / WhatsApp', value: '+503 7890-1234',                          href: 'tel:+50378901234' },
  { Icon: Clock,     label: 'Horario',             value: 'Lunes a Sábado · 8:00 am – 7:00 pm',    href: undefined },
  { Icon: Camera,    label: 'Instagram',           value: '@nailsbymariela.sv',                      href: '#' },
]

export default async function SalonUnasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim().toLowerCase() ?? ''

  const [allServices, gallery, testimonials] = await Promise.all([
    getServices(),
    getGallery(),
    getTestimonials(),
  ])

  const services = query
    ? allServices.filter(s =>
        `${s.name} ${s.tagline} ${s.description}`.toLowerCase().includes(query)
      )
    : allServices

  return (
    <div
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      className="min-h-screen bg-white text-[#222222]"
    >
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#ebebeb] relative">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <a href="/salon-unas" className="flex items-center gap-2.5 shrink-0">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: BRAND }}
            >
              N
            </span>
            <span className="font-semibold text-[#222222] hidden sm:block">Nails by Mariela</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: '#servicios', label: 'Servicios' },
              { href: '#galeria',   label: 'Galería' },
              { href: '#opiniones', label: 'Opiniones' },
              { href: '#contacto',  label: 'Contacto' },
            ].map(l => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-[#3f3f3f] hover:text-[#222222] transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <MobileNav />
            {/* CTA — always visible */}
            <a
              href="#reservar"
              className="shrink-0 px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: BRAND }}
            >
              Reservar cita
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-white overflow-hidden">
        <div className="relative h-[420px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1400&q=85&fit=crop&crop=center"
            alt="Salón de uñas Nails by Mariela"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-3">
              San Salvador · Col. Escalón
            </p>
            <h1
              className="font-bold text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(32px, 5.5vw, 58px)', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}
            >
              Uñas que te hacen sentir
              <br />en tu mejor versión
            </h1>
            <p className="text-white/85 text-lg mb-8 max-w-xl leading-relaxed">
              En Nails by Mariela cuidamos cada detalle para que salgas impecable.
              Precios reales. Resultados que duran.
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <a
                href="#reservar"
                className="px-7 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: BRAND }}
              >
                Reservar ahora
              </a>
              <a
                href="#servicios"
                className="px-7 py-3 rounded-full text-sm font-semibold bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25 transition-colors"
              >
                Ver servicios
              </a>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="border-b border-[#ebebeb]">
          <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {STATS.map(({ Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon size={20} color={BRAND} strokeWidth={1.8} />
                <p className="text-sm font-semibold text-[#222222]">{label}</p>
                <p className="text-xs text-[#6a6a6a]">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          <Suspense fallback={<div className="h-14 rounded-full bg-[#f7f7f7] animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section id="servicios" className="py-16 px-6 bg-[#f7f7f7]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-[#222222] mb-2">
              {query ? `Resultados para "${q}"` : 'Nuestros servicios'}
            </h2>
            <p className="text-[#6a6a6a]">
              {query
                ? `${services.length} servicio${services.length !== 1 ? 's' : ''} encontrado${services.length !== 1 ? 's' : ''}`
                : 'Cada servicio incluye atención personalizada y materiales de calidad'}
            </p>
            {query && (
              <Link href="/salon-unas#servicios" className="inline-block mt-2 text-sm underline" style={{ color: BRAND }}>
                ← Ver todos
              </Link>
            )}
          </div>

          {services.length === 0 && (
            <div className="text-center py-16">
              <Scissors size={48} className="mx-auto mb-4 text-[#ccc]" />
              <p className="text-lg font-semibold text-[#222222] mb-2">Sin resultados para &ldquo;{q}&rdquo;</p>
              <p className="text-sm text-[#6a6a6a] mb-6">Prueba con &quot;manicure&quot;, &quot;pedicure&quot; o &quot;nail art&quot;</p>
              <Link href="/salon-unas#servicios" className="px-6 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: BRAND }}>
                Ver todos los servicios
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div
                key={service.slug}
                className="bg-white rounded-2xl overflow-hidden flex flex-col"
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
                  <h3 className="font-bold text-[#222222] text-base">{service.name}</h3>
                  <p className="text-sm text-[#6a6a6a] leading-relaxed flex-1 line-clamp-3">
                    {service.description ?? service.tagline}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-[#ebebeb] mt-1">
                    <div>
                      <p className="text-xs text-[#929292]">Desde</p>
                      <p className="font-bold text-lg" style={{ color: BRAND }}>${service.price}</p>
                    </div>
                    <Link
                      href={`/salon-unas/servicios/${service.slug}`}
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
      </section>

      {/* GALLERY */}
      <section id="galeria" className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-[#222222] mb-2">Nuestro trabajo</h2>
            <p className="text-[#6a6a6a]">Cada diseño es hecho a mano con amor y precisión</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gallery.map((item, i) => (
              <div key={item.id ?? i} className="relative rounded-2xl overflow-hidden aspect-square group cursor-pointer">
                <Image
                  src={item.image_url}
                  alt={item.alt_text ?? ''}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="opiniones" className="py-16 px-6 bg-[#f7f7f7]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-[#222222] mb-2">Lo que dicen nuestras clientas</h2>
            <p className="text-[#6a6a6a]">4.9 estrellas en promedio · 280+ opiniones verificadas</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.id} className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={14} fill={BRAND} color={BRAND} />
                  ))}
                </div>
                <p className="text-sm text-[#3f3f3f] leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="text-sm font-semibold text-[#222222]">{t.customer_name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING CTA */}
      <section id="reservar" className="py-20 px-6" style={{ background: BRAND }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Tu siguiente cita está a un clic</h2>
          <p className="text-white/80 text-base mb-8 leading-relaxed">
            Disponible lunes a sábado de 8 am a 7 pm. Sin cargos hasta confirmar.
          </p>
          <a
            href="#contacto"
            className="inline-block px-8 py-3.5 rounded-full font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: '#ffffff', color: BRAND }}
          >
            Escribirnos por WhatsApp
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacto" className="bg-[#222222] text-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: BRAND }}>N</span>
                <span className="font-bold text-white text-lg">Nails by Mariela</span>
              </div>
              <p className="text-[#929292] text-sm leading-relaxed max-w-xs">
                Más de 5 años cuidando las uñas de mujeres salvadoreñas que saben lo que quieren: calidad, higiene y resultados que duran.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {CONTACT.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon size={16} className="mt-0.5 shrink-0 text-[#929292]" />
                  <div>
                    <p className="text-xs font-semibold text-[#929292] uppercase tracking-wide mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-white/70 hover:text-white transition-colors">{value}</a>
                    ) : (
                      <p className="text-sm text-white/70">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white text-xl mb-6">Reserva o consúltanos</h3>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">Nombre</label>
                <input type="text" placeholder="Tu nombre completo" className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-[#6a6a6a] outline-none focus:border-white/40 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">Teléfono</label>
                <input type="tel" placeholder="+503 0000-0000" className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-[#6a6a6a] outline-none focus:border-white/40 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">Servicio de interés</label>
                <select className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-sm text-white/70 outline-none focus:border-white/40 transition-colors">
                  <option value="">Selecciona un servicio...</option>
                  {allServices.map(s => (
                    <option key={s.slug} value={s.slug}>{s.name} — desde ${s.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">Mensaje</label>
                <textarea rows={3} placeholder="¿Tienes alguna fecha en mente o pregunta especial?" className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-[#6a6a6a] outline-none focus:border-white/40 transition-colors resize-none" />
              </div>
              <button type="submit" className="w-full py-3 rounded-full font-semibold text-sm text-white transition-opacity hover:opacity-90" style={{ background: BRAND }}>
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#6a6a6a]">© {new Date().getFullYear()} Nails by Mariela · San Salvador, El Salvador</p>
          <p className="text-xs text-[#6a6a6a]">Hecho con amor para clientas que merecen lo mejor</p>
        </div>
      </footer>
    </div>
  )
}
