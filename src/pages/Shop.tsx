import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PRODUCTS, WORLDS, World, fmt } from '../data/products'
import { useCart } from '../context/CartContext'
import { useStock } from '../context/StockContext'
import { useLang } from '../i18n'
import Notebook from '../components/Notebook'
import { useSEO } from '../hooks/useSEO'
export default function Shop() {
  const { world } = useParams<{ world?: World }>(); const { add } = useCart(); const { t, lang, pick } = useLang(); const { qty } = useStock()
  useSEO(world ? pick(WORLDS[world].ar, WORLDS[world].en) : t('all_notebooks'), pick('تصفّح كل دفاتر Notrio وابدأ من استخدامك.', 'Browse all Notrio notebooks and start with your purpose.'))
  const [q, setQ] = useState(''); const [sort, setSort] = useState('def')
  let list = (world ? PRODUCTS.filter(p => p.world === world) : PRODUCTS).filter(p => (p.ar + p.en).toLowerCase().includes(q.trim().toLowerCase()))
  if (sort === 'lo') list = [...list].sort((a, b) => a.price - b.price); if (sort === 'hi') list = [...list].sort((a, b) => b.price - a.price)
  const tabs: [string, string | undefined][] = [[t('all_notebooks'), undefined], ...(Object.keys(WORLDS) as World[]).map(k => [pick(WORLDS[k].ar, WORLDS[k].en), k] as [string, string])]
  return (
    <>
      <div className="bg-blue text-white"><div className="mx-auto max-w-[1200px] px-5 py-10"><h1 className="text-4xl md:text-5xl font-extrabold">{world ? pick(WORLDS[world].ar, WORLDS[world].en) : t('all_notebooks')}</h1>{world && <p className="mt-2 text-white/80">{pick(WORLDS[world].line, WORLDS[world].lineEn)}</p>}</div></div>
      <section className="mx-auto max-w-[1200px] px-5 pt-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto">{tabs.map(([txt, k]) => <Link key={txt} to={k ? `/shop/${k}` : '/shop'} className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium border transition ${world === k ? 'bg-blue text-white border-blue' : 'border-ink/15 hover:border-blue'}`}>{txt}</Link>)}</div>
          <div className="flex gap-2 w-full md:w-auto"><input value={q} onChange={e => setQ(e.target.value)} placeholder={t('search_ph')} aria-label="search" className="input !py-2 text-sm md:w-56" />
            <select value={sort} onChange={e => setSort(e.target.value)} aria-label="sort" className="input !py-2 text-sm !w-auto"><option value="def">{t('sort_default')}</option><option value="lo">{t('sort_lo')}</option><option value="hi">{t('sort_hi')}</option></select></div>
        </div>
        {!list.length && <p className="text-mute text-center py-20">{pick(`لا توجد نتائج لـ «${q}». جرّب كلمة أخرى.`, `No results for "${q}". Try another word.`)}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {list.map(p => { const left = qty(p.id, p.stock); return (
            <div key={p.id} className="group card overflow-hidden flex flex-col hover:shadow-xl hover:border-blue transition">
              <Link to={`/product/${p.id}`} className="bg-fog p-6 pt-10 text-center block relative">
                {left <= 0 && <span className="absolute top-3 right-3 tag !bg-ink !text-white">{t('out_stock')}</span>}
                {left > 0 && left <= 5 && <span className="absolute top-3 right-3 tag !bg-magenta !text-white">{pick(`متبقّي ${left}`, `${left} left`)}</span>}
                <div className="w-[62%] mx-auto transition-transform duration-500 group-hover:scale-105"><Notebook id={p.id} color={p.color} pattern={p.pattern} /></div></Link>
              <div className="p-4 flex-1 flex flex-col"><Link to={`/product/${p.id}`} className="font-medium">{pick(p.ar, p.en)}</Link><div className="text-blue font-medium mt-1">{fmt(p.price, lang)}</div>
                <button disabled={left <= 0} onClick={() => add(p, p.color)} className="btn btn-blue !py-2 text-sm mt-3 disabled:opacity-40 disabled:cursor-not-allowed">{left > 0 ? t('add_to_cart') : t('out_stock')}</button></div>
            </div>) })}
        </div>
      </section>
    </>
  )
}
