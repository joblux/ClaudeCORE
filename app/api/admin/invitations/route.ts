import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '0')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = supabase
    .from('invitations')
    .select('*', { count: 'exact' })
    .order('sent_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (status && status !== 'all') query = query.eq('status', status)
  if (search) {
    const s = `%${search}%`
    query = query.or(`contact_name.ilike.${s},contact_email.ilike.${s}`)
  }

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ invitations: data || [], total: count || 0 })
}
