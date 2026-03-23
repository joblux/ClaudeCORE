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
  const city = searchParams.get('city')
  const country = searchParams.get('country')
  const region = searchParams.get('region')
  const destination_id = searchParams.get('destination_id')
  const is_preferred = searchParams.get('is_preferred')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  let query = supabase
    .from('escape_hotels')
    .select('*', { count: 'exact' })
    .order('is_preferred', { ascending: false })
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (!isAdmin) {
    query = query.eq('status', 'active')
  }

  if (city) query = query.eq('city', city)
  if (country) query = query.eq('country', country)
  if (region) query = query.eq('region', region)
  if (destination_id) query = query.eq('destination_id', destination_id)
  if (is_preferred === 'true') query = query.eq('is_preferred', true)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error, count } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let hotels = data

  // If destination_id is set, join destination name
  if (destination_id && hotels && hotels.length > 0) {
    const { data: destination } = await supabase
      .from('escape_destinations')
      .select('name')
      .eq('id', destination_id)
      .single()

    if (destination) {
      hotels = hotels.map((hotel: any) => ({
        ...hotel,
        destination_name: destination.name,
      }))
    }
  }

  return NextResponse.json({ hotels, total: count, page, limit })
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
    .from('escape_hotels')
    .insert({
      name: body.name,
      slug,
      city: body.city || null,
      country: body.country || null,
      region: body.region || null,
      description: body.description || null,
      perks: body.perks || [],
      is_preferred: body.is_preferred || false,
      photos: body.photos || [],
      photo_credit: body.photo_credit || null,
      destination_id: body.destination_id || null,
      category: body.category || null,
      status: body.status || 'active',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
