'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from './cart-context'

export default function CartIndicator() {
  const { count } = useCart()
  return (
    <Link
      href="/salon-unas/tienda/checkout"
      aria-label="Carrito"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#F0E4CF] transition-colors"
    >
      <ShoppingBag size={18} strokeWidth={1.5} style={{ color: '#0B0B0B' }} />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
          style={{ background: '#C4965A' }}
        >
          {count}
        </span>
      )}
    </Link>
  )
}
