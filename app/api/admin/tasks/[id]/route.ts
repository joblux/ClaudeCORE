import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.role === 'admin'
}

const ALLOWED_FIELDS = ['label', 'category', 'priority', 'notes', 'status', 'sort_order'] as const
const STATUSES = ['open', 'closed', 'validated', 'parked'] as const
const ALLOWED_TRANSITIONS: Record<string, readonly string[]> = {
  open: ['closed', 'parked'],
  closed: ['validated'],
  validated: [],
  parked: ['open'],
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const updates: Record<string, any> = {}

  for (const key of ALLOWED_FIELDS) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  if ('status' in updates) {
    const nextStatus = updates.status
    if (!STATUSES.includes(nextStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data: current, error: fetchError } = await supabase
      .from('admin_tasks')
      .select('status, completed_at')
      .eq('id', params.id)
      .maybeSingle()

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const currentStatus = current.status || 'open'
    if (currentStatus !== nextStatus && !ALLOWED_TRANSITIONS[currentStatus].includes(nextStatus)) {
      return NextResponse.json(
        { error: `Invalid transition: ${currentStatus} → ${nextStatus}` },
        { status: 400 }
      )
    }

    updates.done = nextStatus === 'closed' || nextStatus === 'validated'

    if (nextStatus === 'closed' && !current.completed_at) {
      updates.completed_at = new Date().toISOString()
    } else if (nextStatus === 'open') {
      updates.completed_at = null
    }
    // validated: keep existing completed_at
    // parked: completed_at already null (transition only from open)
  }

  const { data, error } = await supabase
    .from('admin_tasks')
    .update(updates)
    .eq('id', params.id)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase.from('admin_tasks').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
