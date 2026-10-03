// Minimal transactional email via Resend's HTTP API (https://resend.com) — no SDK needed.
// Set RESEND_API_KEY and RESEND_FROM in server/.env to enable; otherwise this silently does nothing,
// so the site keeps working fully without an email provider configured.
const E = process.env
let warned = false
export async function sendEmail(to, subject, html) {
  if (!E.RESEND_API_KEY || !E.RESEND_FROM) { if (!warned) { console.log('mailer: RESEND_API_KEY/RESEND_FROM not set — emails are disabled.'); warned = true } return }
  try {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${E.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: E.RESEND_FROM, to, subject, html }) })
    if (!r.ok) console.error('mailer: send failed', r.status, await r.text().catch(() => ''))
  } catch (e) { console.error('mailer: send error', e.message) }
}

const shell = (lang, title, body) => `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;direction:${lang === 'ar' ? 'rtl' : 'ltr'}">
  <div style="background:#0E1CC3;color:#fff;padding:24px;text-align:center;font-weight:bold;font-size:22px;border-radius:8px 8px 0 0">Notrio</div>
  <div style="background:#F7F7FA;padding:24px;border-radius:0 0 8px 8px">
    <h2 style="color:#0E1CC3;margin-top:0">${title}</h2>${body}
  </div>
  <p style="color:#999;font-size:12px;text-align:center;margin-top:16px">Notrio</p>
</div>`

export const welcomeEmail = (name) => shell('ar', `أهلاً بيك يا ${name} 👋`,
  `<p>اتسجّلت بنجاح في Notrio. دلوقتي تقدر تتصفّح الدفاتر، تطلب، وتتابع كل طلباتك من حسابك.</p>`)

export const orderEmail = (name, orderId, total) => shell('ar', `تم استلام طلبك! 🎉`,
  `<p>أهلاً ${name}، طلبك <b>${orderId}</b> وصلنا وقيمته <b>EGP ${total}</b>. هنتواصل معك لتأكيد التوصيل.</p>`)
