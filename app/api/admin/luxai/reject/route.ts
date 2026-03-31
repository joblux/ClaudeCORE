import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()

    await supabase
      .from('luxai_queue')
      .update({ 
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reject failed:', error)
    return NextResponse.json({ error: 'Failed to reject' }, { status: 500 })
  }
}
