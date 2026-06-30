import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getServiceBySlug,
  getVariants,
  getRelatedServices,
  getTakenSlots,
  getTestimonials,
} from '@/lib/salon/queries'
import BookingWidget from '../../BookingWidget'
import { BRAND } from '../../constants'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return {}
  const description = service.description ?? service.tagline ?? `${service.name} en Nails by Mariela, San Salvador. Desde $${service.price}.`
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
    ? parseFloat((testimonials.reduce((s, t) => s + t.stars, 0) / testimonials.length).toFixed(1))
    : undefined

  return (
    <>
      {/* Service hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${service.gradient_from} 0%, ${service.gradient_to} 100%)`,
            opacity: 0.15,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#8A7176] mb-6">
            <Link href="/salon-unas-lite" className="hover:underline">Inicio</Link>
            <span>/</span>
            <Link href="/salon-unas-lite/servicios" className="hover:underline">Servicios</Link>
            <span>/</span>
            <span className="text-[#3A2A2E] font-medium">{service.name}</span>
          </nav>

          <div className="flex items-start gap-6">
            <div
              className="w-20 h-20 rounded-2xl shrink-0"
              style={{ background: `linear-gradient(135deg, ${service.gradient_from}, ${service.gradient_to})` }}
            />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: BRAND }}>{service.tagline}</p>
              <h1 className="text-4xl font-bold text-[#3A2A2E] mb-3 leading-tight">{service.name}</h1>
              <p className="text-lg text-[#8A7176] max-w-2xl leading-relaxed">{service.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detail + Booking */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">

            <section>
              <h2 className="text-xl font-bold text-[#3A2A2E] mb-6">Elige tu opción</h2>
              <div className="space-y-3">
                {variants.map((variant, i) => (
                  <label
                    key={variant.id}
                    className="flex items-start gap-4 p-5 rounded-2xl border border-[#EFE0DD] cursor-pointer hover:border-[#B86A82] transition-colors"
                  >
                    <input
                      type="radio"
                      name="variant"
                      defaultChecked={i === 0}
                      className="mt-1 accent-[#B86A82] w-4 h-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="font-semibold text-[#3A2A2E]">{variant.name}</span>
                        <span className="font-bold text-lg" style={{ color: BRAND }}>${variant.price}</span>
                      </div>
                      <p className="text-sm text-[#8A7176] mt-1">
                        {variant.description}
                        {variant.duration !== '-' && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#B6A4A7]">
                            {variant.duration}
                          </span>
                        )}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3A2A2E] mb-5">¿Qué incluye?</h2>
              <ul className="space-y-3">
                {service.includes.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#8A7176]">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                      style={{ background: BRAND }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#3A2A2E] mb-6">Preguntas frecuentes</h2>
              <div className="space-y-4">
                {service.faqs.map((faq, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#F7E8E6]">
                    <p className="font-semibold text-[#3A2A2E] mb-2">{faq.q}</p>
                    <p className="text-sm text-[#8A7176] leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <BookingWidget
              serviceId={service.id}
              serviceName={service.name}
              servicePrice={service.price}
              variants={variants}
              takenSlots={takenSlots}
              rating={rating}
              reviewCount={testimonials.length}
            />
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#EFE0DD]">
            <h2 className="text-xl font-bold text-[#3A2A2E] mb-6">También te puede interesar</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map(rel => (
                <Link
                  key={rel.slug}
                  href={`/salon-unas-lite/servicios/${rel.slug}`}
                  className="group flex flex-col rounded-2xl border border-[#EFE0DD] overflow-hidden transition-transform hover:-translate-y-0.5"
                >
                  <div
                    className="h-28"
                    style={{ background: `linear-gradient(135deg, ${rel.gradient_from}, ${rel.gradient_to})` }}
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="font-semibold text-[#3A2A2E] mb-1 group-hover:underline">{rel.name}</p>
                    <p className="text-sm text-[#8A7176] flex-1 mb-3 line-clamp-2">{rel.tagline}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: BRAND }}>Desde ${rel.price}</span>
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background: '#F7E8E6', color: BRAND }}
                      >
                        Ver más →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
