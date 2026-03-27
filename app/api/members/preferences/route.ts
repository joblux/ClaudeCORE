import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('opportunity_preferences')
      .select('*')
      .eq('member_id', memberId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || null)
  } catch (err) {
    console.error('GET /api/members/preferences error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const { data, error } = await supabaseAdmin
      .from('opportunity_preferences')
      .upsert(
        {
          ...body,
          member_id: memberId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'member_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Upsert preferences error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PUT /api/members/preferences error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
