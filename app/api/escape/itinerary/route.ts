import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const destination_id = searchParams.get('destination_id')

  if (!destination_id) {
    return NextResponse.json({ error: 'destination_id is required' }, { status: 400 })
  }

  const { data, error, count } = await supabase
    .from('escape_itinerary')
    .select('*', { count: 'exact' })
    .eq('destination_id', destination_id)
    .order('day_number', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ days: data, total: count })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()

  if (!body.destination_id || !body.day_number) {
    return NextResponse.json({ error: 'destination_id and day_number are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('escape_itinerary')
    .insert({
      destination_id: body.destination_id,
      day_number: body.day_number,
      title: body.title || null,
      morning_text: body.morning_text || null,
      afternoon_text: body.afternoon_text || null,
      evening_text: body.evening_text || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
