import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'admin'

  const { searchParams } = new URL(req.url)
  const cruise_line = searchParams.get('cruise_line')
  const is_preferred = searchParams.get('is_preferred')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  let query = supabase
    .from('escape_cruises')
    .select('*', { count: 'exact' })
    .order('is_preferred', { ascending: false })
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (!isAdmin) {
    query = query.eq('status', 'active')
  }

  if (cruise_line) query = query.eq('cruise_line', cruise_line)
  if (is_preferred === 'true') query = query.eq('is_preferred', true)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error, count } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ cruises: data, total: count, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const slug = body.slug || body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  if (!slug || !body.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('escape_cruises')
    .insert({
      ...body,
      slug,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
