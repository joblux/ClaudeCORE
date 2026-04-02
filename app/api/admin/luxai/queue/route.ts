import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Unpublished AI-generated signals
    const { data: signalItems, error: signalError } = await supabase
      .from('signals')
      .select('*')
      .eq('is_published', false)
      .eq('content_origin', 'ai')
      .order('created_at', { ascending: false })

    if (signalError) console.error('Signals fetch error:', signalError)

    // 2. Draft WikiLux content with actual content
    const { data: wikiluxItems, error: wikiluxError } = await supabase
      .from('wikilux_content')
      .select('id, slug, brand_name, content, editorial_notes, editorial_updated_at, status, updated_at, created_at')
      .eq('status', 'draft')
      .neq('content', '{}')
      .order('created_at', { ascending: false })

    if (wikiluxError) console.error('WikiLux fetch error:', wikiluxError)

    // Normalize signals
    const normalizedSignals = (signalItems || []).map(item => ({
      id: item.id,
      type: 'signal',
      content_type: 'SIGNAL',
      title: item.title,
      content: item,
      status: 'pending',
      generated_at: item.created_at,
      reviewed_at: null,
      reviewed_by: null,
      created_at: item.created_at,
      source: 'signals',
    }))

    // Normalize wikilux items
    const normalizedWikilux = (wikiluxItems || []).map(item => ({
      id: item.id,
      type: 'wikilux',
      content_type: 'WIKILUX',
      title: `WikiLux: ${item.brand_name || item.slug}`,
      content: {
        slug: item.slug,
        brand_name: item.brand_name,
        content: item.content,
        editorial_notes: item.editorial_notes,
      },
      status: item.status,
      generated_at: item.editorial_updated_at || item.updated_at,
      reviewed_at: null,
      reviewed_by: null,
      created_at: item.created_at,
      source: 'wikilux',
    }))

    // Combine and sort by date
    const combined = [...normalizedSignals, ...normalizedWikilux]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ queue: combined })
  } catch (error: any) {
    console.error('Queue API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
