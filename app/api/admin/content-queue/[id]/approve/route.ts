import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin
    .from('content_queue')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
