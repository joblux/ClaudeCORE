import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { readSourcePage } from '@/lib/luxai/page-reader'
import { synthesizeSignal } from '@/lib/luxai/synthesis'
import type { Discovery } from '@/lib/luxai/discovery-runner'
import type { TriageResult } from '@/lib/luxai/queue-writer'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// LuxAI Signals — Sourced-Signal Synthesis route (633d6f8c Slice B2)
//
// POST { queue_id } → reads the source page (fetch → apify ladder), runs the
// sourced-or-empty synthesis, and writes the result to the queue row's
// processed_content. Status STAYS draft — no publish, no approve-path change;
// Mo review in the cockpit remains the gate. The approve route's completeness
// guard (@e9e2804) is what this output later satisfies.
//
// Mechanical fields are merged HERE, never by the model: category copied from
// the queue row, confidence copied from triage importance, source_read /
// read_method / synthesized_at from code.
// ---------------------------------------------------------------------------

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string } | undefined)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let queueId: string | undefined
  try {
    const body = await req.json()
    queueId = body?.queue_id
  } catch {
    // fall through to the missing-id guard
  }
  if (!queueId) {
    return NextResponse.json({ success: false, error: 'queue_id required.' }, { status: 400 })
  }

  const { data: record, error: fetchError } = await supabaseAdmin
    .from('content_queue')
    .select('id, content_type, source_type, status, source_url, category, raw_content')
    .eq('id', queueId)
    .maybeSingle()

  if (fetchError || !record) {
    return NextResponse.json(
      { success: false, error: fetchError?.message || 'Record not found' },
      { status: fetchError ? 500 : 404 }
    )
  }

  const raw = (record.raw_content || {}) as Record<string, any>
  const discovery = raw.discovery as Discovery | undefined
  const triage = raw.triage_result as TriageResult | undefined

  if (
    record.content_type !== 'signal' ||
    record.source_type !== 'external_feed' ||
    record.status !== 'draft' ||
    !triage ||
    !discovery
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Synthesis requires a draft sourced signal (content_type=signal, source_type=external_feed, status=draft) with raw_content discovery + triage_result.',
      },
      { status: 400 }
    )
  }

  const { text, read_method } = await readSourcePage(record.source_url)

  let synthesis
  try {
    synthesis = await synthesizeSignal(discovery, triage, text)
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: `Synthesis failed: ${e?.message || 'unknown error'}` },
      { status: 500 }
    )
  }

  const processed_content = {
    ...synthesis,
    category: record.category, // mechanical copy — never the model
    confidence: triage.importance, // mechanical copy from triage
    read_method,
    synthesized_at: new Date().toISOString(),
  }

  const { error: updateError } = await supabaseAdmin
    .from('content_queue')
    .update({ processed_content }) // status STAYS draft
    .eq('id', queueId)

  if (updateError) {
    return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, queue_id: queueId, processed_content })
}
