/**
 * JOBLUX branded email templates.
 * All 17 templates return { html, text } for SES dual-format sending.
 *
 * Design tokens:
 *   Black header:  #1a1a1a
 *   Gold accent:   #B8975C
 *   Body bg:       #f5f5f5
 *   Card bg:       #ffffff
 *   Text:          #333333
 *   Muted:         #888888
 *   Button:        bg #1a1a1a, color #ffffff, radius 4px
 */

const SITE_URL = 'https://joblux.com'
const HELP_URL = `${SITE_URL}/help`
const ADMIN_EMAIL = 'mo@joblux.com'

// ────────────────────────────────────────────
// Master layout
// ────────────────────────────────────────────

interface LayoutOptions {
  content: string
  /** Reason line at bottom: "You received this email because…" */
  reason: string
  /** Show unsubscribe link (newsletter only) */
  showUnsubscribe?: boolean
}

function layout({ content, reason, showUnsubscribe }: LayoutOptions): string {
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

<!-- Container -->
<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:0;">

<!-- Header -->
<tr><td style="background-color:#1a1a1a;padding:24px 32px;text-align:center;">
<div style="font-family:'Gill Sans','Gill Sans MT',Calibri,Arial,sans-serif;font-size:26px;font-weight:600;color:#ffffff;letter-spacing:4px;">JOBLUX</div>
<div style="font-size:10px;color:#B8975C;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">Luxury Talent Intelligence</div>
</td></tr>

<!-- Body -->
<tr><td style="padding:36px 32px 28px;">
${content}
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 32px;border-top:1px solid #e8e8e8;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr><td style="text-align:center;">
<p style="font-size:13px;color:#888;margin:0 0 8px;"><a href="${HELP_URL}" style="color:#B8975C;text-decoration:none;">Questions? Visit our help centre</a></p>
${showUnsubscribe ? `<p style="font-size:12px;color:#aaa;margin:0 0 8px;"><a href="${SITE_URL}/unsubscribe" style="color:#aaa;text-decoration:underline;">Unsubscribe</a></p>` : ''}
<p style="font-size:11px;color:#bbb;margin:0 0 4px;">JOBLUX LLC &middot; Luxury Talent Intelligence</p>
<p style="font-size:11px;color:#ccc;margin:0;">${reason}</p>
</td></tr>
</table>
</td></tr>

</table>
<!-- /Container -->

</td></tr>
</table>
</body>
</html>`
}

/** Standard CTA button */
function button(label: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
<tr><td align="center">
<a href="${url}" style="display:inline-block;background-color:#1a1a1a;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:4px;letter-spacing:0.5px;">${label}</a>
</td></tr>
</table>`
}

/** Heading */
function h1(text: string): string {
  return `<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:#1a1a1a;margin:0 0 16px;line-height:1.4;">${text}</h1>`
}

/** Body paragraph */
function p(text: string): string {
  return `<p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">${text}</p>`
}

/** Muted paragraph */
function muted(text: string): string {
  return `<p style="font-size:13px;color:#888;line-height:1.5;margin:0 0 12px;">${text}</p>`
}

/** Gold divider */
function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e8e8e8;margin:24px 0;">`
}

// ────────────────────────────────────────────
// Plain-text helper — strips HTML to text
// ────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h1>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>[^<]*<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&middot;/g, '·')
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

/** #1 Magic link sign-in */
export function magicLinkEmail(url: string): EmailContent {
  const html = layout({
    content: [
      h1('Sign in to JOBLUX'),
      p('Click the button below to sign in to your account.'),
      button('Sign In', url),
      muted('This link expires in 24 hours.'),
      muted('If you didn\'t request this, you can safely ignore this email.'),
    ].join(''),
    reason: 'You received this because a sign-in was requested for your account.',
  })
  return { html, text: `Sign in to JOBLUX\n\nClick here to sign in: ${url}\n\nThis link expires in 24 hours.\nIf you didn't request this, ignore this email.\n\nJOBLUX LLC · Luxury Talent Intelligence` }
}

