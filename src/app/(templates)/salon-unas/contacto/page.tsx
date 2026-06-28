import { MapPin, Phone, Clock, Camera } from 'lucide-react'
import { getServices } from '@/lib/salon/queries'

export const dynamic = 'force-dynamic'

const BRAND = '#ff385c'

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
          <h1 className="text-3xl font-bold text-[#222222] mb-2">Contáctanos</h1>
          <p className="text-[#6a6a6a]">Reserva tu cita o resuelve cualquier duda</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6">
            <div className="bg-[#f7f7f7] rounded-2xl p-6 flex flex-col gap-5">
              {CONTACT_INFO.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon size={18} className="mt-0.5 shrink-0" style={{ color: BRAND }} />
                  <div>
                    <p className="text-xs font-semibold text-[#929292] uppercase tracking-wide mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-[#222222] hover:underline">{value}</a>
                    ) : (
                      <p className="text-sm text-[#222222]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden h-48 bg-[#ebebeb] flex items-center justify-center">
              <p className="text-sm text-[#6a6a6a]">Mapa — Col. Escalón, San Salvador</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#222222] mb-5">Envíanos un mensaje</h2>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-1.5">Nombre completo</label>
                <input type="text" placeholder="Tu nombre" className="w-full border border-[#dddddd] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#222] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-1.5">Teléfono</label>
                <input type="tel" placeholder="+503 0000-0000" className="w-full border border-[#dddddd] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#222] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-1.5">Servicio de interés</label>
                <select className="w-full border border-[#dddddd] rounded-xl px-4 py-3 text-sm text-[#6a6a6a] outline-none focus:border-[#222] transition-colors bg-white">
                  <option value="">Selecciona un servicio...</option>
                  {services.map(s => (
                    <option key={s.slug} value={s.slug}>{s.name} — desde ${s.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6a6a6a] uppercase tracking-wide mb-1.5">Mensaje</label>
                <textarea rows={4} placeholder="¿Tienes alguna fecha en mente o pregunta especial?" className="w-full border border-[#dddddd] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#222] transition-colors resize-none" />
              </div>
              <button type="submit" className="w-full py-3 rounded-full font-semibold text-sm text-white transition-opacity hover:opacity-90" style={{ background: BRAND }}>
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
