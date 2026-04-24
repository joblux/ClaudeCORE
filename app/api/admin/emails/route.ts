import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/ses'
import {
  magicLinkEmail,
  emailVerificationEmail,
  welcomeApprovalEmail,
  registrationDeclinedEmail,
  contributionSubmittedEmail,
  contributionApprovedEmail,
  contributionRejectedEmail,
  applicationConfirmationEmail,
  recruitmentUpdateEmail,
  escapeConsultationEmail,
  contactConfirmationEmail,
  adminNewMemberEmail,
  adminNewContributionEmail,
  adminNewApplicationEmail,
  adminNewEscapeEmail,
  adminNewContactEmail,
  theBriefEmail,
  ADMIN_ALERT_EMAIL,
} from '@/lib/email-templates'

// Sample data for each template
const SAMPLE_DATA: Record<string, () => { html: string; text: string; subject: string }> = {
  magic_link: () => {
    const { html, text } = magicLinkEmail('https://joblux.com/api/auth/callback/email?token=sample-token')
    return { html, text, subject: 'Sign in to JOBLUX' }
  },
  email_verification: () => {
    const { html, text } = emailVerificationEmail('https://joblux.com/api/auth/verify?token=sample-token')
    return { html, text, subject: 'Verify your email address' }
  },
  welcome_approval: () => {
    const { html, text } = welcomeApprovalEmail({ firstName: 'Alexandra', tier: 'professional' })
    return { html, text, subject: 'Welcome to JOBLUX' }
  },
  registration_declined: () => {
    const { html, text } = registrationDeclinedEmail({ firstName: 'James', reason: 'We require additional professional verification for your tier. Please update your LinkedIn profile and reapply.' })
    return { html, text, subject: 'Update on your JOBLUX access request' }
  },
  contribution_submitted: () => {
    const { html, text } = contributionSubmittedEmail({ firstName: 'Sophie', contributionType: 'salary_data' })
    return { html, text, subject: 'Thank you for your contribution' }
  },
  contribution_approved: () => {
    const { html, text } = contributionApprovedEmail({ firstName: 'Sophie', contributionType: 'salary_data' })
    return { html, text, subject: 'Your contribution is now live' }
  },
  contribution_rejected: () => {
    const { html, text } = contributionRejectedEmail({ firstName: 'Marc', contributionType: 'interview_experience', reason: 'The submission contained insufficient detail for our quality standards. Please consider resubmitting with more specific information.' })
    return { html, text, subject: 'Update on your contribution' }
  },
  application_confirmation: () => {
    const { html, text } = applicationConfirmationEmail({ firstName: 'Elena', assignmentTitle: 'VP of Retail Operations | Cartier' })
    return { html, text, subject: 'Application received' }
  },
  recruitment_update: () => {
    const { html, text } = recruitmentUpdateEmail({ firstName: 'Elena', assignmentTitle: 'VP of Retail Operations | Cartier', statusMessage: 'You have been shortlisted for the next stage. Our team will be in touch to schedule an initial conversation.' })
    return { html, text, subject: 'Update on your candidacy' }
  },
  escape_consultation: () => {
    const { html, text } = escapeConsultationEmail({ firstName: 'Isabelle' })
    return { html, text, subject: 'We received your travel request' }
  },
  contact_confirmation: () => {
    const { html, text } = contactConfirmationEmail({ firstName: 'Thomas' })
    return { html, text, subject: 'We received your message' }
  },
  admin_new_member: () => {
    const { html, text } = adminNewMemberEmail({ name: 'Philippe Arnault', email: 'philippe@example.com', tier: 'Executive', company: 'LVMH', registrationDate: '2026-03-23' })
    return { html, text, subject: 'New access request: Philippe Arnault (Executive)' }
  },
  admin_new_contribution: () => {
    const { html, text } = adminNewContributionEmail({ contributionType: 'salary_data', contributorName: 'Sophie Martin', brand: 'Hermès' })
    return { html, text, subject: 'New contribution: Salary Data from Sophie Martin' }
  },
  admin_new_application: () => {
    const { html, text } = adminNewApplicationEmail({ applicantName: 'Elena Ricci', applicantEmail: 'elena@example.com', tier: 'Professional', assignmentTitle: 'VP of Retail Operations | Cartier', applicationId: 'sample-application-id' })
    return { html, text, subject: 'New application: Elena Ricci for VP of Retail Operations | Cartier' }
  },
  admin_new_escape: () => {
    const { html, text } = adminNewEscapeEmail({ name: 'Isabelle Dupont', email: 'isabelle@example.com', tripType: 'Honeymoon', destination: 'Maldives', budget: '$15,000–$25,000', dates: 'June 2026', tier: 'Professional' })
    return { html, text, subject: 'New travel request: Isabelle Dupont | Maldives' }
  },
  admin_new_contact: () => {
    const { html, text } = adminNewContactEmail({ name: 'Thomas Weber', email: 'thomas@example.com', subject: 'Partnership Inquiry', messagePreview: 'I represent a luxury hospitality brand and would like to explore partnership opportunities with JOBLUX for our talent acquisition needs...' })
    return { html, text, subject: 'New contact: Thomas Weber | Partnership Inquiry' }
  },
  the_brief: () => {
    const { html, text } = theBriefEmail({
      date: 'March 23, 2026',
      bodyHtml: `<h2 style="font-size:18px;color:#1a1a1a;margin:0 0 12px;">Market Moves</h2><p style="font-size:15px;color:#333;line-height:1.7;">LVMH reported Q1 revenue growth of 8%, driven by strong performance in leather goods and fashion. Kering continues its restructuring with a new creative director appointment at Balenciaga.</p><h2 style="font-size:18px;color:#1a1a1a;margin:16px 0 12px;">Talent Radar</h2><p style="font-size:15px;color:#333;line-height:1.7;">Senior-level mobility is accelerating across Richemont maisons, with three C-suite changes in Q1 alone. Digital transformation roles continue to command premium compensation packages.</p>`,
      escapePick: {
        destination: 'Aman Tokyo',
        teaser: 'Where minimalist luxury meets the beating heart of Japan. The perfect base for cherry blossom season.',
        url: 'https://joblux.com/escape',
      },
    })
    return { html, text, subject: 'THE BRIEF | March 23, 2026' }
  },
}

// GET | preview a template (returns HTML)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const template = req.nextUrl.searchParams.get('template')
  if (!template || !SAMPLE_DATA[template]) {
    return NextResponse.json({
      templates: Object.keys(SAMPLE_DATA).map(key => ({
        key,
        subject: SAMPLE_DATA[key]().subject,
      })),
    })
  }

  const { html, subject } = SAMPLE_DATA[template]()
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

// POST | send a test email
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const { template } = body

  if (!template || !SAMPLE_DATA[template]) {
    return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
  }

  const { html, text, subject } = SAMPLE_DATA[template]()
  const result = await sendEmail({
    to: ADMIN_ALERT_EMAIL,
    subject: `[TEST] ${subject}`,
    body: text,
    bodyHtml: html,
  })

  if (result.success) {
    return NextResponse.json({ success: true, messageId: result.messageId })
  }
  return NextResponse.json({ error: result.error }, { status: 500 })
}
