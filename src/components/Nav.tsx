import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../i18n'
import Avatar from './Avatar'
export default function Nav() {
  const [small, setSmall] = useState(false); const { count, setOpen } = useCart(); const { user } = useAuth(); const { t, lang, toggle } = useLang()
  const links: [string, string][] = [[t('nav_home'), '/'], [t('nav_shop'), '/shop'], [t('nav_story'), '/story'], [t('nav_contact'), '/contact']]
  useEffect(() => { const f = () => setSmall(scrollY > 40); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f) }, [])
  return (
    <header className="sticky top-0 z-40 bg-blue text-white shadow-md" style={{ paddingTop: 'env(safe-area-inset-top,0px)' }}>
      <div className="bg-neon text-ink text-center text-xs py-1.5 font-medium">{t('free_ship_bar')}</div>
      <div className={`mx-auto max-w-[1200px] px-5 flex items-center justify-between transition-all duration-300 ${small ? 'h-12' : 'h-16'}`}>
        <Link to="/" className="font-bold text-2xl">Notrio<span className="text-magenta">.</span></Link>
        <nav className="hidden md:flex gap-7 text-[14px]">
          {links.map(([txt, to]) => <NavLink key={txt} to={to} end className={({ isActive }) => isActive ? 'text-neon' : 'hover:text-neon'}>{txt}</NavLink>)}
        </nav>
        <div className="flex gap-3 items-center text-[14px]">
          <button onClick={toggle} aria-label="switch language" className="rounded-full border border-white/40 w-9 h-9 text-xs font-bold hover:bg-white hover:text-blue transition">{lang === 'ar' ? 'EN' : 'ع'}</button>
          {user ? (
            <Link to="/account" className="flex items-center gap-2 rounded-full border border-white/40 pl-4 pr-1.5 py-1.5 hover:bg-white/10 transition">
              <span className="hidden sm:inline">{user.name.split(' ')[0]}</span><Avatar name={user.name} color={user.avatarColor} size={26} />
            </Link>
          ) : (
            <Link to="/account" className="rounded-full border border-white/40 px-4 py-1.5 hover:bg-white hover:text-blue transition hidden sm:inline-block">{t('nav_account')}</Link>
          )}
          {!user && <Link to="/account" className="rounded-full border border-white/40 w-9 h-9 grid place-items-center sm:hidden" aria-label={t('nav_account')}>👤</Link>}
          <button onClick={() => setOpen(true)} className="rounded-full bg-magenta px-4 py-1.5 font-medium hover:bg-[#d9009a]">{t('nav_cart')}{count > 0 && ` (${count.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')})`}</button>
        </div>
      </div>
      <nav className="md:hidden flex gap-6 overflow-x-auto px-5 pb-2.5 text-sm whitespace-nowrap">
        {links.map(([txt, to]) => <Link key={txt} to={to} className="hover:text-neon">{txt}</Link>)}
      </nav>
    </header>
  )
}
