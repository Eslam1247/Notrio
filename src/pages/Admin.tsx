import { useEffect, useState } from 'react'
import { fmt } from '../data/products'
import { API_BASE } from '../services/api'
import { useLang } from '../i18n'

interface OrderLine { id: string; ar: string; qty: number; color: string; price: number }
interface Order { id: string; customer: { name: string; phone: string; address: string; city: string }; items: OrderLine[]; subtotal: number; shipping: number; total: number; method: 'cod' | 'transfer'; transferRef?: string | null; status: string; pay: string; createdAt: string }

const STATUSES = ['received', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const
const statusLabel: Record<string, [string, string]> = {
  received: ['تم الاستلام', 'Received'], confirmed: ['تم التأكيد', 'Confirmed'], shipped: ['خرج للتوصيل', 'Shipped'], delivered: ['تم التسليم', 'Delivered'], cancelled: ['ملغي', 'Cancelled'],
}
const statusColor: Record<string, string> = { received: 'bg-fog text-ink', confirmed: 'bg-blue/10 text-blue', shipped: 'bg-neon text-ink', delivered: 'bg-[#1f8f5c]/10 text-[#1f8f5c]', cancelled: 'bg-magenta/10 text-magenta' }

async function call(key: string, path: string, opts: { method?: string; body?: unknown } = {}) {
  const r = await fetch(API_BASE + '/api/admin' + path, { method: opts.method || 'GET', headers: { 'Content-Type': 'application/json', 'x-admin-key': key }, body: opts.body ? JSON.stringify(opts.body) : undefined })
  if (r.status === 403) throw new Error('KEY')
  const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'error'); return d
}

function StockPanel({ admKey }: { admKey: string }) {
  const { pick } = useLang()
  const [stock, setStock] = useState<Record<string, { ar: string; qty: number }> | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(''); const [err, setErr] = useState('')
  const load = () => call(admKey, '/stock').then(setStock).catch(() => setErr(pick('تعذّر تحميل المخزون.', 'Could not load stock.')))
  useEffect(() => { load() }, [])
  const save = async (id: string) => {
    const val = Math.max(0, parseInt(edits[id] ?? '', 10) || 0); setBusy(id)
    try { await call(admKey, `/stock/${id}`, { method: 'PATCH', body: { qty: val } }); setStock(s => s ? { ...s, [id]: { ...s[id], qty: val } } : s); setEdits(e => { const n = { ...e }; delete n[id]; return n }) }
    catch { setErr(pick('تعذّر تحديث الكمية.', 'Could not update quantity.')) }
    setBusy('')
  }
  if (!stock) return <p className="text-mute mt-10">{pick('جارٍ التحميل…', 'Loading…')}</p>
  const ids = Object.keys(stock)
  return (
    <div className="mt-6 grid sm:grid-cols-2 gap-3">
      {err && <p role="alert" className="text-sm text-magenta sm:col-span-2">{err}</p>}
      {ids.map(id => { const row = stock[id]; const low = row.qty > 0 && row.qty <= 5; const out = row.qty <= 0
        return (
          <div key={id} className={`card p-4 flex items-center justify-between gap-3 ${out ? 'border-magenta/30' : low ? 'border-neon' : ''}`}>
            <div><div className="font-medium">{row.ar}</div><div className={`text-xs mt-0.5 ${out ? 'text-magenta' : low ? 'text-[#a08a00]' : 'text-mute'}`}>{out ? pick('نفدت الكمية', 'Out of stock') : low ? pick('كمية قليلة', 'Low stock') : pick('متوفر', 'In stock')}</div></div>
            <div className="flex items-center gap-2">
              <input type="number" min={0} max={9999} value={edits[id] ?? row.qty} onChange={e => setEdits(v => ({ ...v, [id]: e.target.value }))} className="input !py-1.5 !w-20 text-center" />
              <button disabled={busy === id} onClick={() => save(id)} className="btn btn-blue !py-1.5 !px-4 text-xs disabled:opacity-40">{pick('حفظ', 'Save')}</button>
            </div>
          </div>) })}
    </div>
  )
}

