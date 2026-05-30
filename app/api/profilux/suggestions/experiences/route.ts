import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import {
  resolveProfiLux,
  projectFor,
  computeProfileCompleteness,
} from '@/lib/profilux'
import { computeExperienceSignature, normalizeExperienceField } from '@/lib/profilux/experienceSignature'
import type {
  CvParsedData,
  CvParsedExperience,
  EditorProjection,
  ProfiLuxResolved,
} from '@/lib/profilux'
import type { CvParsedDataResolutionExperienceItem } from '@/lib/profilux/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// POST /api/profilux/suggestions/experiences — Career History V2 Slice 1
//
// Body: { action: 'apply', company, job_title, start_date }
//   (dismiss intentionally NOT wired v1 — confirm-only flow per Mo scope lock.)
//
// Body: { action: 'apply_edited', routing: { company, job_title, start_date },
//         payload: { company, job_title, city, country, start_date, end_date,
//                    is_current, description } }
//   Direct-edit-to-L2: routing locates the RAW L1 row (same match/signature path);
//   payload supplies the EDITED values that land in work_experiences. The signature
//   and l1_snapshot stay anchored on the RAW matched row so resolver suppression
//   (shared with re-upload) still re-hashes the RAW twin — no ghost row. Edited
//   company is required (400 EDITED_COMPANY_REQUIRED); start_date / end_date obey
//   the same coercion rules as apply, applied to the payload values.
//
// Apply contract (server-authoritative):
//   - Resolves member by session email.
//   - Reads current cv_parsed_data.
//   - Normalizes the submitted (company, job_title, start_date) tuple with
//     the same rules as computeExperienceSignature (trim + lowercase).
//   - Walks cv_parsed_data.experiences[] and locates the row whose normalized
//     tuple matches. No match → 404 SIGNATURE_NOT_FOUND. The matched row is
//     the only source of insert data — submitted body fields are routing
//     only; raw client fields never reach work_experiences.
//   - Computes the canonical signature INTERNALLY from the matched server-side
//     row (server-only crypto). Uses that hash as the resolution_state key.
//   - 409 ALREADY_APPLIED if resolution_state.experiences[signature].status
//     === 'applied' (idempotency; no second INSERT).
//   - 422 START_DATE_UNPARSEABLE if the matched row's start_date is null or
//     not a YYYY-MM-DD / YYYY-MM parseable ISO date (work_experiences.start_date
//     is `date NOT NULL`). YYYY-MM is coerced to YYYY-MM-01 before insert;
//     l1_snapshot still records the raw parser value.
//   - INSERTs into work_experiences using the matched SERVER-SIDE row. Same
//     column set the manual /api/profilux/experiences endpoint uses:
//     member_id, job_title, company, city, country, start_date, end_date,
//     is_current, description. Defaults apply to department /
//     reason_for_leaving / sort_order.
//   - On insert success, writes back resolution_state.experiences[signature]
//     with status='applied', signature, l1_snapshot built from the matched
//     SERVER-SIDE row, l2_id=<new id>, at=ISO. Read-modify-write the jsonb;
//     preserve every other resolution_state slot.
//   - Recomputes profile_completeness against post-write state.
//
// Out of scope: dismiss action; suggestions-array projection; bulk confirm;
// date-model migration. /api/profilux/experiences (manual CRUD) is LOCKED —
// never touched by this route.
// =============================================================================

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const ISO_YEAR_MONTH_REGEX = /^\d{4}-\d{2}$/

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

  if (body?.action !== 'apply' && body?.action !== 'apply_edited') {
    return NextResponse.json(
      { error: 'Invalid or unsupported action', code: 'INVALID_ACTION' },
      { status: 400 }
    )
  }
  // apply_edited shares this route's match / signature / idempotency /
  // resolution_state with apply; it diverges only in the L2 insert value source
  // (edited body.payload vs the matched RAW L1 row). isEdited gates that one fork.
  const isEdited = body.action === 'apply_edited'

  // Routing fields — coerced to nullable strings. The signature normalizer
  // tolerates null/undefined uniformly so we don't reject on missing fields
  // here; mismatch surfaces as 404 SIGNATURE_NOT_FOUND.
  // Routing tuple locates the RAW L1 row. apply reads it flat off the body;
  // apply_edited reads it from body.routing (body.payload carries edited values).
  const routing = isEdited ? (body?.routing ?? {}) : body
  const submittedCompany: string | null =
    typeof routing?.company === 'string' ? routing.company : null
  const submittedJobTitle: string | null =
    typeof routing?.job_title === 'string' ? routing.job_title : null
  const submittedStartDate: string | null =
    typeof routing?.start_date === 'string' ? routing.start_date : null

  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select('id, cv_parsed_data')
    .eq('email', session.user.email)
    .maybeSingle()

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 })
  }
  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Server-authoritative match: walk L1, locate the row whose normalized
  // (company|job_title|start_date) tuple matches the submitted tuple.
  const currentCv = (member.cv_parsed_data ?? {}) as Partial<CvParsedData>
  const l1Rows: CvParsedExperience[] = Array.isArray(currentCv.experiences)
    ? currentCv.experiences
    : []

  const submittedNormCompany = normalizeExperienceField(submittedCompany)
  const submittedNormJobTitle = normalizeExperienceField(submittedJobTitle)
  const submittedNormStartDate = normalizeExperienceField(submittedStartDate)

  let matchedRow: CvParsedExperience | null = null
  for (const row of l1Rows) {
    if (typeof row?.company !== 'string' || row.company.trim() === '') continue
    if (normalizeExperienceField(row.company) !== submittedNormCompany) continue
    if (normalizeExperienceField(row.job_title) !== submittedNormJobTitle) continue
    if (normalizeExperienceField(row.start_date) !== submittedNormStartDate) continue
    matchedRow = row
    break
  }

  if (!matchedRow) {
    return NextResponse.json(
      { error: 'No matching parsed-CV experience row', code: 'SIGNATURE_NOT_FOUND' },
      { status: 404 }
    )
  }

  // Canonical signature: server-internal hash of the matched row. Single
  // resolution_state key for this L1 row across confirm + resolver suppression.
  const signature = computeExperienceSignature({
    company: matchedRow.company ?? null,
    job_title: matchedRow.job_title ?? null,
    start_date: matchedRow.start_date ?? null,
  })

  // Idempotency: refuse a second insert for the same already-applied signature.
  const currentResolution = currentCv.resolution_state ?? {}
  const currentExperiencesResolution = currentResolution.experiences ?? {}
  const existing = currentExperiencesResolution[signature]
  if (existing && existing.status === 'applied') {
    return NextResponse.json(
      { error: 'Suggestion already applied', code: 'ALREADY_APPLIED' },
      { status: 409 }
    )
  }

  // apply_edited promotes the L1 row to L2 using EDITED payload values, while the
  // match / signature / l1_snapshot stay anchored on the RAW matchedRow above — so
  // resolver suppression (shared with re-upload) re-hashes the RAW twin and no ghost
  // row appears. apply keeps matchedRow as its value source (insert unchanged).
  const valueSource: any = isEdited ? (body?.payload ?? {}) : matchedRow

  const editedCompany = (valueSource.company ?? '').trim()
  if (isEdited && editedCompany === '') {
    return NextResponse.json(
      { error: 'Edited company is required', code: 'EDITED_COMPANY_REQUIRED' },
      { status: 400 }
    )
  }

  // Validate + coerce start_date. work_experiences.start_date is `date NOT NULL`.
  // Slice 1.1: Haiku CV parser emits month precision for ~100% of rows ('2026-03'),
  // so strict YYYY-MM-DD validation rejected every real confirm. Coerce YYYY-MM to
  // YYYY-MM-01 (day defaulted to 1) before the L2 insert. YYYY-only and free-text /
  // null still 422. The l1_snapshot below preserves the RAW parser value — the
  // coercion only affects what lands in work_experiences.start_date.
  const rawStartDate = valueSource.start_date
  let normalizedStartDate: string | null = null
  if (typeof rawStartDate === 'string') {
    if (ISO_DATE_REGEX.test(rawStartDate) && !Number.isNaN(Date.parse(rawStartDate))) {
      normalizedStartDate = rawStartDate
    } else if (ISO_YEAR_MONTH_REGEX.test(rawStartDate)) {
      const candidate = `${rawStartDate}-01`
      if (!Number.isNaN(Date.parse(candidate))) {
        normalizedStartDate = candidate
      }
    }
  }
  if (normalizedStartDate === null) {
    return NextResponse.json(
      {
        error: 'Start date is missing or not in YYYY-MM-DD / YYYY-MM format; cannot promote to work_experiences',
        code: 'START_DATE_UNPARSEABLE',
      },
      { status: 422 }
    )
  }

  // end_date is nullable in work_experiences; tolerate partial-precision L1
  // by demoting anything that is not YYYY-MM-DD to null. Mirrors the implicit
  // contract of the manual endpoint (which coerces blanks to null).
  const rawEndDate = valueSource.end_date
  const endDate =
    typeof rawEndDate === 'string' &&
    ISO_DATE_REGEX.test(rawEndDate) &&
    !Number.isNaN(Date.parse(rawEndDate))
      ? rawEndDate
      : null

  const isCurrent = valueSource.is_current === true

  const company = editedCompany
  const jobTitle = typeof valueSource.job_title === 'string' && valueSource.job_title.trim() !== ''
    ? valueSource.job_title.trim()
    : null
  const city = typeof valueSource.city === 'string' && valueSource.city.trim() !== ''
    ? valueSource.city.trim()
    : null
  const country = typeof valueSource.country === 'string' && valueSource.country.trim() !== ''
    ? valueSource.country.trim()
    : null
  const description = typeof valueSource.description === 'string' && valueSource.description.trim() !== ''
    ? valueSource.description.trim()
    : null

  const insertPayload = {
    member_id: member.id,
    job_title: jobTitle,
    company,
    city,
    country,
    start_date: normalizedStartDate,
    end_date: isCurrent ? null : endDate,
    is_current: isCurrent,
    description,
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('work_experiences')
    .insert(insertPayload)
    .select('id')
    .maybeSingle()

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }
  if (!inserted) {
    return NextResponse.json({ error: 'INSERT returned no row' }, { status: 500 })
  }

  // Read-modify-write resolution_state.experiences[signature]. Preserve every
  // sibling slot (identity, education, other experiences) verbatim.
  const newItem: CvParsedDataResolutionExperienceItem = {
    status: 'applied',
    signature,
    l1_snapshot: {
      company: matchedRow.company ?? null,
      job_title: matchedRow.job_title ?? null,
      start_date: matchedRow.start_date ?? null,
      end_date: matchedRow.end_date ?? null,
    },
    l2_id: inserted.id,
    at: new Date().toISOString(),
  }
  const mergedCv = {
    ...currentCv,
    resolution_state: {
      ...currentResolution,
      experiences: {
        ...currentExperiencesResolution,
        [signature]: newItem,
      },
    },
  }

  const { error: updateErr } = await supabase
    .from('members')
    .update({
      cv_parsed_data: mergedCv,
      updated_at: new Date().toISOString(),
    })
    .eq('id', member.id)

  if (updateErr) {
    // The L2 row exists; resolution_state did NOT update — next confirm for
    // the same signature would re-INSERT (duplicate possible). Acceptable
    // v1 trade — mirrors the education sibling's post-insert update failure.
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  let resolved: ProfiLuxResolved | null
  try {
    resolved = await resolveProfiLux(member.id, supabase)
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'resolveProfiLux failed' },
      { status: 500 }
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

  return NextResponse.json(buildEditorResponse(resolved))
}
