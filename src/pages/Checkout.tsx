import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLang } from '../i18n'
import { useAuth } from '../context/AuthContext'
import { fmt } from '../data/products'
import { methods, placeOrder, Method, INSTAPAY_NUMBER, VODAFONE_CASH_NUMBER } from '../services/payment'
import Notebook from '../components/Notebook'
import { useSEO } from '../hooks/useSEO'

function Copyable({ label, number }: { label: string; number: string }) {
  const [copied, setCopied] = useState(false)
  if (!number) return null
  return (
    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-ink/10">
      <div><div className="text-xs text-mute">{label}</div><div className="font-bold" dir="ltr">{number}</div></div>
      <button type="button" onClick={() => { navigator.clipboard?.writeText(number); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="text-xs font-medium text-blue border border-blue/30 rounded-full px-3 py-1 hover:bg-blue hover:text-white transition">{copied ? '✓' : '⧉'}</button>
    </div>
  )
}

export default function Checkout() {
  const { items, subtotal, shipping, total, clear } = useCart(); const { user, refresh } = useAuth(); const { t, lang, pick } = useLang(); useSEO(t('checkout_h'), t('checkout_h'))
  const [orderId, setOrderId] = useState(''); const [busy, setBusy] = useState(false); const [m, setM] = useState<Method['id']>('cod'); const [err, setErr] = useState('')
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true); setErr(''); const f = new FormData(e.currentTarget)
    try {
      const r = await placeOrder(m, { customer: { name: `${f.get('name')}`, phone: `${f.get('phone')}`, address: `${f.get('address')}`, city: `${f.get('city')}` }, items: items.map(i => ({ id: i.product.id, qty: i.qty, color: i.color })), transferRef: `${f.get('transferRef') || ''}` })
      clear(); refresh(); setOrderId(r.orderId)
    } catch (x: any) { setErr(x.message) } setBusy(false)
  }
  if (orderId) return <section className="max-w-xl mx-auto px-5 pt-24 text-center"><div className="text-5xl">🎉</div><h1 className="text-4xl mt-4">{pick("تم استلام طلبك!", "Your order was received!")}</h1>
    <p className="text-mute mt-4">{pick("رقم الطلب", "Order number")} <b className="text-blue">{orderId}</b>. {m === 'transfer' ? pick('هنراجع عملية التحويل ونأكد طلبك خلال ساعات.', "We'll review the transfer and confirm your order within hours.") : pick("احتفظ به لتتبّع طلبك، وسنتصل بك لتأكيد التوصيل.", "Keep it to track your order, and we will call to confirm delivery.")}</p>
    <div className="mt-8 flex gap-3 justify-center"><Link to={`/track?id=${orderId}`} className="btn btn-blue">{t("track_order")}</Link><Link to="/shop" className="btn border-2 border-blue text-blue">{t("browse_notebooks")}</Link></div></section>
  if (!items.length) return <section className="max-w-xl mx-auto px-5 pt-24 text-center"><h1 className="text-3xl">{t("empty_cart_page")}</h1><Link to="/shop" className="btn btn-blue mt-6">{t("browse_notebooks")}</Link></section>
  const fields: [string, string, string, string?][] = [['name', t('full_name'), 'name', user?.name], ['phone', pick('رقم الموبايل (01xxxxxxxxx)', 'Mobile number (01xxxxxxxxx)'), 'tel', user?.phone], ['city', pick('المدينة', 'City'), 'address-level2', user?.city], ['address', pick('العنوان بالتفصيل', 'Full address'), 'street-address', user?.address]]
  return (
    <section className="max-w-4xl mx-auto px-5 pt-12 pb-20 grid md:grid-cols-5 gap-8">
      <form onSubmit={submit} className="md:col-span-3 flex flex-col gap-3">
        <h1 className="text-3xl">{t("checkout_h")}</h1>
        {!user && <p className="text-sm bg-fog rounded-xl p-3">{pick("عندك حساب؟", "Have an account?")} <Link to="/account" className="text-blue font-medium">{t("signin")}</Link> {pick("لتتابع طلباتك، أو أكمل كزائر.", "to track your orders, or continue as a guest.")}</p>}
        {fields.map(([n, l, ac, v]) => (
          <div key={n} className="field">
            <input name={n} required minLength={n === 'address' ? 8 : 2} pattern={n === 'phone' ? '01[0-9]{9}' : undefined} placeholder={l} autoComplete={ac} defaultValue={v} dir={n === 'phone' ? 'ltr' : undefined} type={n === 'phone' ? 'tel' : 'text'} className="input" />
            <span className="field-msg err">{pick(n === 'phone' ? 'رقم موبايل مصري غير صحيح (01xxxxxxxxx).' : n === 'address' ? 'اكتب العنوان بتفصيل أكتر.' : 'هذا الحقل مطلوب.', n === 'phone' ? 'Invalid Egyptian mobile number (01xxxxxxxxx).' : n === 'address' ? 'Please add more address detail.' : 'This field is required.')}</span>
          </div>
        ))}
        <div className="mt-2 grid gap-2">{methods.map(x => (
          <label key={x.id} className={`rounded-xl border-2 p-4 cursor-pointer transition ${m === x.id ? 'border-blue bg-fog' : 'border-ink/15'}`}>
            <input type="radio" name="method" checked={m === x.id} onChange={() => setM(x.id)} className="ml-2 accent-[#0E1CC3]" />
            <span className="font-medium">{pick(x.label, x.labelEn)}</span>
            <div className="text-mute text-sm mt-1 mr-6">{pick(x.hint, x.hintEn)}</div>
          </label>
        ))}</div>

        {m === 'transfer' && (
          <div className="rounded-xl bg-fog p-4 space-y-3">
            <p className="text-sm font-medium">{pick(`حوّل مبلغ ${fmt(total, lang)} على أي رقم من دول:`, `Transfer ${fmt(total, lang)} to either number:`)}</p>
            <Copyable label="InstaPay" number={INSTAPAY_NUMBER} />
            <Copyable label={pick('فودافون كاش', 'Vodafone Cash')} number={VODAFONE_CASH_NUMBER} />
            <div className="field">
              <input name="transferRef" required={m === 'transfer'} minLength={3} placeholder={pick('رقم عملية التحويل أو آخر ٤ أرقام', 'Transfer reference or last 4 digits')} className="input" dir="ltr" />
              <span className="field-msg err">{pick('اكتب رقم العملية عشان نأكد التحويل.', 'Please add the reference so we can confirm the transfer.')}</span>
            </div>
            <p className="text-xs text-mute">{pick('هنراجع التحويل يدويًا ونأكد طلبك — ممكن ياخد لحد ساعتين في أوقات الذروة.', 'We review transfers manually — this can take up to a couple of hours at busy times.')}</p>
          </div>
        )}

        {err && <p role="alert" className="text-magenta text-sm">{err}</p>}
        <button disabled={busy} className="btn btn-magenta mt-3 disabled:opacity-40">{busy ? t('sending') : `${t('confirm_order')} — ${fmt(total, lang)}`}</button>
      </form>
      <aside className="md:col-span-2 card p-5 h-fit text-sm">
        <h2 className="text-lg mb-3">{t("order_summary")}</h2>
        {items.map(i => <div key={i.key} className="flex items-center gap-3 py-2"><Notebook id={i.product.id} color={i.color} pattern={i.product.pattern} className="w-9" /><span className="flex-1">{pick(i.product.ar, i.product.en)} × {i.qty.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</span><span>{fmt(i.product.price * i.qty, lang)}</span></div>)}
        <div className="border-t border-ink/10 mt-3 pt-3 space-y-1"><div className="flex justify-between text-mute"><span>{t("subtotal")}</span><span>{fmt(subtotal, lang)}</span></div><div className="flex justify-between text-mute"><span>{t("shipping")}</span><span>{shipping ? fmt(shipping, lang) : t("free")}</span></div><div className="flex justify-between text-base font-medium"><span>{t("total")}</span><span>{fmt(total, lang)}</span></div></div>
      </aside>
    </section>
  )
}
