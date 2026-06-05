import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Lists WikiLux drafts awaiting human review — the IQ engine's output surface.
// Pending + unpublished + not-deleted only. Read-only; nothing is mutated here.
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('wikilux_content')
      .select('slug, brand_name, content, created_at')
      .eq('status', 'pending')
      .eq('is_published', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, drafts: data ?? [] })
  } catch (error: any) {
    console.error('WikiLux drafts list error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
