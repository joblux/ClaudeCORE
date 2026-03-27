import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if ((session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { data: comments, error } = await supabase
      .from('bloglux_comments')
      .select(`
        id,
        content,
        parent_id,
        created_at,
        is_approved,
        article_id,
        member_id,
        bloglux_members (
          first_name,
          last_name,
          access_level
        ),
        bloglux_articles (
          id,
          title,
          slug
        )
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    return NextResponse.json({ comments: comments || [] })
  } catch (error) {
    console.error('Error fetching pending comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if ((session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id, action } = await request.json()

    if (!id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request. Provide id and action (approve or reject)' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      const { error } = await supabase
        .from('bloglux_comments')
        .update({ is_approved: true })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: 'Failed to approve comment' }, { status: 500 })
      }
    } else {
      // reject: delete the comment
      const { error } = await supabase
        .from('bloglux_comments')
        .delete()
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: 'Failed to reject comment' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error moderating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
