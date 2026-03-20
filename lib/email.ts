/**
 * Email sending utility using Resend.
 * Gracefully handles failures — logs errors but never crashes the caller.
 */
import { Resend } from 'resend'

let resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — email sending disabled')
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface SendEmailParams {
  to: string
  subject: string
  body: string
  bodyHtml?: string
  from?: string
}

/**
 * Send an email via Resend. Returns { success, messageId?, error? }.
 * Never throws — safe to call without try/catch.
 */
export async function sendEmail({
  to,
  subject,
  body,
  bodyHtml,
  from,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const client = getResend()
  if (!client) {
    return { success: false, error: 'Email client not configured' }
  }

  const sender = from || process.env.EMAIL_FROM || 'JOBLUX <noreply@luxuryrecruiter.com>'

  try {
    const result = await client.emails.send({
      from: sender,
      to,
      subject,
      text: body,
      html: bodyHtml || body.replace(/\n/g, '<br>'),
    })

    if (result.error) {
      console.error('Resend API error:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  } catch (err: any) {
    console.error('Email send failed:', err.message)
    return { success: false, error: err.message }
  }
}
