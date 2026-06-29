import { MapPin, Phone, Clock, Camera } from 'lucide-react'
import { getServices } from '@/lib/salon/queries'
import { BRAND, INK, CREAM } from '../constants'
import ContactForm from './ContactForm'
import MapWidget from '../MapWidget'

export const dynamic = 'force-dynamic'

const WA_NUMBER = '+50378901234'
const WA_URL = `https://wa.me/${WA_NUMBER.replace(/\D/g, '')}`
const IG_HANDLE = '@nailsbymariela.sv'
const IG_URL = 'https://www.instagram.com/nailsbymariela.sv'

const CONTACT_INFO = [
  {
    Icon: MapPin,
    label: 'Dirección',
    value: 'Col. Escalón, San Salvador, El Salvador',
    href: 'https://www.google.com/maps/search/?api=1&query=13.7034,-89.2182',
    external: true,
  },
  {
    Icon: Phone,
    label: 'WhatsApp',
    value: WA_NUMBER,
    href: WA_URL,
    external: true,
    cta: 'Abrir WhatsApp',
  },
  {
    Icon: Clock,
    label: 'Horario',
    value: 'Lun – Sáb · 8:00 am – 7:00 pm',
    href: undefined,
    external: false,
  },
  {
    Icon: Camera,
    label: 'Instagram',
    value: IG_HANDLE,
    href: IG_URL,
    external: true,
    cta: 'Ver perfil',
  },
]

export default async function ContactoPage() {
  const services = await getServices()

  return (
    <div style={{ background: CREAM }} className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#EDE9E3] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: BRAND }}>
            Estamos para ti
          </p>
          <h1 className="font-semibold" style={{ color: INK, fontSize: 'clamp(36px, 5vw, 60px)', fontFamily: 'var(--font-cormorant), Georgia, serif', letterSpacing: '-0.01em' }}>
            Contáctanos
          </h1>
          <p className="mt-2 text-[#6B6560]">Reserva tu cita o resuelve cualquier duda.</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Panel izquierdo — info + mapa */}
          <div className="space-y-6">
            {/* Info de contacto */}
            <div className="border border-[#EDE9E3] bg-white">
              {CONTACT_INFO.map(({ Icon, label, value, href, external, cta }, i) => (
                <div
                  key={label}
                  className={`flex items-start gap-5 p-6 ${i < CONTACT_INFO.length - 1 ? 'border-b border-[#EDE9E3]' : ''}`}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0"
                    style={{ color: BRAND }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B0A89E] mb-1">
                      {label}
                    </p>
                    {href ? (
                      <div className="flex items-center justify-between gap-4">
                        <a
                          href={href}
                          target={external ? '_blank' : undefined}
                          rel={external ? 'noopener noreferrer' : undefined}
                          className="text-sm font-medium hover:text-[#C4965A] transition-colors truncate"
                          style={{ color: INK }}
                        >
                          {value}
                        </a>
                        {cta && (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-[10px] font-semibold tracking-[0.1em] uppercase border px-3 py-1.5 transition-all hover:bg-[#C4965A] hover:text-white hover:border-[#C4965A]"
                            style={{ color: BRAND, borderColor: BRAND }}
                          >
                            {cta}
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-medium" style={{ color: INK }}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mapa Leaflet */}
            <div className="h-64 border border-[#EDE9E3] overflow-hidden">
              <MapWidget />
            </div>
          </div>

          {/* Panel derecho — formulario */}
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: INK }}>
                Envíanos un mensaje
              </h2>
              <p className="text-sm text-[#6B6560]">
                Respondemos en menos de 24 horas por WhatsApp.
              </p>
            </div>
            <ContactForm services={services.map(s => ({ slug: s.slug, name: s.name, price: s.price }))} />
          </div>
        </div>
      </div>
    </div>
  )
}
