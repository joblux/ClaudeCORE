import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import {
  resolveProfiLux,
  projectFor,
  computeProfileCompleteness,
  computeEducationSignature,
} from '@/lib/profilux'
import type {
  EditorProjection,
  ProfiLuxResolved,
} from '@/lib/profilux'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// POST /api/members/cv-merge/apply — Phase C.3
//
// Body:
//   {
//     accept: {
//       identity?: { first_name?: true, last_name?: true, city?: true,
//                    country?: true, nationality?: true, phone?: true,
//                    headline?: true, bio?: true },
//       experiences?: number[],     // indices into pending.experiences
//       education?: string[],       // signatures (sha256 hex)
//       languages?: string[],       // lowercased trimmed language keys
//       sectors?: string[]          // exact sector strings
//     }
//   }
//
// Server-side selection from cv_parsed_pending. Atomic via apply_cv_merge RPC:
// on success, cv_parsed_data is swapped to the pending payload, cv_parsed_pending
// is NULLed, and cv_parse_history is closed (applied_at, applied_by_user=true).
// Idempotency comes from L2 UNIQUE expression indexes + ON CONFLICT DO NOTHING.
// =============================================================================

const IDENTITY_FIELDS = [
  'first_name',
  'last_name',
  'city',
  'country',
  'nationality',
  'phone',
  'headline',
  'bio',
] as const
type IdentityField = (typeof IDENTITY_FIELDS)[number]

