import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'
  if (!isAdmin) return NextResponse.json({}, { status: 401 })

  try {
    const [unreadRes, contribRes] = await Promise.all([
      supabase.from('conversations').select('id', { count: 'exact', head: true }).gt('unread_count', 0),
      supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    return NextResponse.json({
      unread_messages: unreadRes.count ?? 0,
      pending_contributions: contribRes.count ?? 0,
    })
  } catch {
    return NextResponse.json({})
  }
}
