'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/components/salon/CartContext'

type Props = {
  basePath?: string   // ruta de la tienda de este skin, ej. '/salon-unas' o '/salon-unas-lite'
  brand?: string
  ink?: string
  hoverBg?: string
}

export default function CartIndicator({
  basePath = '/salon-unas',
  brand = '#C4965A',
  ink = '#0B0B0B',
  hoverBg = '#F0E4CF',
}: Props) {
  const { count } = useCart()
  return (
    <Link
      href={`${basePath}/tienda/checkout`}
      aria-label="Carrito"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors"
      onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <ShoppingBag size={18} strokeWidth={1.5} style={{ color: ink }} />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
          style={{ background: brand }}
        >
          {count}
        </span>
      )}
    </Link>
  )
}
