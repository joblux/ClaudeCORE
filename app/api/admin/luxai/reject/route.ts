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

    const { id, source, reason } = await req.json()

    // WikiLux rejection
    if (source === 'wikilux') {
      const { error } = await supabase
        .from('wikilux_content')
        .update({
          status: 'rejected',
          rejection_reason: reason || null,
          approved_by: (session.user as any).email || 'admin',
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Signal rejection — delete unpublished AI signal
    if (source === 'signals') {
      const { error } = await supabase
        .from('signals')
        .delete()
        .eq('id', id)
        .eq('is_published', false)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Standard luxai_queue rejection
    const { error } = await supabase
      .from('luxai_queue')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reject failed:', error)
    return NextResponse.json({ error: 'Failed to reject' }, { status: 500 })
  }
}
