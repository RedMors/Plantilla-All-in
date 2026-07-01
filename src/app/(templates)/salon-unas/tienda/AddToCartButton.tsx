'use client'

import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { useCart, type CartItem } from './cart-context'

export default function AddToCartButton({ product }: { product: Omit<CartItem, 'quantity'> }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  if (product.stock <= 0) {
    return (
      <button disabled className="w-full mt-3 py-2 text-[11px] font-semibold tracking-wide uppercase border rounded-md opacity-50 cursor-not-allowed"
        style={{ borderColor: '#EDE9E3', color: '#6B6560' }}>
        Agotado
      </button>
    )
  }

  return (
    <button
      onClick={() => { add(product); setAdded(true); setTimeout(() => setAdded(false), 1400) }}
      className="w-full mt-3 py-2 text-[11px] font-semibold tracking-wide uppercase rounded-md flex items-center justify-center gap-1.5 text-white transition-opacity hover:opacity-90"
      style={{ background: '#C4965A' }}
    >
      {added ? <><Check size={13} /> Agregado</> : <><Plus size={13} /> Agregar</>}
    </button>
  )
}
