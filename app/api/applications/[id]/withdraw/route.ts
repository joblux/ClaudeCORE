import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/ses'
import { applicationStatusEmail, adminApplicationWithdrawnEmail, RECRUITING_ALERT_EMAIL } from '@/lib/email-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TERMINAL_STAGES = ['offer_accepted', 'offer_declined', 'rejected', 'withdrawn']

const APPLICATION_SELECT = `
  id, member_id, current_stage,
  member:members!member_id(id, full_name, email),
  search_assignment:search_assignments!search_assignment_id(id, title)
`

/**
 * POST /api/applications/[id]/withdraw
 * Allows the owning candidate to withdraw their own application.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId
  const userEmail = session?.user?.email

  if (!memberId || !userEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: app, error: fetchError } = await supabase
    .from('applications')
    .select(APPLICATION_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if ((app as any).member_id !== memberId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (TERMINAL_STAGES.includes((app as any).current_stage)) {
    return NextResponse.json(
      { error: 'Application is already in a terminal state' },
      { status: 409 }
    )
  }

  const fromStage = (app as any).current_stage

  const { error: updateError } = await supabase
    .from('applications')
    .update({
      current_stage: 'withdrawn',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    console.error('[POST /api/applications/[id]/withdraw] Update error:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const { error: historyError } = await supabase
    .from('application_stage_history')
    .insert({
      application_id: id,
      from_stage: fromStage,
      to_stage: 'withdrawn',
      moved_by: userEmail,
      notes: 'Withdrawn by candidate',
    })

  if (historyError) {
    console.error('[POST /api/applications/[id]/withdraw] History insert error:', historyError)
  }

  const member = (app as any).member
  const assignment = (app as any).search_assignment
  const candidateName = member?.full_name || 'A candidate'
  const candidateEmail = member?.email
  const roleTitle = assignment?.title || 'an application'
  const firstName = candidateName.split(' ')[0]

  const adminTpl = adminApplicationWithdrawnEmail({
    candidateName,
    candidateEmail: candidateEmail || 'unknown',
    roleTitle,
    applicationId: id,
  })
  sendEmail({
    to: RECRUITING_ALERT_EMAIL,
    subject: `Application withdrawn: ${candidateName} — ${roleTitle}`,
    body: adminTpl.text,
    bodyHtml: adminTpl.html,
  }).catch(() => {})

  if (candidateEmail) {
    const tpl = applicationStatusEmail({
      firstName,
      roleTitle,
      statusMessage: 'Your application has been withdrawn.',
    })
    sendEmail({
      to: candidateEmail,
      subject: `Update: ${roleTitle}`,
      body: tpl.text,
      bodyHtml: tpl.html,
    }).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
