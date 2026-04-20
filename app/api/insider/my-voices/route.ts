import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Dual-read Insider Voices feed:
//  Q1 legacy (content_origin='contributed', author_id=memberId) — preserved.
//  Q2 canonical member-scoped fetch (author_id=memberId).
//  Q3 content-match recovers canonicals published via content_queue
//    (title ∈ Q1, status='published', author_id IS NULL).
// Canonical ALWAYS wins: dedup canonical.id across Q2/Q3; drop legacy on Q3 or Q2-twin.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const memberId = (session.user as any).memberId
  if (!memberId) {
    return NextResponse.json({ voices: [] })
  }

  type Row = { id: string; title: string; created_at: string; status: string; slug: string }
  const pick = (r: any): Row => ({
    id: r.id,
    title: r.title,
    created_at: r.created_at,
    status: r.status,
    slug: r.slug,
  })

  // Query 1 — preserved exactly (legacy filter)
  const q1 = await supabase
    .from('bloglux_articles')
    .select('id, slug, title, status, created_at, category')
    .eq('category', 'Insider Voice')
    .eq('content_origin', 'contributed')
    .eq('author_id', memberId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (q1.error) {
    console.error('[my-voices] Q1 failed:', q1.error.message)
    return NextResponse.json({ voices: [] })
  }
  const q1Rows = q1.data || []

  // Query 2 — canonical member-scoped fetch
  const q2 = await supabase
    .from('bloglux_articles')
    .select('id, slug, title, status, created_at')
    .eq('category', 'Insider Voice')
    .eq('author_id', memberId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (q2.error) {
    console.error('[my-voices] Q2 failed, returning Q1 only:', q2.error.message)
    const out = q1Rows.map(pick)
    out.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    return NextResponse.json({ voices: out })
  }
  const q2Rows = q2.data || []

  // Query 3 — content-match for canonical rows published without author_id
  const titles = Array.from(new Set(q1Rows.map((r) => r.title).filter(Boolean)))
  let q3Rows: any[] = []
  if (titles.length > 0) {
    const q3 = await supabase
      .from('bloglux_articles')
      .select('id, slug, title, status, created_at')
      .eq('category', 'Insider Voice')
      .in('title', titles)
      .eq('status', 'published')
      .is('author_id', null)
      .is('deleted_at', null)

    if (q3.error) {
      console.error('[my-voices] Q3 failed, merging Q1+Q2 only:', q3.error.message)
    } else {
      q3Rows = q3.data || []
    }
  }

  // Map legacy.id → canonical Q3 match (title exact equality)
  const matchByLegacyId = new Map<string, any>()
  for (const legacy of q1Rows) {
    const hit = q3Rows.find((c) => c.title === legacy.title)
    if (hit) matchByLegacyId.set(legacy.id, hit)
  }

  // Dedup canonicals by canonical.id across Q2 and Q3
  const byCanonicalId = new Map<string, any>()
  for (const r of q2Rows) byCanonicalId.set(r.id, r)
  for (const hit of matchByLegacyId.values()) {
    if (!byCanonicalId.has(hit.id)) byCanonicalId.set(hit.id, hit)
  }

  // Emit Q1 legacy rows only when no canonical twin exists
  // (neither a Q3 title-match nor a same-id row already in Q2)
  const merged: Row[] = []
  for (const legacy of q1Rows) {
    if (matchByLegacyId.has(legacy.id)) continue
    if (byCanonicalId.has(legacy.id)) continue
    merged.push(pick(legacy))
  }
  for (const c of byCanonicalId.values()) merged.push(pick(c))

  merged.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))

  return NextResponse.json({ voices: merged })
}
