import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'admin'

  let query = supabase.from('escape_advisors').select('*').order('created_at')
  if (!isAdmin) {
    query = query.eq('status', 'active')
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ advisors: data })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  if (!body.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('escape_advisors')
    .insert({
      name: body.name,
      photo_url: body.photo_url || null,
      bases: body.bases || [],
      languages: body.languages || [],
      specialties: body.specialties || [],
      regions: body.regions || [],
      bio: body.bio || null,
      travel_style: body.travel_style || null,
      min_budget_per_night: body.min_budget_per_night || '$250',
      social_links: body.social_links || {},
      status: body.status || 'active',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
