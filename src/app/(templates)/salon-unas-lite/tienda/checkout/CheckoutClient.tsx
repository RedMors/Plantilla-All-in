'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Minus, Plus, Trash2, Banknote, CreditCard, Zap, Copy, Check, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '@/components/salon/CartContext'
import { createOrder, checkOrderPayment } from '../checkout-actions'
import { BRAND, PLUM, BLUSH, PETAL, LINE, MAUVE, MAUVE_SOFT, SHADOW } from '../../constants'
import PhoneInput from '@/components/salon/PhoneInput'

type PayMethod = 'cash' | 'card' | 'lightning'
type Step = 'cart' | 'lightning' | 'success'

const input = 'w-full border-b bg-transparent px-0 py-2.5 text-sm outline-none transition-colors'
const label = 'block text-[10px] font-semibold tracking-[0.2em] uppercase mb-1.5'

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
  const card = 'bg-white rounded-[24px] border'

  // ── SUCCESS ──────────────────────────────────────────────
  if (step === 'success') {
    return (
      <main className={wrap} style={{ background: BLUSH }}>
        <div className={`text-center py-10 ${card}`} style={{ borderColor: LINE, boxShadow: SHADOW.soft }}>
          <Check size={40} strokeWidth={1.5} style={{ color: BRAND }} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2" style={{ color: PLUM }}>¡Pedido confirmado!</h1>
          <p className="text-sm mb-4" style={{ color: MAUVE }}>Te contactaremos por WhatsApp para coordinar la entrega.</p>
          {code && (
            <p className="text-sm mb-6" style={{ color: PLUM }}>Código: <strong className="tracking-widest">{code}</strong></p>
          )}
          <Link href="/salon-unas-lite/tienda" className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: BRAND }}>
            Volver a la tienda
          </Link>
        </div>
      </main>
    )
  }

  // ── LIGHTNING ────────────────────────────────────────────
  if (step === 'lightning' && ln) {
    return (
      <main className={wrap} style={{ background: BLUSH }}>
        <div className={`p-8 ${card}`} style={{ borderColor: LINE, boxShadow: SHADOW.soft }}>
          <h1 className="text-lg font-bold mb-1" style={{ color: PLUM }}>Paga con Lightning</h1>
          <p className="text-sm mb-6" style={{ color: MAUVE }}>Total: <strong style={{ color: PLUM }}>${total.toFixed(2)}</strong></p>
          <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: MAUVE }}>
            <Loader2 size={16} className="animate-spin" style={{ color: BRAND }} /> Esperando la confirmación del pago…
          </div>
          <a href={`lightning:${ln.bolt11}`} className="w-full py-4 mb-4 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ background: BRAND }}>
            <Zap size={15} /> Abrir en mi wallet
          </a>
          <div className="border rounded-[16px] p-4" style={{ borderColor: LINE, background: PETAL }}>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: MAUVE_SOFT }}>Invoice (BOLT11)</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono break-all" style={{ color: MAUVE }}>{ln.bolt11.slice(0, 30)}…</span>
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
      <main className={wrap} style={{ background: BLUSH }}>
        <div className="text-center py-20" style={{ color: MAUVE }}>
          <ShoppingBag size={36} strokeWidth={1.2} className="mx-auto mb-4" style={{ color: MAUVE_SOFT }} />
          <p className="text-sm mb-4">Tu carrito está vacío.</p>
          <Link href="/salon-unas-lite/tienda" className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: BRAND }}>
            Ir a la tienda
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className={wrap} style={{ background: BLUSH }}>
      <Link href="/salon-unas-lite/tienda" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide mb-7" style={{ color: MAUVE }}>
        <ArrowLeft size={13} /> Seguir comprando
      </Link>
      <h1 className="text-3xl font-bold mb-8" style={{ color: PLUM }}>Tu carrito</h1>

      {/* Items */}
      <div className={`mb-8 ${card}`} style={{ borderColor: LINE, boxShadow: SHADOW.soft }}>
        {items.map((it, i) => (
          <div key={it.id} className="flex items-center gap-4 p-4" style={{ borderTop: i ? `1px solid ${LINE}` : 'none' }}>
            <div className="w-14 h-14 rounded-[12px] bg-cover bg-center shrink-0" style={{ background: PETAL, backgroundImage: it.image_url ? `url(${it.image_url})` : undefined }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: PLUM }}>{it.name}</p>
              <p className="text-xs" style={{ color: MAUVE }}>${it.price.toFixed(2)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(it.id, it.quantity - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center" style={{ borderColor: LINE }}><Minus size={12} /></button>
              <span className="text-sm w-5 text-center" style={{ color: PLUM }}>{it.quantity}</span>
              <button onClick={() => setQty(it.id, it.quantity + 1)} disabled={it.quantity >= it.stock} className="w-7 h-7 rounded-full border flex items-center justify-center disabled:opacity-30" style={{ borderColor: LINE }}><Plus size={12} /></button>
            </div>
            <span className="text-sm font-bold w-16 text-right shrink-0" style={{ color: PLUM }}>${(it.price * it.quantity).toFixed(2)}</span>
            <button onClick={() => remove(it.id)} className="p-1.5 hover:bg-red-50 rounded-full"><Trash2 size={14} style={{ color: '#C87A7A' }} /></button>
          </div>
        ))}
        <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: LINE }}>
          <span className="text-sm font-semibold" style={{ color: PLUM }}>Total</span>
          <span className="text-lg font-bold" style={{ color: BRAND }}>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Datos */}
      <div className="grid gap-6 mb-8">
        <div>
          <label className={label} style={{ color: MAUVE_SOFT }}>Nombre</label>
          <input className={input} style={{ borderColor: LINE, color: PLUM }} value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre completo" />
        </div>
        <PhoneInput name="phone" required value={phone} onChange={setPhone} borderColor={LINE} accentColor={BRAND} textColor={PLUM} mutedColor={MAUVE_SOFT} />
        <div>
          <label className={label} style={{ color: MAUVE_SOFT }}>Correo <span className="normal-case" style={{ color: MAUVE_SOFT }}>(opcional)</span></label>
          <input className={input} style={{ borderColor: LINE, color: PLUM }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="para el comprobante" />
        </div>
      </div>

      {/* Método de pago */}
      <p className={label} style={{ color: MAUVE_SOFT }}>Método de pago</p>
      <div className="flex flex-col gap-2 mb-8">
        {PAY_OPTIONS.map(({ id, label: l, sub, Icon }) => {
          const sel = method === id
          return (
            <button key={id} type="button" onClick={() => setMethod(id)} className="flex items-center gap-4 p-4 rounded-[16px] border text-left transition-all"
              style={{ borderColor: sel ? BRAND : LINE, background: sel ? PETAL : 'transparent' }}>
              <Icon size={18} strokeWidth={1.5} style={{ color: sel ? BRAND : MAUVE_SOFT }} />
              <div className="flex-1"><p className="text-sm font-semibold" style={{ color: PLUM }}>{l}</p><p className="text-xs" style={{ color: MAUVE }}>{sub}</p></div>
              {sel && <Check size={14} strokeWidth={2} style={{ color: BRAND }} />}
            </button>
          )
        })}
      </div>

      {err && <p className="text-xs text-red-600 border-l-2 border-red-400 pl-3 mb-4">{err}</p>}

      <button onClick={submit} disabled={pending} className="w-full py-4 rounded-full text-white text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-40" style={{ background: BRAND }}>
        {pending ? 'Procesando...' : method === 'cash' ? `Confirmar pedido · $${total.toFixed(2)}` : `Pagar $${total.toFixed(2)}`}
      </button>
    </main>
  )
}
