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
  CvParsedData,
  CvParsedEducation,
  EditorProjection,
  ProfiLuxResolved,
} from '@/lib/profilux'
import type { CvParsedDataResolutionEducationItem } from '@/lib/profilux/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// POST /api/profilux/suggestions/education — C1 slices S-B.1B.2 + S-B.1B.3
//
// Body: { action: 'apply' | 'dismiss', signature: <64-char lowercase hex> }
//
// Apply contract:
//   - Resolves member by session email.
//   - Reads current cv_parsed_data, recomputes signatures over the L1
//     education[] array, finds the one matching the client-supplied signature.
//   - Rejects 409 SIGNATURE_STALE if no current L1 row matches the signature
//     (L1 changed since the client saw the suggestion, or signature was never
//     valid for this member).
//   - Rejects 400 INSTITUTION_REQUIRED if the matched L1 row has a
//     null/empty institution (cannot be inserted into education_records).
//   - INSERTs a new education_records row, then writes
//     resolution_state.education[signature] with the inserted id.
//   - Recomputes profile_completeness against post-write state.
//
// Dismiss contract (S-B.1B.3):
//   - Resolves member by session email.
//   - Recomputes signatures over L1 education[]; rejects 409 SIGNATURE_STALE
//     if no current L1 row matches.
//   - Rejects 409 (already-applied) if resolution_state.education[signature]
//     already exists with status='applied' (cannot dismiss an L2-backed row;
//     user must delete the education_records row via Edit instead).
//   - Writes resolution_state.education[signature] with status='dismissed',
//     l2_id=null, l1_snapshot, at. No education_records touch.
//   - Idempotent: dismiss-after-dismiss overwrites the existing entry (200).
//   - Institution null/empty is permitted on dismiss (no L2 write to gate).
//   - Recomputes profile_completeness against post-write state.
//
// SIGNATURE CONTRACT (Option γ, locked):
//   Client sends signature only. Server is the single source of L1 truth.
//   Server recomputes signatures from current cv_parsed_data.education[]
//   via computeEducationSignature (sha256 over institution|field_of_study|
//   graduation_year, lowercased + trimmed). No client-supplied payload.
//
// Idempotency enforced by uniq_education_records_member_signature; signature-
// correct lookup-first + ON CONFLICT fallback prevents duplicate inserts and
// wrong-row matches. resolution_state UPDATE can still fail after the L2 row
// is created — the next apply call signature-matches the existing row and
// reuses its id (no second INSERT).
//
// profile_completeness recompute: kept as cheap safety. Today's M6 scorer
// (lib/profilux/_m6Groups.ts) has NO group reading view.education — G3 reads
// sectors / product_categories / expertise_tags / years_in_luxury, G4 reads
// view.experiences only. Recompute is a no-op for this slice; kept to
// preserve the invariant should a future M6 group add education weighting.
//
// Out of scope: experiences, sectors, languages, trio retirement, UI consumer.
// =============================================================================

