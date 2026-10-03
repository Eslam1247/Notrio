import { FormEvent, useState } from 'react'
import { api } from '../services/api'
import { useLang } from '../i18n'
import { useSEO } from '../hooks/useSEO'
export default function Contact() {
  const { t, pick } = useLang(); const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle'); const [err, setErr] = useState('')
  useSEO(t('nav_contact'), pick('تواصل مع فريق Notrio لأي استفسار عن طلبك أو منتجاتنا.', 'Contact the Notrio team about your order or our products.'))
  const send = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const form = e.currentTarget; setState('busy'); setErr(''); const f = Object.fromEntries(new FormData(form))
    try { await api('/contact', { method: 'POST', body: f }); form.reset(); setState('done') } catch (x: any) { setErr(x.message); setState('idle') } }
  return (
    <section className="max-w-xl mx-auto px-5 pt-12"><h1 className="text-3xl font-bold">{t("nav_contact")}</h1><p className="text-mute mt-2">{pick("اكتب لنا وسنرد عليك على رقمك خلال يوم عمل. لو كان عن طلب، اذكر رقمه.", "Send us a message and we will reply on your number within a business day. Mention your order number if relevant.")}</p>
      {state === 'done' ? <p className="mt-6 rounded-xl bg-neon p-4 font-medium">{pick("وصلتنا رسالتك، شكرًا لك!", "Message received, thank you!")}</p> :
        <form onSubmit={send} className="mt-6 grid gap-3">
          <div className="field"><input name="name" required minLength={2} placeholder={t("full_name")} className="input" /><span className="field-msg err">{pick('اكتب اسمك من فضلك.', 'Please enter your name.')}</span></div>
          <div className="field"><input name="phone" required pattern="01[0-9]{9}" type="tel" placeholder={t("phone")} className="input" dir="ltr" /><span className="field-msg err">{pick('رقم موبايل مصري غير صحيح (01xxxxxxxxx).', 'Invalid Egyptian mobile number (01xxxxxxxxx).')}</span></div>
          <div className="field"><textarea name="message" required minLength={5} rows={5} placeholder={pick("رسالتك", "Your message")} className="input" /><span className="field-msg err">{pick('اكتب رسالة أطول شوية.', 'Please write a bit more.')}</span></div>
          {err && <p role="alert" className="text-magenta text-sm">{err}</p>}<button disabled={state === 'busy'} className="btn btn-blue disabled:opacity-40">{state === 'busy' ? t('sending') : pick('إرسال', 'Send')}</button></form>}
    </section>)
}
