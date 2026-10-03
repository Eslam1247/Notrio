import { FormEvent, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { useLang } from '../i18n'
import { fmt } from '../data/products'
import { useSEO } from '../hooks/useSEO'
const steps: [string, string][] = [['received', 'تم استلام الطلب'], ['confirmed', 'تم تأكيد الطلب'], ['shipped', 'خرج للتوصيل'], ['delivered', 'تم التسليم']]
export default function Track() {
  const { t: tt, pick } = useLang(); const [sp] = useSearchParams();
  useSEO(tt('track_order'), pick('تتبّع حالة طلبك من Notrio برقم الطلب ورقم الموبايل.', 'Track your Notrio order status using your order number and phone.'))
  const [o, setO] = useState<any>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const go = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); setBusy(true); setErr(''); setO(null); const f = new FormData(e.currentTarget)
    try { setO(await api(`/orders/track?id=${encodeURIComponent(`${f.get('id')}`.trim())}&phone=${encodeURIComponent(`${f.get('phone')}`)}`)) } catch (x: any) { setErr(x.message) } setBusy(false) }
  const at = o ? steps.findIndex(s => s[0] === o.status) : -1
  return (
    <section className="max-w-xl mx-auto px-5 pt-12">
      <h1 className="text-3xl font-bold">{tt("track_order")}</h1><p className="text-mute mt-2">{pick("اكتب رقم الطلب ورقم الموبايل الذي استخدمته عند الشراء.", "Enter your order number and the mobile number used at checkout.")}</p>
      <form onSubmit={go} className="mt-6 grid gap-3"><input name="id" required defaultValue={sp.get('id') || ''} placeholder="رقم الطلب (NT-12345)" className="input" dir="ltr" /><input name="phone" required type="tel" placeholder="رقم الموبايل" className="input" dir="ltr" /><button disabled={busy} className="btn btn-blue disabled:opacity-40">{busy ? 'جارٍ البحث…' : 'تتبّع'}</button></form>
      {err && <p role="alert" className="text-magenta text-sm mt-4">{err}</p>}
      {o && <div className="card p-5 mt-6">
        <div className="flex justify-between font-medium"><span>{o.id}</span><span>{fmt(o.total)}</span></div>
        {o.status === 'cancelled' ? <p className="mt-4 text-magenta font-medium">تم إلغاء هذا الطلب.</p> : <ol className="mt-5 space-y-4">{steps.map(([k, t], i) => <li key={k} className="flex items-center gap-3"><span className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${i <= at ? 'bg-blue text-white' : 'bg-fog text-mute'}`}>{i <= at ? '✓' : i + 1}</span><span className={i <= at ? 'font-medium' : 'text-mute'}>{t}</span></li>)}</ol>}
        <p className="text-sm text-mute mt-5">{o.items.map((i: any) => `${i.ar} ×${i.qty.toLocaleString('ar-EG')}`).join('، ')}</p>
        <p className="text-sm mt-2">{o.method === 'transfer' ? (o.pay === 'paid' ? pick('✓ تم تأكيد التحويل', '✓ Transfer confirmed') : pick('في انتظار مراجعة التحويل', 'Awaiting transfer review')) : tt('trust_1')}</p></div>}
    </section>)
}
