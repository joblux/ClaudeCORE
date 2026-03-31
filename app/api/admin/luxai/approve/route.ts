import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { id, type } = await req.json()

    // Update queue item
    await supabase
      .from('luxai_queue')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Publish content based on type
    if (type === 'signal') {
      // Fetch the queue item to get content
      const { data: item } = await supabase
        .from('luxai_queue')
        .select('*')
        .eq('id', id)
        .single()

      if (item) {
        await supabase.from('signals').insert({
          title: item.title,
          content: item.content.content,
          type: item.content_type?.toLowerCase() || 'talent',
          status: 'published',
          published_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approve failed:', error)
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
  }
}
