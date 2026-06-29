'use client'

import { useActionState } from 'react'
import { CheckCircle } from 'lucide-react'
import { sendContactMessage } from './actions'
import { BRAND, INK } from '../constants'

type Props = {
  services: { slug: string; name: string; price: number }[]
}

const inputClass =
  'w-full border-b border-[#EDE9E3] bg-transparent px-0 py-3 text-sm text-[#1A1A1A] placeholder-[#B0A89E] outline-none focus:border-[#C4965A] transition-colors'

const labelClass =
  'block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B0A89E] mb-1'

export default function ContactForm({ services }: Props) {
  const [state, action, isPending] = useActionState(sendContactMessage, null)

  if (state && 'success' in state) {
    return (
      <div className="flex flex-col items-start gap-4 py-10">
        <CheckCircle size={32} strokeWidth={1.5} style={{ color: BRAND }} />
        <div>
          <p className="text-lg font-bold tracking-tight mb-1" style={{ color: INK }}>
            Mensaje recibido
          </p>
          <p className="text-sm text-[#6B6560]">
            Te contactamos pronto por WhatsApp o teléfono.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-8">
      <div>
        <label className={labelClass}>Nombre completo</label>
        <input
          name="nombre"
          type="text"
          required
          placeholder="Tu nombre"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Teléfono / WhatsApp</label>
        <input
          name="telefono"
          type="tel"
          required
          placeholder="+503 0000-0000"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Servicio de interés</label>
        <select
          name="servicio"
          className={inputClass + ' cursor-pointer appearance-none'}
          style={{ color: '#6B6560' }}
        >
          <option value="">Selecciona un servicio...</option>
          {services.map(s => (
            <option key={s.slug} value={s.name}>
              {s.name} — desde ${s.price}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Mensaje</label>
        <textarea
          name="mensaje"
          rows={4}
          required
          placeholder="¿Tienes alguna fecha en mente o pregunta especial?"
          className={inputClass + ' resize-none'}
        />
      </div>

      {state && 'error' in state && (
        <p className="text-xs text-red-600 border-l-2 border-red-400 pl-3">{state.error}</p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-3 text-white text-sm font-semibold px-8 py-4 hover:opacity-85 transition-opacity disabled:opacity-50"
          style={{ background: BRAND }}
        >
          {isPending ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </div>
    </form>
  )
}
