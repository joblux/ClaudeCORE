import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/messages/conversations/[id]
 * Fetch a full conversation with its messages.
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
    // Fetch the conversation with joins
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(
        `*, member:members!member_id(id, full_name, email, avatar_url, job_title), search_assignment:search_assignments!search_assignment_id(id, title, maison, reference_number)`
      )
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Authorization: admin or the candidate whose member_id matches
    const isAdmin = session.user.role === 'admin'
    const isParticipant = conversation.member_id === session.user.memberId
    if (!isAdmin && !isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch messages with attachments, ordered by sent_at ascending
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*, attachments:message_attachments(*)')
      .eq('conversation_id', id)
      .order('sent_at', { ascending: true })

    if (msgError) {
      console.error('Error fetching messages:', msgError)
      return NextResponse.json({ error: msgError.message }, { status: 500 })
    }

    return NextResponse.json({
      conversation,
      messages: messages || [],
    })
  } catch (err) {
    console.error('Unexpected error fetching conversation:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/messages/conversations/[id]
 * Update conversation fields (status, subject, assigned_recruiter).
 * Admin only.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { status, subject, assigned_recruiter } = body

    // Build update payload with only provided fields
    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (subject !== undefined) updateData.subject = subject
    if (assigned_recruiter !== undefined) updateData.assigned_recruiter = assigned_recruiter

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating conversation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ conversation })
  } catch (err) {
    console.error('Unexpected error updating conversation:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/messages/conversations/[id]
 * Archive a conversation (soft delete by setting status to 'archived').
 * Admin only.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id } = await params

  try {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error archiving conversation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ conversation })
  } catch (err) {
    console.error('Unexpected error archiving conversation:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
