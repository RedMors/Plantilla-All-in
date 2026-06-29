import Image from 'next/image'
import { getGallery } from '@/lib/salon/queries'

export const dynamic = 'force-dynamic'

export default async function GaleriaPage() {
  const gallery = await getGallery()

  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#222222] mb-2">Nuestro trabajo</h1>
          <p className="text-[#6a6a6a]">Cada diseño es hecho a mano con amor y precisión</p>
        </div>

        {gallery.length === 0 ? (
          <div className="text-center py-20 text-[#6a6a6a]">
            <p className="text-lg font-semibold text-[#222]">Galería en preparación</p>
            <p className="text-sm mt-2">Pronto encontrarás aquí todos nuestros trabajos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {gallery.map((item, i) => (
              <div key={item.id ?? i} className="relative rounded-2xl overflow-hidden aspect-square group cursor-pointer">
                <Image
                  src={item.image_url}
                  alt={item.alt_text ?? ''}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
