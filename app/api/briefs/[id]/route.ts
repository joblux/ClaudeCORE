import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/briefs/[id] — get single brief
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'

  const { data, error } = await supabase
    .from('job_briefs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }

  // Non-admin can't see drafts or closed briefs
  if (!isAdmin && data.status !== 'published') {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }

  // Non-approved members can't see confidential briefs
  if (!isAdmin && data.is_confidential) {
    const memberStatus = (session?.user as any)?.status
    if (memberStatus !== 'approved') {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
    }
  }

  return NextResponse.json(data)
}

// PUT /api/briefs/[id] — update brief (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Handle status transitions
    if (body.status === 'published' && !body.published_at) {
      body.published_at = new Date().toISOString()
    }
    if (body.status === 'closed' && !body.closed_at) {
      body.closed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('job_briefs')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// DELETE /api/briefs/[id] — delete brief (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('job_briefs')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
