// ─── Notification Domain ─────────────────────────────────────
// Foundation layer for all platform-to-user communication.
// Transport: Resend email (lib/email.ts), with branded HTML
// templates per notification type (lib/email-templates.ts).
// Falls back to a console log when RESEND_API_KEY is not set.

import { sendEmail } from './email'
import {
  welcomeTemplate,
  trialStartedTemplate,
  trialExpiringTemplate,
  trialExpiredTemplate,
  orderCreatedTemplate,
  orderApprovedTemplate,
  orderRejectedTemplate,
  paymentReceivedTemplate,
  subscriptionActiveTemplate,
  subscriptionExpiringTemplate,
  subscriptionExpiredTemplate,
  passwordResetTemplate,
  type EmailData,
} from './email-templates'

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
    body: `Pesanan ${d.orderNumber} telah disetujui. Undanganmu sudah aktif di ${d.slug}.iaundang.online. Login dengan email: ${d.email}`,
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

// ─── HTML Templates ──────────────────────────────────────────
// Maps each notification type to its branded HTML email template.

const HTML_TEMPLATES: Record<NotificationType, (d: EmailData) => string> = {
  welcome: welcomeTemplate,
  trial_started: trialStartedTemplate,
  trial_expiring: trialExpiringTemplate,
  trial_expired: trialExpiredTemplate,
  order_created: orderCreatedTemplate,
  order_approved: orderApprovedTemplate,
  order_rejected: orderRejectedTemplate,
  payment_received: paymentReceivedTemplate,
  subscription_active: subscriptionActiveTemplate,
  subscription_expiring: subscriptionExpiringTemplate,
  subscription_expired: subscriptionExpiredTemplate,
  password_reset: passwordResetTemplate,
}

// ─── Public API ──────────────────────────────────────────────

export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const subjectFn = TEMPLATES[payload.type]
  const htmlFn = HTML_TEMPLATES[payload.type]
  const channel = payload.channel ?? 'email'

  if (!subjectFn || !htmlFn) {
    return { success: false, channel, error: `Unknown notification type: ${payload.type}` }
  }

  if (channel !== 'email') {
    return { success: false, channel, error: `Channel ${channel} not implemented` }
  }

  const { subject } = subjectFn(payload.data)
  const html = htmlFn(payload.data)

  const result = await sendEmail({ to: payload.recipientEmail, subject, html })

  if (result.skipped) {
    console.log(`[Notification:email] To: ${payload.recipientEmail} | Subject: ${subject} (RESEND_API_KEY not set, skipped)`)
    return { success: true, channel: 'email', messageId: 'console_skipped' }
  }

  return { success: result.success, channel: 'email', messageId: result.id, error: result.error }
}

export async function notifyUser(
  type: NotificationType,
  email: string,
  data: Record<string, string | number | boolean>,
): Promise<NotificationResult> {
  return sendNotification({ type, recipientEmail: email, data })
}
