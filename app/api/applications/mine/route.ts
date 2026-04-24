import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/applications/mine
 * Returns the current user's own applications (max 5, newest first).
 * Joins search_assignments for title, maison, is_confidential.
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId

  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      current_stage,
      applied_at,
      search_assignment:search_assignments!search_assignment_id(id, title, maison, is_confidential)
    `)
    .eq('member_id', memberId)
    .order('applied_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('[GET /api/applications/mine] Query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ applications: data || [] })
}
