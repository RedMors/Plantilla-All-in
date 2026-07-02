'use client'

import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import { CheckCircle, ArrowRight, ArrowLeft, Banknote, CreditCard, Zap, Copy, Check, Loader2 } from 'lucide-react'
import { bookAppointment, checkLightningPayment } from './actions'
import { BRAND, BRAND_LIGHT, INK, CREAM, STONE } from './constants'
import PhoneInput from '@/components/salon/PhoneInput'

type Variant = { id: string; name: string; price: number; duration: string }

type Props = {
  serviceId: string
  serviceName: string
  servicePrice: number
  serviceImageUrl?: string
  variants: Variant[]
  takenSlots: Record<string, string[]>
  rating?: number
  reviewCount?: number
  methods?: ('cash' | 'card' | 'lightning')[]
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

type Step = 'slot' | 'payment' | 'form' | 'lightning' | 'success'
type PayMethod = 'cash' | 'card' | 'lightning'

export default function BookingWidget({
  serviceId,
  serviceName,
  servicePrice,
  serviceImageUrl,
  variants,
  takenSlots,
  rating,
  reviewCount,
  methods = ['cash'],
}: Props) {
  const [date, setDate] = useState(todayStr)
  const [time, setTime] = useState('09:00')
  const [variantId, setVariantId] = useState(variants[0]?.id ?? '')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<Step>('slot')
  const [payMethod, setPayMethod] = useState<PayMethod>('cash')
  const [errorMsg, setErrorMsg] = useState('')
  const [refCode, setRefCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [invoiceCopied, setInvoiceCopied] = useState(false)
  const [lnInvoice, setLnInvoice] = useState<{ paymentId: string; bolt11: string; expiresAt: string } | null>(null)
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

  function copyRef() {
    navigator.clipboard.writeText(refCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone) { setErrorMsg('El teléfono es requerido'); return }
    setErrorMsg('')
    const fd = new FormData()
    fd.set('service_id', serviceId)
    fd.set('variant_id', variantId)
    fd.set('date', date)
    fd.set('time', time)
    fd.set('customer_name', name)
    fd.set('customer_phone', phone)
    fd.set('customer_email', email)
    fd.set('message', message)
    fd.set('payment_method', payMethod)
    startTransition(async () => {
      const result = await bookAppointment(fd)
      if ('error' in result) {
        setErrorMsg(result.error)
        return
      }
      setRefCode(result.refCode)
      if (result.method === 'card') {
        // Redirige al checkout de Wompi
        window.location.href = result.redirectUrl
        return
      }
      if (result.method === 'lightning') {
        setLnInvoice({ paymentId: result.paymentId, bolt11: result.bolt11, expiresAt: result.expiresAt })
        setStep('lightning')
        return
      }
      setStep('success') // efectivo
    })
  }

  // Polling del estado del pago Lightning mientras se muestra la factura
  useEffect(() => {
    if (step !== 'lightning' || !lnInvoice) return
    let active = true
    const iv = setInterval(async () => {
      const r = await checkLightningPayment(lnInvoice.paymentId)
      if (!active || !('status' in r)) return
      if (r.status === 'paid') {
        clearInterval(iv)
        setStep('success')
      } else if (r.status === 'expired') {
        clearInterval(iv)
        setErrorMsg('La factura Lightning expiró. Elige el método de pago otra vez.')
        setLnInvoice(null)
        setStep('payment')
      }
    }, 4000)
    return () => { active = false; clearInterval(iv) }
  }, [step, lnInvoice])

  function copyInvoice() {
    if (!lnInvoice) return
    navigator.clipboard.writeText(lnInvoice.bolt11)
    setInvoiceCopied(true)
    setTimeout(() => setInvoiceCopied(false), 2000)
  }

  const widgetBase = {
    background: CREAM,
    border: `1px solid ${STONE}`,
  }

  const PAY_OPTIONS: { id: PayMethod; label: string; sub: string; Icon: React.ElementType; available: boolean }[] = [
    { id: 'cash', label: 'Efectivo', sub: 'Paga al llegar', Icon: Banknote, available: methods.includes('cash') },
    { id: 'card', label: 'Tarjeta', sub: 'Visa / Mastercard', Icon: CreditCard, available: methods.includes('card') },
    { id: 'lightning', label: 'Lightning', sub: 'Bitcoin', Icon: Zap, available: methods.includes('lightning') },
  ]

  // ── SUCCESS ──────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div id="booking-widget" className="sticky top-24 p-8" style={widgetBase}>
        <CheckCircle size={36} strokeWidth={1.5} style={{ color: BRAND }} className="mb-5" />
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: BRAND }}>
          Cita confirmada
        </p>
        <h3 className="text-xl font-bold tracking-tight mb-4" style={{ color: INK }}>
          {serviceName}
        </h3>
        <div className="border-t border-[#EDE9E3] pt-4 mb-4 space-y-1">
          <p className="text-sm text-[#6B6560] capitalize">{dateLabel}</p>
          <p className="text-sm text-[#6B6560]">{selectedSlotLabel} · <strong style={{ color: INK }}>${displayPrice}</strong></p>
          <p className="text-sm text-[#6B6560] capitalize">
            {PAY_OPTIONS.find(p => p.id === payMethod)?.label}
          </p>
        </div>

        {/* Número de referencia */}
        {refCode && (
          <div className="border border-[#EDE9E3] p-4 mb-5" style={{ background: '#F5EFE8' }}>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B0A89E] mb-1">
              Código de referencia
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-bold tracking-widest" style={{ color: INK }}>{refCode}</span>
              <button onClick={copyRef} className="shrink-0 transition-colors" style={{ color: BRAND }}>
                {copied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-[#B0A89E] mb-5">Te confirmaremos por WhatsApp pronto.</p>
        <button
          onClick={() => {
            setStep('slot')
            setName('')
            setPhone('')
            setEmail('')
            setMessage('')
            setErrorMsg('')
            setRefCode('')
          }}
          className="text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors"
          style={{ color: BRAND }}
        >
          Hacer otra reserva
        </button>
      </div>
    )
  }

  // ── LIGHTNING ────────────────────────────────────────────
  if (step === 'lightning' && lnInvoice) {
    return (
      <div id="booking-widget" className="sticky top-24 p-8" style={widgetBase}>
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: BRAND }}>
          Paga con Lightning
        </p>
        <h3 className="text-lg font-bold tracking-tight mb-1" style={{ color: INK }}>
          {serviceName}
        </h3>
        <p className="text-xs text-[#6B6560] capitalize mb-6">
          {dateLabel} · {selectedSlotLabel} · <strong style={{ color: INK }}>${displayPrice}</strong>
        </p>

        <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: '#6B6560' }}>
          <Loader2 size={16} className="animate-spin" style={{ color: BRAND }} />
          Esperando la confirmación del pago…
        </div>

        <a
          href={`lightning:${lnInvoice.bolt11}`}
          className="w-full py-4 mb-4 text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-85 transition-opacity"
          style={{ background: BRAND }}
        >
          <Zap size={15} strokeWidth={1.5} />
          Abrir en mi wallet
        </a>

        {/* Invoice copiable */}
        <div className="border border-[#EDE9E3] p-4 mb-4" style={{ background: '#F5EFE8' }}>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B0A89E] mb-1">
            Invoice (BOLT11)
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono break-all text-[#6B6560]">
              {lnInvoice.bolt11.slice(0, 28)}…
            </span>
            <button onClick={copyInvoice} className="shrink-0 transition-colors" style={{ color: BRAND }}>
              {invoiceCopied ? <Check size={15} strokeWidth={2} /> : <Copy size={15} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <p className="text-xs text-[#B0A89E] mb-5">La factura expira en 1 hora. La confirmación es automática.</p>

        <button
          onClick={() => { setLnInvoice(null); setErrorMsg(''); setStep('payment') }}
          className="text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors"
          style={{ color: BRAND }}
        >
          Cambiar método de pago
        </button>
      </div>
    )
  }

  // ── FORM ─────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div id="booking-widget" className="sticky top-24 p-8" style={widgetBase}>
        <button
          onClick={() => setStep('payment')}
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
          {' · '}
          <span className="capitalize">{PAY_OPTIONS.find(p => p.id === payMethod)?.label}</span>
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

          <PhoneInput
            name="phone"
            required
            value={phone}
            onChange={setPhone}
          />

          <div>
            <label className={labelClass}>Correo electrónico <span className="normal-case text-[#D4CCC0]">(opcional)</span></label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="para recibir comprobante"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Mensaje <span className="normal-case text-[#D4CCC0]">(opcional)</span></label>
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
            disabled={isPending || !phone}
            className="w-full py-4 text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-85 transition-opacity disabled:opacity-40"
            style={{ background: BRAND }}
          >
            {isPending
              ? 'Procesando...'
              : payMethod === 'card'
                ? 'Ir a pagar'
                : payMethod === 'lightning'
                  ? 'Generar factura'
                  : 'Confirmar cita'}
            {!isPending && <ArrowRight size={14} strokeWidth={1.5} />}
          </button>
          <p className="text-[11px] text-[#B0A89E] text-center -mt-4">
            {payMethod === 'cash' ? 'No se cobra hasta confirmar' : 'Pago seguro · serás dirigido al cobro'}
          </p>
        </form>
      </div>
    )
  }

  // ── PAYMENT ──────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <div id="booking-widget" className="sticky top-24 p-8" style={widgetBase}>
        <button
          onClick={() => setStep('slot')}
          className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[#B0A89E] hover:text-[#6B6560] transition-colors mb-7"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          Volver
        </button>

        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: BRAND }}>
          Método de pago
        </p>
        <p className="text-xs text-[#6B6560] capitalize mb-8">
          {dateLabel} · {selectedSlotLabel} · <strong style={{ color: INK }}>${displayPrice}</strong>
        </p>

        <div className="flex flex-col gap-2 mb-8">
          {PAY_OPTIONS.map(({ id, label, sub, Icon, available }) => {
            const selected = payMethod === id
            return (
              <button
                key={id}
                type="button"
                disabled={!available}
                onClick={() => available && setPayMethod(id)}
                className={`flex items-center gap-4 p-4 border text-left transition-all ${
                  !available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  borderColor: selected && available ? BRAND : '#EDE9E3',
                  background: selected && available ? BRAND_LIGHT : 'transparent',
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  style={{ color: selected && available ? BRAND : '#B0A89E', flexShrink: 0 }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: INK }}>{label}</p>
                  <p className="text-xs text-[#6B6560]">
                    {available ? sub : `${sub} · Próximamente`}
                  </p>
                </div>
                {selected && available && (
                  <Check size={14} strokeWidth={2} style={{ color: BRAND, flexShrink: 0 }} />
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setStep('form')}
          className="w-full py-4 text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-85 transition-opacity"
          style={{ background: BRAND }}
        >
          Continuar
          <ArrowRight size={14} strokeWidth={1.5} />
        </button>
      </div>
    )
  }

  // ── SLOT (default) ───────────────────────────────────────
  return (
    <div id="booking-widget" className="sticky top-24" style={widgetBase}>
      {/* Imagen del servicio */}
      {serviceImageUrl && (
        <div className="relative h-44 overflow-hidden">
          <Image
            src={serviceImageUrl}
            alt={serviceName}
            fill
            className="object-cover"
            sizes="400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <div className="p-8">
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
                    borderColor: isTaken ? '#EDE9E3' : isSelected ? BRAND : '#EDE9E3',
                    color: isTaken ? '#D4CCC0' : isSelected ? BRAND : '#6B6560',
                    background: isSelected ? BRAND_LIGHT : 'transparent',
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
            setStep('payment')
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
            <span>{selectedVariant?.name ?? serviceName}</span>
            <span>${displayPrice}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-[#EDE9E3]" style={{ color: INK }}>
            <span>Total</span>
            <span>${displayPrice}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
