'use client'

import { useState, useTransition } from 'react'
import { CheckCircle } from 'lucide-react'
import { bookAppointment } from './actions'
import { BRAND } from './constants'

type Variant = { id: string; name: string; price: number; duration: string }

type Props = {
  serviceId: string
  serviceName: string
  servicePrice: number
  variants: Variant[]
  takenSlots: Record<string, string[]>
  rating?: number
  reviewCount?: number
}

const SLOTS = [
  { label: '9:00 AM',  value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM',  value: '13:00' },
  { label: '2:00 PM',  value: '14:00' },
  { label: '3:00 PM',  value: '15:00' },
  { label: '4:00 PM',  value: '16:00' },
  { label: '5:00 PM',  value: '17:00' },
  { label: '6:00 PM',  value: '18:00' },
]

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

type Step = 'slot' | 'form' | 'success'

export default function BookingWidget({ serviceId, serviceName, servicePrice, variants, takenSlots, rating, reviewCount }: Props) {
  const [date, setDate] = useState(todayStr)
  const [time, setTime] = useState('09:00')
  const [variantId, setVariantId] = useState(variants[0]?.id ?? '')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<Step>('slot')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const taken = takenSlots[date] ?? []
  const selectedVariant = variants.find(v => v.id === variantId)
  const displayPrice = selectedVariant?.price ?? servicePrice
  const selectedSlotLabel = SLOTS.find(s => s.value === time)?.label ?? time
  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-SV', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    const fd = new FormData()
    fd.set('service_id', serviceId)
    fd.set('variant_id', variantId)
    fd.set('date', date)
    fd.set('time', time)
    fd.set('customer_name', name)
    fd.set('customer_phone', phone)
    fd.set('message', message)
    startTransition(async () => {
      const result = await bookAppointment(fd)
      if ('error' in result) {
        setErrorMsg(result.error)
      } else {
        setStep('success')
      }
    })
  }

  if (step === 'success') {
    return (
      <div className="sticky top-24 rounded-3xl border border-[#dddddd] p-6 shadow-sm bg-white text-center">
        <CheckCircle size={48} color={BRAND} className="mx-auto mb-3" />
        <h3 className="font-bold text-[#222222] text-lg mb-2">¡Cita reservada!</h3>
        <p className="text-sm font-semibold text-[#222222] mb-1">{serviceName}</p>
        <p className="text-sm text-[#6a6a6a] mb-1">{dateLabel}</p>
        <p className="text-sm text-[#6a6a6a] mb-4">{selectedSlotLabel} · ${displayPrice}</p>
        <p className="text-xs text-[#929292] mb-4">Te confirmaremos por WhatsApp pronto.</p>
        <button
          onClick={() => { setStep('slot'); setName(''); setPhone(''); setMessage(''); setErrorMsg('') }}
          className="text-xs underline"
          style={{ color: BRAND }}
        >
          Hacer otra reserva
        </button>
      </div>
    )
  }

  if (step === 'form') {
    return (
      <div className="sticky top-24 rounded-3xl border border-[#dddddd] p-6 shadow-sm bg-white">
        <button
          onClick={() => setStep('slot')}
          className="text-sm mb-4 flex items-center gap-1 text-[#6a6a6a] hover:text-[#222222] transition-colors"
        >
          ← Volver
        </button>

        <h3 className="font-bold text-[#222222] mb-1">{serviceName}</h3>
        <p className="text-sm text-[#6a6a6a] mb-4">
          {dateLabel} · {selectedSlotLabel} · <strong>${displayPrice}</strong>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full border border-[#dddddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#222222] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+503 0000-0000"
              className="w-full border border-[#dddddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#222222] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#929292] uppercase tracking-wide mb-1.5">
              Mensaje (opcional)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="¿Algún detalle especial o color preferido?"
              className="w-full border border-[#dddddd] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#222222] transition-colors resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: BRAND }}
          >
            {isPending ? 'Reservando...' : 'Confirmar cita'}
          </button>
          <p className="text-xs text-[#929292] text-center">No se cobra hasta confirmar</p>
        </form>
      </div>
    )
  }

  return (
    <div className="sticky top-24 rounded-3xl border border-[#dddddd] p-6 shadow-sm bg-white">
      {variants.length > 1 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-[#929292] uppercase tracking-wide mb-2">Opción</p>
          <select
            value={variantId}
            onChange={e => setVariantId(e.target.value)}
            className="w-full border border-[#dddddd] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#222222]"
          >
            {variants.map(v => (
              <option key={v.id} value={v.id}>{v.name} — ${v.price}</option>
            ))}
          </select>
        </div>
      )}

      <p className="text-sm text-[#6a6a6a] mb-1">Desde</p>
      <p className="text-4xl font-bold text-[#222222] mb-1">
        ${displayPrice}
        <span className="text-base font-normal text-[#6a6a6a]"> / servicio</span>
      </p>
      {rating != null && reviewCount != null && reviewCount > 0 && (
        <div className="flex items-center gap-1 text-sm text-[#6a6a6a] mb-5">
          <span style={{ color: BRAND }}>★ {rating.toFixed(1)}</span>
          <span>· {reviewCount} reseña{reviewCount !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="space-y-2 mb-5">
        <div className="rounded-2xl border border-[#dddddd] p-3">
          <p className="text-xs font-semibold text-[#929292] uppercase tracking-widest mb-2">Fecha</p>
          <input
            type="date"
            value={date}
            min={todayStr()}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-[#f7f7f7] rounded-xl px-3 py-1.5 text-sm text-[#222222] outline-none border-0 cursor-pointer"
          />
        </div>

        <div className="rounded-2xl border border-[#dddddd] p-3">
          <p className="text-xs font-semibold text-[#929292] uppercase tracking-widest mb-2">Hora</p>
          <div className="grid grid-cols-2 gap-1.5">
            {SLOTS.map(slot => {
              const isTaken = taken.includes(slot.value)
              const isSelected = time === slot.value
              return (
                <button
                  key={slot.value}
                  type="button"
                  disabled={isTaken}
                  onClick={() => setTime(slot.value)}
                  className={[
                    'py-1.5 rounded-xl text-xs border transition-colors',
                    isTaken
                      ? 'bg-[#f7f7f7] text-[#c0c0c0] border-transparent cursor-not-allowed line-through'
                      : isSelected
                      ? 'font-semibold border-[#ff385c] text-[#ff385c]'
                      : 'border-[#ebebeb] text-[#3f3f3f] hover:border-[#ff385c] hover:text-[#ff385c] cursor-pointer',
                  ].join(' ')}
                >
                  {slot.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl mb-3">{errorMsg}</p>
      )}

      <button
        onClick={() => {
          if (taken.includes(time)) {
            setErrorMsg('Este horario no está disponible. Elige otro.')
            return
          }
          setErrorMsg('')
          setStep('form')
        }}
        className="w-full py-3.5 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90"
        style={{ background: BRAND }}
      >
        Reservar ahora
      </button>
      <p className="text-xs text-[#929292] text-center mt-2">No se cobra hasta confirmar la cita</p>

      <div className="mt-5 pt-5 border-t border-[#dddddd] space-y-2 text-sm text-[#3f3f3f]">
        <div className="flex justify-between">
          <span>{serviceName}</span>
          <span>${displayPrice}</span>
        </div>
        <div className="flex justify-between font-semibold text-[#222222] pt-2 border-t border-[#ebebeb]">
          <span>Total</span>
          <span>${displayPrice}</span>
        </div>
      </div>
    </div>
  )
}
