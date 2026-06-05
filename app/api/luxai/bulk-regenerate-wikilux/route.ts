import { NextResponse } from 'next/server'

// NEUTRALIZED 2026-06-05 (provenance compliance, DER-001 doctrine).
// Batch twin of regenerate-wikilux: brand-name-only prompt → model
// originates brand facts from memory → direct write to live wikilux_content
// (status=approved / is_published=true), no source, no review. Violates
// STATE § PROVENANCE DOCTRINE. Retired permanently.
const GONE = {
  error: 'Gone',
  message:
    'AI bulk brand-content regeneration from model memory is retired (provenance doctrine). LuxAI does not originate brand facts without a source.',
}

export async function POST() {
  return NextResponse.json(GONE, { status: 410 })
}
