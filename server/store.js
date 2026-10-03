// Storage abstraction: uses PostgreSQL when DATABASE_URL is set, otherwise
// falls back to the same db.json file used before — so local development
// with no database configured keeps working exactly as it did.
import fs from 'fs'
import crypto from 'crypto'
import pg from 'pg'

const usePg = !!process.env.DATABASE_URL
let pool = null

// ---------------- JSON-file mode (fallback / local dev) ----------------
const F = new URL('./db.json', import.meta.url)
let jdb = null
function jload() { if (!jdb) { jdb = fs.existsSync(F) ? JSON.parse(fs.readFileSync(F, 'utf8')) : { users: [], orders: [], messages: [], stock: {} }; if (!jdb.stock) jdb.stock = {} } return jdb }
function jsave() { fs.writeFileSync(F, JSON.stringify(jdb, null, 1)) }

// ---------------- init ----------------
export async function init(cat) {
  if (usePg) {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false } })
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY, name text NOT NULL, email text UNIQUE NOT NULL,
        phone text DEFAULT '', address text DEFAULT '', city text DEFAULT '',
        hash text, google boolean DEFAULT false, avatar_color text DEFAULT '#0E1CC3', created_at timestamptz DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS orders (
        id text PRIMARY KEY, user_id text, customer jsonb NOT NULL, items jsonb NOT NULL,
        subtotal int NOT NULL, shipping int NOT NULL, total int NOT NULL, method text NOT NULL,
        transfer_ref text, status text NOT NULL DEFAULT 'received', pay text NOT NULL DEFAULT 'pending',
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS stock (product_id text PRIMARY KEY, qty int NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS messages (id serial PRIMARY KEY, name text, phone text, message text, at timestamptz DEFAULT now());
    `)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_color text DEFAULT '#0E1CC3'`) // safe to re-run if the table already existed
    for (const id in cat) await pool.query(`INSERT INTO stock (product_id, qty) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [id, cat[id].stock ? 20 : 0])
    console.log('store: connected to PostgreSQL')
  } else {
    jload()
    for (const id in cat) if (!(id in jdb.stock)) jdb.stock[id] = cat[id].stock ? 20 : 0
    jsave()
    console.log('store: using local db.json (set DATABASE_URL to use PostgreSQL instead)')
  }
}

const mapOrder = o => usePg
  ? { id: o.id, userId: o.user_id, customer: o.customer, items: o.items, subtotal: o.subtotal, shipping: o.shipping, total: o.total, method: o.method, transferRef: o.transfer_ref, status: o.status, pay: o.pay, createdAt: o.created_at }
  : o
const mapUser = u => u && usePg ? { ...u, avatarColor: u.avatar_color } : u

// ---------------- users ----------------
export async function findUserByEmail(email) {
  if (usePg) { const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]); return mapUser(r.rows[0]) || null }
  return jload().users.find(u => u.email === email) || null
}
export async function findUserById(id) {
  if (usePg) { const r = await pool.query('SELECT * FROM users WHERE id=$1', [id]); return mapUser(r.rows[0]) || null }
  return jload().users.find(u => u.id === id) || null
}
const AVATAR_COLORS = ['#0E1CC3', '#FE00AE', '#1f6f5c', '#e0662f', '#7a4b8f', '#252525']
export async function createUser(u) {
  const row = { id: crypto.randomUUID(), name: u.name, email: u.email, phone: u.phone || '', address: '', city: '', hash: u.hash || null, google: !!u.google, avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] }
  if (usePg) { await pool.query('INSERT INTO users (id,name,email,phone,address,city,hash,google,avatar_color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [row.id, row.name, row.email, row.phone, row.address, row.city, row.hash, row.google, row.avatarColor]) }
  else { const d = jload(); d.users.push(row); jsave() }
  return row
}
export async function updateUser(id, fields) {
  const allowed = ['name', 'phone', 'address', 'city', 'avatarColor']
  const clean = {}; for (const k of allowed) if (fields[k] !== undefined) clean[k] = `${fields[k]}`.slice(0, 250)
  if (usePg) {
    const cols = { name: 'name', phone: 'phone', address: 'address', city: 'city', avatarColor: 'avatar_color' }
    const sets = Object.keys(clean).map((k, i) => `${cols[k]}=$${i + 2}`); if (!sets.length) return findUserById(id)
    const r = await pool.query(`UPDATE users SET ${sets.join(',')} WHERE id=$1 RETURNING *`, [id, ...Object.values(clean)])
    return mapUser(r.rows[0]) || null
  }
  const d = jload(); const u = d.users.find(x => x.id === id); if (!u) return null
  Object.assign(u, clean); jsave(); return u
}

// ---------------- stock ----------------
export async function getStockMap() {
  if (usePg) { const r = await pool.query('SELECT product_id, qty FROM stock'); return Object.fromEntries(r.rows.map(x => [x.product_id, x.qty])) }
  return { ...jload().stock }
}
export async function setStock(id, qty) {
  if (usePg) { await pool.query('INSERT INTO stock (product_id, qty) VALUES ($1,$2) ON CONFLICT (product_id) DO UPDATE SET qty=$2', [id, qty]) }
  else { const d = jload(); d.stock[id] = qty; jsave() }
}

// ---------------- orders ----------------
// Atomically checks + decrements stock and inserts the order. Throws a plain Error
// with a user-facing Arabic message if something is out of stock.
export async function placeOrder({ userId, customer, lines, method, transferRef }) {
  const id = 'NT-' + crypto.randomInt(10000, 99999)
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0), shipping = subtotal >= 500 ? 0 : 40
  const order = { id, userId: userId || null, customer, items: lines, subtotal, shipping, total: subtotal + shipping, method, transferRef: transferRef || null, status: 'received', pay: 'pending', createdAt: new Date().toISOString() }

  if (usePg) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (const l of lines) {
        const r = await client.query('SELECT qty FROM stock WHERE product_id=$1 FOR UPDATE', [l.id])
        const avail = r.rows[0]?.qty ?? 0
        if (avail <= 0) throw new Error(`«${l.ar}» غير متوفر حاليًا.`)
        if (l.qty > avail) throw new Error(`متبقّي ${avail} فقط من «${l.ar}».`)
        await client.query('UPDATE stock SET qty = qty - $1 WHERE product_id=$2', [l.qty, l.id])
      }
      await client.query('INSERT INTO orders (id,user_id,customer,items,subtotal,shipping,total,method,transfer_ref,status,pay,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
        [order.id, order.userId, order.customer, JSON.stringify(order.items), order.subtotal, order.shipping, order.total, order.method, order.transferRef, order.status, order.pay, order.createdAt])
      await client.query('COMMIT')
    } catch (e) { await client.query('ROLLBACK'); throw e } finally { client.release() }
  } else {
    const d = jload()
    for (const l of lines) {
      const avail = d.stock[l.id] ?? 0
      if (avail <= 0) throw new Error(`«${l.ar}» غير متوفر حاليًا.`)
      if (l.qty > avail) throw new Error(`متبقّي ${avail} فقط من «${l.ar}».`)
    }
    for (const l of lines) d.stock[l.id] = Math.max(0, (d.stock[l.id] ?? 0) - l.qty)
    d.orders.push(order); jsave()
  }
  return order.id
}
export async function getOrdersByUser(userId) {
  if (usePg) { const r = await pool.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [userId]); return r.rows.map(mapOrder) }
  return jload().orders.filter(o => o.userId === userId).slice().reverse()
}
export async function getAllOrders() {
  if (usePg) { const r = await pool.query('SELECT * FROM orders ORDER BY created_at DESC'); return r.rows.map(mapOrder) }
  return jload().orders.slice().reverse()
}
export async function trackOrder(id, phone) {
  if (usePg) { const r = await pool.query('SELECT * FROM orders WHERE id=$1', [id]); const o = r.rows[0] ? mapOrder(r.rows[0]) : null; return o && o.customer.phone === phone ? o : null }
  const o = jload().orders.find(x => x.id === id); return o && o.customer.phone === phone ? o : null
}
export async function updateOrderStatus(id, status) {
  if (usePg) {
    if (status === 'cancelled') {
      const r = await pool.query('SELECT status, items FROM orders WHERE id=$1', [id]); const cur = r.rows[0]; if (!cur) return null
      if (cur.status !== 'cancelled') for (const l of cur.items) await pool.query('UPDATE stock SET qty = qty + $1 WHERE product_id=$2', [l.qty, l.id])
    }
    const r2 = await pool.query('UPDATE orders SET status=$1 WHERE id=$2 RETURNING *', [status, id]); return r2.rows[0] ? mapOrder(r2.rows[0]) : null
  }
  const d = jload(); const o = d.orders.find(x => x.id === id); if (!o) return null
  if (status === 'cancelled' && o.status !== 'cancelled') for (const l of o.items) d.stock[l.id] = (d.stock[l.id] ?? 0) + l.qty
  o.status = status; jsave(); return o
}
export async function updateOrderPay(id, pay) {
  if (usePg) { const r = await pool.query('UPDATE orders SET pay=$1 WHERE id=$2 RETURNING *', [pay, id]); return r.rows[0] ? mapOrder(r.rows[0]) : null }
  const d = jload(); const o = d.orders.find(x => x.id === id); if (!o) return null; o.pay = pay; jsave(); return o
}

// ---------------- messages ----------------
export async function addMessage(m) {
  if (usePg) { await pool.query('INSERT INTO messages (name, phone, message) VALUES ($1,$2,$3)', [m.name, m.phone, m.message]) }
  else { const d = jload(); d.messages.push({ ...m, at: new Date().toISOString() }); jsave() }
}
