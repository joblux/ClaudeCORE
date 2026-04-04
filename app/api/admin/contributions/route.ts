import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── GET: fetch contributions by type ────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'voices'
  const status = searchParams.get('status') || 'all'

  // ── Pending counts for tab badges ─────────────────────────────────────────
  if (type === 'counts') {
    const [voices, salary, interviews, brand] = await Promise.all([
      supabase.from('bloglux_articles').select('id', { count: 'exact', head: true }).eq('category', 'Insider Voice').in('status', ['draft', 'submitted', 'review']),
      supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('contribution_type', 'salary_data').eq('status', 'pending'),
      supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('contribution_type', 'interview_experience').eq('status', 'pending'),
      supabase.from('brand_contributions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    return NextResponse.json({
      counts: {
        voices: voices.count || 0,
        salary: salary.count || 0,
        interviews: interviews.count || 0,
        brand: brand.count || 0,
      }
    })
  }

  // ── Insider Voices ────────────────────────────────────────────────────────
  if (type === 'voices') {
    let query = supabase
      .from('bloglux_articles')
      .select('id, slug, title, excerpt, body, author_name, author_role, cover_image_url, status, created_at, content_origin')
      .eq('category', 'Insider Voice')
      .order('created_at', { ascending: false })

    if (status !== 'all') query = query.eq('status', status)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data || [] })
  }

  // ── Salary ────────────────────────────────────────────────────────────────
  if (type === 'salary') {
    let query = supabase
      .from('contributions')
      .select('id, member_id, brand_name, brand_slug, status, created_at, points_awarded')
      .eq('contribution_type', 'salary_data')
      .order('created_at', { ascending: false })

    if (status !== 'all') query = query.eq('status', status)

    const { data: contribs, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Join salary_contributions details
    const enriched = await Promise.all((contribs || []).map(async c => {
      const { data: sal } = await supabase
        .from('salary_contributions')
        .select('*')
        .eq('contribution_id', c.id)
        .maybeSingle()
      return { ...c, salary: sal }
    }))

    return NextResponse.json({ items: enriched })
  }

  // ── Interviews ────────────────────────────────────────────────────────────
  if (type === 'interviews') {
    let query = supabase
      .from('contributions')
      .select('id, member_id, brand_name, brand_slug, status, created_at, points_awarded')
      .eq('contribution_type', 'interview_experience')
      .order('created_at', { ascending: false })

    if (status !== 'all') query = query.eq('status', status)

    const { data: contribs, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Join interview_experiences details
    const enriched = await Promise.all((contribs || []).map(async c => {
      const { data: iv } = await supabase
        .from('interview_experiences')
        .select('*')
        .eq('contribution_id', c.id)
        .maybeSingle()
      return { ...c, interview: iv }
    }))

    return NextResponse.json({ items: enriched })
  }

  // ── Brand corrections ─────────────────────────────────────────────────────
  if (type === 'brand') {
    let query = supabase
      .from('brand_contributions')
      .select('*')
      .order('created_at', { ascending: false })

    if (status !== 'all') query = query.eq('status', status)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data || [] })
  }

  return NextResponse.json({ items: [] })
}

// ── POST: approve or reject ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action, type, id, note } = await req.json()
  const adminId = (session.user as any)?.memberId
  const now = new Date().toISOString()

  // ── Insider Voices ────────────────────────────────────────────────────────
  if (type === 'voices') {
    if (action === 'approve') {
      const { error } = await supabase
        .from('bloglux_articles')
        .update({ status: 'published', published_at: now, reviewed_by: adminId, reviewed_at: now })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else if (action === 'revision') {
      const { error } = await supabase
        .from('bloglux_articles')
        .update({ status: 'revision_requested', revision_note: note || null, reviewed_by: adminId, reviewed_at: now })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase
        .from('bloglux_articles')
        .update({ status: 'rejected', reviewed_by: adminId, reviewed_at: now, admin_notes: note || null })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  // ── Salary ────────────────────────────────────────────────────────────────
  if (type === 'salary') {
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const { error } = await supabase
      .from('contributions')
      .update({ status: newStatus, reviewed_by: adminId, reviewed_at: now, rejection_reason: action === 'reject' ? (note || null) : null })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If approved, promote to salary_benchmarks (best-effort — do not roll back approval on failure)
    if (action === 'approve') {
      const { data: contrib } = await supabase.from('contributions').select('*').eq('id', id).maybeSingle()
      const { data: sal } = await supabase.from('salary_contributions').select('*').eq('contribution_id', id).maybeSingle()
      if (contrib && sal) {
        const { error: benchErr } = await supabase.from('salary_benchmarks').insert({
          contribution_id: id,
          brand_name: contrib.brand_name,
          brand_slug: contrib.brand_slug,
          job_title: sal.job_title,
          department: sal.department,
          seniority: sal.seniority,
          city: sal.city,
          country: sal.country,
          currency: sal.salary_currency || 'EUR',
          salary_min: sal.base_salary,
          salary_max: sal.base_salary,
          salary_median: sal.base_salary,
          bonus_min: sal.bonus_amount || null,
          bonus_max: sal.bonus_amount || null,
          total_comp_min: sal.total_comp || null,
          total_comp_max: sal.total_comp || null,
          year_of_data: sal.year_of_data || null,
          source: 'Member Contribution',
          content_origin: 'contributed',
          is_published: true,
          created_at: now,
        })
        if (benchErr) console.error('salary_benchmarks promotion failed:', benchErr.message)
      }
    }

    // If rejecting a previously-approved contribution, remove the promoted benchmark row
    if (action === 'reject') {
      const { error: delErr } = await supabase
        .from('salary_benchmarks')
        .delete()
        .eq('contribution_id', id)
      if (delErr) console.error('salary_benchmarks rollback failed:', delErr.message)
    }

    return NextResponse.json({ ok: true })
  }

  // ── Interviews ────────────────────────────────────────────────────────────
  if (type === 'interviews') {
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const { error } = await supabase
      .from('contributions')
      .update({ status: newStatus, reviewed_by: adminId, reviewed_at: now, rejection_reason: action === 'reject' ? (note || null) : null })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // ── Brand corrections ─────────────────────────────────────────────────────
  if (type === 'brand') {
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const { error } = await supabase
      .from('brand_contributions')
      .update({ status: newStatus, reviewed_by: adminId, reviewed_at: now, admin_notes: note || null })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}
