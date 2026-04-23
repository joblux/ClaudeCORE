import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/ses'
import { contributionSubmittedEmail, adminNewContributionEmail, ADMIN_ALERT_EMAIL } from '@/lib/email-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
  }

  const user = session.user as any
  const memberId = user.memberId
  const memberStatus = user.status

  if (!memberId || memberStatus !== 'approved') {
    return NextResponse.json({ success: false, message: 'You must be an approved member to contribute' }, { status: 403 })
  }

  // Get contributor name and email from member record
  const { data: member } = await supabase
    .from('members')
    .select('email, first_name, last_name, full_name')
    .eq('id', memberId)
    .single()

  if (!member?.email) {
    return NextResponse.json({ success: false, message: 'Member record not found' }, { status: 500 })
  }

  const contributorName = member.full_name || [member.first_name, member.last_name].filter(Boolean).join(' ') || 'JOBLUX Member'
  const contributorEmail = member.email

  try {
    const body = await request.json()
    const { brand_slug, issue_description, suggested_correction, source_url } = body

    // Validate required fields
    if (!brand_slug || !issue_description || !suggested_correction) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    // Insert contribution
    const { error } = await supabase
      .from('brand_contributions')
      .insert({
        brand_slug,
        user_id: memberId,
        contributor_name: contributorName,
        contributor_email: contributorEmail,
        issue_description,
        suggested_correction,
        source_url: source_url || null,
      })

    if (error) throw error

    // Fire-and-forget submitter confirmation
    {
      const { html, text } = contributionSubmittedEmail({
        firstName: member.first_name,
        contributionType: 'brand_correction',
      })
      sendEmail({
        to: contributorEmail,
        subject: 'Thank you for your contribution',
        body: text,
        bodyHtml: html,
      }).catch(() => {})
    }

    // Fire-and-forget admin alert
    {
      const { html: adminHtml, text: adminText } = adminNewContributionEmail({
        contributionType: 'brand_correction',
        contributorName,
        brand: brand_slug,
      })
      sendEmail({
        to: ADMIN_ALERT_EMAIL,
        subject: `New contribution: brand_correction from ${contributorName}`,
        body: adminText,
        bodyHtml: adminHtml,
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, message: 'Correction submitted successfully' })
  } catch (error: any) {
    console.error('Brand correction submission error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
