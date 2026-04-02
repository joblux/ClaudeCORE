import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch from luxai_queue (signals, salary, interview)
    const { data: queueItems, error: queueError } = await supabase
      .from('luxai_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (queueError) console.error('Queue fetch error:', queueError)

    // 2. Fetch pending WikiLux edits
    const { data: wikiluxItems, error: wikiluxError } = await supabase
      .from('wikilux_content')
      .select('id, slug, brand_name, content, editorial_notes, editorial_updated_at, status, updated_at')
      .eq('status', 'pending')
      .order('updated_at', { ascending: false })

    if (wikiluxError) console.error('WikiLux fetch error:', wikiluxError)

    // 3. Fetch draft Research Reports and Insider Voices from bloglux_articles
    const { data: articleItems, error: articleError } = await supabase
      .from('bloglux_articles')
      .select('id, slug, title, excerpt, category, author_name, author_role, created_at')
      .eq('status', 'draft')
      .in('category', ['Research Report', 'Insider Voice'])
      .order('created_at', { ascending: false })

    if (articleError) console.error('Articles fetch error:', articleError)

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
      created_at: item.updated_at,
      source: 'wikilux',
    }))

    // Normalize article items (Research Reports + Insider Voices)
    const normalizedArticles = (articleItems || []).map(item => ({
      id: item.id,
      type: item.category === 'Research Report' ? 'report' : 'insider_voice',
      content_type: item.category.toUpperCase().replace(' ', '_'),
      title: item.title,
      content: {
        excerpt: item.excerpt,
        author_name: item.author_name,
        author_role: item.author_role,
        category: item.category,
      },
      status: 'pending',
      generated_at: item.created_at,
      reviewed_at: null,
      reviewed_by: null,
      created_at: item.created_at,
      source: 'bloglux_articles',
    }))

    // Tag queue items with source
    const normalizedQueue = (queueItems || []).map(item => ({
      ...item,
      source: 'luxai_queue',
    }))

    // Combine and sort by date
    const combined = [...normalizedQueue, ...normalizedWikilux, ...normalizedArticles]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ queue: combined })
  } catch (error: any) {
    console.error('Queue API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
