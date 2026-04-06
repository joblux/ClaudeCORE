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
    .select('id, content_type, title, processed_content, source_type, source_name')
    .eq('id', params.id)
    .maybeSingle()

  if (fetchError || !record) {
    return NextResponse.json({ success: false, error: fetchError?.message || 'Record not found' }, { status: 500 })
  }

  // Article: approve and publish to bloglux_articles
  if (record.content_type === 'article') {
    const pc = (record.processed_content || {}) as Record<string, any>
    const slug = pc.slug || (record.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80)

    const { data: newArticle, error: insertError } = await supabaseAdmin
      .from('bloglux_articles')
      .insert({
        title: pc.title || record.title,
        subtitle: pc.subtitle || null,
        slug,
        body: pc.body || null,
        excerpt: pc.excerpt || null,
        tags: pc.tags || null,
        category: pc.category || null,
        read_time_minutes: pc.read_time_minutes || 5,
        author_name: 'JOBLUX Intelligence',
        content_origin: 'ai',
        status: 'published',
        published_at: now,
      })
      .select('id')
      .maybeSingle()

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    await supabaseAdmin
      .from('content_queue')
      .update({
        status: 'published',
        reviewed_at: now,
        destination_table: 'bloglux_articles',
        destination_id: newArticle?.id || null,
      })
      .eq('id', params.id)

    return NextResponse.json({ success: true, published: true, destination_id: newArticle?.id || null })
  }

  // Unhandled content types: approve only, no publish
  if (record.content_type !== 'signal' && record.content_type !== 'event') {
    const { error } = await supabaseAdmin
      .from('content_queue')
      .update({ status: 'approved', reviewed_at: now })
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }

  const pc = (record.processed_content || {}) as Record<string, any>
  const slug = (record.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)

  // Event: approve and publish to events table
  if (record.content_type === 'event') {
    const eventTitle = pc.title || pc.name || record.title
    const eventSlug = slug || (eventTitle || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80)
    const eventStartDate = pc.start_date || pc.date || null

    if (!eventTitle || !eventSlug || !eventStartDate) {
      return NextResponse.json(
        { success: false, error: 'Cannot publish event: missing required fields (name, slug, or start_date). Edit the queue item first.' },
        { status: 400 }
      )
    }

    const { data: newEvent, error: insertError } = await supabaseAdmin
      .from('events')
      .insert({
        title: eventTitle,
        name: eventTitle,
        slug: eventSlug,
        location_city: pc.city || pc.location_city || null,
        location_country: pc.country || pc.location_country || null,
        city: pc.city || pc.location_city || null,
        location: [pc.city || pc.location_city, pc.country || pc.location_country].filter(Boolean).join(', ') || null,
        sector: pc.sector || null,
        start_date: pc.start_date || pc.date || null,
        end_date: pc.end_date || null,
        event_date: pc.start_date || pc.date || null,
        description: pc.description || null,
        long_description: pc.long_description || null,
        highlights: pc.highlights || null,
        brands_present: pc.brands_present || null,
        career_opportunities: pc.career_opportunities || null,
        networking_tips: pc.networking_tips || null,
        practical_info: pc.practical_info || null,
        career_context: pc.career_context || null,
        organizer: pc.organizer || null,
        attendance: pc.attendance || null,
        type: pc.type || null,
        website_url: pc.website_url || null,
        meta_title: pc.meta_title || null,
        meta_description: pc.meta_description || null,
        is_published: true,
        content_origin: record.source_type === 'external_feed' ? 'rss' : 'ai',
        is_featured: false,
        source: record.source_name || 'joblux_generation',
      })
      .select('id')
      .maybeSingle()

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    const destinationId = newEvent?.id || null

    await supabaseAdmin
      .from('content_queue')
      .update({
        status: 'published',
        reviewed_at: now,
        destination_table: 'events',
        destination_id: destinationId,
      })
      .eq('id', params.id)

    return NextResponse.json({ success: true, published: true, destination_id: destinationId })
  }

  // Signal: approve and publish to signals table
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
