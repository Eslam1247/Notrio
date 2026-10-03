import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../i18n'
import { fmt } from '../data/products'
import GoogleButton from '../components/GoogleButton'
import Avatar from '../components/Avatar'
import { useSEO } from '../hooks/useSEO'

const AVATAR_COLORS = ['#0E1CC3', '#FE00AE', '#1f6f5c', '#e0662f', '#7a4b8f', '#252525']

function Settings() {
  const { user, updateProfile } = useAuth(); const { t, pick } = useLang()
  const [color, setColor] = useState(user!.avatarColor || AVATAR_COLORS[0])
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null); const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true); setMsg(null); const f = new FormData(e.currentTarget)
    const error = await updateProfile({ name: `${f.get('name')}`, phone: `${f.get('phone')}`, address: `${f.get('address')}`, city: `${f.get('city')}`, avatarColor: color })
    setMsg(error ? { ok: false, text: error } : { ok: true, text: t('saved_ok') }); setBusy(false)
  }
  return (
    <form onSubmit={submit} className="card p-6 mt-6 flex flex-col gap-3">
      <div>
        <div className="text-sm font-medium mb-2">{t('avatar_color')}</div>
        <div className="flex gap-2">{AVATAR_COLORS.map(c => <button key={c} type="button" aria-label={c} onClick={() => setColor(c)} className="w-9 h-9 rounded-full transition-transform hover:scale-110" style={{ background: c, outline: c === color ? '3px solid #CDFF00' : '1px solid rgba(0,0,0,.15)', outlineOffset: 2 }} />)}</div>
      </div>
      <div className="field"><input name="name" required minLength={2} defaultValue={user!.name} placeholder={t('full_name')} autoComplete="name" className="input" />
        <span className="field-msg err">{pick('اكتب اسمك بالكامل.', 'Please enter your full name.')}</span></div>
      <div className="field"><input name="phone" required pattern="01[0-9]{9}" defaultValue={user!.phone} type="tel" placeholder={t('phone')} autoComplete="tel" className="input" dir="ltr" />
        <span className="field-msg err">{pick('رقم موبايل مصري غير صحيح (01xxxxxxxxx).', 'Invalid Egyptian mobile number (01xxxxxxxxx).')}</span></div>
      <div className="field"><input name="city" defaultValue={user!.city} placeholder={pick('المدينة', 'City')} autoComplete="address-level2" className="input" /></div>
      <div className="field"><input name="address" defaultValue={user!.address} placeholder={pick('العنوان بالتفصيل', 'Full address')} autoComplete="street-address" className="input" /></div>
      {msg && <p role="alert" className={`text-sm rounded-lg px-3 py-2 ${msg.ok ? 'text-[#1f8f5c] bg-[#1f8f5c]/10' : 'text-magenta bg-[#fff3fa] border border-magenta/30'}`}>{msg.text}</p>}
      <button disabled={busy} className="btn btn-blue mt-2 disabled:opacity-40 self-start">{busy ? t('sending') : t('save_changes')}</button>
    </form>
  )
}

