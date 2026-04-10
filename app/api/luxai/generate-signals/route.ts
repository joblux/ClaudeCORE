import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkDuplicate } from '@/lib/duplicate-check'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    let { count = 5 } = await request.json()
    if (count > 50) count = 50

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    // Fetch JOBLUX platform data so generation is grounded in real counts, not invented figures
    const [
      signalsTotalRes,
      signalsCategoryRes,
      salaryTotalRes,
      salaryBrandsRes,
      wikiluxRes,
      blogluxRes,
    ] = await Promise.all([
      supabase.from('signals').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('signals').select('category').eq('is_published', true),
      supabase.from('salary_benchmarks').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('salary_benchmarks').select('brand_slug').eq('is_published', true),
      supabase.from('wikilux_content').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('bloglux_articles').select('*', { count: 'exact', head: true }).eq('status', 'published').is('deleted_at', null),
    ])

    const signalsTotal = signalsTotalRes.count || 0
    const signalCategoryCounts: Record<string, number> = {
      contraction: 0,
      expansion: 0,
      growth: 0,
      leadership: 0,
      merger_acquisition: 0,
    }
    for (const row of (signalsCategoryRes.data || []) as Array<{ category: string | null }>) {
      const key = row.category || ''
      if (key in signalCategoryCounts) signalCategoryCounts[key]++
    }
    const salaryTotal = salaryTotalRes.count || 0
    const salaryDistinctBrands = new Set(
      ((salaryBrandsRes.data || []) as Array<{ brand_slug: string | null }>)
        .map(r => r.brand_slug)
        .filter((s): s is string => !!s)
    ).size
    const wikiluxApproved = wikiluxRes.count || 0
    const blogluxPublished = blogluxRes.count || 0

    const platformContextBlock = `JOBLUX PLATFORM CONTEXT — for reference only. Do not invent beyond this.
- Signals (published, total): ${signalsTotal}
  - contraction: ${signalCategoryCounts.contraction}
  - expansion: ${signalCategoryCounts.expansion}
  - growth: ${signalCategoryCounts.growth}
  - leadership: ${signalCategoryCounts.leadership}
  - merger_acquisition: ${signalCategoryCounts.merger_acquisition}
- Salary benchmarks (published): ${salaryTotal} rows across ${salaryDistinctBrands} distinct brands
- WikiLux brands (approved): ${wikiluxApproved}
- Bloglux articles (published, not deleted): ${blogluxPublished}`

    const prompt = `${platformContextBlock}

You are a luxury industry intelligence analyst for JOBLUX. Generate ${count} luxury industry intelligence signal drafts. These are JOBLUX Intelligence draft items, not press clippings. Do not attribute to any external publication.

Each signal must reference REAL luxury brands or groups (LVMH, Kering, Hermès, Chanel, Richemont, Prada, Burberry, Cartier, Dior, Gucci, Rolex, Tiffany, etc.) using their exact names.

Return ONLY a JSON array (no markdown, no backticks):
[
  {
    "category": "growth" | "leadership" | "contraction" | "expansion" | "merger_acquisition",
    "headline": "Short headline [max 80 chars]",
    "context_paragraph": "2-3 sentences of context explaining the signal [max 300 chars]",
    "career_implications": "1-2 sentences on what this may imply for luxury professionals [max 200 chars]",
    "long_context": "A 150-250 word editorial analysis. Distinguish what happened from what it may imply. Use restrained claim language (suggests / indicates / may imply / points to). Do not invent figures, dates, or headcounts.",
    "what_happened": "One clear sentence describing the observation [max 150 chars]",
    "why_it_matters": "One clear sentence on what this may imply for the industry [max 150 chars]",
    "career_detail": ["Career impact #1", "Career impact #2", "Career impact #3"],
    "brand_impact": ["Brand/group impact #1", "Brand/group impact #2", "Brand/group impact #3"],
    "brand_tags": ["BrandName1", "BrandName2"],
    "confidence": "high" | "medium",
    "meta_title": "Headline — Category Signal | JOBLUX Signals",
    "meta_description": "150-char SEO description summarizing the signal and its career implications"
  }
]

CATEGORIES (use exactly these lowercase values):
- growth: revenue increases, record results, market gains (green dot)
- leadership: C-suite changes, creative director moves, board reshuffles (amber dot)
- contraction: layoffs, store closures, declining revenue, cost cuts (red dot)
- expansion: new stores, new markets, geographic growth, new product lines (blue dot)
- merger_acquisition: M&A activity, acquisitions, mergers, stake purchases (purple dot)

RULES:
- ${count} signals exactly
- Mix of categories: use at least 3 different categories
- brand_tags: use exact brand names (Cartier not cartier)
- career_detail: 2-4 career impacts as string array
- brand_impact: 2-4 brand/group impacts as string array
- No duplicate brands across signals
- Generate signal drafts relevant to luxury careers intelligence
- Keep signals grounded in credible luxury industry patterns and the JOBLUX platform context provided above
- Do not invent specific statistics, financial figures, dates, headcounts, or market totals
- Distinguish what happened from what it may imply
- Use restrained claim language: suggests, indicates, may imply, points to
- Never state company motivations as facts
- Do not present speculative developments as confirmed reported events
- Output valid JSON array only`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Claude API error: ${error}`)
    }

    const data = await response.json()
    const text = data.content[0].text
    const inputTokens = data.usage.input_tokens
    const outputTokens = data.usage.output_tokens
    const cost = (inputTokens * 1.00 / 1000000) + (outputTokens * 5.00 / 1000000)

    console.log('[LUXAI signals] Raw Claude response:', text.substring(0, 500))

    let signals
    try {
      // Strip markdown backticks if present
      let cleaned = text.trim().replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim()

      // Try array first (signals return [...]), fall back to object
      const firstBracket = cleaned.indexOf('[')
      const lastBracket = cleaned.lastIndexOf(']')
      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')

      if (firstBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1)
      } else if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1)
      }

      signals = JSON.parse(cleaned)

      // Wrap single object in array
      if (!Array.isArray(signals)) {
        signals = [signals]
      }
    } catch (e: any) {
      console.error('[LUXAI signals] Raw text that failed parsing:', text)
      throw new Error(`JSON parse failed: ${e.message} — raw starts with: ${text.substring(0, 200)}`)
    }

    console.log(`[LUXAI signals] Parsed ${signals.length} signals from Claude response`)

    // Insert each signal into content_queue as draft, then attempt auto-approve
    const inserted = []
    const insertErrors = []
    let autoApproved = 0
    for (const s of signals) {
      const { data: row, error } = await supabase.from('content_queue').insert({
        content_type: 'signal',
        source_type: 'joblux_generation',
        title: s.headline,
        raw_content: s,
        processed_content: s,
        source_name: 'JOBLUX Intelligence',
        source_url: null,
        byline: 'JOBLUX Intelligence',
        category: s.category,
        brand_tags: s.brand_tags,
        target_surfaces: ['signals', 'homepage'],
        status: 'draft',
      }).select().maybeSingle()

      if (error) {
        console.error(`[LUXAI signals] Insert failed for "${s.headline}":`, error.message, error.details)
        insertErrors.push({ headline: s.headline, error: error.message })
        continue
      }

      if (!row) continue
      inserted.push(row)

      // Auto-approve high-confidence signals
      const pc = s
      const canAutoApprove =
        pc.confidence === 'high' &&
        Array.isArray(pc.brand_tags) && pc.brand_tags.length > 0 &&
        pc.category && pc.category.trim() !== '' &&
        pc.what_happened && pc.what_happened.trim() !== ''

      if (!canAutoApprove) continue

      // Duplicate check
      const dupe = await checkDuplicate({
        content_type: 'signal',
        headline: s.headline,
      }, row.id)

      if (dupe.isDuplicate) {
        console.log(`[LUXAI signals] Duplicate detected for "${s.headline}", left as draft`)
        continue
      }

      // Publish directly to signals table
      const now = new Date().toISOString()
      const slug = (s.headline || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80)

      const { data: newSignal, error: publishError } = await supabase
        .from('signals')
        .insert({
          headline: s.headline,
          category: pc.category,
          context_paragraph: pc.context_paragraph || null,
          career_implications: pc.career_implications || null,
          long_context: pc.long_context || null,
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

      if (publishError) {
        console.error(`[LUXAI signals] Auto-approve publish failed for "${s.headline}":`, publishError.message)
        continue
      }

      await supabase
        .from('content_queue')
        .update({
          status: 'published',
          reviewed_at: now,
          destination_table: 'signals',
          destination_id: newSignal?.id || null,
        })
        .eq('id', row.id)

      autoApproved++
      console.log(`[LUXAI signals] Auto-approved: "${s.headline}"`)
    }

    if (insertErrors.length > 0) {
      console.error(`[LUXAI signals] ${insertErrors.length}/${signals.length} inserts failed:`, JSON.stringify(insertErrors))
    }

    // Log to history
    await supabase.from('luxai_history').insert({
      type: 'signal_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: `Generate ${count} signals`,
      response: {
        count: inserted.length,
        parsed: signals.length,
        auto_approved: autoApproved,
        errors: insertErrors.length > 0 ? insertErrors : undefined
      },
      tokens_used: inputTokens + outputTokens,
      cost_usd: cost,
      status: inserted.length > 0 ? 'success' : 'error'
    })

    return NextResponse.json({
      success: inserted.length > 0,
      message: inserted.length > 0
        ? `${inserted.length} signals generated${autoApproved > 0 ? `, ${autoApproved} auto-published` : ', pending approval'}`
        : `Parsed ${signals.length} signals but all inserts failed — check logs`,
      data: {
        count: inserted.length,
        parsed: signals.length,
        auto_approved: autoApproved,
        failed: insertErrors.length,
        cost,
        tokens: inputTokens + outputTokens,
        errors: insertErrors.length > 0 ? insertErrors : undefined
      }
    })
  } catch (error: any) {
    console.error('[LUXAI signals] Fatal error:', error)
    await supabase.from('luxai_history').insert({
      type: 'signal_generation',
      model: 'claude-haiku-4-5-20251001',
      prompt: 'Generate signals',
      response: { error: error.message },
      tokens_used: 0,
      cost_usd: 0,
      status: 'error'
    }).then(() => {})
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
