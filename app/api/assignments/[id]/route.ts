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
// Shared access-control logic for a fetched assignment
// ---------------------------------------------------------------------------
function applyAccessControl(assignment: any, isAdmin: boolean, user: any) {
  // Non-admin can only view active assignments
  if (!isAdmin && assignment.status !== 'published') {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  // Non-approved members cannot view confidential assignments
  if (!isAdmin && assignment.is_confidential && user?.status !== 'approved') {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  return NextResponse.json(assignment)
}

// ---------------------------------------------------------------------------
// GET /api/assignments/[id] | fetch a single search assignment by id or slug
//   - Tries UUID lookup first; falls back to slug lookup
//   - Non-admin can only see active assignments
//   - Non-approved members cannot see confidential assignments
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
    let assignment: any = null

    if (isUUID(id)) {
      const { data, error } = await supabase
        .from('search_assignments')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        assignment = data
      }
    }

    // If not found by UUID (or id was not a UUID), try by slug
    if (!assignment) {
      const { data, error } = await supabase
        .from('search_assignments')
        .select('*')
        .eq('slug', id)
        .single()

      if (!error && data) {
        assignment = data
      }
    }

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return applyAccessControl(assignment, isAdmin, user)
  } catch (err) {
    console.error('Unexpected error in GET /api/assignments/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PUT /api/assignments/[id] | update a search assignment (admin only)
//   - Accepts partial updates (any subset of fields)
//   - Auto-sets activated_at when status transitions to "active"
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

    // Fetch the existing assignment so we can detect status transitions
    const { data: existing, error: fetchError } = await supabase
      .from('search_assignments')
      .select('status, activated_at, closed_at')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // ---- Status-transition timestamps ----
    // Set activated_at when moving to "active" and it has not been set yet
    if (body.status === 'published' && !existing.activated_at && !body.activated_at) {
      body.activated_at = now
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
    const { data: assignment, error } = await supabase
      .from('search_assignments')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating assignment:', error)
      return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
    }

    return NextResponse.json(assignment)
  } catch (err) {
    console.error('Unexpected error in PUT /api/assignments/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/assignments/[id] | delete a search assignment (admin only)
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

    const { error } = await supabase.from('search_assignments').delete().eq('id', id)

    if (error) {
      console.error('Error deleting assignment:', error)
      return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/assignments/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
