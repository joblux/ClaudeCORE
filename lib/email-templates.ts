/**
 * JOBLUX branded email templates — signature style.
 * White background, logo image header, gold accent line.
 * All templates return { html, text } for SES dual-format sending.
 *
 * Design:
 *   Top accent:    2px #B8975C gold line
 *   Background:    #ffffff
 *   Text:          #1a1a1a (heading), #555 (body), #aaa (muted)
 *   Gold accent:   #B8975C (tagline only)
 *   Button:        bg #1a1a1a, color #ffffff, radius 3px
 *   Footer:        Gold SVG logo + gold tagline + help link + address
 *
 * GLOBAL RULE: "JOBLUX" never appears in subject lines or body text
 * of user-facing emails. The sender name is already "JOBLUX".
 * Exception: footer legal line (required) and admin-internal emails.
 */

const SITE_URL = 'https://joblux.com'
const HELP_URL = `${SITE_URL}/faq`
const ADMIN_EMAIL = 'info@joblux.com'

// ────────────────────────────────────────────
// Logo SVG (inline gold, footer only)
// ────────────────────────────────────────────

const LOGO_SVG = `<svg width="100" height="24" viewBox="-2.47 13.94 297.03 66.06" fill="#B8975C" xmlns="http://www.w3.org/2000/svg" style="display:block;margin-bottom:6px;"><path d="M1.38 80L-2.47 71.53Q-0.31 70.22 1.23 68.78Q2.78 67.34 3.78 65.61Q4.78 63.88 5.25 61.73Q5.72 59.59 5.72 56.88V14.59H15.63V55.09Q15.63 58.34 15.34 61.02Q15.06 63.69 14.42 65.92Q13.78 68.16 12.70 70.03Q11.63 71.91 10.05 73.59Q8.47 75.28 6.33 76.84Q4.19 78.41 1.38 80ZM20.41 38.88Q20.41 33.34 22.44 28.75Q24.47 24.16 28.14 20.86Q31.81 17.56 36.95 15.75Q42.09 13.94 48.34 13.94Q54.56 13.94 59.72 15.75Q64.88 17.56 68.55 20.86Q72.22 24.16 74.25 28.75Q76.28 33.34 76.28 38.88Q76.28 44.44 74.25 49.08Q72.22 53.72 68.55 57.06Q64.88 60.41 59.72 62.27Q54.56 64.13 48.34 64.13Q42.09 64.13 36.95 62.27Q31.81 60.41 28.14 57.06Q24.47 53.72 22.44 49.08Q20.41 44.44 20.41 38.88ZM30.31 38.88Q30.31 42.66 31.67 45.69Q33.03 48.72 35.45 50.86Q37.88 53 41.17 54.16Q44.47 55.31 48.34 55.31Q52.22 55.31 55.52 54.16Q58.81 53 61.22 50.86Q63.63 48.72 65 45.69Q66.38 42.66 66.38 38.88Q66.38 35.09 65 32.09Q63.63 29.09 61.22 27.02Q58.81 24.94 55.52 23.84Q52.22 22.75 48.34 22.75Q44.47 22.75 41.17 23.84Q37.88 24.94 35.45 27.02Q33.03 29.09 31.67 32.09Q30.31 35.09 30.31 38.88ZM82.28 63.44V14.59H108.38Q113.16 14.59 116.70 15.61Q120.25 16.63 122.59 18.41Q124.94 20.19 126.08 22.64Q127.22 25.09 127.22 27.94Q127.22 32.59 124.28 36.09Q127.66 38.09 129.31 41.28Q130.97 44.47 130.97 48.53Q130.97 51.94 129.83 54.69Q128.69 57.44 126.36 59.39Q124.03 61.34 120.48 62.39Q116.94 63.44 112.13 63.44H82.28ZM92.19 33.34H112.19Q113.47 33.34 114.69 33.44Q116.78 31.44 116.78 28.88Q116.78 26.22 114.70 24.77Q112.63 23.31 108.63 23.31H92.19V33.34ZM92.19 54.81H112.38Q116.38 54.81 118.45 53.09Q120.53 51.38 120.53 48.25Q120.53 45.13 118.45 43.38Q116.38 41.63 112.38 41.63H92.19V54.81ZM136 63.44V14.59H145.91V54.75H174.31V63.44H136ZM177.06 42.69V14.59H186.97V41.50Q186.97 44.81 187.88 47.39Q188.78 49.97 190.58 51.75Q192.38 53.53 195.03 54.45Q197.69 55.38 201.22 55.38Q204.72 55.38 207.39 54.45Q210.06 53.53 211.86 51.75Q213.66 49.97 214.56 47.39Q215.47 44.81 215.47 41.50V14.59H225.38V42.69Q225.38 47.50 223.75 51.44Q222.13 55.38 219.03 58.19Q215.94 61 211.45 62.53Q206.97 64.06 201.22 64.06Q195.47 64.06 190.98 62.53Q186.50 61 183.41 58.19Q180.31 55.38 178.69 51.44Q177.06 47.50 177.06 42.69ZM226 63.44L246.31 38.63 227.53 14.59H239.66L252.63 31.41 265.66 14.59H277.59L258.47 38.53 278.25 63.44H266.09L252.19 45.88 237.97 63.44H226ZM279.72 58.03Q279.72 56.78 280.23 55.67Q280.75 54.56 281.72 53.73Q282.69 52.91 284.06 52.44Q285.44 51.97 287.16 51.97Q288.88 51.97 290.25 52.44Q291.63 52.91 292.58 53.73Q293.53 54.56 294.05 55.67Q294.56 56.78 294.56 58.03Q294.56 59.28 294.05 60.39Q293.53 61.50 292.58 62.31Q291.63 63.13 290.25 63.61Q288.88 64.09 287.16 64.09Q285.44 64.09 284.06 63.61Q282.69 63.13 281.72 62.31Q280.75 61.50 280.23 60.39Q279.72 59.28 279.72 58.03Z"/></svg>`

