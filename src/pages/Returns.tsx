const items: [string, string][] = [
  ['الاستبدال', 'يمكنك استبدال الدفتر خلال ١٤ يومًا من الاستلام بشرط أن يكون غير مستخدم وبحالته الأصلية.'],
  ['العيوب الصناعية', 'لو وصلك دفتر به عيب في الطباعة أو التجليد، نستبدله على حسابنا بعد صورة توضّح العيب.'],
  ['الاسترجاع النقدي', 'الاسترجاع متاح للطلبات التي دُفعت بالبطاقة إلى نفس وسيلة الدفع خلال ٧ إلى ١٤ يوم عمل، وللدفع عند الاستلام عبر تحويل يُتفق عليه.'],
  ['الشحن', 'شحن مجاني للطلبات فوق ٥٠٠ ج.م، وأقل من ذلك ٤٠ ج.م. التوصيل عادة خلال ٢ إلى ٥ أيام عمل.'],
  ['كيف تطلب استبدالًا؟', 'تواصل معنا من صفحة «تواصل معنا» برقم الطلب، وسنرد عليك خلال يوم عمل.'],
]
import { useLang } from '../i18n'
import { useSEO } from '../hooks/useSEO'
export default function Returns() {
  const { t } = useLang()
  useSEO(t('returns_policy'), t('returns_policy'))
  return <section className="max-w-2xl mx-auto px-5 pt-12"><h1 className="text-3xl font-bold">{t("returns_policy")}</h1>
    <div className="mt-8 space-y-4">{items.map(([t, d]) => <div key={t} className="card p-5 border-r-4 border-r-magenta"><h2 className="text-lg text-blue">{t}</h2><p className="mt-2 text-sm leading-relaxed">{d}</p></div>)}</div>
    <p className="text-xs text-mute mt-6">راجع هذه المدد والشروط وعدّلها لتناسب سياسة متجركم قبل النشر.</p></section>
}
