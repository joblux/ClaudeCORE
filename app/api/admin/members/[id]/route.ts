import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Handle params safely (works in both Next.js 14 and 15)
  const resolvedParams = await Promise.resolve(params)
  const memberId = resolvedParams.id

  if (!memberId) {
    return NextResponse.json({ error: 'Missing member ID' }, { status: 400 })
  }

  try {
    const { data: member, error: memberErr } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('id', memberId)
      .maybeSingle()

    if (memberErr) {
      console.error('Member fetch error:', memberErr)
      return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 })
    }

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const [workRes, eduRes, langRes, docRes, reviewRes] = await Promise.all([
      supabaseAdmin
        .from('work_experiences')
        .select('*')
        .eq('member_id', memberId)
        .order('sort_order', { ascending: true }),
      supabaseAdmin
        .from('education_records')
        .select('*')
        .eq('member_id', memberId)
        .order('sort_order', { ascending: true }),
      supabaseAdmin
        .from('member_languages')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: true }),
      supabaseAdmin
        .from('member_documents')
        .select('*')
        .eq('member_id', memberId)
        .order('uploaded_at', { ascending: false }),
      supabaseAdmin
        .from('member_ai_reviews')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle(),
    ])

    return NextResponse.json({
      member: {
        ...member,
        work_experiences: workRes.data ?? [],
        education_records: eduRes.data ?? [],
        languages: langRes.data ?? [],
        documents: docRes.data ?? [],
      },
      aiReview: reviewRes.data ?? null,
    })
  } catch (err) {
    console.error('GET /api/admin/members/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resolvedParams = await Promise.resolve(params)
  const memberId = resolvedParams.id

  try {
    const body = await req.json()
    const { action } = body

    if (action === 'update_status') {
      const { status: newStatus } = body
      if (!newStatus) {
        return NextResponse.json({ error: 'Missing status' }, { status: 400 })
      }
      const update: Record<string, any> = { status: newStatus }
      if (newStatus === 'approved') update.approved_at = new Date().toISOString()

      const { error } = await supabaseAdmin
        .from('members')
        .update(update)
        .eq('id', memberId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (action === 'save_notes') {
      const { notes } = body
      const { error } = await supabaseAdmin
        .from('members')
        .update({ notes } as any)
        .eq('id', memberId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
