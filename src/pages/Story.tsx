import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { StoryArt } from './HomeArt'
import { useSEO } from '../hooks/useSEO'
const tri = (c: string, cp: string, cls: string) => <div aria-hidden className={`absolute ${cls}`} style={{ background: c, clipPath: cp }} />
const timeline: [string, string, string, string][] = [
  ['٢٠٢١', '٢٠٢١', 'الفكرة', 'الفكرة'],
  ['٢٠٢٢', '٢٠٢٢', 'أول ورشة صغيرة', 'أول ورشة صغيرة'],
  ['٢٠٢٤', '٢٠٢٤', 'المتجر الإلكتروني', 'المتجر الإلكتروني'],
  ['٢٠٢٦', '٢٠٢٦', 'أكثر من ١٤ تصميمًا', 'أكثر من ١٤ تصميمًا'],
]
export default function Story() {
  const { t, lang, pick } = useLang()
  useSEO(t('nav_story'), pick('قصة Notrio من الفكرة الأولى للورشة اللي بنصمم فيها كل دفتر.', 'The Notrio story, from the first idea to the workshop behind every notebook.'))
  const steps: [string, string][] = [
    [pick('٢٠٢١ — الفكرة', '2021 — The idea'), pick('بدأنا كطلبة بنكتب أفكارنا في دفاتر رخيصة ورقها بيتنشف بسرعة. قلنا نصمم دفتر إحنا عايزينه.', 'We started as students writing ideas in cheap notebooks whose paper wore out fast. We decided to design the notebook we actually wanted.')],
    [pick('٢٠٢٢ — أول ورشة', '2022 — The first workshop'), pick('بدأنا بورشة صغيرة في القاهرة بعشر نسخ تجريبية، واختبرناها مع أصدقاء وفنانين قبل الإنتاج.', 'We opened a small Cairo workshop with ten trial copies, tested with friends and artists before production.')],
    [pick('٢٠٢٤ — المتجر', '2024 — The store'), pick('أطلقنا المتجر الإلكتروني عشان توصل الدفاتر لأي حد في مصر، مع الدفع عند الاستلام لراحة العميل.', 'We launched the online store so the notebooks could reach anyone in Egypt, with cash on delivery for ease.')],
    [pick('٢٠٢٦ — النهاردة', '2026 — Today'), pick('أكتر من ١٤ تصميمًا مقسّمة على ثلاث مجموعات: اكتب، خطّط، أبدع. ولسه في المشوار.', "Over 14 designs across three collections: write, plan, create. And we're just getting started.")],
  ]
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-blue to-[#0a1594] text-white">
        {tri('#FE00AE', 'polygon(0 0,100% 100%,0 100%)', 'bottom-0 right-0 w-32 h-32 sm:w-56 sm:h-56')}
        {tri('#CDFF00', 'polygon(0 0,100% 0,0 100%)', 'top-0 left-0 w-20 h-20 sm:w-28 sm:h-28')}
        <div className="relative mx-auto max-w-[900px] px-5 pt-20 pb-8 text-center">
          <span className="tag !bg-neon !text-ink">Notrio</span>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-4">{t('nav_story')}</h1>
          <p className="mt-5 text-lg text-white/85 max-w-xl mx-auto">{t('story_p')}</p>
        </div>
        <div className="relative flex justify-center pb-10"><StoryArt /></div>
      </section>

      <section className="mx-auto max-w-[800px] px-5 py-16">
        <div className="relative border-r-2 border-blue/20 pr-8 space-y-10">
          {steps.map(([h, d], i) => (
            <div key={h} className="relative">
              <span className="absolute right-[-2.55rem] top-1 w-4 h-4 rounded-full bg-magenta border-4 border-white shadow" />
              <h2 className="text-xl font-bold text-blue">{h}</h2>
              <p className="mt-2 leading-relaxed text-mute">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-fog"><div className="mx-auto max-w-[1000px] px-5 py-16 grid sm:grid-cols-3 gap-6 text-center">
        {[[pick('٪١٠٠', '100%'), pick('تصميم وتجليد محلي', 'Locally designed & bound')], [pick('١٤+', '14+'), pick('تصميم دفتر', 'notebook designs')], [pick('٣', '3'), pick('مجموعات: اكتب، خطّط، أبدع', 'collections: write, plan, create')]].map(([n, l]) => (
          <div key={l} className="bg-white rounded-2xl p-8 border-t-4 border-magenta"><div className="text-4xl font-extrabold text-blue">{n}</div><p className="mt-2 text-mute text-sm">{l}</p></div>
        ))}
      </div></section>

      <section className="mx-auto max-w-[1000px] px-5 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">{pick('جاهز تبدأ دفترك؟', 'Ready to start your notebook?')}</h2>
        <Link to="/shop" className="btn btn-magenta mt-6 !px-9 !py-4 text-base inline-block">{t('cta_shop')}</Link>
      </section>
    </>
  )
}
