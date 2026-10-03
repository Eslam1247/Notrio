import { useEffect, useRef } from 'react'
import { api, getToken } from '../services/api'
declare global { interface Window { google?: any } }
export default function GoogleButton({ onDone }: { onDone(): void }) {
  const ref = useRef<HTMLDivElement>(null); const id = import.meta.env.VITE_GOOGLE_CLIENT_ID
  useEffect(() => { if (!id || !window.google || !ref.current) return
    window.google.accounts.id.initialize({ client_id: id, callback: async (r: any) => { try { const d = await api('/auth/google', { method: 'POST', body: { credential: r.credential } }); localStorage.setItem('nt_token', d.token); onDone() } catch {} } })
    window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', width: 320, locale: document.documentElement.lang })
  }, [id])
  if (!id) return null
  return <div className="flex flex-col items-center gap-3 my-2"><div className="flex items-center gap-3 w-full text-mute text-xs"><span className="flex-1 h-px bg-ink/10" />أو<span className="flex-1 h-px bg-ink/10" /></div><div ref={ref} /></div>
}
