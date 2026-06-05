import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// NEUTRALIZED 2026-06-05 (Phase 0, DER-001 doctrine).
// AI salary generation is retired by STATE § PROVENANCE DOCTRINE / §218.
// LuxAI does not originate proprietary salary data. The only salary
// publish path is the sourced market lane (admin/luxai/market-salary →
// content_queue, external_feed). This producer is permanently gone.
const GONE = {
  error: 'Gone',
  message:
    'AI salary generation is retired (§218 / provenance doctrine). LuxAI does not originate salary data. Use the sourced market-salary lane.',
}

export async function GET() {
  return NextResponse.json(GONE, { status: 410 })
}

export async function POST() {
  return NextResponse.json(GONE, { status: 410 })
}
