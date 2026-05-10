import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// /api/profilux/experiences — A2.3-β work_experiences CRUD for the session user
// Activates work_experiences relational table for Career History.
// RLS locked down (0 policies); route gates by session.user.email.
// L1 fallback preserved by resolver when 0 rows. No silent L1->L2 promotion.
// =============================================================================

type ExperienceBody = {
  job_title?: unknown
  company?: unknown
  city?: unknown
  country?: unknown
  start_date?: unknown
  end_date?: unknown
  is_current?: unknown
  description?: unknown
}

const coerceStr = (v: unknown): string | null => {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t === '' ? null : t
}

const coerceBool = (v: unknown): boolean => v === true

async function resolveMemberId(email: string): Promise<string | null> {
  const { data } = await supabase
    .from('members')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  return data?.id ?? null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const memberId = await resolveMemberId(session.user.email)
  if (!memberId) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('work_experiences')
    .select('id, job_title, company, city, country, start_date, end_date, is_current, description')
    .eq('member_id', memberId)
    .order('start_date', { ascending: false, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ experiences: data ?? [] })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const memberId = await resolveMemberId(session.user.email)
  if (!memberId) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  let body: ExperienceBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const job_title = coerceStr(body.job_title)
  const company = coerceStr(body.company)
  const start_date = coerceStr(body.start_date)

  if (!job_title || !company || !start_date) {
    return NextResponse.json(
      { error: 'job_title, company, and start_date are required', code: 'MISSING_REQUIRED' },
      { status: 400 },
    )
  }

  const is_current = coerceBool(body.is_current)
  const end_date = is_current ? null : coerceStr(body.end_date)

  const insertPayload = {
    member_id: memberId,
    job_title,
    company,
    city: coerceStr(body.city),
    country: coerceStr(body.country),
    start_date,
    end_date,
    is_current,
    description: coerceStr(body.description),
  }

  const { data, error } = await supabase
    .from('work_experiences')
    .insert(insertPayload)
    .select('id, job_title, company, city, country, start_date, end_date, is_current, description')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ experience: data })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const memberId = await resolveMemberId(session.user.email)
  if (!memberId) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  let body: ExperienceBody & { id?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const id = typeof body.id === 'string' ? body.id : null
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const job_title = coerceStr(body.job_title)
  const company = coerceStr(body.company)
  const start_date = coerceStr(body.start_date)

  if (!job_title || !company || !start_date) {
    return NextResponse.json(
      { error: 'job_title, company, and start_date are required', code: 'MISSING_REQUIRED' },
      { status: 400 },
    )
  }

  const is_current = coerceBool(body.is_current)
  const end_date = is_current ? null : coerceStr(body.end_date)

  const updatePayload = {
    job_title,
    company,
    city: coerceStr(body.city),
    country: coerceStr(body.country),
    start_date,
    end_date,
    is_current,
    description: coerceStr(body.description),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('work_experiences')
    .update(updatePayload)
    .eq('id', id)
    .eq('member_id', memberId)
    .select('id, job_title, company, city, country, start_date, end_date, is_current, description')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ experience: data })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const memberId = await resolveMemberId(session.user.email)
  if (!memberId) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  let body: { id?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const id = typeof body.id === 'string' ? body.id : null
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('work_experiences')
    .delete()
    .eq('id', id)
    .eq('member_id', memberId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
