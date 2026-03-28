import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PAGE_SIZE = 25

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '0', 10)
  const statusFilter = searchParams.get('status') || 'all'
  const roleFilter = searchParams.get('role') || 'all'
  const search = searchParams.get('search') || ''

  // Counts
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const day = now.getDay()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day === 0 ? 6 : day - 1)).toISOString()

  const [total, pending, approved, rejected, today, thisWeek] = await Promise.all([
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('registration_completed', true),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('registration_completed', true).eq('status', 'pending'),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('registration_completed', true).eq('status', 'approved'),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('registration_completed', true).eq('status', 'rejected'),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('registration_completed', true).gte('created_at', startOfDay),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('registration_completed', true).gte('created_at', startOfWeek),
  ])

  // Members query
  let query = supabase
    .from('members')
    .select('id, email, full_name, first_name, last_name, role, status, city, country, bio, avatar_url, auth_provider, created_at, approved_at, last_login, profile_completeness', { count: 'exact' })
    .eq('registration_completed', true)
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (statusFilter !== 'all') query = query.eq('status', statusFilter)
  if (roleFilter !== 'all') query = query.eq('role', roleFilter)
  if (search.trim()) {
    const s = `%${search.trim()}%`
    query = query.or(`email.ilike.${s},full_name.ilike.${s},first_name.ilike.${s},last_name.ilike.${s}`)
  }

  const { data: members, count: membersTotal } = await query

  // AI reviews
  const { data: aiReviews } = await supabase
    .from('member_ai_reviews')
    .select('member_id, confidence, reasoning, recommendation, auto_approved')

  return NextResponse.json({
    members: members ?? [],
    total: membersTotal ?? 0,
    counts: {
      total: total.count ?? 0,
      pending: pending.count ?? 0,
      approved: approved.count ?? 0,
      rejected: rejected.count ?? 0,
      today: today.count ?? 0,
      thisWeek: thisWeek.count ?? 0,
    },
    aiReviews: aiReviews ?? [],
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { ids, status: newStatus } = body

    if (!ids || !Array.isArray(ids) || !ids.length || !newStatus) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const updateData: any = { status: newStatus }
    if (newStatus === 'approved') {
      updateData.approved_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('members')
      .update(updateData)
      .in('id', ids)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
