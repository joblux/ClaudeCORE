// Sidebar badge counts.
//
// Member-related counts (total/pending/pending_business) are sourced
// from lib/admin-metrics.getAdminMetrics() so the sidebar and the
// dashboard can never disagree. Review-queue counts (unread messages,
// pending contributions, etc.) stay local — those are sidebar-specific
// and not part of the product KPI source of truth.

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminMetrics } from '@/lib/admin-metrics'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'
  if (!isAdmin) return NextResponse.json({}, { status: 401 })

  try {
    const [unreadRes, contribRes, commentsRes, internshipsRes, contactRes, consultRes, metrics] = await Promise.all([
      supabase.from('conversations').select('id', { count: 'exact', head: true }).gt('unread_count', 0),
      supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('status', 'pending').is('deleted_at', null),
      supabase.from('bloglux_comments').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('internship_listings').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('escape_consultations').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      getAdminMetrics(),
    ])

    return NextResponse.json({
      unread_messages: unreadRes.count ?? 0,
      pending_contributions: contribRes.count ?? 0,
      pending_comments: commentsRes.count ?? 0,
      pending_internships: internshipsRes.count ?? 0,
      new_contact: contactRes.count ?? 0,
      pending_consultations: consultRes.count ?? 0,
      // Member counts come from the shared admin-metrics source
      pending_members: metrics.members.pending,
      pending_businesses: metrics.members.pending_business,
      total_members: metrics.members.total,
    })
  } catch {
    return NextResponse.json({})
  }
}
