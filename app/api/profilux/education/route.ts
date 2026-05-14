import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// /api/profilux/education — MLV-3.0 education_records CRUD for the session user.
// Mirror of /api/profilux/experiences (c6c7c77 family) for the Education
// collection. RLS locked down; route gates by session.user.email.
// L1 fallback preserved by resolver when 0 rows (ea9a997). No silent L1->L2
// promotion. institution is the only required field (NOT NULL anchor per
// education_records DDL).
// =============================================================================

type EducationBody = {
  institution?: unknown
  degree_level?: unknown
  field_of_study?: unknown
  city?: unknown
  country?: unknown
  start_year?: unknown
  graduation_year?: unknown
}

const coerceStr = (v: unknown): string | null => {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t === '' ? null : t
}

const coerceYear = (v: unknown): number | null => {
  if (v === undefined || v === null) return null
  if (typeof v === 'string') {
    const t = v.trim()
    if (t === '') return null
    const n = Number(t)
    if (!Number.isInteger(n) || n < 0) return null
    return n
  }
  if (typeof v === 'number') {
    if (!Number.isInteger(v) || v < 0) return null
    return v
  }
  return null
}

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
    .from('education_records')
    .select('id, institution, degree_level, field_of_study, city, country, start_year, graduation_year, sort_order')
    .eq('member_id', memberId)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('graduation_year', { ascending: false, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ education: data ?? [] })
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

  let body: EducationBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const institution = coerceStr(body.institution)

  if (!institution) {
    return NextResponse.json(
      { error: 'institution is required', code: 'MISSING_REQUIRED' },
      { status: 400 },
    )
  }

  const insertPayload = {
    member_id: memberId,
    institution,
    degree_level: coerceStr(body.degree_level),
    field_of_study: coerceStr(body.field_of_study),
    city: coerceStr(body.city),
    country: coerceStr(body.country),
    start_year: coerceYear(body.start_year),
    graduation_year: coerceYear(body.graduation_year),
  }

  const { data, error } = await supabase
    .from('education_records')
    .insert(insertPayload)
    .select('id, institution, degree_level, field_of_study, city, country, start_year, graduation_year, sort_order')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ education: data })
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

  let body: EducationBody & { id?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const id = typeof body.id === 'string' ? body.id : null
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const institution = coerceStr(body.institution)

  if (!institution) {
    return NextResponse.json(
      { error: 'institution is required', code: 'MISSING_REQUIRED' },
      { status: 400 },
    )
  }

  const updatePayload = {
    institution,
    degree_level: coerceStr(body.degree_level),
    field_of_study: coerceStr(body.field_of_study),
    city: coerceStr(body.city),
    country: coerceStr(body.country),
    start_year: coerceYear(body.start_year),
    graduation_year: coerceYear(body.graduation_year),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('education_records')
    .update(updatePayload)
    .eq('id', id)
    .eq('member_id', memberId)
    .select('id, institution, degree_level, field_of_study, city, country, start_year, graduation_year, sort_order')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ education: data })
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
    .from('education_records')
    .delete()
    .eq('id', id)
    .eq('member_id', memberId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
