import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/trash — list all soft-deleted items across 4 tables
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [wikilux, articles, contributions, interviews] = await Promise.all([
    supabase
      .from('wikilux_content')
      .select('id, slug, brand_name, deleted_at, deleted_by')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false }),
    supabase
      .from('bloglux_articles')
      .select('id, slug, title, author_name, category, deleted_at, deleted_by')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false }),
    supabase
      .from('contributions')
      .select('id, contribution_type, brand_name, brand_slug, status, member_id, deleted_at, deleted_by')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false }),
    supabase
      .from('interview_experiences')
      .select('id, contribution_id, job_title, department, deleted_at')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false }),
  ])

  // Build a lookup of interview details by contribution_id
  const interviewByContribution: Record<string, { job_title: string; department: string | null }> = {}
  for (const iv of interviews.data || []) {
    interviewByContribution[iv.contribution_id] = { job_title: iv.job_title, department: iv.department }
  }

  // Normalize into unified items
  const items: Array<{
    id: string
    content_type: string
    label: string
    sublabel: string | null
    deleted_at: string
    deleted_by: string | null
    original_status: string | null
    meta: Record<string, unknown>
  }> = []

  for (const row of wikilux.data || []) {
    items.push({
      id: row.id,
      content_type: 'wikilux',
      label: row.brand_name || row.slug,
      sublabel: `WikiLux · ${row.slug}`,
      deleted_at: row.deleted_at,
      deleted_by: row.deleted_by,
      original_status: null,
      meta: { slug: row.slug },
    })
  }

  for (const row of articles.data || []) {
    items.push({
      id: row.id,
      content_type: 'article',
      label: row.title || row.slug,
      sublabel: `${row.category || 'Article'} · ${row.author_name || 'Unknown'}`,
      deleted_at: row.deleted_at,
      deleted_by: row.deleted_by,
      original_status: null,
      meta: { slug: row.slug },
    })
  }

  for (const row of contributions.data || []) {
    // Interview contributions: merge child details into one logical item
    const isInterview = row.contribution_type === 'interview_experience'
    const ivDetail = isInterview ? interviewByContribution[row.id] : null

    let label = row.brand_name || row.brand_slug || 'Unknown brand'
    let sublabel = row.contribution_type === 'salary_data'
      ? 'Salary contribution'
      : row.contribution_type === 'wikilux_insight'
        ? 'WikiLux insight'
        : 'Interview experience'

    if (ivDetail) {
      label = `${ivDetail.job_title || 'Interview'} at ${label}`
      sublabel = `Interview experience${ivDetail.department ? ` · ${ivDetail.department}` : ''}`
    }

    items.push({
      id: row.id,
      content_type: isInterview ? 'interview' : 'contribution',
      label,
      sublabel,
      deleted_at: row.deleted_at,
      deleted_by: row.deleted_by,
      original_status: row.status,
      meta: { contribution_type: row.contribution_type, brand_slug: row.brand_slug },
    })
  }

  // Sort all items by deleted_at descending
  items.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime())

  return NextResponse.json({ items })
}

// POST /api/admin/trash — restore or permanently delete
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action, content_type, id } = await req.json()

  if (!action || !content_type || !id) {
    return NextResponse.json({ error: 'action, content_type, and id are required' }, { status: 400 })
  }

  if (!['restore', 'permanent_delete'].includes(action)) {
    return NextResponse.json({ error: 'action must be restore or permanent_delete' }, { status: 400 })
  }

  // ── Restore ─────────────────────────────────────────────────────────────
  if (action === 'restore') {
    if (content_type === 'wikilux') {
      const { error } = await supabase
        .from('wikilux_content')
        .update({ deleted_at: null, deleted_by: null })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, restored: true })
    }

    if (content_type === 'article') {
      const { error } = await supabase
        .from('bloglux_articles')
        .update({ deleted_at: null, deleted_by: null })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, restored: true })
    }

    if (content_type === 'contribution') {
      const { error } = await supabase
        .from('contributions')
        .update({ deleted_at: null, deleted_by: null })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, restored: true })
    }

    if (content_type === 'interview') {
      // Restore both parent contribution and child interview_experiences
      const { error: e1 } = await supabase
        .from('contributions')
        .update({ deleted_at: null, deleted_by: null })
        .eq('id', id)
      if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })
      const { error: e2 } = await supabase
        .from('interview_experiences')
        .update({ deleted_at: null, deleted_by: null })
        .eq('contribution_id', id)
      if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })
      return NextResponse.json({ ok: true, restored: true })
    }

    return NextResponse.json({ error: 'Unknown content_type' }, { status: 400 })
  }

  // ── Permanent delete ────────────────────────────────────────────────────
  if (action === 'permanent_delete') {
    if (content_type === 'wikilux') {
      const { error } = await supabase
        .from('wikilux_content')
        .delete()
        .eq('id', id)
        .not('deleted_at', 'is', null)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, permanently_deleted: true })
    }

    if (content_type === 'article') {
      // bloglux_comments and bloglux_reactions cascade on delete
      const { error } = await supabase
        .from('bloglux_articles')
        .delete()
        .eq('id', id)
        .not('deleted_at', 'is', null)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, permanently_deleted: true })
    }

    if (content_type === 'contribution') {
      // Salary: delete promoted benchmarks + salary_contributions + parent
      const { error: e1 } = await supabase.from('salary_benchmarks').delete().eq('contribution_id', id)
      if (e1) console.error('delete salary_benchmarks failed:', e1.message)
      const { error: e2 } = await supabase.from('salary_contributions').delete().eq('contribution_id', id)
      if (e2) console.error('delete salary_contributions failed:', e2.message)
      const { error: e3 } = await supabase
        .from('contributions')
        .delete()
        .eq('id', id)
        .not('deleted_at', 'is', null)
      if (e3) return NextResponse.json({ error: e3.message }, { status: 500 })
      return NextResponse.json({ ok: true, permanently_deleted: true })
    }

    if (content_type === 'interview') {
      // Child first, then parent
      const { error: e1 } = await supabase.from('interview_experiences').delete().eq('contribution_id', id)
      if (e1) console.error('delete interview_experiences failed:', e1.message)
      const { error: e2 } = await supabase
        .from('contributions')
        .delete()
        .eq('id', id)
        .not('deleted_at', 'is', null)
      if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })
      return NextResponse.json({ ok: true, permanently_deleted: true })
    }

    return NextResponse.json({ error: 'Unknown content_type' }, { status: 400 })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
