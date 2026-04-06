import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const now = new Date().toISOString()

  // Fetch the queue record
  const { data: record, error: fetchError } = await supabaseAdmin
    .from('content_queue')
    .select('id, content_type, title, processed_content')
    .eq('id', params.id)
    .maybeSingle()

  if (fetchError || !record) {
    return NextResponse.json({ success: false, error: fetchError?.message || 'Record not found' }, { status: 500 })
  }

  // Non-signal types: approve only, no publish
  if (record.content_type !== 'signal') {
    const { error } = await supabaseAdmin
      .from('content_queue')
      .update({ status: 'approved', reviewed_at: now })
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  // Signal: approve and publish to signals table
  const pc = (record.processed_content || {}) as Record<string, any>
  const slug = (record.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)

  const { data: newSignal, error: insertError } = await supabaseAdmin
    .from('signals')
    .insert({
      headline: record.title,
      category: pc.category,
      context_paragraph: pc.context_paragraph || null,
      career_implications: pc.career_implications || null,
      long_context: pc.strategic_read || pc.long_context || null,
      what_happened: pc.what_happened || null,
      why_it_matters: pc.why_it_matters || null,
      career_detail: pc.career_detail || null,
      brand_impact: pc.brand_impact || null,
      brand_tags: pc.brand_tags || null,
      meta_title: pc.meta_title || null,
      meta_description: pc.meta_description || null,
      confidence: pc.confidence || 'high',
      source_name: 'JOBLUX Intelligence',
      source_url: null,
      content_origin: 'ai',
      is_published: true,
      is_pinned: false,
      published_at: now,
      slug,
    })
    .select('id')
    .maybeSingle()

  if (insertError) {
    return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
  }

  const destinationId = newSignal?.id || null

  // Update queue record to published
  await supabaseAdmin
    .from('content_queue')
    .update({
      status: 'published',
      reviewed_at: now,
      destination_table: 'signals',
      destination_id: destinationId,
    })
    .eq('id', params.id)

  return NextResponse.json({ success: true, published: true, destination_id: destinationId })
}