// ────────────────────────────────────────────
// Tier display labels
// ────────────────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  rising: 'Emerging Professional',
  pro: 'Established Professional',
  executive: 'Senior & Executive',
  insider: 'Trusted Contributor',
  business: 'Company',
}

// ────────────────────────────────────────────
// Master layout — signature style
// ────────────────────────────────────────────

interface LayoutOptions {
  content: string
  reason: string
  showUnsubscribe?: boolean
}

function layout({ content, reason, showUnsubscribe }: LayoutOptions): string {
  const unsubLinks = showUnsubscribe
    ? `<a href="${SITE_URL}/unsubscribe" style="color:#999;text-decoration:underline;">Unsubscribe</a> &middot; <a href="${SITE_URL}/preferences" style="color:#999;text-decoration:underline;">Manage preferences</a> &middot; `
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JOBLUX</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f5f5;">
<tr><td align="center" style="padding:32px 16px;">

<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-top:2px solid #B8975C;">

<tr><td style="padding:40px 36px 28px;">
${content}
</td></tr>

<tr><td style="padding:0 36px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr><td style="border-top:1px solid #eee;padding-top:24px;">
${LOGO_SVG}
<p style="font-size:11px;color:#B8975C;font-family:Arial,Helvetica,sans-serif;margin:0 0 10px;letter-spacing:0.5px;">Luxury Talent Intelligence</p>
<p style="font-size:11px;color:#999;font-family:Arial,Helvetica,sans-serif;margin:0 0 8px;">${unsubLinks}<a href="${HELP_URL}" style="color:#999;text-decoration:underline;">Need help?</a></p>
<p style="font-size:11px;color:#bbb;font-family:Arial,Helvetica,sans-serif;margin:0 0 3px;">JOBLUX LLC &middot; 424 Park Avenue South, New York, NY 10016</p>
<p style="font-size:11px;color:#ccc;font-family:Arial,Helvetica,sans-serif;margin:0;">${reason}</p>
</td></tr>
</table>
</td></tr>

</table>

</td></tr>
</table>
</body>
</html>`
}

// ────────────────────────────────────────────
// Admin layout — minimal, no gold
// ────────────────────────────────────────────

function adminLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f5f5;">
<tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-top:2px solid #1a1a1a;">
<tr><td style="padding:24px 28px;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr><td>
<span style="font-family:Arial,sans-serif;font-size:16px;color:#1a1a1a;letter-spacing:2px;font-weight:600;">JOBLUX</span>
<span style="font-size:11px;color:#B8975C;margin-left:8px;">Admin</span>
</td></tr>
</table>
</td></tr>
<tr><td style="padding:0 28px 24px;">
${content}
</td></tr>
<tr><td style="padding:12px 28px;border-top:1px solid #eee;text-align:center;">
<p style="font-size:11px;color:#bbb;margin:0;">JOBLUX Admin Notifications</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

// ────────────────────────────────────────────
// HTML helpers
// ────────────────────────────────────────────

function button(label: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
<tr><td>
<a href="${url}" style="display:inline-block;background-color:#1a1a1a;color:#ffffff;font-size:13px;font-weight:500;text-decoration:none;padding:11px 28px;border-radius:3px;letter-spacing:0.3px;">${label}</a>
</td></tr>
</table>`
}

function h1(text: string): string {
  return `<p style="font-size:16px;font-weight:500;color:#1a1a1a;margin:0 0 16px;line-height:1.4;font-family:Arial,Helvetica,sans-serif;">${text}</p>`
}

function p(text: string): string {
  return `<p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;">${text}</p>`
}

function muted(text: string): string {
  return `<p style="font-size:12px;color:#aaa;line-height:1.6;margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;">${text}</p>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">`
}

function adminRow(label: string, value: string): string {
  return `<tr><td style="padding:4px 8px;font-size:13px;color:#888;width:120px;vertical-align:top;">${label}</td><td style="padding:4px 8px;font-size:14px;color:#333;">${value}</td></tr>`
}

