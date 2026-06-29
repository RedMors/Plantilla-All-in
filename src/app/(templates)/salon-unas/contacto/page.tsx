import { MapPin, Phone, Clock, Camera } from 'lucide-react'
import { getServices } from '@/lib/salon/queries'
import { BRAND, INK, CREAM } from '../constants'
import ContactForm from './ContactForm'

export const dynamic = 'force-dynamic'

const CONTACT_INFO = [
  { Icon: MapPin,     label: 'Dirección',           value: 'Col. Escalón, San Salvador, El Salvador', href: undefined },
  { Icon: Phone,      label: 'Teléfono / WhatsApp',  value: '+503 7890-1234',                           href: 'tel:+50378901234' },
  { Icon: Clock,      label: 'Horario',             value: 'Lun – Sáb · 8:00 am – 7:00 pm',           href: undefined },
  { Icon: Camera,     label: 'Instagram',           value: '@nailsbymariela.sv',                        href: '#' },
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
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: INK }}>
            Contáctanos
          </h1>
          <p className="mt-2 text-[#6B6560]">Reserva tu cita o resuelve cualquier duda.</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Panel izquierdo — info */}
          <div className="space-y-8">
            {/* Info de contacto */}
            <div className="border border-[#EDE9E3] bg-white">
              {CONTACT_INFO.map(({ Icon, label, value, href }, i) => (
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
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B0A89E] mb-1">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm font-medium hover:text-[#C4965A] transition-colors"
                        style={{ color: INK }}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium" style={{ color: INK }}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mapa placeholder */}
            <div
              className="h-52 border border-[#EDE9E3] flex items-center justify-center"
              style={{ background: '#F5EFE8' }}
            >
              <div className="text-center">
                <MapPin size={24} strokeWidth={1} className="mx-auto mb-2" style={{ color: BRAND }} />
                <p className="text-xs text-[#6B6560] tracking-wide">Col. Escalón · San Salvador</p>
              </div>
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
