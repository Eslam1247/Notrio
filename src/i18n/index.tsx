import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { dict, Key } from './dict'
type Lang = 'ar' | 'en'
interface Ctx { lang: Lang; t(k: Key): string; toggle(): void; pick<T>(ar: T, en: T): T }
const C = createContext<Ctx>(null!); export const useLang = () => useContext(C)
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('nt_lang') as Lang) || 'ar')
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; localStorage.setItem('nt_lang', lang) }, [lang])
  const t = (k: Key) => dict[k]?.[lang] ?? String(k)
  return <C.Provider value={{ lang, t, toggle: () => setLang(l => l === 'ar' ? 'en' : 'ar'), pick: (ar, en) => (lang === 'ar' ? ar : en) }}>{children}</C.Provider>
}
