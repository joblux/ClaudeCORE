import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Try atomic increment via rpc first
    const { error: rpcError } = await supabase.rpc('increment_views', {
      article_id: id,
    })

    // Fallback: if rpc doesn't exist, do a read-then-write
    if (rpcError) {
      const { data: article, error: fetchError } = await supabase
        .from('bloglux_articles')
        .select('views_count')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (fetchError) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
      }

      const { error: updateError } = await supabase
        .from('bloglux_articles')
        .update({ views_count: (article.views_count || 0) + 1 })
        .eq('id', id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing views:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
