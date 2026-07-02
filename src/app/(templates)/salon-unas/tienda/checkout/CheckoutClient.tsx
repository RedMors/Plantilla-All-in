'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Minus, Plus, Trash2, Banknote, CreditCard, Zap, Copy, Check, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '@/components/salon/CartContext'
import { createOrder, checkOrderPayment } from '../checkout-actions'
import { BRAND, BRAND_LIGHT, INK, CREAM, STONE, MUTED } from '../../constants'
import PhoneInput from '@/components/salon/PhoneInput'

type PayMethod = 'cash' | 'card' | 'lightning'
type Step = 'cart' | 'lightning' | 'success'

const input = 'w-full border-b bg-transparent px-0 py-2.5 text-sm outline-none focus:border-[#C4965A] transition-colors'
const label = 'block text-[10px] font-semibold tracking-[0.2em] uppercase mb-1.5 text-[#B0A89E]'

export default function CheckoutClient({ methods }: { methods: readonly PayMethod[] }) {
  const { items, total, count, setQty, remove, clear } = useCart()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [method, setMethod] = useState<PayMethod>(methods[0] ?? 'cash')
  const [step, setStep] = useState<Step>('cart')
  const [err, setErr] = useState('')
  const [code, setCode] = useState('')
  const [ln, setLn] = useState<{ orderId: string; bolt11: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  // Polling del pago Lightning
  useEffect(() => {
    if (step !== 'lightning' || !ln) return
    let active = true
    const iv = setInterval(async () => {
      const r = await checkOrderPayment(ln.orderId)
      if (!active || !('status' in r)) return
      if (r.status === 'paid') { clearInterval(iv); clear(); setStep('success') }
      else if (r.status === 'expired') { clearInterval(iv); setErr('La factura Lightning expiró. Intenta de nuevo.'); setLn(null); setStep('cart') }
    }, 4000)
    return () => { active = false; clearInterval(iv) }
  }, [step, ln, clear])

  const ALL_OPTIONS: { id: PayMethod; label: string; sub: string; Icon: React.ElementType }[] = [
    { id: 'cash', label: 'Efectivo', sub: 'Paga al recoger', Icon: Banknote },
    { id: 'card', label: 'Tarjeta', sub: 'Visa / Mastercard', Icon: CreditCard },
    { id: 'lightning', label: 'Lightning', sub: 'Bitcoin', Icon: Zap },
  ]
  const PAY_OPTIONS = ALL_OPTIONS.filter(o => methods.includes(o.id))

  function submit() {
    if (!name.trim() || !phone.trim()) { setErr('Nombre y teléfono son requeridos.'); return }
    setErr('')
    startTransition(async () => {
      const res = await createOrder({
        items: items.map(i => ({ id: i.id, quantity: i.quantity })),
        name, phone, email: email || undefined, method,
      })
      if ('error' in res) { setErr(res.error); return }
      if (res.method === 'card') { clear(); window.location.href = res.redirectUrl; return }
      if (res.method === 'lightning') { setLn({ orderId: res.orderId, bolt11: res.bolt11 }); setStep('lightning'); return }
      setCode(res.confirmationCode); clear(); setStep('success')  // cash
    })
  }

  const wrap = 'max-w-2xl mx-auto px-6 py-14'

  // ── SUCCESS ──────────────────────────────────────────────
  if (step === 'success') {
    return (
      <main className={wrap}>
        <div className="text-center py-10" style={{ background: CREAM, border: `1px solid ${STONE}` }}>
          <Check size={40} strokeWidth={1.5} style={{ color: BRAND }} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2" style={{ color: INK }}>¡Pedido confirmado!</h1>
          <p className="text-sm mb-4" style={{ color: MUTED }}>Te contactaremos por WhatsApp para coordinar la entrega.</p>
          {code && (
            <p className="text-sm mb-6" style={{ color: INK }}>Código: <strong className="tracking-widest">{code}</strong></p>
          )}
          <Link href="/salon-unas/tienda" className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: BRAND }}>
            Volver a la tienda
          </Link>
        </div>
      </main>
    )
  }

  // ── LIGHTNING ────────────────────────────────────────────
  if (step === 'lightning' && ln) {
    return (
      <main className={wrap}>
        <div className="p-8" style={{ background: CREAM, border: `1px solid ${STONE}` }}>
          <h1 className="text-lg font-bold mb-1" style={{ color: INK }}>Paga con Lightning</h1>
          <p className="text-sm mb-6" style={{ color: MUTED }}>Total: <strong style={{ color: INK }}>${total.toFixed(2)}</strong></p>
          <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: MUTED }}>
            <Loader2 size={16} className="animate-spin" style={{ color: BRAND }} /> Esperando la confirmación del pago…
          </div>
          <a href={`lightning:${ln.bolt11}`} className="w-full py-4 mb-4 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-85 transition-opacity" style={{ background: BRAND }}>
            <Zap size={15} /> Abrir en mi wallet
          </a>
          <div className="border p-4" style={{ borderColor: STONE, background: '#F5EFE8' }}>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: '#B0A89E' }}>Invoice (BOLT11)</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono break-all" style={{ color: MUTED }}>{ln.bolt11.slice(0, 30)}…</span>
              <button onClick={() => { navigator.clipboard.writeText(ln.bolt11); setCopied(true); setTimeout(() => setCopied(false), 1500) }} style={{ color: BRAND }}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── CART + FORM ──────────────────────────────────────────
  if (count === 0) {
    return (
      <main className={wrap}>
        <div className="text-center py-20" style={{ color: MUTED }}>
          <ShoppingBag size={36} strokeWidth={1.2} className="mx-auto mb-4" style={{ color: '#D4CCC0' }} />
          <p className="text-sm mb-4">Tu carrito está vacío.</p>
          <Link href="/salon-unas/tienda" className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: BRAND }}>
            Ir a la tienda
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className={wrap}>
      <Link href="/salon-unas/tienda" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide mb-7" style={{ color: MUTED }}>
        <ArrowLeft size={13} /> Seguir comprando
      </Link>
      <h1 className="text-3xl font-bold mb-8" style={{ color: INK, fontFamily: 'var(--font-cormorant), serif' }}>Tu carrito</h1>

      {/* Items */}
      <div className="mb-8" style={{ background: CREAM, border: `1px solid ${STONE}` }}>
        {items.map((it, i) => (
          <div key={it.id} className="flex items-center gap-4 p-4" style={{ borderTop: i ? `1px solid ${STONE}` : 'none' }}>
            <div className="w-14 h-14 rounded-md bg-[#F1ECE4] bg-cover bg-center shrink-0" style={{ backgroundImage: it.image_url ? `url(${it.image_url})` : undefined }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: INK }}>{it.name}</p>
              <p className="text-xs" style={{ color: MUTED }}>${it.price.toFixed(2)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(it.id, it.quantity - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center" style={{ borderColor: STONE }}><Minus size={12} /></button>
              <span className="text-sm w-5 text-center" style={{ color: INK }}>{it.quantity}</span>
              <button onClick={() => setQty(it.id, it.quantity + 1)} disabled={it.quantity >= it.stock} className="w-7 h-7 rounded-full border flex items-center justify-center disabled:opacity-30" style={{ borderColor: STONE }}><Plus size={12} /></button>
            </div>
            <span className="text-sm font-bold w-16 text-right shrink-0" style={{ color: INK }}>${(it.price * it.quantity).toFixed(2)}</span>
            <button onClick={() => remove(it.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 size={14} style={{ color: '#C87A7A' }} /></button>
          </div>
        ))}
        <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: STONE }}>
          <span className="text-sm font-semibold" style={{ color: INK }}>Total</span>
          <span className="text-lg font-bold" style={{ color: BRAND }}>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Datos */}
      <div className="grid gap-6 mb-8">
        <div><label className={label}>Nombre</label><input className={input} style={{ borderColor: STONE }} value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre completo" /></div>
        <PhoneInput name="phone" required value={phone} onChange={setPhone} />
        <div><label className={label}>Correo <span className="normal-case text-[#D4CCC0]">(opcional)</span></label><input className={input} style={{ borderColor: STONE }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="para el comprobante" /></div>
      </div>

      {/* Método de pago */}
      <p className={label}>Método de pago</p>
      <div className="flex flex-col gap-2 mb-8">
        {PAY_OPTIONS.map(({ id, label: l, sub, Icon }) => {
          const sel = method === id
          return (
            <button key={id} type="button" onClick={() => setMethod(id)} className="flex items-center gap-4 p-4 border text-left transition-all"
              style={{ borderColor: sel ? BRAND : STONE, background: sel ? BRAND_LIGHT : 'transparent' }}>
              <Icon size={18} strokeWidth={1.5} style={{ color: sel ? BRAND : '#B0A89E' }} />
              <div className="flex-1"><p className="text-sm font-semibold" style={{ color: INK }}>{l}</p><p className="text-xs" style={{ color: MUTED }}>{sub}</p></div>
              {sel && <Check size={14} strokeWidth={2} style={{ color: BRAND }} />}
            </button>
          )
        })}
      </div>

      {err && <p className="text-xs text-red-600 border-l-2 border-red-400 pl-3 mb-4">{err}</p>}

      <button onClick={submit} disabled={pending} className="w-full py-4 text-white text-sm font-semibold tracking-wide hover:opacity-85 transition-opacity disabled:opacity-40" style={{ background: BRAND }}>
        {pending ? 'Procesando...' : method === 'cash' ? `Confirmar pedido · $${total.toFixed(2)}` : `Pagar $${total.toFixed(2)}`}
      </button>
    </main>
  )
}
