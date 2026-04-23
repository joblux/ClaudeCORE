import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Per-assignment applicant count. Admin-only.
// Returns { counts: Record<assignment_id, number> }.
// Paginates internally with stable ordering so aggregation is deterministic
// regardless of the applications table size.
export async function GET() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const PAGE_SIZE = 1000
  const counts: Record<string, number> = {}
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from('applications')
      .select('search_assignment_id')
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = data ?? []
    for (const row of rows) {
      const id = (row as { search_assignment_id: string | null }).search_assignment_id
      if (!id) continue
      counts[id] = (counts[id] ?? 0) + 1
    }

    if (rows.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return NextResponse.json({ counts })
}
