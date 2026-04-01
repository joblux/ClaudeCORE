import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date().toISOString()

    // Count pending first
    const { count } = await supabase
      .from('wikilux_content')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Approve all pending wikilux content that has non-empty content
    const { error } = await supabase
      .from('wikilux_content')
      .update({
        status: 'approved',
        approved_by: (session.user as any).email || 'admin',
        approved_at: now,
        is_published: true,
        published_at: now,
      })
      .eq('status', 'pending')
      .neq('content', '{}')

    if (error) throw error

    return NextResponse.json({
      success: true,
      approved_count: count || 0,
    })
  } catch (error: any) {
    console.error('Bulk approve error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
