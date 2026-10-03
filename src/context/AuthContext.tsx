import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, getToken } from '../services/api'
export interface OrderLine { id: string; ar: string; qty: number }
export interface Order { id: string; createdAt: string; total: number; status: string; items: OrderLine[] }
export interface User { name: string; email: string; phone: string; address: string; city: string; avatarColor: string }
interface ProfileInput { name?: string; phone?: string; address?: string; city?: string; avatarColor?: string }
interface Ctx { user: User | null; orders: Order[]; register(u: { name: string; email: string; phone: string }, pw: string): Promise<string | null>; login(email: string, pw: string): Promise<string | null>; logout(): void; refresh(): Promise<void>; updateProfile(p: ProfileInput): Promise<string | null> }
const C = createContext<Ctx>(null!); export const useAuth = () => useContext(C)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [orders, setOrders] = useState<Order[]>([])
  const refresh = async () => { if (!getToken()) return; try { const d = await api('/me'); setUser(d.user); setOrders(d.orders) } catch { localStorage.removeItem('nt_token'); setUser(null) } }
  useEffect(() => { refresh() }, [])
  const done = (d: any) => { localStorage.setItem('nt_token', d.token); setUser(d.user); refresh(); return null }
  const call = async (p: string, body: unknown) => { try { return done(await api(p, { method: 'POST', body })) } catch (e: any) { return e.message as string } }
  const updateProfile = async (p: ProfileInput) => { try { const d = await api('/me', { method: 'PATCH', body: p }); setUser(d.user); return null } catch (e: any) { return e.message as string } }
  return <C.Provider value={{ user, orders, register: (u, password) => call('/auth/register', { ...u, password }), login: (email, password) => call('/auth/login', { email, password }), logout: () => { localStorage.removeItem('nt_token'); setUser(null); setOrders([]) }, refresh, updateProfile }}>{children}</C.Provider>
}
