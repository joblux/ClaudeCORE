import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Stages that indicate an application is no longer active
const TERMINAL_STAGES = ['offer_accepted', 'offer_declined', 'rejected', 'withdrawn']

/**
 * GET /api/applications/stats
 * ATS dashboard statistics. Admin only.
 *
 * Returns aggregate counts: total, this month, by stage, by source,
 * active candidates, placements this month, and top briefs.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Current month boundaries (UTC)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()

    // Run all stat queries in parallel for performance
    const [
      totalResult,
      thisMonthResult,
      byStageResult,
      bySourceResult,
      activeCandidatesResult,
      placementsResult,
      topBriefsResult,
    ] = await Promise.all([
      // Total applications
      supabase
        .from('applications')
        .select('*', { count: 'exact', head: true }),

      // Applications created this month
      supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd),

      // Count by stage
      supabase
        .from('applications')
        .select('current_stage'),

      // Count by source
      supabase
        .from('applications')
        .select('source'),

      // Active candidates (not in terminal stages)
      supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .not('current_stage', 'in', `(${TERMINAL_STAGES.join(',')})`),

      // Placements this month (offer_accepted, updated this month)
      supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('current_stage', 'offer_accepted')
        .gte('updated_at', monthStart)
        .lte('updated_at', monthEnd),

      // Top 5 assignments by application count
      supabase
        .from('applications')
        .select('search_assignment_id, search_assignment:search_assignments!search_assignment_id(title, maison)'),
    ])

    // Aggregate by_stage counts from raw rows
    const stageCounts: Record<string, number> = {}
    if (byStageResult.data) {
      for (const row of byStageResult.data) {
        const stage = row.current_stage as string
        stageCounts[stage] = (stageCounts[stage] || 0) + 1
      }
    }
    const byStage = Object.entries(stageCounts)
      .map(([stage, count]) => ({ stage, count }))
      .sort((a, b) => b.count - a.count)

    // Aggregate by_source counts from raw rows
    const sourceCounts: Record<string, number> = {}
    if (bySourceResult.data) {
      for (const row of bySourceResult.data) {
        const source = (row.source as string) || 'unknown'
        sourceCounts[source] = (sourceCounts[source] || 0) + 1
      }
    }
    const bySource = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)

    // Aggregate top assignments
    const assignmentCounts: Record<string, { count: number; title: string; maison: string | null }> = {}
    if (topBriefsResult.data) {
      for (const row of topBriefsResult.data) {
        const assignmentId = row.search_assignment_id as string
        const assignment = row.search_assignment as unknown as { title: string; maison: string | null } | null
        if (!assignmentCounts[assignmentId]) {
          assignmentCounts[assignmentId] = {
            count: 0,
            title: assignment?.title || 'Unknown',
            maison: assignment?.maison || null,
          }
        }
        assignmentCounts[assignmentId].count += 1
      }
    }
    const topBriefs = Object.entries(assignmentCounts)
      .map(([id, data]) => ({ search_assignment_id: id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      total: totalResult.count || 0,
      this_month: thisMonthResult.count || 0,
      by_stage: byStage,
      by_source: bySource,
      active_candidates: activeCandidatesResult.count || 0,
      placements_this_month: placementsResult.count || 0,
      top_briefs: topBriefs,
    })
  } catch (err) {
    console.error('[GET /api/applications/stats] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