export default function Admin() {
  const { pick } = useLang()
  const [key, setKey] = useState(() => sessionStorage.getItem('nt_admin_key') || '')
  const [inputKey, setInputKey] = useState('')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [err, setErr] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [q, setQ] = useState('')
  const [busyId, setBusyId] = useState('')
  const [tab, setTab] = useState<'orders' | 'stock'>('orders')

  const load = async (k: string) => {
    setErr('')
    try { setOrders(await call(k, '/orders')); sessionStorage.setItem('nt_admin_key', k); setKey(k) }
    catch (e: any) { if (e.message === 'KEY') { setErr(pick('المفتاح غير صحيح.', 'Invalid admin key.')); sessionStorage.removeItem('nt_admin_key'); setKey('') } else setErr(pick('تعذّر الاتصال بالسيرفر. تأكد إن الباك إند شغّال.', "Couldn't reach the server. Make sure the backend is running.")) }
  }
  useEffect(() => { if (key) load(key) }, [])

  const setStatus = async (id: string, status: string) => {
    setBusyId(id)
    try { await call(key, `/orders/${id}`, { method: 'PATCH', body: { status } }); setOrders(os => os!.map(o => o.id === id ? { ...o, status } : o)) }
    catch { setErr(pick('تعذّر تحديث حالة الطلب.', 'Could not update order status.')) }
    setBusyId('')
  }
  const setPay = async (id: string, pay: string) => {
    setBusyId(id)
    try { await call(key, `/orders/${id}`, { method: 'PATCH', body: { pay } }); setOrders(os => os!.map(o => o.id === id ? { ...o, pay } : o)) }
    catch { setErr(pick('تعذّر تحديث حالة الدفع.', 'Could not update payment status.')) }
    setBusyId('')
  }

  if (!key) return (
    <section className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6"><div className="text-3xl font-bold text-blue">Notrio<span className="text-magenta">.</span></div><div className="text-mute text-sm mt-1">{pick('لوحة التحكم', 'Dashboard')}</div></div>
        <div className="card p-7 border-t-4 border-t-blue shadow-sm">
          <h1 className="text-xl font-bold">{pick('تسجيل الدخول', 'Sign in')}</h1>
          <p className="text-mute text-sm mt-2">{pick('أدخل مفتاح الأدمن (ADMIN_KEY) من server/.env', 'Enter the ADMIN_KEY from server/.env')}</p>
          <form onSubmit={e => { e.preventDefault(); load(inputKey) }} className="mt-5 flex flex-col gap-3">
            <input value={inputKey} onChange={e => setInputKey(e.target.value)} type="password" placeholder="ADMIN_KEY" className="input" dir="ltr" />
            {err && <p role="alert" className="text-sm text-magenta bg-[#fff3fa] border border-magenta/30 rounded-lg px-3 py-2">{err}</p>}
            <button className="btn btn-blue">{pick('دخول', 'Enter')}</button>
          </form>
        </div>
      </div>
    </section>
  )

  const list = (orders || []).filter(o => (filter === 'all' || o.status === filter) && (o.id + o.customer.name + o.customer.phone).toLowerCase().includes(q.toLowerCase()))
  const counts = STATUSES.reduce((a, s) => ({ ...a, [s]: (orders || []).filter(o => o.status === s).length }), {} as Record<string, number>)
  const revenue = (orders || []).filter(o => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0)
  const pendingReview = (orders || []).filter(o => o.pay !== 'paid' && o.status !== 'cancelled').length

  return (
    <section className="mx-auto max-w-[1200px] px-5 pt-8 pb-20">
      <div className="rounded-3xl bg-gradient-to-br from-blue to-[#0a1594] text-white p-6 flex items-center justify-between gap-4 flex-wrap">
        <div><div className="text-sm text-white/70">{pick('أهلاً بيك في', 'Welcome to')} Notrio Admin 👋</div><h1 className="text-2xl font-bold mt-1">{pick('لوحة تحكم الطلبات', 'Orders dashboard')}</h1></div>
        <div className="flex gap-2">
          <button onClick={() => load(key)} className="btn !bg-white/10 !text-white border border-white/30 !py-2 text-sm hover:!bg-white/20">{pick('تحديث', 'Refresh')}</button>
          <button onClick={() => { sessionStorage.removeItem('nt_admin_key'); setKey(''); setOrders(null) }} className="btn !bg-transparent !text-white/80 border border-white/20 !py-2 text-sm hover:!text-white">{pick('خروج', 'Sign out')}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        <div className="card p-4"><div className="text-xs text-mute">{pick('إجمالي الطلبات', 'Total orders')}</div><div className="text-2xl font-bold text-blue mt-1">{(orders || []).length}</div></div>
        <div className="card p-4"><div className="text-xs text-mute">{pick('قيد المراجعة', 'Awaiting review')}</div><div className="text-2xl font-bold text-magenta mt-1">{pendingReview}</div></div>
        <div className="card p-4"><div className="text-xs text-mute">{pick('خرجت للتوصيل', 'Out for delivery')}</div><div className="text-2xl font-bold text-ink mt-1">{counts.shipped || 0}</div></div>
        <div className="card p-4"><div className="text-xs text-mute">{pick('إجمالي الإيرادات', 'Total revenue')}</div><div className="text-2xl font-bold text-[#1f8f5c] mt-1">{fmt(revenue, pick('ar', 'en'))}</div></div>
      </div>

      <div className="grid grid-cols-2 bg-fog rounded-full p-1 text-sm font-medium mt-6 max-w-xs">
        <button onClick={() => setTab('orders')} className={`rounded-full py-2 transition ${tab === 'orders' ? 'bg-blue text-white' : 'text-ink'}`}>{pick('الطلبات', 'Orders')}</button>
        <button onClick={() => setTab('stock')} className={`rounded-full py-2 transition ${tab === 'stock' ? 'bg-blue text-white' : 'text-ink'}`}>{pick('المخزون', 'Stock')}</button>
      </div>

      {tab === 'stock' ? <StockPanel admKey={key} /> : <>
      <div className="flex gap-2 overflow-x-auto mt-6 pb-1">
        <button onClick={() => setFilter('all')} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium border ${filter === 'all' ? 'bg-blue text-white border-blue' : 'border-ink/15'}`}>{pick('الكل', 'All')} ({(orders || []).length})</button>
        {STATUSES.map(s => <button key={s} onClick={() => setFilter(s)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium border ${filter === s ? 'bg-blue text-white border-blue' : 'border-ink/15'}`}>{pick(...statusLabel[s])} ({counts[s] || 0})</button>)}
      </div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder={pick('ابحث برقم الطلب، الاسم أو الموبايل…', 'Search by order id, name or phone…')} className="input !py-2 text-sm mt-3 max-w-sm" />

      {err && <p role="alert" className="text-sm text-magenta mt-4">{err}</p>}
      {!orders ? <p className="text-mute mt-10">{pick('جارٍ التحميل…', 'Loading…')}</p> : !list.length ? <p className="text-mute mt-10 text-center">{pick('لا توجد طلبات.', 'No orders.')}</p> : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[720px]">
            <thead><tr className="text-mute text-right border-b border-ink/10">
              {[pick('الطلب', 'Order'), pick('العميل', 'Customer'), pick('المنتجات', 'Items'), pick('الإجمالي', 'Total'), pick('الدفع', 'Payment'), pick('الحالة', 'Status')].map(h => <th key={h} className="py-3 px-2 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {list.map(o => (
                <tr key={o.id} className="border-b border-ink/5 align-top hover:bg-fog/50">
                  <td className="py-3 px-2"><div className="font-medium text-blue">{o.id}</div><div className="text-mute text-xs mt-1">{new Date(o.createdAt).toLocaleString(pick('ar-EG', 'en-US'))}</div></td>
                  <td className="py-3 px-2"><div className="font-medium">{o.customer.name}</div><div className="text-mute text-xs" dir="ltr">{o.customer.phone}</div><div className="text-mute text-xs">{o.customer.city} — {o.customer.address}</div></td>
                  <td className="py-3 px-2 max-w-[220px]"><ul className="space-y-0.5">{o.items.map(i => <li key={i.id + i.color}>{i.ar} ×{i.qty}{i.color ? ` (${i.color})` : ''}</li>)}</ul></td>
                  <td className="py-3 px-2 font-medium">{fmt(o.total, pick('ar', 'en'))}</td>
                  <td className="py-3 px-2">
                    <div>{o.method === 'transfer' ? pick('تحويل', 'Transfer') : pick('عند الاستلام', 'COD')}</div>
                    {o.method === 'transfer' && o.transferRef && <div className="text-mute text-xs mt-0.5" dir="ltr">ref: {o.transferRef}</div>}
                    <div className={`text-xs mt-1 font-medium ${o.pay === 'paid' ? 'text-[#1f8f5c]' : 'text-mute'}`}>{o.pay === 'paid' ? pick('✓ مدفوع', '✓ Paid') : pick('غير مدفوع', 'Unpaid')}</div>
                    {o.pay !== 'paid' && <button disabled={busyId === o.id} onClick={() => setPay(o.id, 'paid')} className="mt-1 text-xs text-blue underline underline-offset-2 disabled:opacity-40">{pick('تأكيد الدفع', 'Mark as paid')}</button>}
                  </td>
                  <td className="py-3 px-2">
                    <select disabled={busyId === o.id} value={o.status} onChange={e => setStatus(o.id, e.target.value)} className={`rounded-full text-xs font-medium px-3 py-1.5 border-0 outline-none disabled:opacity-50 ${statusColor[o.status] || 'bg-fog'}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{pick(...statusLabel[s])}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>}
    </section>
  )
}
