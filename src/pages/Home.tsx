import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PRODUCTS, WORLDS, World, byId, fmt } from '../data/products'
import { useCart } from '../context/CartContext'
import { useStock } from '../context/StockContext'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../i18n'
import { OpenBookArt, StoryArt } from './HomeArt'
import Notebook from '../components/Notebook'
import { useSEO } from '../hooks/useSEO'

const tri = (c: string, cp: string, cls: string) => <div aria-hidden className={`absolute ${cls}`} style={{ background: c, clipPath: cp }} />

function Hero() {
  const fan = [byId('sketch')!, byId('daily')!, byId('classic')!]; const { t } = useLang()
  useSEO(t('brand_tag'), 'Notrio — دفاتر مصمّمة بعناية، شحن لكل مصر، الدفع عند الاستلام. Notrio — thoughtfully designed notebooks, delivery across Egypt, cash on delivery.')
  return (
    <section className="relative overflow-hidden bg-blue text-white">
      {tri('#FE00AE', 'polygon(0 0,100% 100%,0 100%)', 'bottom-0 right-0 w-40 h-40 sm:w-72 sm:h-72')}
      {tri('#CDFF00', 'polygon(100% 0,100% 100%,0 100%)', 'bottom-0 right-24 sm:right-52 w-20 h-20 sm:w-32 sm:h-32')}
      {tri('#252525', 'polygon(0 0,100% 0,0 100%)', 'top-0 left-0 w-16 h-16 sm:w-24 sm:h-24')}
      <div className="relative mx-auto max-w-[1200px] px-5 pt-14 pb-24 sm:pb-32 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-[2.6rem] sm:text-6xl font-extrabold leading-[1.25]">
              <span className="inline-block bg-neon text-magenta px-4 py-1 -rotate-1">{t('hero_line1')}</span><br />{t('hero_line2')}<br />{t('hero_line3')}
            </h1>
          </motion.div>
          <p className="mt-6 text-lg text-white/85 max-w-md">{t('hero_sub')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="btn btn-neon !px-9 !py-4 text-base">{t('cta_shop')}</Link>
            <a href="#discover" className="btn border-2 border-white/60 text-white hover:bg-white hover:text-blue !py-[14px]">{t('cta_discover')}</a>
          </div>
        </div>
        <div className="relative h-[300px] sm:h-[420px]">
          {fan.map((p, i) => (
            <motion.div key={p.id} className="absolute bottom-0 w-[42%]" style={{ left: `${i * 26}%` }} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.12, duration: 0.8 }}>
              <div style={{ transform: `rotate(${(i - 1) * 8}deg)` }}><Notebook id={p.id} color={p.color} pattern={p.pattern} title={p.ar} className="text-[10px] sm:text-sm" /></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Trust() { const { t } = useLang(); const trust = [t('trust_1'), t('trust_2'), t('trust_3'), t('trust_4')]
  return <div className="bg-magenta text-white"><div className="mx-auto max-w-[1200px] px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm font-medium text-center">{trust.map(x => <div key={x}>✓ {x}</div>)}</div></div> }

const tone: Record<World, string> = { write: 'bg-neon text-ink', plan: 'bg-ink text-white', create: 'bg-magenta text-white' }
function Worlds() {
  const { t, pick } = useLang()
  return (
    <section id="discover" className="mx-auto max-w-[1200px] px-5 pt-20">
      <h2 className="text-3xl md:text-5xl font-bold">{t('discover_h')}</h2>
      <p className="text-mute mt-2">{t('discover_p')}</p>
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {(Object.keys(WORLDS) as World[]).map((k, n) => { const w = WORLDS[k]; const items = PRODUCTS.filter(p => p.world === k).slice(0, 3)
          return (
            <Link key={k} to={`/shop/${k}`} className={`group relative overflow-hidden rounded-3xl p-7 flex flex-col justify-between min-h-[380px] ${tone[k]} ${n === 1 ? 'md:mt-10' : ''}`}>
              <div><div className="text-5xl font-extrabold">{pick(w.ar, w.en)}</div><p className="mt-3 max-w-[16rem] opacity-85">{pick(w.line, w.lineEn)}</p></div>
              <div className="flex gap-3 items-end justify-center mt-8">{items.map((p, j) => <div key={p.id} className="w-[30%] transition-transform duration-300 group-hover:-translate-y-3" style={{ marginBottom: j * 14 }}><Notebook id={p.id} color={p.color} pattern={p.pattern} /></div>)}</div>
              <span className="mt-6 font-medium underline underline-offset-4">{t('browse')} {pick(w.ar, w.en)}</span>
            </Link>) })}
      </div>
    </section>
  )
}

function Best() {
  const { add } = useCart(); const { t, lang, pick } = useLang(); const { qty } = useStock(); const list = ['classic', 'daily', 'sketch', 'todo'].map(i => byId(i)!)
  return (
    <section className="mx-auto max-w-[1200px] px-5 pt-24">
      <div className="flex items-end justify-between"><h2 className="text-3xl md:text-5xl font-bold">{t('best_h')}</h2><Link to="/shop" className="btn-ghost">{t('all_notebooks')}</Link></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {list.map(p => { const left = qty(p.id, p.stock); return (
          <div key={p.id} className="card overflow-hidden flex flex-col hover:border-blue hover:shadow-xl transition">
            <Link to={`/product/${p.id}`} className="bg-fog p-6 pt-10 block relative">{left <= 0 && <span className="absolute top-3 right-3 tag !bg-ink !text-white">{t('out_stock')}</span>}<div className="w-[62%] mx-auto"><Notebook id={p.id} color={p.color} pattern={p.pattern} /></div></Link>
            <div className="p-4 flex flex-col flex-1"><Link to={`/product/${p.id}`} className="font-medium">{pick(p.ar, p.en)}</Link><p className="text-mute text-sm mt-1">{pick(p.tagline, p.taglineEn)}</p>
              <div className="text-blue font-bold mt-2">{fmt(p.price, lang)}</div><button disabled={left <= 0} onClick={() => add(p, p.color)} className="btn btn-magenta !py-2 text-sm mt-3 disabled:opacity-40">{left > 0 ? t('add_to_cart') : t('out_stock')}</button></div>
          </div>) })}
      </div>
    </section>
  )
}

function Why() {
  const { t, pick } = useLang()
  const facts: [string, string, string][] = [
    ['📖', pick('١٠٠–٢٠٠ جرام', '100–200gsm'), t('fact_paper')],
    ['✏️', t('sewn'), t('fact_bind')],
    ['📐', pick('٤ مقاسات', '4 sizes'), t('fact_size')],
  ]
  return (
    <section className="mt-24 bg-blue text-white overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-5 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="tag !bg-neon !text-ink">{pick('التفاصيل اللي بتفرق', 'The details that matter')}</span>
          <h2 className="text-3xl md:text-5xl font-bold leading-snug mt-4">{t('why_h')}</h2>
          <div className="mt-8 space-y-5">
            {facts.map(([icon, x, d]) => (
              <div key={x} className="flex gap-4 items-start border-b border-white/15 pb-5 last:border-0">
                <span className="w-11 h-11 shrink-0 rounded-full bg-white/10 grid place-items-center text-xl">{icon}</span>
                <div><div className="text-xl font-bold text-neon">{x}</div><p className="text-white/75 mt-1 text-sm leading-relaxed">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
        <OpenBookArt />
      </div>
    </section>
  )
}

function StoryTeaser() {
  const { t } = useLang()
  return (
    <section id="story" className="bg-ink text-white"><div className="mx-auto max-w-[1200px] px-5 py-20 grid md:grid-cols-[1fr_1.3fr] gap-10 items-center">
      <div aria-hidden className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue to-[#080d63] py-8 flex items-center justify-center">
        <StoryArt />
      </div>
      <div><h2 className="text-3xl md:text-5xl font-bold">{t('story_h')}</h2><p className="mt-4 text-white/80 leading-relaxed max-w-lg">{t('story_p')}</p><Link to="/story" className="inline-block mt-5 text-neon underline underline-offset-4 font-medium">{t('read_story')}</Link></div>
    </div></section>
  )
}

function Join() {
  const { user } = useAuth(); const { t } = useLang()
  return (
    <section className="bg-neon text-ink"><div className="mx-auto max-w-[1200px] px-5 py-16 flex flex-wrap items-center justify-between gap-6">
      <div><h2 className="text-3xl md:text-4xl font-bold">{user ? t('join_h_user') : t('join_h_guest')}</h2><p className="mt-2 max-w-md">{user ? t('join_p_user') : t('join_p_guest')}</p></div>
      <Link to={user ? '/shop' : '/account'} className="btn btn-blue !px-9 !py-4 text-base">{user ? t('cta_shop') : t('create_account')}</Link>
    </div></section>
  )
}

export default function Home() { return <><Hero /><Trust /><Worlds /><Best /><Why /><StoryTeaser /><Join /></> }