/** #2 Email verification */
export function emailVerificationEmail(url: string): EmailContent {
  const html = layout({
    content: [
      h1('Verify your email address'),
      p('Please confirm your email address by clicking the button below.'),
      button('Verify Email', url),
      muted('If you didn\'t create an account on JOBLUX, you can safely ignore this email.'),
    ].join(''),
    reason: 'You received this because an account was created with this email address.',
  })
  return { html, text: `Verify your email address\n\nClick here to verify: ${url}\n\nIf you didn't create an account on JOBLUX, ignore this email.\n\nJOBLUX LLC · Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// ONBOARDING EMAILS (3–4)
// ────────────────────────────────────────────

/** #3 Welcome on approval */
export function welcomeApprovalEmail(params: {
  firstName?: string
  tier: string
}): EmailContent {
  const greeting = params.firstName ? `Dear ${params.firstName},` : ''
  const tierDisplay = params.tier.charAt(0).toUpperCase() + params.tier.slice(1)
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Welcome to JOBLUX'),
      p(`Your ${tierDisplay} access is now active. You have full access to confidential positions, salary intelligence, WikiLux brand insights, and all member features.`),
      p('Your dashboard is ready — explore what\'s available to you.'),
      button('Explore Your Dashboard', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because your JOBLUX access request was approved.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Welcome to JOBLUX\n\nYour ${tierDisplay} access is now active. You have full access to confidential positions, salary intelligence, WikiLux brand insights, and all member features.\n\nExplore your dashboard: ${SITE_URL}/dashboard\n\nJOBLUX LLC · Luxury Talent Intelligence` }
}

