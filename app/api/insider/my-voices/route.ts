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

  const user = session.user as any
  const memberName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name

  if (!memberName) {
    return NextResponse.json({ voices: [] })
  }

  // Filter by author_name matching session user's name
  // This is the best available approach until member_id is added to bloglux_articles
  const { data, error } = await supabase
    .from('bloglux_articles')
    .select('id, slug, title, status, created_at, category')
    .eq('category', 'Insider Voice')
    .eq('content_origin', 'contributed')
    .eq('author_name', memberName)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ voices: data || [] })
}
