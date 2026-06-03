import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkDuplicate, DuplicateCheckPayload } from '@/lib/duplicate-check'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const now = new Date().toISOString()

  const { data: record, error: fetchError } = await supabaseAdmin
    .from('content_queue')
    .select('id, content_type, title, processed_content, source_type, source_name, source_url')
    .eq('id', params.id)
    .maybeSingle()

  if (fetchError || !record) {
    return NextResponse.json({ success: false, error: fetchError?.message || 'Record not found' }, { status: 500 })
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
      year_of_data: 2026,
      source: 'JOBLUX Intelligence',
      content_origin: 'luxai',
      is_published: true,
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
