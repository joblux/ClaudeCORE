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
    const session = await getServerSession(authOptions)

    // Get all reactions for this article grouped by type
    const { data: reactions, error } = await supabase
      .from('bloglux_reactions')
      .select('reaction_type')
      .eq('article_id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
    }

    // Count reactions by type
    const counts: Record<string, number> = {}
    for (const reaction of reactions || []) {
      counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1
    }

    // Check which reactions the current user has made
    let userReactions: string[] = []
    if (session?.user) {
      const userId = (session.user as any)?.id
      if (userId) {
        const { data: userReactionData } = await supabase
          .from('bloglux_reactions')
          .select('reaction_type')
          .eq('article_id', id)
          .eq('member_id', userId)

        userReactions = (userReactionData || []).map((r) => r.reaction_type)
      }
    }

    return NextResponse.json({ counts, userReactions })
  } catch (error) {
    console.error('Error fetching reactions:', error)
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
      return NextResponse.json({ error: 'Approved membership required' }, { status: 403 })
    }

    const userId = (session.user as any)?.id
    const { reaction_type } = await request.json()

    if (!['like', 'insightful', 'bookmark'].includes(reaction_type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
    }

    // Check if reaction already exists
    const { data: existing, error: checkError } = await supabase
      .from('bloglux_reactions')
      .select('id')
      .eq('article_id', id)
      .eq('member_id', userId)
      .eq('reaction_type', reaction_type)
      .maybeSingle()

    if (checkError) {
      return NextResponse.json({ error: 'Failed to check reaction' }, { status: 500 })
    }

    if (existing) {
      // Toggle off: delete the reaction
      const { error: deleteError } = await supabase
        .from('bloglux_reactions')
        .delete()
        .eq('id', existing.id)

      if (deleteError) {
        return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 })
      }
    } else {
      // Toggle on: insert the reaction
      const { error: insertError } = await supabase
        .from('bloglux_reactions')
        .insert({
          article_id: id,
          member_id: userId,
          reaction_type,
        })

      if (insertError) {
        return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 })
      }
    }

    // Update likes_count on the articles table
    const { count: likesCount } = await supabase
      .from('bloglux_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', id)
      .eq('reaction_type', 'like')

    await supabase
      .from('bloglux_articles')
      .update({ likes_count: likesCount || 0 })
      .eq('id', id)

    return NextResponse.json({ toggled: !existing })
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
