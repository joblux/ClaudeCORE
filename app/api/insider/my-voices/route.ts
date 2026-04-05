import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/insider/my-voices — fetch current insider's submitted voices
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const memberId = (session.user as any).memberId
  if (!memberId) {
    return NextResponse.json({ voices: [] })
  }

  const { data, error } = await supabase
    .from('bloglux_articles')
    .select('id, slug, title, status, created_at, category')
    .eq('category', 'Insider Voice')
    .eq('content_origin', 'contributed')
    .eq('author_id', memberId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ voices: data || [] })
}
