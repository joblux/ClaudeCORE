import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('internship_listings')
      .update({ status: 'expired', updated_at: now })
      .eq('status', 'approved')
      .lt('expires_at', now)
      .select('id')

    if (error) {
      console.error('Expire internships error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ expired: data?.length || 0 })
  } catch (err) {
    console.error('GET /api/internships/expire error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
