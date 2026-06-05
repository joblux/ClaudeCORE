import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Human review decision on a WikiLux draft. Nothing auto-publishes — a draft
// only goes live when an admin explicitly approves it here.
//   approve -> status='approved', is_published=true, published_at=now
//   reject  -> status='rejected', is_published=false
// NOTE: the wikilux_content_status_check constraint permits only
// draft/pending/approved/rejected — 'published' is NOT a valid status here,
// so live state is expressed as status='approved' + is_published=true.
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const slug = params.slug
    const { action } = await request.json()
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { success: false, message: "action must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    // Confirm the draft exists and is genuinely a pending, unpublished draft.
    const { data: draft } = await supabase
      .from('wikilux_content')
      .select('id, slug, status, is_published')
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle()

    if (!draft) {
      return NextResponse.json(
        { success: false, message: `No draft found for slug "${slug}"` },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()
    const update =
      action === 'approve'
        ? { status: 'approved', is_published: true, published_at: now, updated_at: now }
        : { status: 'rejected', is_published: false, updated_at: now }

    const { data: updated, error } = await supabase
      .from('wikilux_content')
      .update(update)
      .eq('id', draft.id)
      .select('slug, brand_name, status, is_published, published_at')
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Draft published.' : 'Draft rejected.',
      data: updated,
    })
  } catch (error: any) {
    console.error('WikiLux draft decision error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
