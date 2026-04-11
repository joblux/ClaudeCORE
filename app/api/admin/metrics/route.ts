// Thin HTTP wrapper around lib/admin-metrics.getAdminMetrics().
//
// Client components (like the admin dashboard) hit this endpoint to read
// product KPIs. Server components should call getAdminMetrics() directly
// instead of round-tripping through HTTP.
//
// Admin-gated. Returns 401 for non-admin sessions.

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminMetrics } from '@/lib/admin-metrics'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const metrics = await getAdminMetrics()
    return NextResponse.json(metrics)
  } catch (error: any) {
    console.error('admin metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin metrics' },
      { status: 500 }
    )
  }
}