function buildEditorResponse(resolved: ProfiLuxResolved) {
  const projection = projectFor(resolved, 'editor') as EditorProjection
  return {
    surface: projection.surface,
    view: projection.view,
    editor: projection.editor,
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const accept = (body?.accept ?? {}) as Record<string, any>

  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select('id, cv_parsed_pending')
    .eq('email', session.user.email)
    .maybeSingle()

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 })
  }
  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  const pending = (member.cv_parsed_pending ?? null) as Record<string, any> | null
  if (!pending || typeof pending !== 'object') {
    return NextResponse.json({ error: 'NOTHING_TO_APPLY' }, { status: 409 })
  }

  // ---------------------------------------------------------------------------
  // Build accept_payload server-side from cv_parsed_pending. Client only sends
  // selectors (booleans / indices / signatures / keys); server is the single
  // source of truth for the actual values to insert.
  // ---------------------------------------------------------------------------

  // CV parser emits partial dates (YYYY, YYYY-MM) per its SYSTEM_PROMPT spec.
  // RPC apply_cv_merge casts via NULLIF(...)::date, which rejects anything
  // shorter than YYYY-MM-DD. Pad month/year-only values before handing off.
  function normalizeDate(v: unknown): string | null {
    if (v == null) return null
    const s = String(v).trim()
    if (s === '') return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`
    if (/^\d{4}$/.test(s)) return `${s}-01-01`
    return null
  }

  const acceptPayload: Record<string, any> = {}

  // Identity
  const acceptIdentity = (accept.identity ?? {}) as Record<string, unknown>
  const pendingIdentity = (pending.identity ?? {}) as Record<string, unknown>
  const identityOut: Record<string, string> = {}
  for (const field of IDENTITY_FIELDS) {
    if (acceptIdentity[field] !== true) continue
    const raw = pendingIdentity[field]
    if (typeof raw !== 'string') continue
    const trimmed = raw.trim()
    if (trimmed === '') continue
    identityOut[field] = trimmed
  }
  if (Object.keys(identityOut).length > 0) {
    acceptPayload.identity = identityOut
  }

  // Experiences (by index, validate range + skip rows missing both company AND job_title)
  const pendingExperiencesRaw = Array.isArray(pending.experiences) ? pending.experiences : []
  const acceptExpIndices: number[] = Array.isArray(accept.experiences)
    ? accept.experiences.filter(
        (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n),
      )
    : []
  const expOut: any[] = []
  for (const i of acceptExpIndices) {
    if (i < 0 || i >= pendingExperiencesRaw.length) continue
    const row = pendingExperiencesRaw[i]
    if (!row || typeof row !== 'object') continue
    const company = typeof (row as any).company === 'string' ? (row as any).company.trim() : ''
    const jobTitle = typeof (row as any).job_title === 'string' ? (row as any).job_title.trim() : ''
    if (company === '' && jobTitle === '') continue
    expOut.push({
      ...row,
      start_date: normalizeDate((row as any).start_date),
      end_date: normalizeDate((row as any).end_date),
    })
  }
  if (expOut.length > 0) acceptPayload.experiences = expOut

  // Education (signatures → rows from pending where signature matches)
  const pendingEducationRaw = Array.isArray(pending.education) ? pending.education : []
  const acceptEduSigs: Set<string> = new Set(
    Array.isArray(accept.education)
      ? accept.education.filter((s: unknown): s is string => typeof s === 'string')
      : [],
  )
  const eduOut: any[] = []
  for (const row of pendingEducationRaw) {
    if (!row || typeof row !== 'object') continue
    const inst = typeof (row as any).institution === 'string' ? (row as any).institution.trim() : ''
    if (inst === '') continue
    const sig = computeEducationSignature({
      institution: inst,
      field_of_study:
        typeof (row as any).field_of_study === 'string' ? (row as any).field_of_study : null,
      graduation_year:
        typeof (row as any).graduation_year === 'number' ? (row as any).graduation_year : null,
    })
    if (!acceptEduSigs.has(sig)) continue
    eduOut.push(row)
  }
  if (eduOut.length > 0) acceptPayload.education = eduOut

  // Languages (lowercased trimmed keys → pending rows; require proficiency)
  const pendingLanguagesRaw = Array.isArray(pending.languages) ? pending.languages : []
  const acceptLangKeys: Set<string> = new Set(
    Array.isArray(accept.languages)
      ? accept.languages
          .filter((s: unknown): s is string => typeof s === 'string')
          .map((s: string) => s.trim().toLowerCase())
      : [],
  )
  const langOut: any[] = []
  for (const row of pendingLanguagesRaw) {
    if (!row || typeof row !== 'object') continue
    const lang = typeof (row as any).language === 'string' ? (row as any).language.trim() : ''
    if (lang === '') continue
    const prof = typeof (row as any).proficiency === 'string' ? (row as any).proficiency.trim() : ''
    if (prof === '') continue
    const key = lang.toLowerCase()
    if (!acceptLangKeys.has(key)) continue
    langOut.push(row)
  }
  if (langOut.length > 0) acceptPayload.languages = langOut

  // Sectors (string set → { sector, rank } with 1-based rank in accept order)
  const pendingSectorsRaw = Array.isArray(pending.sectors) ? pending.sectors : []
  const acceptSectorSet: Set<string> = new Set(
    Array.isArray(accept.sectors)
      ? accept.sectors.filter((s: unknown): s is string => typeof s === 'string')
      : [],
  )
  const sectorOut: Array<{ sector: string; rank: number }> = []
  let nextRank = 1
  for (const s of pendingSectorsRaw) {
    if (typeof s !== 'string') continue
    const value = s.trim()
    if (value === '') continue
    if (!acceptSectorSet.has(value)) continue
    sectorOut.push({ sector: value, rank: nextRank })
    nextRank += 1
  }
  if (sectorOut.length > 0) acceptPayload.sectors = sectorOut

  // ---------------------------------------------------------------------------
  // RPC call — atomic. cv_parsed_data swap + history close happen inside the
  // function under the same transaction.
  // ---------------------------------------------------------------------------
  const { data: rpcResult, error: rpcErr } = await supabase.rpc('apply_cv_merge', {
    p_member_id: member.id,
    p_accept: acceptPayload,
    p_new_cv_parsed_data: pending,
  })

  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message }, { status: 500 })
  }

  const counts = (rpcResult ?? {}) as Record<string, unknown>

  // Re-resolve + recompute profile_completeness post-write.
  let resolved: ProfiLuxResolved | null
  try {
    resolved = await resolveProfiLux(member.id, supabase)
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'resolveProfiLux failed' },
      { status: 500 },
    )
  }
  if (!resolved) {
    return NextResponse.json({ error: 'Member not found post-write' }, { status: 500 })
  }

  const score = computeProfileCompleteness(resolved)
  if (score !== resolved.profile_completeness) {
    const { error: scoreErr } = await supabase
      .from('members')
      .update({
        profile_completeness: score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', member.id)

    if (scoreErr) {
      return NextResponse.json({ error: scoreErr.message }, { status: 500 })
    }
    resolved = { ...resolved, profile_completeness: score }
  }

  return NextResponse.json({
    ...buildEditorResponse(resolved),
    counts,
  })
}
