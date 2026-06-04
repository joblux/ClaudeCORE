import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const sp = req.nextUrl.searchParams
    const page = Math.max(1, parseInt(sp.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '50')))
    const offset = (page - 1) * limit

    const db = supabaseAdmin() as any
    const { data, count, error } = await db
      .from('salary_benchmarks')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ benchmarks: data || [], total: count || 0, page, limit })
  } catch (err) {
    console.error('Admin salary API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Direct writes into salary_benchmarks are disabled. Market salaries must flow through the
// source-backed content_queue (POST /api/admin/luxai/market-salary → source_type='external_feed',
// source_url required) and be published only via the content-queue approve mapper after review.
// No direct publish/write bypass. GET (above) is unaffected.
export async function POST() {
  return NextResponse.json(
    { error: 'Direct salary writes are disabled. Use the source-backed market-salary queue.' },
    { status: 410 }
  )
}
