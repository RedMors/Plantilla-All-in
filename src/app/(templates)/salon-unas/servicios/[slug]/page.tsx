import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import {
  getServiceBySlug,
  getVariants,
  getRelatedServices,
  getTakenSlots,
  getTestimonials,
} from '@/lib/salon/queries'
import BookingWidget from '../../BookingWidget'
import { BRAND, INK, CREAM } from '../../constants'
import { config } from '../../template.config'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return {}
  const description =
    service.description ??
    service.tagline ??
    `${service.name} en Nails by Mariela, San Salvador. Desde $${service.price}.`
  return {
    title: `${service.name} — Nails by Mariela`,
    description,
    openGraph: {
      title: `${service.name} — Nails by Mariela`,
      description,
      ...(service.image_url ? { images: [{ url: service.image_url }] } : {}),
    },
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  const [variants, related, takenSlots, testimonials] = await Promise.all([
    getVariants(service.id),
    getRelatedServices(service.related_slugs),
    getTakenSlots(service.id, 30),
    getTestimonials(),
  ])

  const rating = testimonials.length
    ? parseFloat(
        (testimonials.reduce((s, t) => s + t.stars, 0) / testimonials.length).toFixed(1)
      )
    : undefined

  return (
    <div style={{ background: CREAM }} className="min-h-screen">
      {/* Hero del servicio */}
      <div
        className="relative border-b border-[#EDE9E3]"
        style={{ background: INK }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${service.gradient_from} 0%, ${service.gradient_to} 100%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">
          {/* Back button */}
          <Link
            href="/salon-unas/servicios"
            className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-white/40 hover:text-white/80 transition-colors mb-10"
          >
            <ArrowLeft size={13} strokeWidth={1.5} />
            Servicios
          </Link>

          <div className="max-w-2xl">
            <p
              className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-4"
              style={{ color: BRAND }}
            >
              {service.tagline}
            </p>
            <h1
              className="text-white font-semibold leading-tight mb-5"
              style={{ fontSize: 'clamp(32px, 5vw, 58px)', fontFamily: 'var(--font-cormorant), Georgia, serif', letterSpacing: '-0.01em' }}
            >
              {service.name}
            </h1>
            {service.description && (
              <p className="text-white/55 text-base leading-relaxed max-w-xl">
                {service.description}
              </p>
            )}
            <div className="flex items-baseline gap-2 mt-6">
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Desde</p>
              <p className="text-3xl font-bold text-white tracking-tight">${service.price}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Columna izquierda — detalles */}
          <div className="lg:col-span-2 space-y-14">

            {/* Variantes */}
            {variants.length > 0 && (
              <section>
                <h2 className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-6" style={{ color: BRAND }}>
                  Elige tu opción
                </h2>
                <div className="flex flex-col gap-px bg-[#EDE9E3]">
                  {variants.map((variant, i) => (
                    <label
                      key={variant.id}
                      className="group flex items-start gap-5 p-6 bg-white cursor-pointer hover:bg-[#FAF9F6] transition-colors"
                    >
                      <input
                        type="radio"
                        name="variant"
                        defaultChecked={i === 0}
                        className="mt-1 shrink-0 accent-[#C4965A] w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                          <span className="font-semibold text-sm" style={{ color: INK }}>
                            {variant.name}
                          </span>
                          <span className="text-lg font-bold tracking-tight" style={{ color: BRAND }}>
                            ${variant.price}
                          </span>
                        </div>
                        <p className="text-sm text-[#6B6560]">
                          {variant.description}
                          {variant.duration !== '-' && (
                            <span className="ml-2 text-xs text-[#B0A89E]">{variant.duration}</span>
                          )}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {/* Qué incluye */}
            {service.includes.length > 0 && (
              <section>
                <h2 className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-6" style={{ color: BRAND }}>
                  ¿Qué incluye?
                </h2>
                <div className="flex flex-col gap-3">
                  {service.includes.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span
                        className="w-5 h-5 flex items-center justify-center shrink-0"
                        style={{ background: BRAND }}
                      >
                        <Check size={11} strokeWidth={2.5} color="white" />
                      </span>
                      <span className="text-sm text-[#3F3A38]">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {service.faqs.length > 0 && (
              <section>
                <h2 className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-6" style={{ color: BRAND }}>
                  Preguntas frecuentes
                </h2>
                <div className="flex flex-col gap-px bg-[#EDE9E3]">
                  {service.faqs.map((faq, i) => (
                    <div key={i} className="bg-white p-6">
                      <p className="text-sm font-semibold mb-2" style={{ color: INK }}>
                        {faq.q}
                      </p>
                      <p className="text-sm text-[#6B6560] leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Columna derecha — booking */}
          <div className="lg:col-span-1">
            <BookingWidget
              serviceId={service.id}
              serviceName={service.name}
              servicePrice={service.price}
              serviceImageUrl={service.image_url ?? undefined}
              variants={variants}
              takenSlots={takenSlots}
              rating={rating}
              reviewCount={testimonials.length}
              methods={config.methods}
            />
          </div>
        </div>

        {/* Servicios relacionados */}
        {related.length > 0 && (
          <section className="mt-20 pt-14 border-t border-[#EDE9E3]">
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-2" style={{ color: BRAND }}>
              Relacionados
            </p>
            <h2 className="text-2xl font-bold tracking-tight mb-10" style={{ color: INK }}>
              También te puede interesar
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EDE9E3]">
              {related.map(rel => (
                <Link
                  key={rel.slug}
                  href={`/salon-unas/servicios/${rel.slug}`}
                  className="group bg-white p-7 flex flex-col gap-4 hover:bg-[#FAF9F6] transition-colors"
                >
                  <div
                    className="h-1.5 w-12"
                    style={{ background: BRAND }}
                  />
                  <div>
                    <p className="text-sm font-bold group-hover:text-[#C4965A] transition-colors mb-1" style={{ color: INK }}>
                      {rel.name}
                    </p>
                    <p className="text-xs text-[#6B6560] line-clamp-2">{rel.tagline}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#EDE9E3]">
                    <span className="text-sm font-bold" style={{ color: BRAND }}>
                      Desde ${rel.price}
                    </span>
                    <ArrowRight
                      size={14}
                      strokeWidth={1.5}
                      className="text-[#D4CCC0] group-hover:text-[#C4965A] transition-colors"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky CTA — solo móvil */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 border-t border-[#EDE9E3]" style={{ background: CREAM }}>
        <div>
          <p className="text-[10px] text-[#B0A89E] uppercase tracking-wide">{service.name}</p>
          <p className="text-lg font-bold tracking-tight" style={{ color: INK }}>Desde ${service.price}</p>
        </div>
        <a
          href="#booking-widget"
          className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3"
          style={{ background: BRAND }}
        >
          Reservar
          <ArrowRight size={14} strokeWidth={1.5} />
        </a>
      </div>
    </div>
  )
}
