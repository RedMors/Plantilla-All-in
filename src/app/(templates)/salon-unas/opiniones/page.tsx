import { Star } from 'lucide-react'
import { getTestimonials } from '@/lib/salon/queries'

export const dynamic = 'force-dynamic'

const BRAND = '#ff385c'

export default async function OpinionesPage() {
  const testimonials = await getTestimonials()
  const avg = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.stars, 0) / testimonials.length).toFixed(1)
    : null

  return (
    <div className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#222222] mb-2">Lo que dicen nuestras clientas</h1>
          {avg && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={18} fill={BRAND} color={BRAND} />
                ))}
              </div>
              <span className="font-bold text-[#222]">{avg}</span>
              <span className="text-sm text-[#6a6a6a]">· {testimonials.length} opiniones</span>
            </div>
          )}
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-20 text-[#6a6a6a]">
            <p className="text-lg font-semibold text-[#222]">Sin opiniones aún</p>
            <p className="text-sm mt-2">Las reseñas de nuestras clientas aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-6 border border-[#ebebeb]"
                style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
              >
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
        )}
      </div>
    </div>
  )
}
