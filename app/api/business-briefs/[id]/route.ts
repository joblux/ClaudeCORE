import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/ses'
import { briefAcceptedEmail, briefInProgressEmail, briefCompletedEmail } from '@/lib/email-templates'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_STATUSES = ['under_review', 'accepted', 'in_progress', 'completed'] as const

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  return role === 'admin'
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('business_briefs')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const status = body?.status
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('business_briefs')
    .update({ status })
    .eq('id', params.id)
    .select('*')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (status === 'accepted' || status === 'in_progress' || status === 'completed') {
    try {
      const firstName = data.contact_name?.split(' ')[0] || data.contact_name
      const params = { firstName, companyName: data.company_name }
      let content
      if (status === 'accepted')    content = briefAcceptedEmail(params)
      if (status === 'in_progress') content = briefInProgressEmail(params)
      if (status === 'completed')   content = briefCompletedEmail(params)
      const recipientEmail = data.contact_email
      if (content && recipientEmail) {
        await sendEmail({
          to: recipientEmail,
          subject: content.subject,
          body: content.text,
          bodyHtml: content.html,
        })
      }
    } catch (e) {
      console.error('brief status email failed:', e)
    }
  }

  return NextResponse.json(data)
}
