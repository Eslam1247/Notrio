import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { API_BASE } from '../services/api'
interface Ctx { qty(id: string, fallback: boolean): number; loaded: boolean; refresh(): void }
const C = createContext<Ctx>(null!); export const useStock = () => useContext(C)
export function StockProvider({ children }: { children: ReactNode }) {
  const [stock, setStock] = useState<Record<string, number> | null>(null)
  const refresh = () => fetch(API_BASE + '/api/stock').then(r => r.ok ? r.json() : null).then(setStock).catch(() => {})
  useEffect(() => { refresh() }, [])
  // Falls back to the static catalog flag (20 or 0) if the API hasn't responded yet — keeps the site usable offline/demo.
  const qty = (id: string, fallback: boolean) => stock?.[id] ?? (fallback ? 20 : 0)
  return <C.Provider value={{ qty, loaded: !!stock, refresh }}>{children}</C.Provider>
}
