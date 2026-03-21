import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Fetch approved comments with member info
    const { data: comments, error } = await supabase
      .from('bloglux_comments')
      .select(`
        id,
        content,
        parent_id,
        created_at,
        member_id,
        bloglux_members (
          first_name,
          last_name,
          access_level
        )
      `)
      .eq('article_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    // Organize into top-level comments and nested replies
    const topLevel: any[] = []
    const repliesMap: Record<string, any[]> = {}

    for (const comment of comments || []) {
      const formatted = {
        id: comment.id,
        content: comment.content,
        parent_id: comment.parent_id,
        created_at: comment.created_at,
        member_id: comment.member_id,
        member: comment.bloglux_members,
        replies: [] as any[],
      }

      if (comment.parent_id) {
        if (!repliesMap[comment.parent_id]) {
          repliesMap[comment.parent_id] = []
        }
        repliesMap[comment.parent_id].push(formatted)
      } else {
        topLevel.push(formatted)
      }
    }

    // Attach replies to their parent comments
    for (const comment of topLevel) {
      comment.replies = repliesMap[comment.id] || []
    }

    return NextResponse.json({
      comments: topLevel,
      total: (comments || []).length,
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if ((session.user as any)?.status !== 'approved') {
      return NextResponse.json({ error: 'Approved account required' }, { status: 403 })
    }

    const userId = (session.user as any)?.id
    const { content, parent_id } = await request.json()

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Comment must be at least 10 characters' },
        { status: 400 }
      )
    }

    const { data: comment, error } = await supabase
      .from('bloglux_comments')
      .insert({
        article_id: id,
        member_id: userId,
        content: content.trim(),
        parent_id: parent_id || null,
        is_approved: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 })
    }

    return NextResponse.json({
      comment,
      message: 'Comment submitted for moderation',
    })
  } catch (error) {
    console.error('Error submitting comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
