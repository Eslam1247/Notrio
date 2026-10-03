import express from 'express'; import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken'; import fs from 'fs'; import cors from 'cors'
import { OAuth2Client } from 'google-auth-library'
import * as store from './store.js'
import { sendEmail, welcomeEmail, orderEmail } from './mailer.js'
const E = process.env; if (!E.JWT_SECRET) throw new Error('Set JWT_SECRET in server/.env')
const gClient = E.GOOGLE_CLIENT_ID ? new OAuth2Client(E.GOOGLE_CLIENT_ID) : null
const cat = JSON.parse(fs.readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'))

const app = express()
// In production the frontend (Vercel) and backend (Render/Railway) live on different domains,
// so the browser needs this server's explicit permission to call it. Set ALLOWED_ORIGIN to your
// deployed site's exact URL, e.g. https://notrio.vercel.app — leave unset to allow all origins (fine for local dev only).
app.use(cors({ origin: E.ALLOWED_ORIGIN || true, credentials: false }))
app.use(express.json({ limit: '50kb' }))
const err = (res, s, m) => res.status(s).json({ error: m })
const auth = required => (req, res, next) => { try { req.uid = jwt.verify((req.headers.authorization || '').slice(7), E.JWT_SECRET).uid; next() } catch { required ? err(res, 401, 'سجّل الدخول أولًا.') : next() } }
const pub = u => ({ name: u.name, email: u.email, phone: u.phone, address: u.address, city: u.city, avatarColor: u.avatarColor || '#0E1CC3' })
const token = u => jwt.sign({ uid: u.id }, E.JWT_SECRET, { expiresIn: '30d' })
const adminOnly = (req, res, next) => (!E.ADMIN_KEY || req.headers['x-admin-key'] !== E.ADMIN_KEY) ? err(res, 403, 'forbidden') : next()
// tiny per-IP rate limit for auth/orders/contact
const hits = new Map(); const limit = (n) => (req, res, next) => { const k = req.ip + req.path, t = Date.now(), a = (hits.get(k) || []).filter(x => t - x < 60000); if (a.length >= n) return err(res, 429, 'محاولات كثيرة، حاول بعد دقيقة.'); hits.set(k, [...a, t]); next() }

app.post('/api/auth/register', limit(10), async (req, res) => { const { name, email, phone, password } = req.body || {}
  if (!name || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 6) return err(res, 400, 'تأكد من الاسم والبريد وكلمة مرور ٦ أحرف على الأقل.')
  const e = email.toLowerCase(); if (await store.findUserByEmail(e)) return err(res, 409, 'هذا البريد مسجّل بالفعل، جرّب تسجيل الدخول.')
  const u = await store.createUser({ name, email: e, phone: phone || '', hash: bcrypt.hashSync(password, 10) }); res.json({ token: token(u), user: pub(u) })
  sendEmail(u.email, 'أهلاً بيك في Notrio', welcomeEmail(u.name)) })
app.post('/api/auth/login', limit(10), async (req, res) => { const u = await store.findUserByEmail(`${req.body?.email}`.toLowerCase())
  if (!u || !u.hash || !bcrypt.compareSync(`${req.body?.password}`, u.hash)) return err(res, 401, 'البريد أو كلمة المرور غير صحيحة.'); res.json({ token: token(u), user: pub(u) }) })
app.post('/api/auth/google', limit(15), async (req, res) => { if (!gClient) return err(res, 400, 'تسجيل الدخول بجوجل غير مفعّل حاليًا.')
  try { const ticket = await gClient.verifyIdToken({ idToken: req.body?.credential, audience: E.GOOGLE_CLIENT_ID }); const p = ticket.getPayload()
    let u = await store.findUserByEmail(p.email.toLowerCase()); let isNew = false
    if (!u) { u = await store.createUser({ name: p.name || p.email.split('@')[0], email: p.email.toLowerCase(), google: true }); isNew = true }
    res.json({ token: token(u), user: pub(u) })
    if (isNew) sendEmail(u.email, 'أهلاً بيك في Notrio', welcomeEmail(u.name))
  } catch { err(res, 401, 'تعذّر التحقق من حساب جوجل.') } })
app.get('/api/me', auth(true), async (req, res) => { const u = await store.findUserById(req.uid); if (!u) return err(res, 401, 'انتهت الجلسة.')
  res.json({ user: pub(u), orders: await store.getOrdersByUser(u.id) }) })
app.patch('/api/me', auth(true), async (req, res) => { const { name, phone, address, city, avatarColor } = req.body || {}
  if (name !== undefined && !`${name}`.trim()) return err(res, 400, 'الاسم مطلوب.')
  if (avatarColor !== undefined && !/^#[0-9a-fA-F]{6}$/.test(avatarColor)) return err(res, 400, 'لون غير صحيح.')
  const u = await store.updateUser(req.uid, { name, phone, address, city, avatarColor }); if (!u) return err(res, 404, 'المستخدم غير موجود.'); res.json({ user: pub(u) }) })

app.get('/api/stock', async (req, res) => { const s = await store.getStockMap(); const out = {}; for (const id in cat) out[id] = s[id] ?? 0; res.json(out) })
app.post('/api/orders', limit(15), auth(false), async (req, res) => {
  const { customer: c, items, method, transferRef } = req.body || {}
  const phone = `${c?.phone || ''}`.replace(/[\s+-]/g, '').replace(/^20/, '0')
  if (!c?.name || !/^01\d{9}$/.test(phone) || !c.address || !c.city) return err(res, 400, 'تأكد من الاسم ورقم موبايل مصري صحيح والعنوان والمدينة.')
  if (!Array.isArray(items) || !items.length) return err(res, 400, 'السلة فارغة.')
  const isTransfer = method === 'transfer'
  if (isTransfer && !`${transferRef || ''}`.trim()) return err(res, 400, 'اكتب رقم أو مرجع عملية التحويل.')
  // merge duplicate lines (same product + color) so re-adding an item doesn't bypass the stock check
  const merged = new Map()
  for (const it of items) { const k = it.id + '|' + (it.color || ''); const q = Math.max(1, it.qty | 0); merged.set(k, { id: it.id, color: it.color, qty: (merged.get(k)?.qty || 0) + q }) }
  const lines = []; for (const it of merged.values()) { const p = cat[it.id]; if (!p) return err(res, 400, 'منتج غير موجود.')
    lines.push({ id: it.id, ar: p.ar, qty: Math.min(20, it.qty), color: `${it.color || ''}`.slice(0, 20), price: p.price }) }
  try {
    const orderId = await store.placeOrder({ userId: req.uid, method: isTransfer ? 'transfer' : 'cod', transferRef: isTransfer ? `${transferRef}`.slice(0, 60) : null,
      customer: { name: `${c.name}`.slice(0, 80), phone, address: `${c.address}`.slice(0, 250), city: `${c.city}`.slice(0, 60) }, lines })
    res.json({ orderId })
    const total = lines.reduce((a, l) => a + l.price * l.qty, 0) + (lines.reduce((a, l) => a + l.price * l.qty, 0) >= 500 ? 0 : 40)
    if (req.uid) { const u = await store.findUserById(req.uid); if (u?.email) sendEmail(u.email, `تم استلام طلبك ${orderId}`, orderEmail(u.name, orderId, total)) }
  } catch (e) { err(res, 400, e.message || 'تعذّر إنشاء الطلب.') } })
app.get('/api/orders/track', limit(20), async (req, res) => { const phone = `${req.query.phone || ''}`.replace(/[\s+-]/g, '').replace(/^20/, '0')
  const o = await store.trackOrder(`${req.query.id}`.toUpperCase(), phone); if (!o) return err(res, 404, 'لم نجد طلبًا بهذه البيانات. تأكد من رقم الطلب ورقم الموبايل.')
  res.json({ id: o.id, status: o.status, pay: o.pay, method: o.method, total: o.total, items: o.items, createdAt: o.createdAt }) })

app.patch('/api/admin/orders/:id', adminOnly, async (req, res) => {
  let o = null
  if (['received', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(req.body?.status)) o = await store.updateOrderStatus(req.params.id, req.body.status)
  if (['pending', 'paid', 'failed'].includes(req.body?.pay)) o = await store.updateOrderPay(req.params.id, req.body.pay)
  if (!o) return err(res, 404, 'not found'); res.json(o) })
app.get('/api/admin/stock', adminOnly, async (req, res) => { const s = await store.getStockMap(); const out = {}; for (const id in cat) out[id] = { ar: cat[id].ar, qty: s[id] ?? 0 }; res.json(out) })
app.patch('/api/admin/stock/:id', adminOnly, async (req, res) => { if (!cat[req.params.id]) return err(res, 404, 'not found')
  const qty = Math.max(0, Math.min(9999, req.body?.qty | 0)); await store.setStock(req.params.id, qty); res.json({ id: req.params.id, qty }) })
app.get('/api/admin/orders', adminOnly, async (req, res) => res.json(await store.getAllOrders()))
app.post('/api/contact', limit(5), async (req, res) => { const { name, phone, message } = req.body || {}; if (!name || !phone || !message) return err(res, 400, 'املأ كل الحقول.')
  await store.addMessage({ name: `${name}`.slice(0, 80), phone: `${phone}`.slice(0, 20), message: `${message}`.slice(0, 1000) }); res.json({ ok: true }) })

store.init(cat).then(() => app.listen(E.PORT || 4000, () => console.log('Notrio API on :' + (E.PORT || 4000))))
  .catch(e => { console.error('Failed to start:', e.message); process.exit(1) })
