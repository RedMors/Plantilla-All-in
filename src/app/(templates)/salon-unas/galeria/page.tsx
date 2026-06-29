import Image from 'next/image'
import { getGallery } from '@/lib/salon/queries'
import { BRAND, INK, CREAM } from '../constants'

export const dynamic = 'force-dynamic'

export default async function GaleriaPage() {
  const gallery = await getGallery()

  return (
    <div style={{ background: CREAM }} className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#EDE9E3] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: BRAND }}>
            Nuestro trabajo
          </p>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: INK }}>
            Galería
          </h1>
          <p className="mt-2 text-[#6B6560]">
            Cada diseño es hecho a mano con precisión y dedicación.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        {gallery.length === 0 ? (
          <div className="text-center py-28">
            <div
              className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[#EDE9E3]"
              style={{ background: '#F5EFE8' }}
            >
              <span className="text-2xl text-[#C4965A]">✦</span>
            </div>
            <p className="text-xl font-bold tracking-tight mb-2" style={{ color: INK }}>
              Galería en preparación
            </p>
            <p className="text-sm text-[#6B6560]">
              Pronto encontrarás aquí todos nuestros trabajos.
            </p>
          </div>
        ) : (
          <>
            {/* Grid masonry simulado con columnas CSS */}
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {gallery.map((item, i) => (
                <div
                  key={item.id ?? i}
                  className="group relative overflow-hidden break-inside-avoid cursor-pointer"
                  style={{ marginBottom: '12px' }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: i % 5 === 0 ? '3/4' : i % 3 === 0 ? '1/1' : '4/5' }}>
                    <Image
                      src={item.image_url}
                      alt={item.alt_text ?? ''}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-[#0B0B0B]/0 group-hover:bg-[#0B0B0B]/30 transition-all duration-300 flex items-end p-4">
                      {item.alt_text && (
                        <span className="text-white text-xs font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                          {item.alt_text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-[#B0A89E] tracking-[0.2em] uppercase mt-14">
              {gallery.length} trabajos · Actualizado regularmente
            </p>
          </>
        )}
      </div>
    </div>
  )
}
