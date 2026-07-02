'use client'

import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { useCart, type CartItem } from '@/components/salon/CartContext'

type Theme = { brand: string; borderColor: string; mutedColor: string }
const DEFAULT_THEME: Theme = { brand: '#C4965A', borderColor: '#EDE9E3', mutedColor: '#6B6560' }

export default function AddToCartButton({
  product,
  theme = DEFAULT_THEME,
}: {
  product: Omit<CartItem, 'quantity'>
  theme?: Theme
}) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  if (product.stock <= 0) {
    return (
      <button disabled className="w-full mt-3 py-2 text-[11px] font-semibold tracking-wide uppercase border rounded-md opacity-50 cursor-not-allowed"
        style={{ borderColor: theme.borderColor, color: theme.mutedColor }}>
        Agotado
      </button>
    )
  }

  return (
    <button
      onClick={() => { add(product); setAdded(true); setTimeout(() => setAdded(false), 1400) }}
      className="w-full mt-3 py-2 text-[11px] font-semibold tracking-wide uppercase rounded-md flex items-center justify-center gap-1.5 text-white transition-opacity hover:opacity-90"
      style={{ background: theme.brand }}
    >
      {added ? <><Check size={13} /> Agregado</> : <><Plus size={13} /> Agregar</>}
    </button>
  )
}
