import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { candidateNotificationEmail } from '@/lib/email-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/messages/conversations/[id]/messages
 * List all messages in a conversation, ordered by sent_at ascending.
 * Accessible by admin or the candidate whose member_id matches.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Verify the conversation exists and check authorization
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, member_id')
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const isAdmin = session.user.role === 'admin'
    const isParticipant = conversation.member_id === session.user.memberId
    if (!isAdmin && !isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch messages with attachments
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*, attachments:message_attachments(*)')
      .eq('conversation_id', id)
      .order('sent_at', { ascending: true })

    if (msgError) {
      console.error('Error fetching messages:', msgError)
      return NextResponse.json({ error: msgError.message }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (err) {
    console.error('Unexpected error fetching messages:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/messages/conversations/[id]/messages
 * Send a new message in a conversation.
 * Admin can send as recruiter; candidate can send in their own conversation.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Verify the conversation exists
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, member_id, participant_type, subject')
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const isAdmin = session.user.role === 'admin'
    const isParticipant = conversation.member_id === session.user.memberId

    // Authorization check
    if (!isAdmin && !isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { body: messageBody } = body

    if (!messageBody) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
    }

    // Determine sender details based on role
    let senderType: string
    let senderName: string

    if (isAdmin) {
      senderType = 'recruiter'
      senderName = session.user.email || 'JOBLUX'
    } else {
      // Candidate sending a message - look up their name
      senderType = 'candidate'
      const { data: member } = await supabase
        .from('members')
        .select('full_name')
        .eq('id', session.user.memberId)
        .single()
      senderName = member?.full_name || session.user.email
    }

    // Insert the message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_type: senderType,
        sender_name: senderName,
        body: messageBody,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (msgError) {
      console.error('Error inserting message:', msgError)
      return NextResponse.json({ error: msgError.message }, { status: 500 })
    }

    // Update the conversation: last_message_at and preview
    const preview = messageBody.slice(0, 100)
    const conversationUpdate: Record<string, unknown> = {
      last_message_at: message.sent_at,
      last_message_preview: preview,
    }

    // If recruiter sends to candidate, increment unread_count and send notification
    if (senderType === 'recruiter') {
      // Increment unread count using RPC or manual fetch + update
      const { data: currentConv } = await supabase
        .from('conversations')
        .select('unread_count')
        .eq('id', id)
        .single()

      conversationUpdate.unread_count = (currentConv?.unread_count || 0) + 1

      // Send email notification to the candidate
      try {
        if (conversation.participant_type === 'candidate' && conversation.member_id) {
          const { data: member } = await supabase
            .from('members')
            .select('email, full_name')
            .eq('id', conversation.member_id)
            .single()

          if (member?.email) {
            const emailHtml = candidateNotificationEmail(messageBody)
            await sendEmail({
              to: member.email,
              subject: `New message: ${conversation.subject || 'JOBLUX'}`,
              body: messageBody,
              bodyHtml: emailHtml,
            })
          }
        }
      } catch (emailErr) {
        console.error('Failed to send email notification:', emailErr)
      }
    }
    // If candidate sends, no unread increment (admin will see it when opening)

    await supabase
      .from('conversations')
      .update(conversationUpdate)
      .eq('id', id)

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error sending message:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
