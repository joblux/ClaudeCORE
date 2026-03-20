import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/messages/conversations/[id]/read
 * Mark all unread messages in a conversation as read.
 * Updates messages where read_at IS NULL and sender_type != 'recruiter',
 * then resets the conversation's unread_count to 0.
 * Admin only.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id } = await params

  try {
    // Verify the conversation exists
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Mark all unread non-recruiter messages as read
    const { error: updateError } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', id)
      .is('read_at', null)
      .neq('sender_type', 'recruiter')

    if (updateError) {
      console.error('Error marking messages as read:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Reset the conversation's unread count to 0
    const { error: resetError } = await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', id)

    if (resetError) {
      console.error('Error resetting unread count:', resetError)
      return NextResponse.json({ error: resetError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error marking messages as read:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
