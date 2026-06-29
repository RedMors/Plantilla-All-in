'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { bookAppointment } from './actions'
import { BRAND, INK, CREAM, STONE } from './constants'

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

const inputClass =
  'w-full border-b border-[#EDE9E3] bg-transparent px-0 py-2.5 text-sm text-[#1A1A1A] placeholder-[#B0A89E] outline-none focus:border-[#C4965A] transition-colors'

const labelClass =
  'block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B0A89E] mb-1.5'

type Step = 'slot' | 'form' | 'success'

export default function BookingWidget({
  serviceId,
  serviceName,
  servicePrice,
  variants,
  takenSlots,
  rating,
  reviewCount,
}: Props) {
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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

  const widgetBase = {
    background: CREAM,
    border: `1px solid ${STONE}`,
  }

  if (step === 'success') {
    return (
      <div className="sticky top-24 p-8 text-center" style={widgetBase}>
        <CheckCircle size={36} strokeWidth={1.5} style={{ color: BRAND }} className="mx-auto mb-5" />
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: BRAND }}>
          Cita confirmada
        </p>
        <h3 className="text-xl font-bold tracking-tight mb-4" style={{ color: INK }}>
          {serviceName}
        </h3>
        <div className="border-t border-[#EDE9E3] pt-4 mb-6 space-y-1">
          <p className="text-sm text-[#6B6560] capitalize">{dateLabel}</p>
          <p className="text-sm text-[#6B6560]">{selectedSlotLabel} · ${displayPrice}</p>
        </div>
        <p className="text-xs text-[#B0A89E] mb-5">Te confirmaremos por WhatsApp pronto.</p>
        <button
          onClick={() => {
            setStep('slot')
            setName('')
            setPhone('')
            setMessage('')
            setErrorMsg('')
          }}
          className="text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors"
          style={{ color: BRAND }}
        >
          Hacer otra reserva
        </button>
      </div>
    )
  }

  if (step === 'form') {
    return (
      <div className="sticky top-24 p-8" style={widgetBase}>
        <button
          onClick={() => setStep('slot')}
          className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[#B0A89E] hover:text-[#6B6560] transition-colors mb-7"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          Volver
        </button>

        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: BRAND }}>
          Confirmar cita
        </p>
        <h3 className="text-lg font-bold tracking-tight mb-1" style={{ color: INK }}>
          {serviceName}
        </h3>
        <p className="text-xs text-[#6B6560] capitalize mb-8">
          {dateLabel} · {selectedSlotLabel} ·{' '}
          <strong style={{ color: INK }}>${displayPrice}</strong>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre completo"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Teléfono / WhatsApp</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+503 0000-0000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Mensaje (opcional)</label>
            <textarea
              rows={2}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="¿Algún detalle especial o color preferido?"
              className={inputClass + ' resize-none'}
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 border-l-2 border-red-400 pl-3">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-85 transition-opacity disabled:opacity-50"
            style={{ background: BRAND }}
          >
            {isPending ? 'Reservando...' : 'Confirmar cita'}
            {!isPending && <ArrowRight size={14} strokeWidth={1.5} />}
          </button>
          <p className="text-[11px] text-[#B0A89E] text-center">No se cobra hasta confirmar</p>
        </form>
      </div>
    )
  }

  return (
    <div className="sticky top-24 p-8" style={widgetBase}>
      {/* Variante */}
      {variants.length > 1 && (
        <div className="mb-6 pb-6 border-b border-[#EDE9E3]">
          <label className={labelClass}>Opción</label>
          <select
            value={variantId}
            onChange={e => setVariantId(e.target.value)}
            className="w-full bg-transparent border-b border-[#EDE9E3] py-2.5 text-sm outline-none focus:border-[#C4965A] cursor-pointer transition-colors"
            style={{ color: INK }}
          >
            {variants.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} — ${v.price}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Precio */}
      <div className="mb-6 pb-6 border-b border-[#EDE9E3]">
        <p className="text-[10px] text-[#B0A89E] uppercase tracking-wide mb-1">Desde</p>
        <p className="text-4xl font-bold tracking-tight" style={{ color: INK }}>
          ${displayPrice}
          <span className="text-sm font-normal text-[#B0A89E] ml-1">/ servicio</span>
        </p>
        {rating != null && reviewCount != null && reviewCount > 0 && (
          <p className="text-xs text-[#6B6560] mt-2">
            <span style={{ color: BRAND }}>★ {rating.toFixed(1)}</span>
            {' · '}{reviewCount} reseña{reviewCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Fecha */}
      <div className="mb-4">
        <label className={labelClass}>Fecha</label>
        <input
          type="date"
          value={date}
          min={todayStr()}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-transparent border-b border-[#EDE9E3] py-2.5 text-sm outline-none focus:border-[#C4965A] cursor-pointer transition-colors"
          style={{ color: INK }}
        />
      </div>

      {/* Hora */}
      <div className="mb-7">
        <label className={labelClass}>Hora</label>
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          {SLOTS.map(slot => {
            const isTaken = taken.includes(slot.value)
            const isSelected = time === slot.value
            return (
              <button
                key={slot.value}
                type="button"
                disabled={isTaken}
                onClick={() => setTime(slot.value)}
                className="py-2 text-[11px] font-medium border transition-all"
                style={{
                  borderColor: isTaken
                    ? '#EDE9E3'
                    : isSelected
                    ? BRAND
                    : '#EDE9E3',
                  color: isTaken
                    ? '#D4CCC0'
                    : isSelected
                    ? BRAND
                    : '#6B6560',
                  background: isSelected ? '#F0E4CF' : 'transparent',
                  textDecoration: isTaken ? 'line-through' : 'none',
                  cursor: isTaken ? 'not-allowed' : 'pointer',
                }}
              >
                {slot.label}
              </button>
            )
          })}
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-red-600 border-l-2 border-red-400 pl-3 mb-4">{errorMsg}</p>
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
        className="w-full py-4 text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-85 transition-opacity"
        style={{ background: BRAND }}
      >
        Reservar ahora
        <ArrowRight size={14} strokeWidth={1.5} />
      </button>
      <p className="text-[11px] text-[#B0A89E] text-center mt-2">No se cobra hasta confirmar la cita</p>

      {/* Resumen */}
      <div className="mt-6 pt-6 border-t border-[#EDE9E3] space-y-2 text-sm">
        <div className="flex justify-between text-[#6B6560]">
          <span>{serviceName}</span>
          <span>${displayPrice}</span>
        </div>
        <div className="flex justify-between font-semibold pt-2 border-t border-[#EDE9E3]" style={{ color: INK }}>
          <span>Total</span>
          <span>${displayPrice}</span>
        </div>
      </div>
    </div>
  )
}
