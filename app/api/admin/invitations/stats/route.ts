import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [total, sent, clicked, registered, approved] = await Promise.all([
    supabase.from('invitations').select('id', { count: 'exact', head: true }),
    supabase.from('invitations').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
    supabase.from('invitations').select('id', { count: 'exact', head: true }).not('opened_at', 'is', null),
    supabase.from('invitations').select('id', { count: 'exact', head: true }).not('joined_at', 'is', null),
    supabase.from('invitations').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
  ])

  return NextResponse.json({
    total: total.count || 0,
    sent: sent.count || 0,
    clicked: clicked.count || 0,
    registered: registered.count || 0,
    approved: approved.count || 0,
  })
}
