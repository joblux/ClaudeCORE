import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, type, source } = await req.json()

    // WikiLux approval
    if (source === 'wikilux' || type === 'wikilux') {
      const { data, error } = await supabase
        .from('wikilux_content')
        .update({
          status: 'approved',
          is_published: true,
          published_at: new Date().toISOString(),
          approved_by: (session.user as any).email || 'admin',
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('slug, brand_name')
        .maybeSingle()

      if (error) {
        console.error('WikiLux approve error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `${data?.brand_name || 'Brand'} approved and published`,
      })
    }

    // Signal approval — direct from signals table
    if (source === 'signals' && type === 'signal') {
      const { error } = await supabase
        .from('signals')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        console.error('Signal approve error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Signal published' })
    }

    // Research Report or Insider Voice approval | publish from bloglux_articles
    if (source === 'bloglux_articles' || type === 'report' || type === 'insider_voice') {
      const { data, error } = await supabase
        .from('bloglux_articles')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('title, category')
        .maybeSingle()

      if (error) {
        console.error('Article approve error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `"${data?.title}" published`,
      })
    }

    // content_queue approval (canonical editorial gate)
    const { data: item } = await supabase
      .from('content_queue')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (!item) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 })
    }

    const now = new Date().toISOString()
    const rc = (item.raw_content || {}) as Record<string, any>
    const pc = (item.processed_content || {}) as Record<string, any>

    // Shape guard — run BEFORE any status change. RSS-shape drafts (raw_content has
    // link/feed_url but no headline/name) are not publishable here; they need enrichment.
    // Leave the queue row untouched (stays 'draft').
    const isRssShape =
      (('link' in rc) || ('feed_url' in rc)) && !('headline' in rc) && !('name' in rc)
    if (isRssShape) {
      return NextResponse.json(
        { error: 'RSS-shape draft not publishable via approve (enrichment required)', skipped: true },
        { status: 422 }
      )
    }

    // Publish the RICH (LuxAI-generated) draft to its destination table, capture the id.
    // If the destination insert fails, return 500 and do NOT mark approved (no orphan approve).
    let destinationTable: string
    let destinationId: any

    if (item.content_type === 'signal') {
      const { data, error } = await supabase
        .from('signals')
        .insert({
          headline: rc.headline,
          category: rc.category,
          context_paragraph: rc.context_paragraph,
          what_happened: rc.what_happened,
          why_it_matters: rc.why_it_matters,
          career_implications: rc.career_implications,
          confidence: rc.confidence,
          brand_tags: rc.brand_tags,
          slug: rc.slug ?? null,
          is_published: true,
          published_at: now,
        })
        .select('id')
        .maybeSingle()
      if (error) {
        console.error('Signal publish error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      destinationTable = 'signals'
      destinationId = data?.id
    } else if (item.content_type === 'event') {
      // Pull each key from raw_content when present; omit keys absent from raw_content.
      const eventRow: Record<string, any> = { is_published: true, slug: rc.slug ?? null }
      for (const k of [
        'name', 'start_date', 'end_date', 'location_city', 'location_country',
        'sector', 'description', 'long_description', 'highlights', 'brands_present',
        'career_opportunities', 'networking_tips', 'organizer', 'attendance', 'type',
        'website_url', 'meta_title', 'meta_description', 'practical_info',
      ]) {
        if (k in rc) eventRow[k] = rc[k]
      }
      const { data, error } = await supabase
        .from('events')
        .insert(eventRow)
        .select('id')
        .maybeSingle()
      if (error) {
        console.error('Event publish error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      destinationTable = 'events'
      destinationId = data?.id
    } else if (item.content_type === 'article') {
      const { data, error } = await supabase
        .from('bloglux_articles')
        .insert({
          title: pc.title,
          subtitle: pc.subtitle,
          excerpt: pc.excerpt,
          body: pc.body,
          category: pc.category,
          tags: pc.tags,
          slug: pc.slug,
          read_time_minutes: pc.read_time_minutes,
          status: 'published',
          published_at: now,
        })
        .select('id')
        .maybeSingle()
      if (error) {
        console.error('Article publish error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      destinationTable = 'bloglux_articles'
      destinationId = data?.id
    } else {
      // Unknown/unsupported content_type (e.g. salary_benchmark) — no status change.
      return NextResponse.json({ error: 'Unsupported content_type for approve' }, { status: 422 })
    }

    // Destination insert succeeded — now mark the queue row approved and record the link.
    const { error: queueError } = await supabase
      .from('content_queue')
      .update({
        status: 'approved',
        reviewed_by: (session.user as any).id || null,
        reviewed_at: now,
        destination_table: destinationTable,
        destination_id: destinationId,
      })
      .eq('id', id)
    if (queueError) {
      console.error('Queue update error:', queueError)
      return NextResponse.json({ error: queueError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      destination_table: destinationTable,
      destination_id: destinationId,
    })
  } catch (error: any) {
    console.error('Approve failed:', error)
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
  }
}
