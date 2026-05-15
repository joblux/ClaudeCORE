import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// /api/profilux/sectors — member_sectors CRUD for the session user
// Mirrors /api/profilux/experiences pattern: email gate + resolveMemberId.
// member_sectors: sector text NOT NULL, rank int NOT NULL, UNIQUE(member_id, sector).
// Resolver: L2 (this table) REPLACES L1 sectors entirely when present.
// =============================================================================

type SectorBody = {
  id?: unknown
  sector?: unknown
  rank?: unknown
}

const coerceSector = (v: unknown): string | null => {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t === '' ? null : t
}

const coerceRank = (v: unknown): number | null => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null
  const n = Math.trunc(v)
  return n >= 0 ? n : null
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
    .from('member_sectors')
    .select('id, sector, rank')
    .eq('member_id', memberId)
    .order('rank', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sectors: data ?? [] })
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

  let body: SectorBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const sector = coerceSector(body.sector)
  const rank = coerceRank(body.rank)

  if (!sector || rank === null) {
    return NextResponse.json(
      { error: 'sector and rank are required', code: 'MISSING_REQUIRED' },
      { status: 400 },
    )
  }

  const { data: existing } = await supabase
    .from('member_sectors')
    .select('id')
    .eq('member_id', memberId)
    .ilike('sector', sector)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'This sector already exists on your profile', code: 'DUPLICATE_SECTOR' },
      { status: 409 },
    )
  }

  const { data, error } = await supabase
    .from('member_sectors')
    .insert({ member_id: memberId, sector, rank })
    .select('id, sector, rank')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sector: data }, { status: 201 })
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

  let body: SectorBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const id = typeof body.id === 'string' ? body.id : null
  const sector = coerceSector(body.sector)
  const rank = coerceRank(body.rank)

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }
  if (!sector || rank === null) {
    return NextResponse.json(
      { error: 'sector and rank are required', code: 'MISSING_REQUIRED' },
      { status: 400 },
    )
  }

  const { data, error } = await supabase
    .from('member_sectors')
    .update({ sector, rank })
    .eq('id', id)
    .eq('member_id', memberId)
    .select('id, sector, rank')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ sector: data })
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
    .from('member_sectors')
    .delete()
    .eq('id', id)
    .eq('member_id', memberId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
