import { NextResponse } from 'next/server'

// NEUTRALIZED 2026-06-05 (provenance compliance, DER-001 doctrine).
// Cron-driven twin of regenerate-wikilux: model originated brand facts from
// memory and upserted them to live wikilux_content on a schedule, with no
// source and no human review. Violates STATE § PROVENANCE DOCTRINE. Disabled.
const GONE = {
  error: 'Gone',
  message:
    'Scheduled AI brand-content refresh from model memory is retired (provenance doctrine). LuxAI does not originate brand facts without a source.',
}

export async function GET() {
  return NextResponse.json(GONE, { status: 410 })
}