function adminButton(label: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
<tr><td>
<a href="${url}" style="display:inline-block;background-color:#1a1a1a;color:#ffffff;font-size:13px;font-weight:500;text-decoration:none;padding:10px 20px;border-radius:3px;">${label}</a>
</td></tr>
</table>`
}

// ────────────────────────────────────────────
// Plain-text helper
// ────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h1>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>[^<]*<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&middot;/g, '\u00B7')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ────────────────────────────────────────────
// Return type
// ────────────────────────────────────────────

export interface EmailContent {
  html: string
  text: string
}

// ────────────────────────────────────────────
// AUTH EMAILS (1–2)
// ────────────────────────────────────────────

export function magicLinkEmail(url: string): EmailContent {
  const html = layout({
    content: [
      h1('Your sign-in link'),
      p('Click the button below to access your account.'),
      button('Sign in', url),
      muted('This link expires in 24 hours.'),
      muted('If you didn\'t request this, you can safely ignore this email.'),
    ].join(''),
    reason: 'You received this because a sign-in was requested for your account.',
  })
  return { html, text: `Your sign-in link\n\nClick here to sign in: ${url}\n\nThis link expires in 24 hours.\nIf you didn't request this, ignore this email.\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function emailVerificationEmail(url: string): EmailContent {
  const html = layout({
    content: [
      h1('Verify your email address'),
      p('Please confirm your email address by clicking the button below.'),
      button('Verify email', url),
      muted('If you didn\'t create an account, you can safely ignore this email.'),
    ].join(''),
    reason: 'You received this because an account was created with this email address.',
  })
  return { html, text: `Verify your email address\n\nClick here to verify: ${url}\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// ONBOARDING EMAILS (3–5)
// ────────────────────────────────────────────

export function registrationPendingEmail(params: {
  firstName?: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('We received your request'),
      p('Thank you for your interest. Your request is being reviewed and you\'ll hear from us shortly.'),
      p('In the meantime, you can explore our public intelligence — brand insights, market signals, and industry news are available without an account.'),
      button('Explore', SITE_URL),
    ].join(''),
    reason: 'You received this because you submitted an access request.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}We received your request\n\nThank you for your interest. Your request is being reviewed.\n\nExplore: ${SITE_URL}\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function welcomeApprovalEmail(params: {
  firstName?: string
  tier: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const tierDisplay = TIER_LABELS[params.tier] || params.tier.charAt(0).toUpperCase() + params.tier.slice(1)
  const isBusiness = params.tier === 'business'
  const bodyLine = isBusiness
    ? 'Your company access has been approved. You now have full access to career intelligence, salary data, industry news, brand insights, and employer services.'
    : `Your ${tierDisplay} access has been approved. You now have full access to career intelligence, salary data, brand insights, and confidential opportunities.`
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Your access is active'),
      p(bodyLine),
      p('To get started, click below to sign in. You\'ll receive a secure link to verify your email and access your dashboard.'),
      button('Sign in to get started', `${SITE_URL}/join`),
    ].join(''),
    reason: 'You received this because your access request was approved.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Your access is active\n\n${bodyLine} Sign in to get started.\n\nDashboard: ${SITE_URL}/dashboard\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function registrationDeclinedEmail(params: {
  firstName?: string
  reason?: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Update on your access request'),
      p('Thank you for your interest. After review, we are unable to approve your request at this time.'),
      params.reason ? p(params.reason) : '',
      p('If you have questions or believe this should be reconsidered, please reach out.'),
      button('Contact us', HELP_URL),
    ].join(''),
    reason: 'You received this because you submitted an access request.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Update on your access request\n\nAfter review, we are unable to approve your request at this time.\n${params.reason ? '\n' + params.reason + '\n' : ''}\nContact: ${HELP_URL}\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// EMPLOYER EMAILS (7–9)
// ────────────────────────────────────────────

export function employerPendingEmail(params: {
  firstName?: string
  companyName?: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('We received your request'),
      p(`Thank you for connecting${params.companyName ? ` on behalf of ${params.companyName}` : ''}. Your request is being reviewed and we\'ll be in touch shortly.`),
      button('Explore', SITE_URL),
    ].join(''),
    reason: 'You received this because you submitted an access request.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}We received your request\n\nThank you for connecting${params.companyName ? ` on behalf of ${params.companyName}` : ''}. We'll be in touch shortly.\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function employerApprovalEmail(params: {
  firstName?: string
  companyName?: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Your employer access is active'),
      p(`Welcome${params.companyName ? ` — ${params.companyName} is now connected` : ''}. You have access to salary benchmarks, talent intelligence, and our confidential search services.`),
      button('Sign in to get started', `${SITE_URL}/join`),
    ].join(''),
    reason: 'You received this because your employer access was approved.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Your employer access is active\n\nWelcome${params.companyName ? ` — ${params.companyName} is now connected` : ''}.\n\nDashboard: ${SITE_URL}/dashboard\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// EXECUTIVE SEARCH — EMPLOYER SIDE (10, 12–15)
// ────────────────────────────────────────────

export function briefReceivedEmail(params: {
  firstName: string
  companyName: string
}): EmailContent {
  const html = layout({
    content: [
      p(`Thank you ${params.firstName}. Your brief regarding ${params.companyName} has been received and will be reviewed privately. If follow-up is required, we will be in touch using the contact details you provided.`),
    ].join(''),
    reason: 'You received this because you submitted a search brief.',
  })
  return {
    html,
    text: `Thank you ${params.firstName}. Your brief regarding ${params.companyName} has been received and will be reviewed privately. If follow-up is required, we will be in touch using the contact details you provided.\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence`,
  }
}

export function briefAcceptedEmail(params: {
  firstName: string
  companyName: string
}): EmailContent & { subject: string } {
  const html = layout({
    content: [
      p(`${params.firstName}, your brief regarding ${params.companyName} has been accepted. We will be in touch shortly to discuss the mandate and confirm next steps.`),
    ].join(''),
    reason: 'You received this because you submitted a search brief.',
  })
  return {
    subject: 'Your brief has been accepted',
    html,
    text: `${params.firstName}, your brief regarding ${params.companyName} has been accepted. We will be in touch shortly to discuss the mandate and confirm next steps.\n\nJOBLUX LLC · Luxury Talent Intelligence`,
  }
}

export function briefInProgressEmail(params: {
  firstName: string
  companyName: string
}): EmailContent & { subject: string } {
  const html = layout({
    content: [
      p(`${params.firstName}, the search for ${params.companyName} is now underway. Our team is identifying suitable candidates and will keep you informed as the process advances.`),
    ].join(''),
    reason: 'You received this because you submitted a search brief.',
  })
  return {
    subject: 'Your search is in progress',
    html,
    text: `${params.firstName}, the search for ${params.companyName} is now underway. Our team is identifying suitable candidates and will keep you informed as the process advances.\n\nJOBLUX LLC · Luxury Talent Intelligence`,
  }
}

export function briefCompletedEmail(params: {
  firstName: string
  companyName: string
}): EmailContent & { subject: string } {
  const html = layout({
    content: [
      p(`${params.firstName}, the search for ${params.companyName} has been completed. We will follow up with a full summary and next steps in a separate communication.`),
    ].join(''),
    reason: 'You received this because you submitted a search brief.',
  })
  return {
    subject: 'Your search is complete',
    html,
    text: `${params.firstName}, the search for ${params.companyName} has been completed. We will follow up with a full summary and next steps in a separate communication.\n\nJOBLUX LLC · Luxury Talent Intelligence`,
  }
}

export function searchUpdateEmail(params: {
  firstName?: string
  roleTitle: string
  message: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1(`Update: ${params.roleTitle}`),
      p(params.message),
      button('View on dashboard', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because you have an active search.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Update: ${params.roleTitle}\n\n${params.message}\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function candidateSharedEmail(params: {
  firstName?: string
  roleTitle: string
  candidateCount: number
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Candidates ready for review'),
      p(`We\'ve prepared ${params.candidateCount} candidate${params.candidateCount > 1 ? 's' : ''} for <strong>${params.roleTitle}</strong>. Profiles are ready for your review on the platform.`),
      button('Review candidates', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because you have an active search.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Candidates ready for review\n\n${params.candidateCount} candidate(s) for ${params.roleTitle}.\n\nReview: ${SITE_URL}/dashboard\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function placementConfirmedEmployerEmail(params: {
  firstName?: string
  roleTitle: string
  candidateName: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Placement confirmed'),
      p(`We\'re pleased to confirm the placement of <strong>${params.candidateName}</strong> for <strong>${params.roleTitle}</strong>.`),
      p('Thank you for trusting us with this search. We look forward to working together again.'),
    ].join(''),
    reason: 'You received this because a placement was confirmed through your account.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Placement confirmed\n\n${params.candidateName} for ${params.roleTitle}.\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// EXECUTIVE SEARCH — CANDIDATE SIDE (16–20)
// ────────────────────────────────────────────

export function candidateMatchedEmail(params: {
  firstName?: string
  roleTitle: string
  sector?: string
  location?: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('An opportunity for you'),
      p(`Based on your profile, we\'d like to discuss a confidential opportunity: <strong>${params.roleTitle}</strong>${params.location ? ` in ${params.location}` : ''}${params.sector ? ` (${params.sector})` : ''}.`),
      p('This is a discreet enquiry — your details have not been shared. If you\'re interested, we\'ll tell you more.'),
      button('View details', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because your profile matched an active search.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}An opportunity for you\n\n${params.roleTitle}${params.location ? ' in ' + params.location : ''}${params.sector ? ' (' + params.sector + ')' : ''}\n\nThis is a discreet enquiry. View details: ${SITE_URL}/dashboard\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function interviewScheduledEmail(params: {
  firstName?: string
  roleTitle: string
  date?: string
  details?: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Interview scheduled'),
      p(`An interview has been arranged for <strong>${params.roleTitle}</strong>${params.date ? ` on ${params.date}` : ''}.`),
      params.details ? p(params.details) : '',
      button('View on dashboard', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because you have an active application.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Interview scheduled\n\n${params.roleTitle}${params.date ? ' on ' + params.date : ''}${params.details ? '\n' + params.details : ''}\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function applicationStatusEmail(params: {
  firstName?: string
  roleTitle: string
  statusMessage: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1(`Update: ${params.roleTitle}`),
      p(params.statusMessage),
      button('View details', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because you have an active application.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Update: ${params.roleTitle}\n\n${params.statusMessage}\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function offerExtendedEmail(params: {
  firstName?: string
  roleTitle: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('An offer has been extended'),
      p(`We\'re pleased to inform you that an offer has been extended for <strong>${params.roleTitle}</strong>. Please review the details on your dashboard.`),
      button('View offer', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because you have an active application.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}An offer has been extended for ${params.roleTitle}.\n\nView: ${SITE_URL}/dashboard\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function placementConfirmedCandidateEmail(params: {
  firstName?: string
  roleTitle: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Congratulations'),
      p(`Your placement for <strong>${params.roleTitle}</strong> has been confirmed. We\'re delighted to have been part of this next chapter in your career.`),
      p('We wish you every success.'),
    ].join(''),
    reason: 'You received this because a placement was confirmed through your account.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Congratulations\n\nYour placement for ${params.roleTitle} has been confirmed.\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// PROFILE & ACCOUNT (21–25)
// ────────────────────────────────────────────

export function profiluxReminderEmail(params: {
  firstName?: string
  completionPercent: number
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Complete your Profilux'),
      p(`Your profile is ${params.completionPercent}% complete. A full profile helps us match you with the right opportunities and intelligence.`),
      button('Continue building', `${SITE_URL}/dashboard/candidate/profilux`),
    ].join(''),
    reason: 'You received this because your profile is incomplete.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Complete your Profilux\n\nYour profile is ${params.completionPercent}% complete.\n\nContinue: ${SITE_URL}/dashboard/candidate/profilux\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function profiluxCompleteEmail(params: {
  firstName?: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Your Profilux is complete'),
      p('Your profile is now fully built. You\'re visible to our search team and eligible for the most relevant opportunities.'),
      button('View your profile', `${SITE_URL}/dashboard/candidate/profilux`),
    ].join(''),
    reason: 'You received this because your Profilux reached 100%.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Your Profilux is complete\n\nYou're now visible to our search team.\n\nView: ${SITE_URL}/dashboard/candidate/profilux\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function profileSharedEmail(params: {
  senderName: string
  profileUrl: string
}): EmailContent {
  const html = layout({
    content: [
      h1('A profile has been shared with you'),
      p(`<strong>${params.senderName}</strong> shared their profile with you.`),
      button('View profile', params.profileUrl),
    ].join(''),
    reason: 'You received this because someone shared their profile with you.',
  })
  return { html, text: `A profile has been shared with you\n\n${params.senderName} shared their profile.\n\nView: ${params.profileUrl}\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function dataExportEmail(params: {
  firstName?: string
  downloadUrl: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Your data export is ready'),
      p('The data you requested is ready to download. This link is valid for 48 hours.'),
      button('Download your data', params.downloadUrl),
    ].join(''),
    reason: 'You received this because you requested a data export.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Your data export is ready\n\nDownload: ${params.downloadUrl}\n\nThis link is valid for 48 hours.\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function accountDeletedEmail(params: {
  firstName?: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Your account has been deleted'),
      p('Your account and all associated data have been permanently removed.'),
      p('If this was a mistake, please contact us within 30 days.'),
    ].join(''),
    reason: 'You received this because your account was deleted.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Your account has been deleted\n\nAll data has been permanently removed. Contact us within 30 days if this was a mistake.\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// CONTRIBUTIONS (26–28)
// ────────────────────────────────────────────

export function contributionSubmittedEmail(params: {
  firstName?: string
  contributionType: string
}): EmailContent {
  const typeLabels: Record<string, string> = {
    wikilux_insight: 'brand insight',
    salary_data: 'salary data',
    interview_experience: 'interview experience',
    insider_voice: 'insider voice',
    brand_correction: 'brand correction',
  }
  const typeLabel = typeLabels[params.contributionType] || 'contribution'
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Thank you for your contribution'),
      p(`Your ${typeLabel} has been submitted and is under review.`),
      button('View your dashboard', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because you submitted a contribution.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Thank you for your contribution\n\nYour ${typeLabel} is under review.\n\nDashboard: ${SITE_URL}/dashboard\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function contributionApprovedEmail(params: {
  firstName?: string
  contributionType: string
}): EmailContent {
  const typeLabels: Record<string, string> = {
    wikilux_insight: 'brand insight',
    salary_data: 'salary data',
    interview_experience: 'interview experience',
    insider_voice: 'insider voice',
    brand_correction: 'brand correction',
  }
  const typeLabel = typeLabels[params.contributionType] || 'contribution'
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Your contribution is live'),
      p(`Your ${typeLabel} has been approved and is now part of the intelligence platform. Thank you for contributing.`),
    ].join(''),
    reason: 'You received this because a contribution you submitted was reviewed.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Your contribution is live\n\nYour ${typeLabel} has been approved.\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function contributionRejectedEmail(params: {
  firstName?: string
  contributionType: string
  reason?: string
}): EmailContent {
  const typeLabels: Record<string, string> = {
    wikilux_insight: 'brand insight',
    salary_data: 'salary data',
    interview_experience: 'interview experience',
    insider_voice: 'insider voice',
    brand_correction: 'brand correction',
  }
  const typeLabel = typeLabels[params.contributionType] || 'contribution'
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Update on your contribution'),
      p(`Your ${typeLabel} was not published at this time.`),
      params.reason ? p(params.reason) : '',
    ].join(''),
    reason: 'You received this because a contribution you submitted was reviewed.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Update on your contribution\n\nYour ${typeLabel} was not published.\n${params.reason ? '\n' + params.reason + '\n' : ''}\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// SOCIAL & INVITES (29–31)
// ────────────────────────────────────────────

export function inviteColleagueEmail(params: {
  inviterName: string
  inviteUrl: string
}): EmailContent {
  const html = layout({
    content: [
      h1('You\'ve been invited'),
      p(`<strong>${params.inviterName}</strong> thinks you\'d benefit from a confidential career intelligence platform for the luxury industry.`),
      button('Accept invitation', params.inviteUrl),
    ].join(''),
    reason: `You received this because ${params.inviterName} invited you.`,
  })
  return { html, text: `You've been invited\n\n${params.inviterName} thinks you'd benefit from a confidential career intelligence platform for the luxury industry.\n\nAccept: ${params.inviteUrl}\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function inviteAcceptedEmail(params: {
  inviterFirstName?: string
  newMemberName: string
}): EmailContent {
  const greeting = params.inviterFirstName ? `${params.inviterFirstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Your colleague joined'),
      p(`<strong>${params.newMemberName}</strong> accepted your invitation and is now on the platform.`),
    ].join(''),
    reason: 'You received this because someone you invited joined the platform.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Your colleague joined\n\n${params.newMemberName} accepted your invitation.\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function sendToFriendEmail(params: {
  senderName: string
  articleTitle: string
  articleUrl: string
  personalNote?: string
}): EmailContent {
  const html = layout({
    content: [
      h1(`${params.senderName} shared an article with you`),
      p(`<strong>${params.articleTitle}</strong>`),
      params.personalNote ? p(`<em>"${params.personalNote}"</em>`) : '',
      button('Read article', params.articleUrl),
    ].join(''),
    reason: `You received this because ${params.senderName} shared an article with you.`,
  })
  return { html, text: `${params.senderName} shared an article with you\n\n${params.articleTitle}\n${params.personalNote ? '\n"' + params.personalNote + '"\n' : ''}\nRead: ${params.articleUrl}\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// ESCAPE (32–33)
// ────────────────────────────────────────────

export function escapeConsultationEmail(params: {
  firstName?: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('We received your travel request'),
      p('Thank you for reaching out through Escape. A travel advisor will review your request and be in touch within 48 hours.'),
      divider(),
      muted('Travel advisory services provided by independent advisors affiliated with Fora Travel, Inc.'),
    ].join(''),
    reason: 'You received this because you submitted a travel request through Escape.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}We received your travel request\n\nA travel advisor will be in touch within 48 hours.\n\nTravel advisory by Fora Travel, Inc.\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// NEWSLETTER (34)
// ────────────────────────────────────────────

export function theBriefEmail(params: {
  date: string
  bodyHtml: string
  escapePick?: {
    destination: string
    teaser: string
    imageUrl?: string
    url: string
  }
}): EmailContent {
  const escapeSection = params.escapePick ? [
    divider(),
    `<p style="font-size:11px;color:#B8975C;letter-spacing:2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;margin:0 0 8px;">Escape pick</p>`,
    params.escapePick.imageUrl ? `<img src="${params.escapePick.imageUrl}" alt="${params.escapePick.destination}" style="width:100%;max-width:528px;height:auto;border-radius:3px;margin:0 0 12px;" />` : '',
    `<p style="font-size:16px;color:#1a1a1a;font-weight:500;margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;">${params.escapePick.destination}</p>`,
    `<p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;">${params.escapePick.teaser}</p>`,
    button('Explore', params.escapePick.url),
  ].join('') : ''

  const html = layout({
    content: [
      `<p style="font-size:11px;color:#B8975C;font-family:Arial,Helvetica,sans-serif;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">The Brief</p>`,
      `<p style="font-size:20px;color:#1a1a1a;line-height:1.4;margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;">Luxury intelligence, biweekly.</p>`,
      `<p style="font-size:12px;color:#999;margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;">${params.date}</p>`,
      divider(),
      `<div style="font-size:14px;color:#555;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">${params.bodyHtml}</div>`,
      escapeSection,
    ].join(''),
    reason: 'You\'re receiving this because you have access.',
    showUnsubscribe: true,
  })
  return {
    html,
    text: `THE BRIEF \u2014 Luxury intelligence, biweekly.\n${params.date}\n\n${stripHtml(params.bodyHtml)}${params.escapePick ? '\n\n---\nEscape: ' + params.escapePick.destination + '\n' + params.escapePick.teaser + '\n' + params.escapePick.url : ''}\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence\nUnsubscribe: ${SITE_URL}/unsubscribe`,
  }
}

// ────────────────────────────────────────────
// CONTACT FORM (35)
// ────────────────────────────────────────────

export function contactConfirmationEmail(params: {
  firstName?: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('We received your message'),
      p('Our team will review your message and get back to you shortly.'),
    ].join(''),
    reason: 'You received this because you sent a message through the help page.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}We received your message\n\nOur team will get back to you shortly.\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// ADMIN ALERTS (6, 9, 11, etc.)
// ────────────────────────────────────────────

export function adminNewMemberEmail(params: {
  name: string
  email: string
  tier: string
  company?: string
  jobTitle?: string
  registrationDate: string
}): EmailContent {
  const html = adminLayout([
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New access request</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Name', params.name),
    adminRow('Email', params.email),
    adminRow('Tier', params.tier),
    params.jobTitle ? adminRow('Title', params.jobTitle) : '',
    params.company ? adminRow('Company', params.company) : '',
    adminRow('Date', params.registrationDate),
    `</table>`,
    adminButton('Review in admin', `${SITE_URL}/admin`),
  ].join(''))
  return {
    html,
    text: `New JOBLUX access request — ${params.name}\nTier: ${params.tier}\nEmail: ${params.email}${params.jobTitle ? '\nTitle: ' + params.jobTitle : ''}${params.company && params.company !== 'Not provided' ? '\nCompany: ' + params.company : ''}\nDate: ${params.registrationDate}\n\nReview: ${SITE_URL}/admin`,
  }
}

export function adminNewEmployerEmail(params: {
  name: string
  email: string
  companyName: string
  orgType?: string
  jobTitle?: string
}): EmailContent {
  const html = adminLayout([
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New employer request</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Name', params.name),
    adminRow('Email', params.email),
    adminRow('Company', params.companyName),
    params.orgType ? adminRow('Type', params.orgType) : '',
    params.jobTitle ? adminRow('Title', params.jobTitle) : '',
    `</table>`,
    adminButton('Review in admin', `${SITE_URL}/admin`),
  ].join(''))
  return {
    html,
    text: `New JOBLUX access request — ${params.name} (${params.companyName})\nEmail: ${params.email}${params.orgType ? '\nType: ' + params.orgType : ''}${params.jobTitle ? '\nTitle: ' + params.jobTitle : ''}\n\nReview: ${SITE_URL}/admin`,
  }
}

export function adminNewBriefEmail(params: {
  companyName: string
  briefType: string
  urgency: string
  confidentiality: string
  contactName: string
  contactEmail: string
  summary: string
}): EmailContent {
  const truncated = params.summary.length > 200 ? params.summary.slice(0, 200) + '…' : params.summary
  const html = adminLayout([
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New business brief</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Company', params.companyName),
    adminRow('Brief type', params.briefType),
    adminRow('Urgency', params.urgency),
    adminRow('Confidentiality', params.confidentiality),
    adminRow('Contact', `${params.contactName} (${params.contactEmail})`),
    `</table>`,
    `<div style="margin:16px 0;padding:12px;background:#f9f9f9;border-left:3px solid #B8975C;font-size:14px;color:#555;line-height:1.6;">${truncated}</div>`,
    adminButton('View in admin', `${SITE_URL}/admin/business-briefs`),
  ].join(''))
  return {
    html,
    text: `New business brief\n\nCompany: ${params.companyName}\nBrief type: ${params.briefType}\nUrgency: ${params.urgency}\nConfidentiality: ${params.confidentiality}\nContact: ${params.contactName} (${params.contactEmail})\n\nSummary:\n${truncated}\n\nView: ${SITE_URL}/admin/business-briefs`,
  }
}

export function adminNewContributionEmail(params: {
  contributionType: string
  contributorName: string
  brand?: string
}): EmailContent {
  const typeLabels: Record<string, string> = {
    wikilux_insight: 'Brand Insight',
    salary_data: 'Salary Data',
    interview_experience: 'Interview Experience',
    insider_voice: 'Insider Voice',
    brand_correction: 'Brand Correction',
  }
  const typeLabel = typeLabels[params.contributionType] || params.contributionType
  const html = adminLayout([
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New contribution</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Type', typeLabel),
    adminRow('From', params.contributorName),
    params.brand ? adminRow('Brand', params.brand) : '',
    `</table>`,
    adminButton('Review in admin', `${SITE_URL}/admin/contributions`),
  ].join(''))
  return {
    html,
    text: `New contribution: ${typeLabel} from ${params.contributorName}${params.brand ? ' (' + params.brand + ')' : ''}\n\nReview: ${SITE_URL}/admin/contributions`,
  }
}

export function adminNewEscapeEmail(params: {
  name: string
  email: string
  tripType?: string
  destination?: string
  budget?: string
  dates?: string
  tier?: string
}): EmailContent {
  const html = adminLayout([
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New travel request</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Name', params.name),
    adminRow('Email', params.email),
    params.tripType ? adminRow('Type', params.tripType) : '',
    params.destination ? adminRow('Destination', params.destination) : '',
    params.budget ? adminRow('Budget', params.budget) : '',
    params.dates ? adminRow('Dates', params.dates) : '',
    adminRow('Tier', params.tier || 'Visitor'),
    `</table>`,
    adminButton('View in admin', `${SITE_URL}/admin/consultations`),
  ].join(''))
  return {
    html,
    text: `New travel request: ${params.name} \u2014 ${params.destination || 'TBD'}\nEmail: ${params.email}${params.tripType ? '\nType: ' + params.tripType : ''}${params.budget ? '\nBudget: ' + params.budget : ''}${params.dates ? '\nDates: ' + params.dates : ''}\nTier: ${params.tier || 'Visitor'}\n\nView: ${SITE_URL}/admin/consultations`,
  }
}

export function adminNewContactEmail(params: {
  name: string
  email: string
  subject: string
  messagePreview: string
}): EmailContent {
  const html = adminLayout([
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New contact message</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Name', params.name),
    adminRow('Email', params.email),
    adminRow('Subject', params.subject),
    `</table>`,
    `<div style="margin:16px 0;padding:12px;background:#f9f9f9;border-left:3px solid #B8975C;font-size:14px;color:#555;line-height:1.6;">${params.messagePreview}</div>`,
    adminButton('View in admin', `${SITE_URL}/admin/contact`),
  ].join(''))
  return {
    html,
    text: `New contact: ${params.name} \u2014 ${params.subject}\nEmail: ${params.email}\n\n${params.messagePreview}\n\nView: ${SITE_URL}/admin/contact`,
  }
}

export function adminNewApplicationEmail(params: {
  applicantName: string
  applicantEmail: string
  tier: string
  assignmentTitle: string
}): EmailContent {
  const html = adminLayout([
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New application</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Applicant', params.applicantName),
    adminRow('Email', params.applicantEmail),
    adminRow('Tier', params.tier),
    adminRow('Position', params.assignmentTitle),
    `</table>`,
    adminButton('Review in admin', `${SITE_URL}/admin/assignments`),
  ].join(''))
  return {
    html,
    text: `New application: ${params.applicantName} for ${params.assignmentTitle}\nEmail: ${params.applicantEmail}\nTier: ${params.tier}\n\nReview: ${SITE_URL}/admin/assignments`,
  }
}

// ────────────────────────────────────────────
// Legacy compatibility wrappers
// ────────────────────────────────────────────

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
  return layout({
    content: [
      `<div style="font-size:14px;color:#555;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">${bodyHtml}</div>`,
      ctaUrl ? button(ctaLabel || 'View on dashboard', ctaUrl) : '',
    ].join(''),
    reason: 'You received this email.',
  })
}

export function candidateNotificationEmail(body: string): string {
  return wrapInEmailTemplate({
    body,
    ctaUrl: `${SITE_URL}/dashboard/messages`,
    ctaLabel: 'View messages',
  })
}

export function clientNotificationEmail(body: string): string {
  return wrapInEmailTemplate({ body })
}

export function applicationConfirmationEmail(params: {
  firstName?: string
  assignmentTitle: string
}): EmailContent {
  const greeting = params.firstName ? `${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Application received'),
      p(`Your profile has been submitted for <strong>${params.assignmentTitle}</strong>. You can track the status on your dashboard.`),
      button('View dashboard', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because you applied for a position.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Application received\n\nSubmitted for ${params.assignmentTitle}.\n\nDashboard: ${SITE_URL}/dashboard\n\nJOBLUX LLC \u00B7 Luxury Talent Intelligence` }
}

export function recruitmentUpdateEmail(params: {
  firstName?: string
  assignmentTitle: string
  statusMessage: string
}): EmailContent {
  return applicationStatusEmail({
    firstName: params.firstName,
    roleTitle: params.assignmentTitle,
    statusMessage: params.statusMessage,
  })
}

// ────────────────────────────────────────────
// Export admin email address
// ────────────────────────────────────────────
export const ADMIN_ALERT_EMAIL = ADMIN_EMAIL
export const RECRUITING_ALERT_EMAIL = 'alex@joblux.com'
// v2
