import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/messages/my-conversations
 * Returns conversations for the currently authenticated member.
 * Non-admin: only conversations where member_id = session.user.memberId.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const memberId = session.user.memberId

  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(
        `*, search_assignment:search_assignments!search_assignment_id(id, title, maison, reference_number)`
      )
      .eq('member_id', memberId)
      .neq('status', 'archived')
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('Error fetching member conversations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      conversations: conversations || [],
    })
  } catch (err) {
    console.error('Unexpected error fetching member conversations:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
