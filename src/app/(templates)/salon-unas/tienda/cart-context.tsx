'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type CartItem = {
  id: string          // product id
  name: string
  price: number
  image_url: string | null
  quantity: number
  stock: number       // tope disponible (para no exceder)
}

type CartCtx = {
  items: CartItem[]
  count: number
  total: number
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
}

const Ctx = createContext<CartCtx | null>(null)
const KEY = 'nail_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Cargar del localStorage al montar (evita hydration mismatch vs. lazy init en SSR)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persistir
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items))
  }, [items, hydrated])

  const add = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      const cap = Math.max(0, item.stock)
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: Math.min(cap, i.quantity + qty) } : i
        )
      }
      return [...prev, { ...item, quantity: Math.min(cap, qty) }]
    })
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    setItems(prev => prev.flatMap(i => {
      if (i.id !== id) return [i]
      const q = Math.min(Math.max(0, qty), Math.max(0, i.stock))
      return q <= 0 ? [] : [{ ...i, quantity: q }]
    }))
  }, [])

  const remove = useCallback((id: string) => setItems(prev => prev.filter(i => i.id !== id)), [])
  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <Ctx.Provider value={{ items, count, total, add, setQty, remove, clear }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
