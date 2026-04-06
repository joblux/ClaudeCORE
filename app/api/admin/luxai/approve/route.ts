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

    await supabase
      .from('content_queue')
      .update({
        status: 'approved',
        reviewed_by: (session.user as any).id || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Publish content to destination table
    if (item.content_type === 'signal' && item.raw_content) {
      await supabase.from('signals').insert({
        title: item.title,
        content: item.raw_content.content,
        type: item.category?.toLowerCase() || 'talent',
        status: 'published',
        published_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Approve failed:', error)
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 })
  }
}
