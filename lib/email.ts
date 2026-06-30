import { Resend } from 'resend'

const FROM = process.env.EMAIL_FROM || 'iaundang <halo@iaundang.online>'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export interface SendEmailResult {
  success: boolean
  id?: string
  skipped?: boolean
  error?: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email send to:', to)
    return { success: false, skipped: true }
  }

  try {
    const resend = new Resend(apiKey)
    const result = await resend.emails.send({ from: FROM, to, subject, html })
    if (result.error) {
      console.error('Resend email error:', result.error)
      return { success: false, error: String(result.error) }
    }
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Resend email error:', error)
    return { success: false, error: String(error) }
  }
}
