import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { checkDuplicate, DuplicateCheckPayload } from '@/lib/duplicate-check'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string } | undefined)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()

  const { data: record, error: fetchError } = await supabaseAdmin
    .from('content_queue')
    .select('id, content_type, title, processed_content, source_type, source_name, source_url, brand_tags')
    .eq('id', params.id)
    .maybeSingle()

  if (fetchError || !record) {
    return NextResponse.json({ success: false, error: fetchError?.message || 'Record not found' }, { status: 500 })
  }

  // Doctrine enforcement: UI flag alone is not enough; forbidden AI families must not publish.
  if (
    record.source_type === 'joblux_generation' &&
    ['article', 'event', 'salary_benchmark', 'interview'].includes(record.content_type)
  ) {
    return NextResponse.json(
      {
        success: false,
        blocked: true,
        reason: 'Approval blocked: forbidden AI family (doctrine §218 — content_origin ai/luxai not allowed for article/event/salary_benchmark/interview).',
        content_type: record.content_type,
      },
      { status: 403 }
    )
  }

  const pc = (record.processed_content || {}) as Record<string, any>

  let dupePayload: DuplicateCheckPayload | null = null

  if (record.content_type === 'event') {
    dupePayload = {
      content_type: 'event',
      title: pc.title || pc.name || record.title || undefined,
      start_date: pc.start_date || pc.date || undefined,
      city: pc.city || pc.location_city || undefined,
      organizer: pc.organizer || undefined,
    }
  } else if (record.content_type === 'signal') {
    dupePayload = {
      content_type: 'signal',
      headline: record.title || undefined,
      source_url: (record as any).source_url || undefined,
    }
  } else if (record.content_type === 'article') {
    dupePayload = {
      content_type: 'article',
      title: pc.title || record.title || undefined,
      slug: pc.slug || undefined,
    }
  } else if (record.content_type === 'salary_benchmark') {
    dupePayload = {
      content_type: 'salary_benchmark',
      brand_slug: pc.brand_slug || undefined,
    }
  }

  if (dupePayload) {
    const dupe = await checkDuplicate(dupePayload, params.id)
    if (dupe.isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          blocked: true,
          reason: 'Approval blocked: duplicate of existing item',
          match: dupe.match,
        },
        { status: 409 }
      )
    }
  }

  if (record.content_type === 'article') {
    const slug =
      pc.slug ||
      (record.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80)

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

  if (record.content_type === 'salary_benchmark') {
    const records: any[] = Array.isArray(pc.records) ? pc.records : []
    const brand_name: string = pc.brand_name || ''
    const brand_slug: string = pc.brand_slug || ''

    if (!brand_name || !brand_slug || records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot publish salary benchmark: missing brand_name, brand_slug, or records.' },
        { status: 400 }
      )
    }

    for (const r of records) {
      const dupe = await checkDuplicate(
        {
          content_type: 'salary_benchmark',
          brand_slug,
          job_title: r.job_title,
          city: r.city,
          seniority: r.seniority,
        },
        params.id
      )

      if (dupe.isDuplicate) {
        return NextResponse.json(
          {
            success: false,
            blocked: true,
            reason: 'Approval blocked: duplicate of existing item',
            match: dupe.match,
          },
          { status: 409 }
        )
      }
    }

    // Market (source-backed) items arrive with source_type='external_feed' + a citable
    // source_url; AI items arrive with 'joblux_generation'. No source → no market publish.
    const isMarket = record.source_type === 'external_feed'
    if (isMarket && !record.source_url) {
      return NextResponse.json(
        { success: false, error: 'Market salary publish requires a source_url.' },
        { status: 400 }
      )
    }

    const rows = records.map((r) => ({
      brand_name,
      brand_slug,
      job_title: r.job_title,
      department: r.department,
      seniority: r.seniority,
      city: r.city,
      country: r.country,
      currency: r.currency,
      salary_min: r.salary_min,
      salary_max: r.salary_max,
      salary_median: r.salary_median,
      // Market rows preserve the source year when provided (per-record → queue-level → 2026
      // fallback). AI/joblux_generation path is unchanged: always 2026.
      year_of_data: isMarket ? (r.year_of_data ?? pc.year_of_data ?? 2026) : 2026,
      source: isMarket ? (record.source_name || 'Market source') : 'JOBLUX Intelligence',
      content_origin: isMarket ? 'market' : 'luxai',
      is_published: true,
      ...(isMarket ? { source_url: record.source_url, confidence: 'verified' } : {}),
    }))

    const { error: insertError } = await supabaseAdmin.from('salary_benchmarks').insert(rows)
    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    // Functional parity: the brand-page Salaries tab reads content.salaries (blob,
    // roles[].cities[]) from wikilux_content. Write the verbatim WikiLux blob here,
    // AFTER the salary_benchmarks insert and BEFORE marking the queue item published.
    // Absent pc.salaries (legacy records-only queue items) → skip, do not fail.
    const salariesBlob = pc.salaries
    if (salariesBlob && typeof salariesBlob === 'object' && !Array.isArray(salariesBlob)) {
      const { data: brandRow } = await supabaseAdmin
        .from('wikilux_content')
        .select('content')
        .eq('slug', brand_slug)
        .maybeSingle()

      const updatedContent = { ...((brandRow?.content as Record<string, any>) || {}), salaries: salariesBlob }

      const { error: wikiError } = await supabaseAdmin
        .from('wikilux_content')
        .update({ content: updatedContent, updated_at: now })
        .eq('slug', brand_slug)

      if (wikiError) {
        // salary_benchmarks already inserted; queue item NOT yet published → partial write.
        return NextResponse.json(
          {
            success: false,
            error: wikiError.message,
            partial_write: `salary_benchmarks inserted (${rows.length}) but wikilux_content.salaries blob failed; queue item left unpublished.`,
          },
          { status: 500 }
        )
      }
    }

    await supabaseAdmin
      .from('content_queue')
      .update({
        status: 'published',
        reviewed_at: now,
        destination_table: 'salary_benchmarks',
      })
      .eq('id', params.id)

    return NextResponse.json({ success: true, inserted: rows.length })
  }

  if (record.content_type === 'interview') {
    // Generator emits a single processed_content.interview object (since a2f5dd3).
    // Legacy batch shape (processed_content.interviews[]) is not supported here.
    const iv = (pc.interview || null) as Record<string, any> | null
    if (!iv || typeof iv !== 'object' || Array.isArray(iv)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot publish interview: processed_content.interview missing (legacy batch shape not supported).',
        },
        { status: 400 }
      )
    }

    // NOT-NULL pre-checks — fail before any insert or status mutation.
    if (!iv.job_title) {
      return NextResponse.json(
        { success: false, error: 'Cannot publish interview: job_title required.' },
        { status: 400 }
      )
    }
    if (!iv.process_description) {
      return NextResponse.json(
        { success: false, error: 'Cannot publish interview: process_description required.' },
        { status: 400 }
      )
    }

    // Strict enum normalize — null passes (nullable cols), canonical passes,
    // known aliases map, anything else throws. No silent default.
    const normEnum = (
      field: string,
      value: any,
      aliasMap: Record<string, string>,
      canonical: string[]
    ): string | null => {
      if (value == null) return null
      if (canonical.includes(value)) return value
      if (aliasMap[value]) return aliasMap[value]
      throw { field, value }
    }

    let normDifficulty: string | null
    let normOutcome: string | null
    let normSeniority: string | null
    let normOverall: string | null
    try {
      normDifficulty = normEnum(
        'difficulty',
        iv.difficulty,
        { medium: 'moderate', hard: 'challenging', very_hard: 'very_challenging' },
        ['easy', 'moderate', 'challenging', 'very_challenging']
      )
      normOutcome = normEnum(
        'outcome',
        iv.outcome,
        { accepted: 'offered' },
        ['offered', 'rejected', 'withdrew', 'pending', 'prefer_not_to_say']
      )
      normSeniority = normEnum(
        'seniority',
        iv.seniority,
        { mid: 'mid-level', executive: 'c-suite' },
        ['intern', 'junior', 'mid-level', 'senior', 'director', 'vp', 'c-suite']
      )
      normOverall = normEnum(
        'overall_experience',
        iv.overall_experience,
        {},
        ['positive', 'neutral', 'negative']
      )
    } catch (e: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot publish interview: unmappable ${e.field}="${e.value}". Edit queue item first.`,
        },
        { status: 400 }
      )
    }

    // brand_slug/brand_name are nullable — warn, do not block.
    const warnings: string[] = []
    if (!pc.brand_slug) warnings.push('missing brand_slug')
    if (!pc.brand_name) warnings.push('missing brand_name')
    if (warnings.length) console.warn(`Interview publish warnings (${params.id}):`, warnings.join(', '))

    const { data: newRow, error: insertError } = await supabaseAdmin
      .from('interview_experiences')
      .insert({
        contribution_id: null,
        job_title: iv.job_title,
        process_description: iv.process_description,
        department: iv.department ?? null,
        seniority: normSeniority,
        location: iv.location ?? null,
        interview_year: iv.interview_year ?? null,
        process_duration: iv.process_duration ?? null,
        number_of_rounds: iv.number_of_rounds ?? null,
        interview_format: iv.interview_format ?? null,
        questions_asked: iv.questions_asked ?? null,
        tips: iv.tips ?? null,
        outcome: normOutcome,
        difficulty: normDifficulty,
        overall_experience: normOverall,
        brand_slug: pc.brand_slug ?? null,
        brand_name: pc.brand_name ?? null,
        content_origin: 'luxai',
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
        destination_table: 'interview_experiences',
        destination_id: newRow?.id || null,
      })
      .eq('id', params.id)

    return NextResponse.json({
      success: true,
      published: true,
      destination_id: newRow?.id || null,
      ...(warnings.length ? { warnings } : {}),
    })
  }

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

  const slug = (record.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)

  if (record.content_type === 'event') {
    const eventTitle = pc.title || pc.name || record.title
    const eventSlug =
      slug ||
      (eventTitle || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80)
    const eventStartDate = pc.start_date || pc.date || null

    if (!eventTitle || !eventSlug || !eventStartDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot publish event: missing required fields (name, slug, or start_date). Edit the queue item first.',
        },
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

  if (!pc.category || (!pc.context_paragraph && !pc.what_happened)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Cannot publish signal: processed_content incomplete (synthesis required). Edit the queue item first.',
      },
      { status: 400 }
    )
  }

  // Sourced signals (external_feed) publish with their real provenance; AI signals
  // keep the JOBLUX Intelligence attribution. No source → no sourced publish.
  const isSourced = record.source_type === 'external_feed'
  if (isSourced && !record.source_url) {
    return NextResponse.json(
      { success: false, error: 'Sourced signal publish requires a source_url.' },
      { status: 400 }
    )
  }

  // GPT condition (633d6f8c): no publication from an unread/paywalled source.
  // source_read is set mechanically by the synthesize route, never by the model.
  if (isSourced && pc.source_read !== true) {
    return NextResponse.json(
      {
        success: false,
        blocked: true,
        reason: 'Thin source — signal synthesized without a read source is not approvable.',
      },
      { status: 403 }
    )
  }

  // JOBLUX headline (Mo+GPT): a sourced signal publishes its own synthesized
  // headline, never the source's title. AI/historical path keeps record.title
  // and the title-derived slug byte-identical.
  const useJobluxHeadline = isSourced && typeof pc.headline === 'string' && pc.headline.trim().length > 0
  const signalHeadline = useJobluxHeadline ? pc.headline : record.title
  const signalSlug = useJobluxHeadline
    ? pc.headline
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80)
    : slug

  const { data: newSignal, error: insertError } = await supabaseAdmin
    .from('signals')
    .insert({
      headline: signalHeadline,
      category: pc.category,
      context_paragraph: pc.context_paragraph || null,
      career_implications: pc.career_implications || null,
      long_context: pc.strategic_read || pc.long_context || null,
      what_happened: pc.what_happened || null,
      why_it_matters: pc.why_it_matters || null,
      career_detail: pc.career_detail || null,
      brand_impact: pc.brand_impact || null,
      brand_tags: isSourced ? (pc.brand_tags || record.brand_tags || null) : (pc.brand_tags || null),
      meta_title: pc.meta_title || null,
      meta_description: pc.meta_description || null,
      confidence: pc.confidence || 'high',
      source_name: isSourced ? (record.source_name || null) : 'JOBLUX Intelligence',
      source_url: isSourced ? record.source_url : null,
      content_origin: isSourced ? 'sourced' : 'ai',
      is_published: true,
      is_pinned: false,
      published_at: now,
      slug: signalSlug,
    })
    .select('id')
    .maybeSingle()

  if (insertError) {
    return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
  }

  const destinationId = newSignal?.id || null

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
