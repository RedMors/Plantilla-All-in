'use client'

import { useActionState } from 'react'
import { CheckCircle } from 'lucide-react'
import { sendContactMessage } from './actions'
import { BRAND } from '../constants'

type Props = {
  services: { slug: string; name: string; price: number }[]
}

export default function ContactForm({ services }: Props) {
  const [state, action, isPending] = useActionState(sendContactMessage, null)

  if (state && 'success' in state) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <CheckCircle size={40} color={BRAND} />
        <p className="text-lg font-bold text-[#3A2A2E]">¡Mensaje recibido!</p>
        <p className="text-sm text-[#8A7176]">Te contactamos pronto por WhatsApp o teléfono.</p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-[#8A7176] uppercase tracking-wide mb-1.5">
          Nombre completo
        </label>
        <input
          name="nombre"
          type="text"
          required
          placeholder="Tu nombre"
          className="w-full border border-[#EFE0DD] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B86A82] transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#8A7176] uppercase tracking-wide mb-1.5">
          Teléfono / WhatsApp
        </label>
        <input
          name="telefono"
          type="tel"
          required
          placeholder="+503 0000-0000"
          className="w-full border border-[#EFE0DD] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B86A82] transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#8A7176] uppercase tracking-wide mb-1.5">
          Servicio de interés
        </label>
        <select
          name="servicio"
          className="w-full border border-[#EFE0DD] rounded-xl px-4 py-3 text-sm text-[#8A7176] outline-none focus:border-[#B86A82] transition-colors bg-white"
        >
          <option value="">Selecciona un servicio...</option>
          {services.map(s => (
            <option key={s.slug} value={s.name}>{s.name} — desde ${s.price}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#8A7176] uppercase tracking-wide mb-1.5">
          Mensaje
        </label>
        <textarea
          name="mensaje"
          rows={4}
          required
          placeholder="¿Tienes alguna fecha en mente o pregunta especial?"
          className="w-full border border-[#EFE0DD] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B86A82] transition-colors resize-none"
        />
      </div>

      {state && 'error' in state && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-full font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: BRAND }}
      >
        {isPending ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  )
}
