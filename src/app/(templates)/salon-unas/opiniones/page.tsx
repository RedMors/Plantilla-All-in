import { Star } from 'lucide-react'
import { getTestimonials } from '@/lib/salon/queries'
import { BRAND, INK, CREAM } from '../constants'

export const dynamic = 'force-dynamic'

export default async function OpinionesPage() {
  const testimonials = await getTestimonials()
  const avg = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.stars, 0) / testimonials.length).toFixed(1)
    : null

  return (
    <div style={{ background: CREAM }} className="min-h-screen">
      {/* Header con stat de rating */}
      <div className="border-b border-[#EDE9E3] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: BRAND }}>
            Clientas satisfechas
          </p>
          <h1 className="text-4xl font-bold tracking-tight mb-6" style={{ color: INK }}>
            Opiniones
          </h1>

          {avg && (
            <div className="flex items-center gap-5 border-t border-[#EDE9E3] pt-6">
              <div>
                <p
                  className="text-5xl font-bold tracking-tight leading-none"
                  style={{ color: INK }}
                >
                  {avg}
                </p>
                <p className="text-[10px] text-[#B0A89E] uppercase tracking-wide mt-1">de 5</p>
              </div>
              <div className="w-px h-10 bg-[#EDE9E3]" />
              <div>
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(n => {
                    const filled = n <= Math.round(parseFloat(avg))
                    return (
                      <Star
                        key={n}
                        size={16}
                        strokeWidth={1.5}
                        fill={filled ? BRAND : 'none'}
                        color={BRAND}
                      />
                    )
                  })}
                </div>
                <p className="text-xs text-[#6B6560]">{testimonials.length} reseñas verificadas</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid de opiniones */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        {testimonials.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl font-bold tracking-tight mb-2" style={{ color: INK }}>
              Sin opiniones aún
            </p>
            <p className="text-sm text-[#6B6560]">
              Las reseñas de nuestras clientas aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EDE9E3]">
            {testimonials.map(t => (
              <div
                key={t.id}
                className="bg-white p-8 flex flex-col gap-5"
              >
                {/* Estrellas */}
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={13} strokeWidth={1.5} fill={BRAND} color={BRAND} />
                  ))}
                </div>

                {/* Cita */}
                <p
                  className="text-[28px] font-bold leading-none"
                  style={{ color: BRAND, fontFamily: 'Georgia, serif' }}
                >
                  &ldquo;
                </p>
                <p className="text-sm text-[#3F3A38] leading-relaxed -mt-4 flex-1">
                  {t.text}
                </p>

                {/* Autor */}
                <div className="pt-4 border-t border-[#EDE9E3]">
                  <p className="text-xs font-semibold tracking-[0.1em] uppercase" style={{ color: INK }}>
                    {t.customer_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
