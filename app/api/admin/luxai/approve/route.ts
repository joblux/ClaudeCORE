import { NextResponse } from 'next/server'

// NEUTRALIZED 2026-06-05 (provenance compliance, DER-001 doctrine).
// Legacy approve route: it published wikilux/signal/article directly
// (is_published=true, no content_origin) AND duplicated the content_queue
// approve path WITHOUT the §218 guard — letting forbidden AI families
// (article/event/interview) publish by bypassing the canonical gate.
// No live UI caller. Retired permanently.
// Canonical approve path with the §218 guard:
//   app/api/admin/content-queue/[id]/approve/route.ts
const GONE = {
  error: 'Gone',
  message:
    'Legacy LuxAI approve is retired (provenance doctrine / §218). Use the canonical content-queue approve route, which enforces the AI-forbidden-family guard.',
}

export async function POST() {
  return NextResponse.json(GONE, { status: 410 })
}
