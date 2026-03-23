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
  const featured = searchParams.get('featured')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  let query = supabase
    .from('escape_destinations')
    .select('*', { count: 'exact' })
    .order('name')
    .range(offset, offset + limit - 1)

  if (!isAdmin) {
    query = query.eq('status', 'published')
  } else if (status) {
    query = query.eq('status', status)
  }

  if (featured === 'true') query = query.eq('featured', true)
  if (category) query = query.eq('category', category)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error, count } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ destinations: data, total: count, page, limit })
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
    .from('escape_destinations')
    .insert({
      slug,
      name: body.name,
      region: body.region || null,
      country: body.country || null,
      hero_image: body.hero_image || null,
      description: body.description || null,
      content: body.content || null,
      category: body.category || null,
      experience_count: body.experience_count || 0,
      featured: body.featured || false,
      status: body.status || 'draft',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
