import { useLang } from '../i18n'
import { useSEO } from '../hooks/useSEO'
export default function Privacy() {
  const { t, pick } = useLang()
  useSEO(pick('سياسة الخصوصية', 'Privacy policy'), pick('كيف تتعامل Notrio مع بياناتك الشخصية.', 'How Notrio handles your personal data.'))
  const items: [string, string][] = [
    [pick('البيانات اللي بنجمعها', 'What we collect'), pick('الاسم، رقم الموبايل، العنوان، والبريد الإلكتروني لو أنشأت حسابًا — فقط عشان نوصّل طلبك ونتواصل معك بخصوصه.', "Name, mobile number, address, and email if you create an account — only to deliver your order and contact you about it.")],
    [pick('إزاي بنستخدمها', 'How we use it'), pick('لمعالجة الطلبات، تتبّع الشحن، الردّ على استفساراتك، ولا نستخدمها لأي غرض تاني.', "To process orders, track shipping, and respond to your questions — nothing else.")],
    [pick('المشاركة مع طرف ثالث', 'Sharing with third parties'), pick('بنشارك بيانات التوصيل (الاسم، العنوان، الموبايل) مع شركة الشحن بس، عشان توصّل طلبك.', "We share delivery details (name, address, phone) only with our shipping partner, to deliver your order.")],
    [pick('كلمات المرور', 'Passwords'), pick('بنخزّن كلمة المرور مشفّرة (hashed) ولا يقدر حد يشوفها، حتى إحنا.', "Passwords are stored hashed — nobody, including us, can see them in plain text.")],
    [pick('حذف الحساب', 'Account deletion'), pick('تقدر تطلب حذف حسابك وبياناتك في أي وقت عن طريق صفحة «تواصل معنا».', 'You can request deletion of your account and data at any time via the Contact page.')],
    [pick('ملفات تعريف الارتباط (Cookies)', 'Cookies'), pick('بنستخدم بيانات محلية في متصفحك بس (زي محتوى السلة وتفضيل اللغة)، ومفيش تتبّع إعلاني.', 'We only use local browser storage (like your cart and language preference) — no advertising tracking.')],
  ]
  return (
    <section className="max-w-2xl mx-auto px-5 pt-12 pb-20">
      <h1 className="text-3xl font-bold">{pick('سياسة الخصوصية', 'Privacy policy')}</h1>
      <p className="text-mute mt-2">{pick('آخر تحديث: سبتمبر ٢٠٢٦', 'Last updated: September 2026')}</p>
      <div className="mt-8 space-y-4">{items.map(([h, d]) => <div key={h} className="card p-5 border-r-4 border-r-blue"><h2 className="text-lg text-blue">{h}</h2><p className="mt-2 text-sm leading-relaxed">{d}</p></div>)}</div>
      <p className="text-xs text-mute mt-6">{pick('راجعوا هذا النص مع مختص قانوني قبل النشر، فهو نموذج مبدئي.', 'Review this text with a legal professional before publishing — it is a starting template.')}</p>
    </section>
  )
}
