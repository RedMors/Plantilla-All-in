import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'

const TEMPLATES = [
  {
    id: 'salon-unas-elite',
    name: 'Salón de Uñas',
    style: 'Studio Élite',
    description: 'Estética oscura y dorada. Diseño premium para salones de alto perfil.',
    tags: ['Belleza', 'Oscuro', 'Dorado'],
    href: '/salon-unas',
    status: 'live' as const,
    palette: ['#0B0B0B', '#C4965A', '#F0E4CF', '#FAF9F6'],
    gradient: 'from-[#0B0B0B] to-[#1a1208]',
    accentColor: '#C4965A',
  },
  {
    id: 'salon-unas-lite',
    name: 'Salón de Uñas',
    style: 'Pinterest',
    description: 'Estética clara y fresca. Blanco, rosa y tarjetas tipo Pinterest.',
    tags: ['Belleza', 'Claro', 'Rosa'],
    href: '/salon-unas-lite',
    status: 'soon' as const,
    palette: ['#FFFFFF', '#FF385C', '#F9F0F2', '#1A1A1A'],
    gradient: 'from-[#FFF0F3] to-[#FFE4EA]',
    accentColor: '#FF385C',
  },
  {
    id: 'carwash',
    name: 'Car Wash',
    style: 'Motion',
    description: 'Diseño dinámico y urbano. Azul eléctrico para lavados de autos.',
    tags: ['Automotriz', 'Oscuro', 'Azul'],
    href: '/carwash',
    status: 'soon' as const,
    palette: ['#0A0F1E', '#1E6FFF', '#E8F0FF', '#FFFFFF'],
    gradient: 'from-[#0A0F1E] to-[#0d1a3a]',
    accentColor: '#1E6FFF',
  },
]

const STATUS_LABEL: Record<'live' | 'soon', string> = {
  live: 'Disponible',
  soon: 'Próximamente',
}

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
            <span className="text-[#0D0D0D] text-xs font-black tracking-tight">W</span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/80">WashOS</span>
          <span className="text-white/20">/</span>
          <span className="text-sm text-white/40">Plantillas</span>
        </div>
        <span className="text-[11px] text-white/30 tracking-widest uppercase">
          {TEMPLATES.filter(t => t.status === 'live').length} de {TEMPLATES.length} disponibles
        </span>
      </header>

      {/* Hero */}
      <div className="px-8 pt-16 pb-12 max-w-5xl">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-4">
          Template Gallery
        </p>
        <h1 className="text-5xl font-black tracking-tight leading-none mb-4">
          Elige tu diseño
        </h1>
        <p className="text-white/40 text-base max-w-lg">
          Cada plantilla es un proyecto completo — booking, pagos, admin, y SEO incluido.
          Elige el estilo que mejor represente tu negocio.
        </p>
      </div>

      {/* Grid */}
      <div className="px-8 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              className={`group relative flex flex-col rounded-xl overflow-hidden border ${
                t.status === 'live'
                  ? 'border-white/10 hover:border-white/20'
                  : 'border-white/5 opacity-50'
              } transition-all`}
              style={{ background: '#161616' }}
            >
              {/* Preview swatch */}
              <div className={`h-36 bg-gradient-to-br ${t.gradient} relative flex items-end p-4`}>
                <div className="flex gap-1.5">
                  {t.palette.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <div
                  className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-full tracking-wide"
                  style={{
                    background: t.status === 'live' ? t.accentColor + '22' : '#ffffff11',
                    color: t.status === 'live' ? t.accentColor : '#ffffff55',
                    border: `1px solid ${t.status === 'live' ? t.accentColor + '44' : '#ffffff22'}`,
                  }}
                >
                  {STATUS_LABEL[t.status]}
                </div>
                <div
                  className="absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{ background: t.accentColor + '22', color: t.accentColor }}
                >
                  {t.style[0]}
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1 gap-3">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">
                    {t.name}
                  </p>
                  <h3 className="text-base font-bold tracking-tight text-white">
                    {t.style}
                  </h3>
                </div>
                <p className="text-xs text-white/40 leading-relaxed flex-1">
                  {t.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {t.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full text-white/40 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {t.status === 'live' ? (
                  <Link
                    href={t.href}
                    className="mt-1 flex items-center justify-between text-sm font-semibold px-4 py-2.5 rounded-lg transition-all hover:opacity-90"
                    style={{
                      background: t.accentColor,
                      color: t.id === 'salon-unas-elite' ? '#0B0B0B' : '#fff',
                    }}
                  >
                    Abrir plantilla
                    <ExternalLink size={13} strokeWidth={2} />
                  </Link>
                ) : (
                  <div className="mt-1 flex items-center justify-between text-sm font-semibold px-4 py-2.5 rounded-lg border border-white/10 text-white/20 cursor-not-allowed">
                    Próximamente
                    <ArrowRight size={13} strokeWidth={2} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
