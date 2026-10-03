import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCart, FREE_SHIP } from '../context/CartContext'
import { useLang } from '../i18n'
import { fmt } from '../data/products'
import Notebook from './Notebook'
export default function CartDrawer() {
  const { items, setQty, remove, subtotal, shipping, total, open, setOpen } = useCart(); const nav = useNavigate(); const { t, lang, pick } = useLang()
  const left = FREE_SHIP - subtotal
  return (
    <AnimatePresence>{open && (
      <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
        <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 32, stiffness: 300 }} className="absolute inset-y-0 left-0 w-full max-w-sm bg-paper p-5 flex flex-col">
          <div className="flex justify-between items-center"><h3 className="text-2xl">{t('nav_cart')}</h3><button onClick={() => setOpen(false)} className="text-blue font-normal text-sm">{pick('إغلاق', 'Close')}</button></div>
          {items.length > 0 && <div className="mt-4 rounded-xl bg-fog p-3 text-sm">
            {left > 0 ? <>{pick('أضف', 'Add')} <b className="text-blue">{fmt(left, lang)}</b> {pick('للحصول على شحن مجاني', 'to get free shipping')}</> : <span className="text-blue font-medium">🎉 {pick('شحنك مجاني!', 'Your shipping is free!')}</span>}
            <div className="h-1.5 rounded-full bg-white mt-2 overflow-hidden"><div className="h-full bg-magenta transition-all" style={{ width: `${Math.min(100, subtotal / FREE_SHIP * 100)}%` }} /></div></div>}
          <div className="flex-1 overflow-y-auto mt-4">
            {!items.length && <p className="text-mute mt-8 text-center">{t('empty_cart')}<br /><button onClick={() => { setOpen(false); nav('/shop') }} className="btn btn-blue mt-4">{t('browse_notebooks')}</button></p>}
            {items.map(i => <div key={i.key} className="flex gap-3 py-4 border-b border-ink/10 items-center"><Notebook id={i.product.id} color={i.color} pattern={i.product.pattern} className="w-12" />
              <div className="flex-1 text-sm"><div className="font-medium">{pick(i.product.ar, i.product.en)}</div><div className="text-mute">{fmt(i.product.price, lang)}</div>
                <div className="flex items-center gap-1 mt-2"><button aria-label="نقص" onClick={() => setQty(i.key, i.qty - 1)} className="w-8 h-8 rounded-full bg-fog text-blue font-medium">−</button><span className="w-8 text-center">{i.qty.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span><button aria-label="زيادة" onClick={() => setQty(i.key, i.qty + 1)} className="w-8 h-8 rounded-full bg-fog text-blue font-medium">+</button></div></div>
              <button onClick={() => remove(i.key)} className="text-xs text-mute hover:text-magenta">{pick('حذف', 'Remove')}</button></div>)}
          </div>
          {items.length > 0 && <div className="pt-3 text-sm space-y-1"><div className="flex justify-between text-mute"><span>{t('subtotal')}</span><span>{fmt(subtotal, lang)}</span></div><div className="flex justify-between text-mute"><span>{t('shipping')}</span><span>{shipping ? fmt(shipping, lang) : t('free')}</span></div><div className="flex justify-between text-lg font-medium pt-1"><span>{t('total')}</span><span>{fmt(total, lang)}</span></div></div>}
          <button disabled={!items.length} onClick={() => { setOpen(false); nav('/checkout') }} className="btn btn-magenta mt-4 disabled:opacity-40">{t('checkout_h')}</button>
        </motion.aside>
      </motion.div>)}
    </AnimatePresence>
  )
}
