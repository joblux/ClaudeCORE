import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/ses'
import { applicationConfirmationEmail, adminNewApplicationEmail, ADMIN_ALERT_EMAIL } from '@/lib/email-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/opportunities/apply
 * Self-apply to a search assignment as an authenticated member.
 *
 * Body: { jobId: string } — the search_assignment id to apply to
 * Returns: { success: true, application_id: string }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !session.user.memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { jobId } = await req.json()

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const memberId = session.user.memberId

    // Check for existing application (same member + same assignment)
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('member_id', memberId)
      .eq('search_assignment_id', jobId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'You have already expressed interest in this position' },
        { status: 409 }
      )
    }

    // Insert the application
    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert({
        member_id: memberId,
        search_assignment_id: jobId,
        source: 'self_applied',
        current_stage: 'applied',
      })
      .select('id')
      .single()

    if (insertError) {
      // Handle unique constraint violation at DB level
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already expressed interest in this position' },
          { status: 409 }
        )
      }
      console.error('[POST /api/opportunities/apply] Insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Record the initial stage transition in history
    const { error: historyError } = await supabase
      .from('application_stage_history')
      .insert({
        application_id: application.id,
        from_stage: null,
        to_stage: 'applied',
        moved_by: session.user.email,
      })

    if (historyError) {
      console.error('[POST /api/opportunities/apply] Stage history insert error:', historyError)
    }

    // Fetch assignment title and member details for emails
    const [{ data: assignment }, { data: memberInfo }] = await Promise.all([
      supabase
        .from('search_assignments')
        .select('title')
        .eq('id', jobId)
        .single(),
      supabase
        .from('members')
        .select('email, first_name, full_name, role')
        .eq('id', memberId)
        .single(),
    ])

    const assignmentTitle = assignment?.title || 'Position'

    // Send confirmation to applicant
    if (memberInfo?.email) {
      const { html, text } = applicationConfirmationEmail({
        firstName: memberInfo.first_name,
        assignmentTitle,
      })
      sendEmail({
        to: memberInfo.email,
        subject: 'Application received',
        body: text,
        bodyHtml: html,
      }).catch(() => {})
    }

    // Admin alert
    const { html: adminHtml, text: adminText } = adminNewApplicationEmail({
      applicantName: memberInfo?.full_name || session.user.email || 'Unknown',
      applicantEmail: memberInfo?.email || session.user.email || '',
      tier: memberInfo?.role || 'member',
      assignmentTitle,
    })
    sendEmail({
      to: ADMIN_ALERT_EMAIL,
      subject: `New application: ${memberInfo?.full_name || 'Member'} for ${assignmentTitle}`,
      body: adminText,
      bodyHtml: adminHtml,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      application_id: application.id,
    })
  } catch (err) {
    console.error('[POST /api/opportunities/apply] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
