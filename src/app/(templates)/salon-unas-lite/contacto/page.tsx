import { MapPin, Phone, Clock, Camera } from 'lucide-react'
import { getServices } from '@/lib/salon/queries'
import { BRAND } from '../constants'
import ContactForm from './ContactForm'

export const dynamic = 'force-dynamic'

const CONTACT_INFO = [
  { Icon: MapPin,  label: 'Dirección',           value: 'Col. Escalón, San Salvador, El Salvador', href: undefined },
  { Icon: Phone,   label: 'Teléfono / WhatsApp', value: '+503 7890-1234',                           href: 'tel:+50378901234' },
  { Icon: Clock,   label: 'Horario',             value: 'Lunes a Sábado · 8:00 am – 7:00 pm',     href: undefined },
  { Icon: Camera,  label: 'Instagram',           value: '@nailsbymariela.sv',                       href: '#' },
]

export default async function ContactoPage() {
  const services = await getServices()

  return (
    <div className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#3A2A2E] mb-2">Contáctanos</h1>
          <p className="text-[#8A7176]">Reserva tu cita o resuelve cualquier duda</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6">
            <div className="bg-[#F7E8E6] rounded-2xl p-6 flex flex-col gap-5">
              {CONTACT_INFO.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon size={18} className="mt-0.5 shrink-0" style={{ color: BRAND }} />
                  <div>
                    <p className="text-xs font-semibold text-[#B6A4A7] uppercase tracking-wide mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-[#3A2A2E] hover:underline">{value}</a>
                    ) : (
                      <p className="text-sm text-[#3A2A2E]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden h-48 bg-[#F7E8E6] flex items-center justify-center">
              <p className="text-sm text-[#8A7176]">Mapa — Col. Escalón, San Salvador</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#3A2A2E] mb-5">Envíanos un mensaje</h2>
            <ContactForm services={services.map(s => ({ slug: s.slug, name: s.name, price: s.price }))} />
          </div>
        </div>
      </div>
    </div>
  )
}
