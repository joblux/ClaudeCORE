/**
 * HTML email template wrappers in the JOBLUX brand style.
 * Generates simple, email-client-safe HTML.
 */

/** Wrap a message body in the JOBLUX branded email template */
export function wrapInEmailTemplate({
  body,
  ctaUrl,
  ctaLabel,
}: {
  body: string
  ctaUrl?: string
  ctaLabel?: string
}): string {
  const bodyHtml = body.replace(/\n/g, '<br>')
  const ctaBlock = ctaUrl
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td align="center">
          <a href="${ctaUrl}" style="display:inline-block;background:#a58e28;color:#1a1a1a;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:2px;letter-spacing:1px;text-transform:uppercase;">${ctaLabel || 'View on JOBLUX'}</a>
        </td></tr>
       </table>`
    : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e8e2d8;">
        <!-- Header -->
        <tr><td style="background:#1a1a1a;padding:20px 32px;text-align:center;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#a58e28;letter-spacing:3px;">JOBLUX</div>
          <div style="font-size:9px;color:#666;letter-spacing:3px;margin-top:2px;text-transform:uppercase;">Luxury Talents Society</div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <div style="font-size:15px;color:#333;line-height:1.7;">
            ${bodyHtml}
          </div>
          ${ctaBlock}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #e8e2d8;text-align:center;">
          <p style="font-size:11px;color:#999;margin:0;">This message was sent via JOBLUX | Luxury Talents Society</p>
          <p style="font-size:10px;color:#bbb;margin:4px 0 0;">Paris · London · Dubai · Singapore</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/** Generate notification email for a candidate receiving a message */
export function candidateNotificationEmail(body: string): string {
  return wrapInEmailTemplate({
    body,
    ctaUrl: 'https://www.luxuryrecruiter.com/dashboard/messages',
    ctaLabel: 'View Messages',
  })
}

/** Generate notification email for a client receiving a message */
export function clientNotificationEmail(body: string): string {
  return wrapInEmailTemplate({ body })
}
