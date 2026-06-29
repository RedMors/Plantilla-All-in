'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ServiceImageProps {
  src: string
  alt: string
  className?: string
  sizes?: string
  gradientFrom?: string | null
  gradientTo?: string | null
  /** Cuando es true, oculta la imagen en error sin mostrar fallback (para overlays decorativos) */
  hideFallback?: boolean
}

export default function ServiceImage({
  src,
  alt,
  className,
  sizes,
  gradientFrom,
  gradientTo,
  hideFallback = false,
}: ServiceImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    if (hideFallback) return null
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom ?? '#E8E2D9'}, ${gradientTo ?? '#D4CCC0'})`,
        }}
      >
        <span className="text-3xl" style={{ color: 'rgba(255,255,255,0.4)' }}>✦</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      onError={() => setFailed(true)}
    />
  )
}
