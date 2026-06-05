import { NextResponse } from 'next/server'

// NEUTRALIZED 2026-06-05 (provenance compliance, DER-001 doctrine).
// This route originated factual market signals from model memory with no
// real source, and could direct-publish high-confidence items straight to
// the signals table (is_published=true, source_url=null). That violates
// STATE § PROVENANCE DOCTRINE: LuxAI does not originate proprietary factual
// content — no source → no output. Retired permanently.
// The compliant signal paths remain: sourced RSS ingestion (ingest-rss) and
// the queue-only singular route (generate-signal) when source-backed.
const GONE = {
  error: 'Gone',
  message:
    'AI signal generation from model memory is retired (provenance doctrine). LuxAI does not originate factual signals without a source. Use the sourced RSS signal path.',
}

export async function POST() {
  return NextResponse.json(GONE, { status: 410 })
}
