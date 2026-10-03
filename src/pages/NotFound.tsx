import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { useSEO } from '../hooks/useSEO'
export default function NotFound() {
  const { pick } = useLang()
  useSEO('404', pick('الصفحة غير موجودة.', 'Page not found.'))
  return (
    <section className="max-w-lg mx-auto px-5 pt-24 pb-24 text-center">
      <div className="text-7xl font-extrabold text-blue">404</div>
      <h1 className="text-2xl font-bold mt-4">{pick('الصفحة مش موجودة', "This page doesn't exist")}</h1>
      <p className="text-mute mt-3">{pick('ممكن يكون الرابط اتغيّر أو المنتج مبقاش متاح.', 'The link may have changed, or the product is no longer available.')}</p>
      <div className="mt-8 flex gap-3 justify-center flex-wrap">
        <Link to="/" className="btn btn-blue">{pick('الرئيسية', 'Home')}</Link>
        <Link to="/shop" className="btn border-2 border-blue text-blue">{pick('تصفّح الدفاتر', 'Browse notebooks')}</Link>
      </div>
    </section>
  )
}
