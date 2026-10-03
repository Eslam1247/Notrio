import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Product } from '../data/products'
export const FREE_SHIP = 500, SHIP_FEE = 40
export interface CartItem { key: string; product: Product; color: string; qty: number }
interface Ctx { items: CartItem[]; add(p: Product, color: string): void; setQty(k: string, q: number): void; remove(k: string): void; clear(): void; subtotal: number; shipping: number; total: number; count: number; open: boolean; setOpen(v: boolean): void }
const C = createContext<Ctx>(null!)
export const useCart = () => useContext(C)
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => { try { return JSON.parse(localStorage.getItem('nt_cart') || '[]') } catch { return [] } })
  const [open, setOpen] = useState(false)
  useEffect(() => { localStorage.setItem('nt_cart', JSON.stringify(items)) }, [items])
  const add = (product: Product, color: string) => { const key = product.id + color; setItems(s => s.some(i => i.key === key) ? s.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i) : [...s, { key, product, color, qty: 1 }]); setOpen(true) }
  const setQty = (k: string, q: number) => setItems(s => q < 1 ? s.filter(i => i.key !== k) : s.map(i => i.key === k ? { ...i, qty: Math.min(q, 20) } : i))
  const remove = (k: string) => setItems(s => s.filter(i => i.key !== k))
  const subtotal = items.reduce((a, i) => a + i.product.price * i.qty, 0)
  const shipping = items.length && subtotal < FREE_SHIP ? SHIP_FEE : 0
  const count = items.reduce((a, i) => a + i.qty, 0)
  return <C.Provider value={{ items, add, setQty, remove, clear: () => setItems([]), subtotal, shipping, total: subtotal + shipping, count, open, setOpen }}>{children}</C.Provider>
}
