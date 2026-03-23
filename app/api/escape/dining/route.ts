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
    .from('escape_dining')
    .select('*', { count: 'exact' })
    .eq('destination_id', destination_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ dining: data, total: count })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()

  if (!body.destination_id) {
    return NextResponse.json({ error: 'destination_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('escape_dining')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
