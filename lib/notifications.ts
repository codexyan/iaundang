// ─── Notification Domain ─────────────────────────────────────
// Foundation layer for all platform-to-user communication.
// Currently logs to console — swap transport when email provider is configured.

// ─── Types ───────────────────────────────────────────────────

export type NotificationType =
  | 'welcome'
  | 'trial_started'
  | 'trial_expiring'
  | 'trial_expired'
  | 'order_created'
  | 'order_approved'
  | 'order_rejected'
  | 'payment_received'
  | 'subscription_active'
  | 'subscription_expiring'
  | 'subscription_expired'
  | 'password_reset'

export type NotificationChannel = 'email' | 'in_app'

export interface NotificationPayload {
  type: NotificationType
  recipientEmail: string
  recipientName?: string
  channel?: NotificationChannel
  data: Record<string, string | number | boolean>
}

export interface NotificationResult {
  success: boolean
  channel: NotificationChannel
  messageId?: string
  error?: string
}

// ─── Templates ───────────────────────────────────────────────

interface NotificationTemplate {
  subject: string
  body: string
}

const TEMPLATES: Record<NotificationType, (data: Record<string, string | number | boolean>) => NotificationTemplate> = {
  welcome: (d) => ({
    subject: 'Selamat datang di IAUndang!',
    body: `Halo ${d.name || 'Kak'}! Akun kamu sudah aktif. Mulai buat undangan digital pertamamu sekarang.`,
  }),
  trial_started: (d) => ({
    subject: 'Free Trial 7 Hari Dimulai',
    body: `Undangan "${d.slug}" sudah dibuat! Kamu punya 7 hari untuk mencoba semua fitur dasar. Upgrade kapan saja untuk membuka fitur premium.`,
  }),
  trial_expiring: (d) => ({
    subject: `Trial berakhir dalam ${d.daysLeft} hari`,
    body: `Free trial untuk "${d.slug}" akan berakhir dalam ${d.daysLeft} hari. Upgrade sekarang agar undangan tetap aktif dan bisa diakses tamu.`,
  }),
  trial_expired: (d) => ({
    subject: 'Free Trial Berakhir',
    body: `Free trial untuk "${d.slug}" telah berakhir. Undangan masih tersimpan selama 14 hari. Upgrade untuk mengaktifkan kembali.`,
  }),
  order_created: (d) => ({
    subject: `Pesanan ${d.orderNumber} Diterima`,
    body: `Pesanan kamu (${d.orderNumber}) sebesar Rp ${d.amount} sudah kami terima. Silakan lakukan pembayaran sesuai instruksi.`,
  }),
  order_approved: (d) => ({
    subject: 'Pesanan Disetujui — Undangan Siap!',
    body: `Pesanan ${d.orderNumber} telah disetujui. Undanganmu sudah aktif di ${d.slug}.iaundang.id. Login dengan email: ${d.email}`,
  }),
  order_rejected: (d) => ({
    subject: 'Pesanan Tidak Dapat Diproses',
    body: `Pesanan ${d.orderNumber} tidak dapat diproses. Alasan: ${d.reason || 'Silakan hubungi admin.'}`,
  }),
  payment_received: (d) => ({
    subject: 'Bukti Pembayaran Diterima',
    body: `Bukti pembayaran untuk "${d.slug}" sudah kami terima dan sedang diverifikasi. Proses biasanya memakan waktu 1x24 jam.`,
  }),
  subscription_active: (d) => ({
    subject: `Paket ${d.tierName} Aktif!`,
    body: `Paket ${d.tierName} untuk "${d.slug}" sudah aktif hingga ${d.expiresAt}. Selamat membuat undangan impianmu!`,
  }),
  subscription_expiring: (d) => ({
    subject: `Langganan berakhir dalam ${d.daysLeft} hari`,
    body: `Paket ${d.tierName} untuk "${d.slug}" akan berakhir dalam ${d.daysLeft} hari (${d.expiresAt}). Perpanjang sekarang agar undangan tetap bisa diakses.`,
  }),
  subscription_expired: (d) => ({
    subject: 'Langganan Berakhir',
    body: `Paket ${d.tierName} untuk "${d.slug}" telah berakhir. Undangan tidak lagi bisa diakses oleh tamu. Perpanjang untuk mengaktifkan kembali.`,
  }),
  password_reset: (d) => ({
    subject: 'Reset Password IAUndang',
    body: `Klik link berikut untuk mereset password: ${d.resetLink}. Link berlaku 1 jam.`,
  }),
}

// ─── Transport ───────────────────────────────────────────────

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'IAUndang <noreply@iaundang.id>'

async function sendViaEmail(to: string, template: NotificationTemplate): Promise<NotificationResult> {
  if (!RESEND_API_KEY) {
    console.log(`[Notification:email] To: ${to} | Subject: ${template.subject}`)
    console.log(`[Notification:email] Body: ${template.body}`)
    return { success: true, channel: 'email', messageId: `console_${Date.now()}` }
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: template.subject,
      html: buildHtml(template),
    })

    if (error) {
      console.error('[Notification:email] Resend error:', error)
      return { success: false, channel: 'email', error: error.message }
    }

    return { success: true, channel: 'email', messageId: data?.id }
  } catch (err) {
    console.error('[Notification:email] Send failed:', err)
    return { success: false, channel: 'email', error: String(err) }
  }
}

function buildHtml(template: NotificationTemplate): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f4;margin:0;padding:0}
.c{max-width:520px;margin:0 auto;padding:40px 20px}
.card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
h1{font-size:18px;color:#1c1917;margin:0 0 16px}
p{font-size:14px;color:#57534e;line-height:1.6;margin:0 0 12px}
.footer{text-align:center;padding:24px 0 0;font-size:11px;color:#a8a29e}</style></head>
<body><div class="c"><div class="card"><h1>${template.subject}</h1><p>${template.body}</p></div>
<div class="footer">Dikirim oleh <strong>IAUndang</strong> · iaundang.id</div></div></body></html>`
}

// ─── Public API ──────────────────────────────────────────────

export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const templateFn = TEMPLATES[payload.type]
  if (!templateFn) {
    return { success: false, channel: payload.channel ?? 'email', error: `Unknown notification type: ${payload.type}` }
  }

  const template = templateFn(payload.data)
  const channel = payload.channel ?? 'email'

  if (channel === 'email') {
    return sendViaEmail(payload.recipientEmail, template)
  }

  return { success: false, channel, error: `Channel ${channel} not implemented` }
}

export async function notifyUser(
  type: NotificationType,
  email: string,
  data: Record<string, string | number | boolean>,
): Promise<NotificationResult> {
  return sendNotification({ type, recipientEmail: email, data })
}
