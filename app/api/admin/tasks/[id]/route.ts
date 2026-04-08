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

const ALLOWED_FIELDS = ['label', 'category', 'priority', 'notes', 'done', 'sort_order'] as const

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const updates: Record<string, any> = {}

  for (const key of ALLOWED_FIELDS) {
    if (key in body) updates[key] = body[key]
  }

  if ('done' in updates) {
    updates.completed_at = updates.done ? new Date().toISOString() : null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
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
