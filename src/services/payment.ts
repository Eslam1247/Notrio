import { api } from './api'
export interface OrderInput { customer: { name: string; phone: string; address: string; city: string }; items: { id: string; qty: number; color: string }[]; transferRef?: string }
export interface Method { id: 'cod' | 'transfer'; label: string; labelEn: string; hint: string; hintEn: string }
export const methods: Method[] = [
  { id: 'cod', label: 'الدفع عند الاستلام', labelEn: 'Cash on delivery', hint: 'تدفع نقدًا للمندوب عند وصول الطلب.', hintEn: 'Pay the courier in cash when your order arrives.' },
  { id: 'transfer', label: 'تحويل InstaPay / فودافون كاش', labelEn: 'InstaPay / Vodafone Cash transfer', hint: 'حوّل المبلغ وأرسل رقم العملية، ونؤكد طلبك بعد المراجعة.', hintEn: "Transfer the amount and share the reference — we'll confirm after review." },
]
export const INSTAPAY_NUMBER = import.meta.env.VITE_INSTAPAY_NUMBER || ''
export const VODAFONE_CASH_NUMBER = import.meta.env.VITE_VODAFONE_CASH_NUMBER || ''
// Server recomputes prices & shipping; the client only sends ids/quantities.
export const placeOrder = (method: Method['id'], o: OrderInput) => api<{ orderId: string }>('/orders', { method: 'POST', body: { ...o, method } })
