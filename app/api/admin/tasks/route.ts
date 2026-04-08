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

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('admin_tasks')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tasks: data || [] })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { label, category, priority, notes } = body

  if (!label || !category) {
    return NextResponse.json({ error: 'label and category are required' }, { status: 400 })
  }

  // Place new task at end of its category
  const { data: maxRow } = await supabase
    .from('admin_tasks')
    .select('sort_order')
    .eq('category', category)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sort_order = (maxRow?.sort_order ?? 0) + 10

  const { data, error } = await supabase
    .from('admin_tasks')
    .insert({
      label,
      category,
      priority: priority || 'normal',
      notes: notes || null,
      done: false,
      sort_order,
    })
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data })
}
