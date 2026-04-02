import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/contributions/my-points | get current member's points, access level, and contribution history
export async function GET() {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId

  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Get member points
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('contribution_points, access_level')
    .eq('id', memberId)
    .single()

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  // Get thresholds
  const { data: thresholds } = await supabase
    .from('access_thresholds')
    .select('*')
    .order('points_required', { ascending: true })

  // Get contribution summary
  const { data: contributions } = await supabase
    .from('contributions')
    .select('id, contribution_type, status, points_awarded, brand_name, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })

  const points = member?.contribution_points || 0
  const accessLevel = member?.access_level || 'basic'

  // Find next level
  const sortedThresholds = (thresholds || []).sort((a: any, b: any) => a.points_required - b.points_required)
  const currentIndex = sortedThresholds.findIndex((t: any) => t.access_level === accessLevel)
  const nextLevel = currentIndex < sortedThresholds.length - 1 ? sortedThresholds[currentIndex + 1] : null

  return NextResponse.json({
    points,
    access_level: accessLevel,
    next_level: nextLevel ? {
      level: nextLevel.access_level,
      points_required: nextLevel.points_required,
      points_needed: nextLevel.points_required - points,
      unlocks: nextLevel.unlocks,
    } : null,
    thresholds: sortedThresholds,
    contributions: contributions || [],
    summary: {
      total: (contributions || []).length,
      approved: (contributions || []).filter((c: any) => c.status === 'approved').length,
      pending: (contributions || []).filter((c: any) => c.status === 'pending').length,
      rejected: (contributions || []).filter((c: any) => c.status === 'rejected').length,
    },
  })
}