const SIGNATURE_REGEX = /^[a-f0-9]{64}$/

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

  if (body?.action !== 'apply' && body?.action !== 'dismiss') {
    return NextResponse.json(
      { error: 'Invalid or unsupported action' },
      { status: 400 }
    )
  }
  if (typeof body?.signature !== 'string' || !SIGNATURE_REGEX.test(body.signature)) {
    return NextResponse.json(
      { error: 'Invalid signature format', code: 'INVALID_SIGNATURE_FORMAT' },
      { status: 400 }
    )
  }

  const signature: string = body.signature

  // Resolve member by email + read cv_parsed_data for L1 lookup + jsonb merge.
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

  // Recompute signatures over current L1 to find the matching row.
  const currentCv = (member.cv_parsed_data ?? {}) as Partial<CvParsedData>
  const l1Rows: CvParsedEducation[] = Array.isArray(currentCv.education)
    ? currentCv.education
    : []

  let matchedRow: CvParsedEducation | null = null
  for (const row of l1Rows) {
    const rowSignature = computeEducationSignature({
      institution: row.institution ?? null,
      field_of_study: row.field_of_study ?? null,
      graduation_year: row.graduation_year ?? null,
    })
    if (rowSignature === signature) {
      matchedRow = row
      break
    }
  }

  if (!matchedRow) {
    return NextResponse.json(
      { error: 'Signature does not match any current education row', code: 'SIGNATURE_STALE' },
      { status: 409 }
    )
  }

  // ===== Dismiss branch (S-B.1B.3) =====
  // No L2 write; pure resolution_state update. Institution null/empty is
  // permitted on dismiss (no education_records insert to gate).
  if (body.action === 'dismiss') {
    const currentResolutionD = currentCv.resolution_state ?? {}
    const currentEducationResolutionD = currentResolutionD.education ?? {}
    const existing = currentEducationResolutionD[signature]
    if (existing && existing.status === 'applied') {
      return NextResponse.json(
        { error: 'Suggestion already applied; cannot dismiss', code: 'ALREADY_APPLIED' },
        { status: 409 }
      )
    }

    const dismissedItem: CvParsedDataResolutionEducationItem = {
      status: 'dismissed',
      signature,
      l1_snapshot: {
        institution: matchedRow.institution ?? null,
        degree_level: matchedRow.degree_level ?? null,
        field_of_study: matchedRow.field_of_study ?? null,
        graduation_year: matchedRow.graduation_year ?? null,
      },
      l2_id: null,
      at: new Date().toISOString(),
    }
    const mergedCvD = {
      ...currentCv,
      resolution_state: {
        ...currentResolutionD,
        education: {
          ...currentEducationResolutionD,
          [signature]: dismissedItem,
        },
      },
    }

    const { error: updateErrD } = await supabase
      .from('members')
      .update({
        cv_parsed_data: mergedCvD,
        updated_at: new Date().toISOString(),
      })
      .eq('id', member.id)

    if (updateErrD) {
      return NextResponse.json({ error: updateErrD.message }, { status: 500 })
    }

    let resolvedD: ProfiLuxResolved | null
    try {
      resolvedD = await resolveProfiLux(member.id, supabase)
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message ?? 'resolveProfiLux failed' },
        { status: 500 }
      )
    }
    if (!resolvedD) {
      return NextResponse.json({ error: 'Member not found post-write' }, { status: 500 })
    }

    const scoreD = computeProfileCompleteness(resolvedD)
    if (scoreD !== resolvedD.profile_completeness) {
      const { error: scoreErrD } = await supabase
        .from('members')
        .update({
          profile_completeness: scoreD,
          updated_at: new Date().toISOString(),
        })
        .eq('id', member.id)

      if (scoreErrD) {
        return NextResponse.json({ error: scoreErrD.message }, { status: 500 })
      }
      resolvedD = { ...resolvedD, profile_completeness: scoreD }
    }

    return NextResponse.json(buildEditorResponse(resolvedD))
  }

  // ===== Apply branch (S-B.1B.2) =====
  // Defense-in-depth: education_records.institution is NOT NULL.
  const institutionTrimmed = (matchedRow.institution ?? '').trim()
  if (institutionTrimmed === '') {
    return NextResponse.json(
      { error: 'Institution is required to apply this education record', code: 'INSTITUTION_REQUIRED' },
      { status: 400 }
    )
  }

  // STEP 1: signature-correct lookup first. If an L2 row with the same
  // signature already exists for this member, reuse its id. Otherwise insert;
  // race-resolve via re-fetch on unique-constraint conflict.
  const { data: candidates, error: candErr } = await supabase
    .from('education_records')
    .select('id, institution, field_of_study, graduation_year')
    .eq('member_id', member.id)

  if (candErr) {
    return NextResponse.json({ error: candErr.message }, { status: 500 })
  }

  let l2Id: string | null = null
  const existingMatch = (candidates ?? []).find((r) =>
    computeEducationSignature({
      institution: r.institution,
      field_of_study: r.field_of_study,
      graduation_year: r.graduation_year,
    }) === signature,
  )

  if (existingMatch) {
    l2Id = existingMatch.id
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from('education_records')
      .insert({
        member_id: member.id,
        institution: institutionTrimmed,
        degree_level: matchedRow.degree_level ?? null,
        field_of_study: matchedRow.field_of_study ?? null,
        city: matchedRow.city ?? null,
        country: matchedRow.country ?? null,
        start_year: matchedRow.start_year ?? null,
        graduation_year: matchedRow.graduation_year ?? null,
      })
      .select('id')
      .maybeSingle()

    if (insertErr) {
      // Race: another request inserted between our lookup and insert. Re-fetch
      // and signature-match again.
      const { data: raced } = await supabase
        .from('education_records')
        .select('id, institution, field_of_study, graduation_year')
        .eq('member_id', member.id)

      const racedMatch = (raced ?? []).find((r) =>
        computeEducationSignature({
          institution: r.institution,
          field_of_study: r.field_of_study,
          graduation_year: r.graduation_year,
        }) === signature,
      )
      if (!racedMatch) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 })
      }
      l2Id = racedMatch.id
    } else if (!inserted) {
      return NextResponse.json({ error: 'INSERT returned no row' }, { status: 500 })
    } else {
      l2Id = inserted.id
    }
  }

  // STEP 2: merge resolution_state.education[signature] and UPDATE. If this
  // fails the L2 row is left behind, but the next apply call signature-matches
  // it and reuses its id (no duplicate insert) — see header comment.
  const currentResolution = currentCv.resolution_state ?? {}
  const currentEducationResolution = currentResolution.education ?? {}
  const newItem: CvParsedDataResolutionEducationItem = {
    status: 'applied',
    signature,
    l1_snapshot: {
      institution: matchedRow.institution ?? null,
      degree_level: matchedRow.degree_level ?? null,
      field_of_study: matchedRow.field_of_study ?? null,
      graduation_year: matchedRow.graduation_year ?? null,
    },
    l2_id: l2Id,
    at: new Date().toISOString(),
  }
  const mergedCv = {
    ...currentCv,
    resolution_state: {
      ...currentResolution,
      education: {
        ...currentEducationResolution,
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
    // L2 row exists; next apply reuses it via signature match. See header.
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // Recompute completeness (no-op today; cheap safety — see header comment).
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
