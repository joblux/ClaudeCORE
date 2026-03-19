import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/dashboard — all admin dashboard stats
export async function GET() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Total members (non-admin)
    const { count: totalMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .neq('role', 'admin')

    // Pending approvals
    const { count: pendingApprovals } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Approved members
    const { count: approvedMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .neq('role', 'admin')

    // Members by tier
    const { data: tierData } = await supabase
      .from('members')
      .select('role')
      .neq('role', 'admin')

    const membersByTier: Record<string, number> = {}
    const tierLabels: Record<string, string> = {
      rising: 'Rising',
      pro: 'Pro',
      professional: 'Pro+',
      executive: 'Executive',
      business: 'Business',
      insider: 'Insider',
    }
    for (const m of tierData || []) {
      membersByTier[m.role] = (membersByTier[m.role] || 0) + 1
    }

    // Recent members (last 5)
    const { data: recentMembers } = await supabase
      .from('members')
      .select('id, full_name, email, role, status, created_at, city, country, maison, job_title')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
      .limit(5)

    // Pending contributions
    const { count: pendingContributions } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Total contributions
    const { count: totalContributions } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })

    // Contributions by type
    const { data: contribTypeData } = await supabase
      .from('contributions')
      .select('contribution_type, status')

    const contributionsByType: Record<string, { total: number; pending: number; approved: number }> = {}
    for (const c of contribTypeData || []) {
      if (!contributionsByType[c.contribution_type]) {
        contributionsByType[c.contribution_type] = { total: 0, pending: 0, approved: 0 }
      }
      contributionsByType[c.contribution_type].total++
      if (c.status === 'pending') contributionsByType[c.contribution_type].pending++
      if (c.status === 'approved') contributionsByType[c.contribution_type].approved++
    }

    // Recent contributions (last 5)
    const { data: recentContributions } = await supabase
      .from('contributions')
      .select('id, contribution_type, status, brand_name, created_at, is_anonymous, members!contributions_member_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(5)

    // Job briefs stats
    const { data: briefsData } = await supabase
      .from('job_briefs')
      .select('status')

    const briefsByStatus: Record<string, number> = {}
    for (const b of briefsData || []) {
      briefsByStatus[b.status] = (briefsByStatus[b.status] || 0) + 1
    }

    // Members joined this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const { count: newThisWeek } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .neq('role', 'admin')
      .gte('created_at', oneWeekAgo.toISOString())

    return NextResponse.json({
      overview: {
        totalMembers: totalMembers || 0,
        approvedMembers: approvedMembers || 0,
        pendingApprovals: pendingApprovals || 0,
        newThisWeek: newThisWeek || 0,
        pendingContributions: pendingContributions || 0,
        totalContributions: totalContributions || 0,
        totalBriefs: briefsData?.length || 0,
        publishedBriefs: briefsByStatus['published'] || 0,
      },
      membersByTier: Object.entries(tierLabels).map(([key, label]) => ({
        tier: key,
        label,
        count: membersByTier[key] || 0,
      })),
      contributionsByType,
      briefsByStatus,
      recentMembers: recentMembers || [],
      recentContributions: recentContributions || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
