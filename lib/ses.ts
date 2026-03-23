/**
 * AWS SES email sending utility.
 * Replaces Resend — all emails route through SES eu-west-1.
 */
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

let client: SESClient | null = null

function getSESClient(): SESClient | null {
  if (!process.env.AWS_SES_ACCESS_KEY_ID || !process.env.AWS_SES_SECRET_ACCESS_KEY) {
    console.warn('AWS SES credentials not set — email sending disabled')
    return null
  }
  if (!client) {
    client = new SESClient({
      region: process.env.AWS_SES_REGION || 'eu-west-1',
      credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
      },
    })
  }
  return client
}

interface SendEmailParams {
  to: string | string[]
  subject: string
  body: string
  bodyHtml?: string
  from?: string
  replyTo?: string
}

/**
 * Send an email via AWS SES. Returns { success, messageId?, error? }.
 * Never throws — safe to call without try/catch.
 */
export async function sendEmail({
  to,
  subject,
  body,
  bodyHtml,
  from,
  replyTo,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const ses = getSESClient()
  if (!ses) {
    return { success: false, error: 'SES client not configured' }
  }

  const sender = from || 'JOBLUX <noreply@joblux.com>'
  const recipients = Array.isArray(to) ? to : [to]

  try {
    const command = new SendEmailCommand({
      Source: sender,
      Destination: {
        ToAddresses: recipients,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: body,
            Charset: 'UTF-8',
          },
          Html: {
            Data: bodyHtml || body.replace(/\n/g, '<br>'),
            Charset: 'UTF-8',
          },
        },
      },
      ...(replyTo ? { ReplyToAddresses: [replyTo] } : {}),
    })

    const result = await ses.send(command)
    return { success: true, messageId: result.MessageId }
  } catch (err: any) {
    console.error('SES send failed:', err.message)
    return { success: false, error: err.message }
  }
}
