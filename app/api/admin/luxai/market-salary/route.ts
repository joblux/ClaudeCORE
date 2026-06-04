import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  insertLuxaiQueueItem,
  QueueValidationError,
  queueValidationErrorResponse,
  type LuxaiQueuePayload,
} from '@/lib/luxai-rules'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Source-backed market salary ingestion.
// Writes a salary_benchmark DRAFT into content_queue with source_type='external_feed'
// (which forces source_url via lib/luxai-rules). NEVER writes salary_benchmarks directly —
// publication happens only through the content-queue approve mapper after review.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string } | undefined)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { brand_name, brand_slug, source_url, source_name, year_of_data, records } = body || {}

  if (!source_url || typeof source_url !== 'string' || !source_url.trim()) {
    return NextResponse.json({ error: 'source_url is required' }, { status: 400 })
  }
  if (!brand_name || !brand_slug || !Array.isArray(records) || records.length === 0) {
    return NextResponse.json(
      { error: 'brand_name, brand_slug and a non-empty records[] are required' },
      { status: 400 }
    )
  }

  const payload: LuxaiQueuePayload = {
    content_type: 'salary_benchmark',
    source_type: 'external_feed',
    source_url: source_url.trim(),
    source_name: source_name || null,
    title: `Market Salary: ${brand_name}`,
    raw_content: { brand_name, brand_slug, source_url, source_name: source_name || null },
    processed_content: {
      brand_name,
      brand_slug,
      year_of_data: year_of_data || null,
      records,
    },
    destination_table: 'salary_benchmarks',
  }

  try {
    const { error } = await insertLuxaiQueueItem(supabase, payload)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } catch (e: any) {
    if (e instanceof QueueValidationError) return queueValidationErrorResponse(e)
    throw e
  }

  return NextResponse.json({ queued: true, brand_slug, records: records.length }, { status: 201 })
}