export default function Account() {
  const { user, orders, login, register, logout, refresh } = useAuth(); const { t, lang, pick } = useLang(); useSEO(t('nav_account'), t('nav_account'))
  const [mode, setMode] = useState<'login' | 'register'>('login'); const [err, setErr] = useState<string | null>(null)
  const [tab, setTab] = useState<'orders' | 'settings'>('orders')
  const submit = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); const g = (k: string) => `${f.get(k) ?? ''}`
    setErr(mode === 'login' ? await login(g('email'), g('pw')) : await register({ name: g('name'), email: g('email'), phone: g('phone') }, g('pw'))) }

  if (user) return (
    <section className="max-w-2xl mx-auto px-5 pt-10 pb-20">
      <div className="rounded-3xl bg-gradient-to-br from-blue to-[#0a1594] text-white p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} color={user.avatarColor} />
          <div><div className="text-xs text-white/70">{t('welcome_to')} Notrio</div><h1 className="text-2xl font-bold">{user.name}</h1><div className="text-white/70 text-sm">{user.email}</div></div>
        </div>
        <button onClick={logout} className="text-sm text-white/80 hover:text-white border border-white/30 rounded-full px-4 py-1.5">{t('logout')}</button>
      </div>

      <div className="grid grid-cols-2 bg-fog rounded-full p-1 text-sm font-medium mt-6 max-w-xs">
        <button onClick={() => setTab('orders')} className={`rounded-full py-2 transition ${tab === 'orders' ? 'bg-blue text-white' : 'text-ink'}`}>{t('my_orders')}</button>
        <button onClick={() => setTab('settings')} className={`rounded-full py-2 transition ${tab === 'settings' ? 'bg-blue text-white' : 'text-ink'}`}>{t('settings')}</button>
      </div>

      {tab === 'settings' ? <Settings /> : (
        !orders.length ? <p className="text-mute mt-6">{t('no_orders')} <Link to="/shop" className="text-blue">{t('start_shopping')}</Link></p> :
          <div className="mt-6 space-y-3">{orders.map(o => <div key={o.id} className="card p-4 text-sm"><div className="flex justify-between font-medium"><Link to={`/track?id=${o.id}`} className="text-blue">{o.id}</Link><span>{fmt(o.total, lang)}</span></div><div className="text-mute mt-1">{new Date(o.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')} · {o.items.map(i => `${i.ar} ×${i.qty}`).join('، ')}</div></div>)}</div>
      )}
    </section>)

  return (
    <section className="max-w-md mx-auto px-5 pt-12 pb-20">
      <div className="card p-7 border-t-4 border-t-blue shadow-sm">
        <div className="grid grid-cols-2 bg-fog rounded-full p-1 text-sm font-medium">{(['login', 'register'] as const).map(m => <button key={m} type="button" onClick={() => { setMode(m); setErr(null) }} className={`rounded-full py-2 transition ${mode === m ? 'bg-blue text-white' : 'text-ink'}`}>{m === 'login' ? t('signin') : t('new_account')}</button>)}</div>
        <GoogleButton onDone={refresh} />
        <form onSubmit={submit} className="mt-2 flex flex-col gap-3">
          {mode === 'register' && <>
            <div className="field"><input name="name" required minLength={2} placeholder={t('full_name')} autoComplete="name" className="input" />
              <span className="field-msg err">{pick('اكتب اسمك بالكامل.', 'Please enter your full name.')}</span></div>
            <div className="field"><input name="phone" required pattern="01[0-9]{9}" title={pick('رقم موبايل مصري صحيح مثل 0101234567', 'A valid Egyptian mobile like 0101234567')} type="tel" placeholder={t('phone')} autoComplete="tel" className="input" dir="ltr" />
              <span className="field-msg err">{pick('رقم موبايل مصري غير صحيح (01xxxxxxxxx).', 'Invalid Egyptian mobile number (01xxxxxxxxx).')}</span>
              <span className="field-msg ok">{pick('تمام 👍', 'Looks good 👍')}</span></div>
          </>}
          <div className="field"><input name="email" required type="email" placeholder={t('email')} autoComplete="email" className="input" dir="ltr" />
            <span className="field-msg err">{pick('البريد الإلكتروني غير صحيح.', 'Please enter a valid email.')}</span>
            <span className="field-msg ok">{pick('تمام 👍', 'Looks good 👍')}</span></div>
          <div className="field"><input name="pw" required minLength={6} type="password" placeholder={t('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="input" dir="ltr" />
            <span className="field-msg err">{pick('٦ أحرف على الأقل من فضلك.', 'At least 6 characters, please.')}</span>
            <span className="field-msg ok">{pick('كلمة مرور قوية 👍', 'Good password 👍')}</span></div>
          {err && <p role="alert" className="text-sm text-magenta bg-[#fff3fa] border border-magenta/30 rounded-lg px-3 py-2">{err}</p>}
          <button className="btn btn-blue mt-2">{mode === 'login' ? t('login_btn') : t('register_btn')}</button>
        </form>
        <p className="text-xs text-mute text-center mt-4">{t('guest_note')}</p>
      </div>
    </section>)
}
