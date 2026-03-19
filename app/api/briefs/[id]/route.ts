import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ---------------------------------------------------------------------------
// Helper: determine whether a string looks like a UUID
// ---------------------------------------------------------------------------
function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

// ---------------------------------------------------------------------------
// Shared access-control logic for a fetched brief
// ---------------------------------------------------------------------------
function applyAccessControl(brief: any, isAdmin: boolean, user: any) {
  // Non-admin can only view published briefs
  if (!isAdmin && brief.status !== 'published') {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }

  // Non-approved members cannot view confidential briefs
  if (!isAdmin && brief.is_confidential && user?.status !== 'approved') {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }

  return NextResponse.json(brief)
}

// ---------------------------------------------------------------------------
// GET /api/briefs/[id] — fetch a single brief by id or slug
//   - Tries UUID lookup first; falls back to slug lookup
//   - Non-admin can only see published briefs
//   - Non-approved members cannot see confidential briefs
// ---------------------------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    const isAdmin = user?.role === 'admin'

    // Try by UUID first, then fall back to slug
    let brief: any = null

    if (isUUID(id)) {
      const { data, error } = await supabase
        .from('job_briefs')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        brief = data
      }
    }

    // If not found by UUID (or id was not a UUID), try by slug
    if (!brief) {
      const { data, error } = await supabase
        .from('job_briefs')
        .select('*')
        .eq('slug', id)
        .single()

      if (!error && data) {
        brief = data
      }
    }

    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
    }

    return applyAccessControl(brief, isAdmin, user)
  } catch (err) {
    console.error('Unexpected error in GET /api/briefs/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PUT /api/briefs/[id] — update a brief (admin only)
//   - Accepts partial updates (any subset of fields)
//   - Auto-sets published_at when status transitions to "published"
//   - Auto-sets closed_at when status transitions to "closed" or "filled"
//   - Always sets updated_at to now()
// ---------------------------------------------------------------------------
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ---- Authentication & authorisation ----
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const now = new Date().toISOString()

    // Fetch the existing brief so we can detect status transitions
    const { data: existing, error: fetchError } = await supabase
      .from('job_briefs')
      .select('status, published_at, closed_at')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
    }

    // ---- Status-transition timestamps ----
    // Set published_at when moving to "published" and it has not been set yet
    if (body.status === 'published' && !existing.published_at && !body.published_at) {
      body.published_at = now
    }

    // Set closed_at when moving to "closed" or "filled" and it has not been set yet
    if (
      (body.status === 'closed' || body.status === 'filled') &&
      !existing.closed_at &&
      !body.closed_at
    ) {
      body.closed_at = now
    }

    // Always bump updated_at
    body.updated_at = now

    // ---- Perform the update ----
    const { data: brief, error } = await supabase
      .from('job_briefs')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating brief:', error)
      return NextResponse.json({ error: 'Failed to update brief' }, { status: 500 })
    }

    return NextResponse.json(brief)
  } catch (err) {
    console.error('Unexpected error in PUT /api/briefs/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/briefs/[id] — delete a brief (admin only)
// ---------------------------------------------------------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ---- Authentication & authorisation ----
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase.from('job_briefs').delete().eq('id', id)

    if (error) {
      console.error('Error deleting brief:', error)
      return NextResponse.json({ error: 'Failed to delete brief' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/briefs/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