/** #4 Registration declined */
export function registrationDeclinedEmail(params: {
  firstName?: string
  reason?: string
}): EmailContent {
  const greeting = params.firstName ? `Dear ${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Update on your JOBLUX access request'),
      p('Thank you for your interest in JOBLUX. After careful review, we are unable to approve your access request at this time.'),
      params.reason ? p(params.reason) : '',
      p('We appreciate your understanding. If you have questions or believe this decision should be reconsidered, please don\'t hesitate to reach out.'),
      button('Visit Help Centre', HELP_URL),
    ].join(''),
    reason: 'You received this because you submitted an access request to JOBLUX.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Update on your JOBLUX access request\n\nThank you for your interest in JOBLUX. After careful review, we are unable to approve your access request at this time.\n${params.reason ? '\n' + params.reason + '\n' : ''}\nIf you have questions, visit our help centre: ${HELP_URL}\n\nJOBLUX LLC · Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// CONTRIBUTION EMAILS (5–7)
// ────────────────────────────────────────────

/** #5 Contribution submitted confirmation */
export function contributionSubmittedEmail(params: {
  firstName?: string
  contributionType: string
}): EmailContent {
  const typeLabels: Record<string, string> = {
    wikilux_insight: 'brand insight',
    salary_data: 'salary data',
    interview_experience: 'interview experience',
  }
  const typeLabel = typeLabels[params.contributionType] || 'contribution'
  const greeting = params.firstName ? `Dear ${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Thank you for your contribution'),
      p(`Your ${typeLabel} has been submitted and is under review. Our team carefully reviews every contribution to maintain the quality of JOBLUX intelligence.`),
      p('We\'ll notify you once your contribution has been reviewed.'),
      button('View Your Dashboard', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because you submitted a contribution on JOBLUX.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Thank you for your contribution\n\nYour ${typeLabel} has been submitted and is under review. We'll notify you once it's been reviewed.\n\nView your dashboard: ${SITE_URL}/dashboard\n\nJOBLUX LLC · Luxury Talent Intelligence` }
}

/** #6 Contribution approved */
export function contributionApprovedEmail(params: {
  firstName?: string
  contributionType: string
  pointsAwarded: number
}): EmailContent {
  const typeLabels: Record<string, string> = {
    wikilux_insight: 'brand insight',
    salary_data: 'salary data',
    interview_experience: 'interview experience',
  }
  const typeLabel = typeLabels[params.contributionType] || 'contribution'
  const greeting = params.firstName ? `Dear ${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Your contribution is now live'),
      p(`Thank you for contributing to JOBLUX intelligence. Your ${typeLabel} has been approved and is now available to the community.`),
      p(`You\'ve earned <strong style="color:#B8975C;">${params.pointsAwarded} points</strong> for this contribution.`),
      button('View Your Contributions', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because a contribution you submitted on JOBLUX was reviewed.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Your contribution is now live\n\nYour ${typeLabel} has been approved. You've earned ${params.pointsAwarded} points.\n\nView your contributions: ${SITE_URL}/dashboard\n\nJOBLUX LLC · Luxury Talent Intelligence` }
}

/** #7 Contribution rejected */
export function contributionRejectedEmail(params: {
  firstName?: string
  contributionType: string
  reason?: string
}): EmailContent {
  const typeLabels: Record<string, string> = {
    wikilux_insight: 'brand insight',
    salary_data: 'salary data',
    interview_experience: 'interview experience',
  }
  const typeLabel = typeLabels[params.contributionType] || 'contribution'
  const greeting = params.firstName ? `Dear ${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Update on your contribution'),
      p(`Thank you for submitting a ${typeLabel}. After review, we were unable to publish this contribution at this time.`),
      params.reason ? p(params.reason) : '',
      p('We value your engagement with the JOBLUX community and encourage you to continue contributing.'),
      button('Visit Help Centre', HELP_URL),
    ].join(''),
    reason: 'You received this because a contribution you submitted on JOBLUX was reviewed.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Update on your contribution\n\nYour ${typeLabel} was not published at this time.\n${params.reason ? '\n' + params.reason + '\n' : ''}\nVisit our help centre: ${HELP_URL}\n\nJOBLUX LLC · Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// ASSIGNMENT / RECRUITMENT EMAILS (8–9)
// ────────────────────────────────────────────

/** #8 Assignment application confirmation */
export function applicationConfirmationEmail(params: {
  firstName?: string
  assignmentTitle: string
}): EmailContent {
  const greeting = params.firstName ? `Dear ${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Application received'),
      p(`Your profile has been submitted for <strong>${params.assignmentTitle}</strong>.`),
      p('You can track the status of your application on your dashboard.'),
      button('View Dashboard', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because you applied for a position on JOBLUX.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Application received\n\nYour profile has been submitted for ${params.assignmentTitle}. Track the status on your dashboard.\n\n${SITE_URL}/dashboard\n\nJOBLUX LLC · Luxury Talent Intelligence` }
}

/** #9 Recruitment update (flexible status email) */
export function recruitmentUpdateEmail(params: {
  firstName?: string
  assignmentTitle: string
  statusMessage: string
}): EmailContent {
  const greeting = params.firstName ? `Dear ${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('Update on your candidacy'),
      p(`Regarding your application for <strong>${params.assignmentTitle}</strong>:`),
      p(params.statusMessage),
      button('View Details', `${SITE_URL}/dashboard`),
    ].join(''),
    reason: 'You received this because you have an active application on JOBLUX.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}Update on your candidacy\n\nRegarding ${params.assignmentTitle}:\n\n${params.statusMessage}\n\nView details: ${SITE_URL}/dashboard\n\nJOBLUX LLC · Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// ESCAPE EMAIL (10)
// ────────────────────────────────────────────

/** #10 Escape consultation confirmation */
export function escapeConsultationEmail(params: {
  firstName?: string
}): EmailContent {
  const greeting = params.firstName ? `Dear ${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('We received your travel request'),
      p('Thank you for reaching out through JOBLUX Escape.'),
      p('A travel advisor will review your request and contact you within 48 hours for a complimentary consultation.'),
      divider(),
      muted('Travel advisory services provided by independent advisors affiliated with Fora Travel, Inc.'),
    ].join(''),
    reason: 'You received this because you submitted a travel request through JOBLUX Escape.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}We received your travel request\n\nThank you for reaching out through JOBLUX Escape. A travel advisor will review your request and contact you within 48 hours for a complimentary consultation.\n\nTravel advisory services provided by independent advisors affiliated with Fora Travel, Inc.\n\nJOBLUX LLC · Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// SUPPORT EMAIL (11)
// ────────────────────────────────────────────

/** #11 Contact form confirmation */
export function contactConfirmationEmail(params: {
  firstName?: string
  referenceNumber?: string
}): EmailContent {
  const greeting = params.firstName ? `Dear ${params.firstName},` : ''
  const html = layout({
    content: [
      greeting ? p(greeting) : '',
      h1('We received your message'),
      p('Our team will review your message and get back to you shortly.'),
      params.referenceNumber ? muted(`Reference: ${params.referenceNumber}`) : '',
    ].join(''),
    reason: 'You received this because you sent a message through the JOBLUX contact form.',
  })
  return { html, text: `${greeting ? greeting + '\n\n' : ''}We received your message\n\nOur team will get back to you shortly.${params.referenceNumber ? '\nReference: ' + params.referenceNumber : ''}\n\nJOBLUX LLC · Luxury Talent Intelligence` }
}

// ────────────────────────────────────────────
// ADMIN ALERT EMAILS (12–16)
// ────────────────────────────────────────────

function adminLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f5f5;">
<tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;">
<tr><td style="background-color:#1a1a1a;padding:16px 24px;">
<span style="font-family:Arial,sans-serif;font-size:18px;color:#ffffff;letter-spacing:3px;font-weight:600;">JOBLUX</span>
<span style="font-size:11px;color:#B8975C;margin-left:12px;">Admin Alert</span>
</td></tr>
<tr><td style="padding:24px;">
${content}
</td></tr>
<tr><td style="padding:12px 24px;border-top:1px solid #eee;text-align:center;">
<p style="font-size:11px;color:#bbb;margin:0;">JOBLUX Admin Notifications</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function adminRow(label: string, value: string): string {
  return `<tr><td style="padding:4px 8px;font-size:13px;color:#888;width:120px;vertical-align:top;">${label}</td><td style="padding:4px 8px;font-size:14px;color:#333;">${value}</td></tr>`
}

function adminButton(label: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
<tr><td>
<a href="${url}" style="display:inline-block;background-color:#1a1a1a;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:4px;">${label}</a>
</td></tr>
</table>`
}

/** #12 Admin: New member pending approval */
export function adminNewMemberEmail(params: {
  name: string
  email: string
  tier: string
  company?: string
  registrationDate: string
}): EmailContent {
  const html = adminLayout([
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New Access Request</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Name', params.name),
    adminRow('Email', params.email),
    adminRow('Tier', params.tier),
    params.company ? adminRow('Company', params.company) : '',
    adminRow('Registered', params.registrationDate),
    `</table>`,
    adminButton('Review in Admin', `${SITE_URL}/admin/profiles`),
  ].join(''))
  return {
    html,
    text: `New access request: ${params.name} (${params.tier})\n\nEmail: ${params.email}${params.company ? '\nCompany: ' + params.company : ''}\nRegistered: ${params.registrationDate}\n\nReview: ${SITE_URL}/admin/profiles`,
  }
}

/** #13 Admin: New contribution submitted */
export function adminNewContributionEmail(params: {
  contributionType: string
  contributorName: string
  brand?: string
}): EmailContent {
  const typeLabels: Record<string, string> = {
    wikilux_insight: 'Brand Insight',
    salary_data: 'Salary Data',
    interview_experience: 'Interview Experience',
  }
  const typeLabel = typeLabels[params.contributionType] || params.contributionType
  const html = adminLayout([
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New Contribution</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Type', typeLabel),
    adminRow('From', params.contributorName),
    params.brand ? adminRow('Brand', params.brand) : '',
    `</table>`,
    adminButton('Review in Admin', `${SITE_URL}/admin/contributions`),
  ].join(''))
  return {
    html,
    text: `New contribution: ${typeLabel} from ${params.contributorName}${params.brand ? ' (' + params.brand + ')' : ''}\n\nReview: ${SITE_URL}/admin/contributions`,
  }
}

/** #14 Admin: New assignment application */
export function adminNewApplicationEmail(params: {
  applicantName: string
  applicantEmail: string
  tier: string
  assignmentTitle: string
}): EmailContent {
  const html = adminLayout([
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New Application</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Applicant', params.applicantName),
    adminRow('Email', params.applicantEmail),
    adminRow('Tier', params.tier),
    adminRow('Position', params.assignmentTitle),
    `</table>`,
    adminButton('Review in Admin', `${SITE_URL}/admin/assignments`),
  ].join(''))
  return {
    html,
    text: `New application: ${params.applicantName} for ${params.assignmentTitle}\n\nEmail: ${params.applicantEmail}\nTier: ${params.tier}\n\nReview: ${SITE_URL}/admin/assignments`,
  }
}

/** #15 Admin: New Escape consultation */
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
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New Travel Request</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Name', params.name),
    adminRow('Email', params.email),
    params.tripType ? adminRow('Trip Type', params.tripType) : '',
    params.destination ? adminRow('Destination', params.destination) : '',
    params.budget ? adminRow('Budget', params.budget) : '',
    params.dates ? adminRow('Dates', params.dates) : '',
    adminRow('Tier', params.tier || 'Visitor'),
    `</table>`,
    adminButton('View in Admin', `${SITE_URL}/admin/consultations`),
  ].join(''))
  return {
    html,
    text: `New travel request: ${params.name} — ${params.destination || 'TBD'}\n\nEmail: ${params.email}${params.tripType ? '\nType: ' + params.tripType : ''}${params.budget ? '\nBudget: ' + params.budget : ''}${params.dates ? '\nDates: ' + params.dates : ''}\nTier: ${params.tier || 'Visitor'}\n\nView: ${SITE_URL}/admin/consultations`,
  }
}

/** #16 Admin: New contact message */
export function adminNewContactEmail(params: {
  name: string
  email: string
  subject: string
  messagePreview: string
}): EmailContent {
  const html = adminLayout([
    `<h2 style="font-size:16px;color:#1a1a1a;margin:0 0 16px;">New Contact Message</h2>`,
    `<table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">`,
    adminRow('Name', params.name),
    adminRow('Email', params.email),
    adminRow('Subject', params.subject),
    `</table>`,
    `<div style="margin:16px 0;padding:12px;background:#f9f9f9;border-left:3px solid #B8975C;font-size:14px;color:#555;line-height:1.6;">${params.messagePreview}</div>`,
    adminButton('View in Admin', `${SITE_URL}/admin/contact`),
  ].join(''))
  return {
    html,
    text: `New contact: ${params.name} — ${params.subject}\n\nEmail: ${params.email}\n\n${params.messagePreview}\n\nView: ${SITE_URL}/admin/contact`,
  }
}

// ────────────────────────────────────────────
// NEWSLETTER (17)
// ────────────────────────────────────────────

/** #17 The Brief — newsletter template */
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
    `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px;">`,
    `<tr><td>`,
    `<p style="font-size:11px;color:#B8975C;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Escape Pick</p>`,
    params.escapePick.imageUrl ? `<img src="${params.escapePick.imageUrl}" alt="${params.escapePick.destination}" style="width:100%;max-width:536px;height:auto;border-radius:4px;margin:0 0 12px;" />` : '',
    `<p style="font-size:17px;color:#1a1a1a;font-weight:600;margin:0 0 8px;">${params.escapePick.destination}</p>`,
    `<p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 12px;">${params.escapePick.teaser}</p>`,
    button('Explore', params.escapePick.url),
    `</td></tr>`,
    `</table>`,
  ].join('') : ''

  const html = layout({
    content: [
      `<div style="text-align:center;margin-bottom:24px;">`,
      `<p style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#1a1a1a;letter-spacing:3px;margin:0 0 4px;">THE BRIEF</p>`,
      `<p style="font-size:13px;color:#888;margin:0 0 2px;">Luxury intelligence, biweekly.</p>`,
      `<p style="font-size:12px;color:#B8975C;margin:0;">${params.date}</p>`,
      `</div>`,
      divider(),
      `<div style="font-size:15px;color:#333;line-height:1.7;">${params.bodyHtml}</div>`,
      escapeSection,
    ].join(''),
    reason: 'You\'re receiving this because you have JOBLUX access.',
    showUnsubscribe: true,
  })
  return {
    html,
    text: `THE BRIEF — Luxury intelligence, biweekly.\n${params.date}\n\n${stripHtml(params.bodyHtml)}${params.escapePick ? '\n\n---\nEscape Pick: ' + params.escapePick.destination + '\n' + params.escapePick.teaser + '\n' + params.escapePick.url : ''}\n\nJOBLUX LLC · Luxury Talent Intelligence\nUnsubscribe: ${SITE_URL}/unsubscribe`,
  }
}

// ────────────────────────────────────────────
// Legacy compatibility wrappers
// ────────────────────────────────────────────

/** Wrap a message body in the JOBLUX branded email template (legacy) */
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
  const html = layout({
    content: [
      `<div style="font-size:15px;color:#333;line-height:1.7;">${bodyHtml}</div>`,
      ctaUrl ? button(ctaLabel || 'View on JOBLUX', ctaUrl) : '',
    ].join(''),
    reason: 'You received this email from JOBLUX.',
  })
  return html
}

/** Generate notification email for a candidate receiving a message */
export function candidateNotificationEmail(body: string): string {
  return wrapInEmailTemplate({
    body,
    ctaUrl: `${SITE_URL}/dashboard/messages`,
    ctaLabel: 'View Messages',
  })
}

/** Generate notification email for a client receiving a message */
export function clientNotificationEmail(body: string): string {
  return wrapInEmailTemplate({ body })
}

// ────────────────────────────────────────────
// Export admin email address for use in triggers
// ────────────────────────────────────────────
export const ADMIN_ALERT_EMAIL = ADMIN_EMAIL
