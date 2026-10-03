import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { byId, PRODUCTS, WORLDS, fmt } from '../data/products'
import { useCart, FREE_SHIP } from '../context/CartContext'
import { useStock } from '../context/StockContext'
import { useLang } from '../i18n'
import Notebook from '../components/Notebook'
import { useSEO } from '../hooks/useSEO'

const SWATCHES = ['#252525', '#0E1CC3', '#FE00AE', '#1f6f5c', '#e0662f']

export default function Product() {
  const { id } = useParams(); const p = byId(id) ?? PRODUCTS[0]; const nav = useNavigate()
  const { add, setOpen } = useCart(); const { t, lang, pick } = useLang(); const { qty: stockQty } = useStock(); const left = stockQty(p.id, p.stock); const [hasImg, setHasImg] = useState(false); useEffect(() => { const i = new Image(); i.onload = () => setHasImg(true); i.onerror = () => setHasImg(false); i.src = `/products/${p.id}.jpg` }, [p.id]); const [color, setColor] = useState(p.color); const [qty, setQty] = useState(1)
  useSEO(pick(p.ar, p.en), pick(p.desc, p.descEn))
  useEffect(() => { setColor(p.color); setQty(1) }, [p.id])
  const addQty = () => { for (let i = 0; i < qty; i++) add(p, color) }
  const buyNow = () => { addQty(); setOpen(false); nav('/checkout') }
  const specs: [string, string][] = [[pick('المقاس', 'Size'), p.size], [pick('عدد الصفحات', 'Pages'), p.pages.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')], [pick('الورق', 'Paper'), p.paper], [pick('التجليد', 'Binding'), t('sewn')]]
  const related = PRODUCTS.filter(x => x.world === p.world && x.id !== p.id)
  return (
    <>
      <nav className="mx-auto max-w-[1200px] px-5 pt-6 text-sm text-mute"><Link to="/shop" className="hover:text-blue">{t('nav_shop')}</Link> ‹ <Link to={`/shop/${p.world}`} className="hover:text-blue">{pick(WORLDS[p.world].ar, WORLDS[p.world].en)}</Link> ‹ <span className="text-ink">{pick(p.ar, p.en)}</span></nav>

      <section className="mx-auto max-w-[1200px] px-5 py-8 grid md:grid-cols-2 gap-10 items-start">
        <div className="relative overflow-hidden rounded-3xl bg-fog py-16 md:sticky md:top-32">
          <div aria-hidden className="absolute bottom-0 right-0 w-32 h-32 bg-magenta" style={{ clipPath: 'polygon(0 0,100% 100%,0 100%)' }} />
          <div aria-hidden className="absolute top-0 left-0 w-20 h-20 bg-neon" style={{ clipPath: 'polygon(0 0,100% 0,0 100%)' }} />
          <div className="relative w-[58%] max-w-[320px] mx-auto"><Notebook id={p.id} color={color} pattern={p.pattern} title={p.ar} className="text-[13px] sm:text-base" /></div>
        </div>

        <div>
          <p className="text-mute text-sm">{pick(p.en, p.ar)}</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-1">{pick(p.ar, p.en)}</h1>
          <p className="text-xl text-mute mt-3">{pick(p.tagline, p.taglineEn)}</p>
          <div className="flex items-center gap-4 mt-5"><span className="text-3xl font-bold text-blue">{fmt(p.price, lang)}</span>
            <span className={`tag ${left > 0 ? (left <= 5 ? '!bg-magenta !text-white' : '') : '!bg-ink !text-white'}`}>{left > 0 ? (left <= 5 ? pick(`متبقّي ${left} فقط`, `Only ${left} left`) : t('in_stock')) : t('out_stock')}</span></div>
          <p className="mt-5 leading-relaxed max-w-md">{pick(p.desc, p.descEn)}</p>

          {!hasImg && <div className="mt-8"><div className="font-medium text-sm mb-3">{t('color')}</div>
            <div className="flex gap-3">{[p.color, ...SWATCHES.filter(c => c !== p.color)].map(c => <button key={c} aria-label={`لون ${c}`} aria-pressed={c === color} onClick={() => setColor(c)} className="w-10 h-10 rounded-full transition-transform hover:scale-110" style={{ background: c, outline: c === color ? '3px solid #FE00AE' : '1px solid rgba(0,0,0,.15)', outlineOffset: 3 }} />)}</div></div>}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-ink/15"><button aria-label="نقص" onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-11 text-xl text-blue">−</button><span className="w-8 text-center">{qty.toLocaleString('ar-EG')}</span><button aria-label="زيادة" onClick={() => setQty(q => Math.min(20, left, q + 1))} className="w-11 h-11 text-xl text-blue">+</button></div>
            <button disabled={left <= 0} onClick={addQty} className="btn btn-blue flex-1 min-w-[160px] disabled:opacity-40">{t('add_to_cart')}</button>
          </div>
          <button disabled={left <= 0} onClick={buyNow} className="btn btn-magenta w-full mt-3 !py-4 text-base disabled:opacity-40">{t('buy_now')} — {fmt(p.price * qty, lang)}</button>

          <ul className="mt-6 space-y-2 text-sm rounded-2xl bg-fog p-4"><li>✓ {t('trust_1')}</li><li>✓ {pick(`شحن مجاني للطلبات فوق ${fmt(FREE_SHIP, lang)}`, `Free shipping over ${fmt(FREE_SHIP, lang)}`)}</li><li>✓ {t('trust_3')}</li></ul>

          <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10 text-sm">{specs.map(([k, v]) => <div key={k} className="flex justify-between py-3"><dt className="text-mute">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
        </div>
      </section>

      <section className="bg-ink text-white mt-12"><div className="mx-auto max-w-[1200px] px-5 py-16 grid md:grid-cols-3 gap-6">
        {[[`${p.pages.toLocaleString('ar-EG')} صفحة`, 'مساحة تكفي شهورًا من الكتابة قبل أن تحتاج دفترًا جديدًا.'], [`ورق ${p.paper.replace('جم', 'جرام')}`, 'يحتمل الحبر والقلم دون أن ينفذ إلى الصفحة التالية.'], ['خياطة مسطّحة', 'يفتح بالكامل ويبقى مفتوحًا أثناء الكتابة.']].map(([t, d]) => <div key={t} className="rounded-2xl border border-white/15 p-6"><div className="text-2xl font-bold text-neon">{t}</div><p className="mt-3 text-white/75 text-sm leading-relaxed">{d}</p></div>)}
      </div></section>

      {related.length > 0 && <section className="mx-auto max-w-[1200px] px-5 pt-16 pb-28 md:pb-10"><h2 className="text-3xl font-bold mb-8">{pick('من نفس المجموعة', 'From the same collection')}</h2>
        <Swiper dir={lang === 'ar' ? 'rtl' : 'ltr'} spaceBetween={16} slidesPerView={2.2} breakpoints={{ 768: { slidesPerView: 4 } }}>
          {related.map(x => <SwiperSlide key={x.id}><Link to={`/product/${x.id}`} className="card block overflow-hidden hover:border-blue transition"><div className="bg-fog p-6 pt-10"><div className="w-[60%] mx-auto"><Notebook id={x.id} color={x.color} pattern={x.pattern} /></div></div><div className="p-4"><div className="font-medium">{pick(x.ar, x.en)}</div><div className="text-blue text-sm mt-1">{fmt(x.price, lang)}</div></div></Link></SwiperSlide>)}
        </Swiper></section>}

      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-ink/10 px-4 py-3 flex items-center gap-3" style={{ paddingBottom: 'calc(.75rem + env(safe-area-inset-bottom,0px))' }}>
        <div className="flex-1"><div className="text-xs text-mute">{pick(p.ar, p.en)}</div><div className="font-bold text-blue">{fmt(p.price, lang)}</div></div>
        <button disabled={left <= 0} onClick={addQty} className="btn btn-magenta !py-3 disabled:opacity-40">{t('add_to_cart')}</button>
      </div>
    </>
  )
}
