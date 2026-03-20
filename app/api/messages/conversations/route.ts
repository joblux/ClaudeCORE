import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { candidateNotificationEmail, clientNotificationEmail } from '@/lib/email-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/messages/conversations
 * List conversations with filtering, search, and pagination.
 * Admin only.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const participantType = searchParams.get('participant_type')
  const searchAssignmentId = searchParams.get('search_assignment_id')
  const memberId = searchParams.get('member_id')
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const unreadOnly = searchParams.get('unread_only') === 'true'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const offset = (page - 1) * limit

  try {
    // Build the query with joins
    let query = supabase
      .from('conversations')
      .select(
        `*, member:members!member_id(id, full_name, email, avatar_url, job_title), search_assignment:search_assignments!search_assignment_id(id, title, maison, reference_number)`,
        { count: 'exact' }
      )

    // Apply filters
    if (participantType) {
      query = query.eq('participant_type', participantType)
    }
    if (searchAssignmentId) {
      query = query.eq('search_assignment_id', searchAssignmentId)
    }
    if (memberId) {
      query = query.eq('member_id', memberId)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (unreadOnly) {
      query = query.gt('unread_count', 0)
    }

    // Text search on subject or participant name (ilike)
    if (search) {
      query = query.or(`subject.ilike.%${search}%,member.full_name.ilike.%${search}%`)
    }

    // Order and paginate
    query = query
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    const { data: conversations, count, error } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      conversations: conversations || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (err) {
    console.error('Unexpected error listing conversations:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/messages/conversations
 * Create a new conversation with an initial message.
 * Admin only.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      participant_type,
      member_id,
      client_name,
      client_email,
      client_company,
      search_assignment_id,
      application_id,
      subject,
      initial_message,
    } = body

    // Validate required fields
    if (!participant_type || !subject || !initial_message?.body) {
      return NextResponse.json(
        { error: 'participant_type, subject, and initial_message.body are required' },
        { status: 400 }
      )
    }

    // Build the conversation record
    const conversationData: Record<string, unknown> = {
      participant_type,
      subject,
      status: 'active',
      created_by: session.user.memberId,
    }

    if (member_id) conversationData.member_id = member_id
    if (client_name) conversationData.client_name = client_name
    if (client_email) conversationData.client_email = client_email
    if (client_company) conversationData.client_company = client_company
    if (search_assignment_id) conversationData.search_assignment_id = search_assignment_id
    if (application_id) conversationData.application_id = application_id

    // Insert the conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single()

    if (convError) {
      console.error('Error creating conversation:', convError)
      return NextResponse.json({ error: convError.message }, { status: 500 })
    }

    // Insert the initial message
    const messageData = {
      conversation_id: conversation.id,
      sender_type: 'recruiter',
      sender_name: session.user.email,
      body: initial_message.body,
      sent_at: new Date().toISOString(),
    }

    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single()

    if (msgError) {
      console.error('Error creating initial message:', msgError)
      return NextResponse.json({ error: msgError.message }, { status: 500 })
    }

    // Update the conversation with the last message preview
    const preview = initial_message.body.slice(0, 100)
    await supabase
      .from('conversations')
      .update({
        last_message_at: message.sent_at,
        last_message_preview: preview,
      })
      .eq('id', conversation.id)

    // Send email notification to the participant
    try {
      if (participant_type === 'candidate' && member_id) {
        // Look up candidate email from members table
        const { data: member } = await supabase
          .from('members')
          .select('email, full_name')
          .eq('id', member_id)
          .single()

        if (member?.email) {
          const emailHtml = candidateNotificationEmail(initial_message.body)
          await sendEmail({
            to: member.email,
            subject: `New message: ${subject || 'JOBLUX'}`,
            body: initial_message.body,
            bodyHtml: emailHtml,
          })
        }
      } else if (participant_type === 'client' && client_email) {
        const emailHtml = clientNotificationEmail(initial_message.body)
        await sendEmail({
          to: client_email,
          subject: `New message: ${subject || 'JOBLUX'}`,
          body: initial_message.body,
          bodyHtml: emailHtml,
        })
      }
    } catch (emailErr) {
      // Log but don't fail the request if email sending fails
      console.error('Failed to send email notification:', emailErr)
    }

    return NextResponse.json({ conversation, message }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error creating conversation:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
