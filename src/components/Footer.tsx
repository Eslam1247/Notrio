import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
export default function Footer() {
  const { t } = useLang()
  return <footer className="bg-ink text-white mt-24"><div className="mx-auto max-w-[1200px] px-5 py-14 grid gap-8 md:grid-cols-4 text-sm">
    <div><div className="text-2xl font-bold">Notrio<span className="text-magenta">.</span></div><p className="mt-2 text-white/70">{t('footer_tag')}</p></div>
    <div className="space-y-2 text-white/80"><div className="text-neon font-medium">{t('footer_why')}</div><p>✓ {t('trust_1')}</p><p>✓ {t('trust_2')}</p><p>✓ {t('trust_3')}</p></div>
    <div className="space-y-2 text-white/80"><div className="text-neon font-medium">{t('footer_help')}</div><Link to="/track" className="block hover:text-neon">{t('track_order')}</Link><Link to="/returns" className="block hover:text-neon">{t('returns_policy')}</Link><Link to="/contact" className="block hover:text-neon">{t('nav_contact')}</Link><Link to="/story" className="block hover:text-neon">{t('nav_story')}</Link><Link to="/privacy" className="block hover:text-neon">{t('privacy')}</Link></div>
    <p className="text-white/50 md:text-left">© 2026 Notrio. {t('rights')}</p>
  </div></footer>
}
