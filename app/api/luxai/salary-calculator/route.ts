import { NextResponse } from 'next/server'

// NEUTRALIZED 2026-06-05 (Phase 0, DER-001 doctrine).
// AI salary generation is retired by STATE § PROVENANCE DOCTRINE / §218.
// LuxAI does not originate proprietary salary data (estimates included).
// The only salary publish path is the sourced market lane
// (admin/luxai/market-salary → content_queue, external_feed).
const GONE = {
  error: 'Gone',
  message:
    'AI salary calculation is retired (§218 / provenance doctrine). LuxAI does not originate salary data. Use the sourced market-salary lane.',
}

export async function POST() {
  return NextResponse.json(GONE, { status: 410 })
}
