import { NextResponse } from 'next/server'

// NEUTRALIZED 2026-06-05 (provenance compliance, DER-001 doctrine).
// This route prompted the model with the brand NAME ONLY and asked it to
// originate founders, dates, revenue, executives, "verifiable quotes" and
// market caps from memory — then wrote them DIRECTLY to live wikilux_content
// (status=approved / is_published=true), bypassing any source or review.
// That violates STATE § PROVENANCE DOCTRINE: LuxAI does not originate
// proprietary brand facts — no source → no output. Retired permanently.
const GONE = {
  error: 'Gone',
  message:
    'AI brand-content regeneration from model memory is retired (provenance doctrine). LuxAI does not originate brand facts without a source.',
}

export async function POST() {
  return NextResponse.json(GONE, { status: 410 })
}
