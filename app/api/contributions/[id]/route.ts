import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/ses'
import { contributionApprovedEmail, contributionRejectedEmail } from '@/lib/email-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Points awarded per contribution type
const POINTS_MAP: Record<string, number> = {
  wikilux_insight: 5,
  salary_data: 10,
  interview_experience: 10,
}

// Access level thresholds
const ACCESS_LEVELS = [
  { level: 'full', points: 50 },
  { level: 'premium', points: 25 },
  { level: 'standard', points: 10 },
  { level: 'basic', points: 0 },
]

function calculateAccessLevel(points: number): string {
  for (const tier of ACCESS_LEVELS) {
    if (points >= tier.points) return tier.level
  }
  return 'basic'
}

// PUT /api/contributions/[id] | approve or reject a contribution (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'
  const adminId = (session?.user as any)?.memberId

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action, rejection_reason } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 })
    }

    // Get the contribution
    const { data: contribution, error: fetchError } = await supabase
      .from('contributions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    if (contribution.status !== 'pending') {
      return NextResponse.json({ error: 'Contribution already reviewed' }, { status: 400 })
    }

    if (action === 'approve') {
      const points = POINTS_MAP[contribution.contribution_type] || 0

      // Update contribution status
      const { error: updateError } = await supabase
        .from('contributions')
        .update({
          status: 'approved',
          points_awarded: points,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Add points to member
      const { data: member, error: memberFetchError } = await supabase
        .from('members')
        .select('contribution_points')
        .eq('id', contribution.member_id)
        .single()

      if (!memberFetchError && member) {
        const newPoints = (member.contribution_points || 0) + points
        const newAccessLevel = calculateAccessLevel(newPoints)

        await supabase
          .from('members')
          .update({
            contribution_points: newPoints,
            access_level: newAccessLevel,
          })
          .eq('id', contribution.member_id)
      }

      // Smart refresh: if this is a wikilux_insight, check if brand page needs regeneration
      if (contribution.contribution_type === 'wikilux_insight' && contribution.brand_slug) {
        const { data: brandContent } = await supabase
          .from('wikilux_content')
          .select('last_regenerated_at, updated_at')
          .eq('slug', contribution.brand_slug)
          .single()

        if (brandContent) {
          const lastRegen = brandContent.last_regenerated_at || brandContent.updated_at
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
          if (!lastRegen || new Date(lastRegen).getTime() < sevenDaysAgo) {
            // Trigger background regeneration (fire-and-forget)
            fetch(`${process.env.NEXTAUTH_URL || 'https://www.luxuryrecruiter.com'}/api/wikilux/regenerate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug: contribution.brand_slug }),
            }).catch(() => {})
          }
        }
      }

      // Send approval email to contributor
      const { data: approvedMember } = await supabase
        .from('members')
        .select('email, first_name')
        .eq('id', contribution.member_id)
        .single()

      if (approvedMember?.email) {
        const { html, text } = contributionApprovedEmail({
          firstName: approvedMember.first_name,
          contributionType: contribution.contribution_type,
        })
        sendEmail({
          to: approvedMember.email,
          subject: 'Your contribution is now live',
          body: text,
          bodyHtml: html,
        }).catch(() => {})
      }

      return NextResponse.json({
        success: true,
        message: `Contribution approved. ${points} points awarded.`,
        points_awarded: points,
      })

    } else {
      // Reject
      const { error: updateError } = await supabase
        .from('contributions')
        .update({
          status: 'rejected',
          rejection_reason: rejection_reason || null,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Send rejection email to contributor
      const { data: rejectedMember } = await supabase
        .from('members')
        .select('email, first_name')
        .eq('id', contribution.member_id)
        .single()

      if (rejectedMember?.email) {
        const { html, text } = contributionRejectedEmail({
          firstName: rejectedMember.first_name,
          contributionType: contribution.contribution_type,
          reason: rejection_reason,
        })
        sendEmail({
          to: rejectedMember.email,
          subject: 'Update on your contribution',
          body: text,
          bodyHtml: html,
        }).catch(() => {})
      }

      return NextResponse.json({
        success: true,
        message: 'Contribution rejected.',
      })
    }

  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// GET /api/contributions/[id] | get contribution with full detail
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'
  const memberId = (session?.user as any)?.memberId

  const { data: contribution, error } = await supabase
    .from('contributions')
    .select('*, members!contributions_member_id_fkey(full_name, first_name, last_name, email, avatar_url)')
    .eq('id', id)
    .single()

  if (error || !contribution) {
    return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
  }

  // Only admin or the contributor can see pending/rejected
  if (contribution.status !== 'approved' && !isAdmin && contribution.member_id !== memberId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch type-specific detail
  let detail = null
  if (contribution.contribution_type === 'wikilux_insight') {
    const { data } = await supabase
      .from('wikilux_insights')
      .select('*')
      .eq('contribution_id', id)
      .single()
    detail = data
  } else if (contribution.contribution_type === 'salary_data') {
    const { data } = await supabase
      .from('salary_contributions')
      .select('*')
      .eq('contribution_id', id)
      .single()
    detail = data
  } else if (contribution.contribution_type === 'interview_experience') {
    const { data } = await supabase
      .from('interview_experiences')
      .select('*')
      .eq('contribution_id', id)
      .single()
    detail = data
  }

  return NextResponse.json({ ...contribution, detail })
}
