// In production the frontend and backend are deployed separately (e.g. Vercel + Render),
// so API calls need the backend's full URL. Set VITE_API_URL to it, e.g. https://notrio-api.onrender.com
// Leave empty for local development — Vite's dev server proxies "/api" to localhost:4000 (see vite.config.ts).
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const getToken = () => localStorage.getItem('nt_token')
export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const t = getToken()
  const r = await fetch(API_BASE + '/api' + path, { method: opts.method || 'GET', headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: opts.body ? JSON.stringify(opts.body) : undefined })
  const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'حدث خطأ، حاول مرة أخرى.'); return d
}
