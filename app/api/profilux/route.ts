import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import {
  resolveProfiLux,
  projectFor,
  computeProfileCompleteness,
} from '@/lib/profilux'
import type {
  EditorProjection,
  ProfiLuxResolved,
  ResolvedExperience,
} from '@/lib/profilux'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// LEGACY ADAPTER — Phase 2.1 transition shim.
// Maps Matrix v1 ProfiLuxResolved → legacy camelCase profile shape consumed by:
//   - app/dashboard/candidate/page.tsx           (read-only completion bar)
//   - app/dashboard/candidate/profilux/page.tsx  (editor)
// REMOVE in Phase 4 (ledger 8f82b3ac) when the editor rebuild reads `view`
// directly. Lossy mappings are commented inline.
// =============================================================================

function normalizeAvailability(raw: string | null): string {
  // Legacy editor enum: 'active' | 'open' | 'passive' | 'unavailable' | ''.
  // members.availability is free-text (no enum constraint, verified May 2026).
  // Only value currently live in DB is 'not_actively_looking' (column default).
  if (!raw) return ''
  switch (raw) {
    case 'active':
    case 'actively_looking':
      return 'active'
    case 'open':
    case 'considering':
    case 'open_to_opportunities':
    case 'not_actively_looking': // DB default → display as "Considering opportunities"
      return 'open'
    case 'passive':
    case 'passively_exploring':
      return 'passive'
    case 'unavailable':
      return 'unavailable'
    default:
      return ''
  }
}

function mapLegacyExperiences(experiences: ResolvedExperience[]) {
  // LOSSY: L1 has no 'group' or stable 'id'. Editor uses 'id' for delete; array
  // index is stable enough for read-only render. Phase 2.2 POST will not
  // preserve these legacy ids anyway.
  return experiences.map((e, i) => ({
    id: String(i),
    role: e.job_title ?? '',
    brand: e.company ?? '',
    group: '', // LOSSY: no source in Matrix v1
    location: [e.city, e.country].filter(Boolean).join(', '),
    from: e.start_date ? e.start_date.slice(0, 4) : '',
    to: e.end_date ? e.end_date.slice(0, 4) : '',
    current: e.end_date === null,
  }))
}

function toLegacyProfile(view: ProfiLuxResolved) {
  return {
    firstName: view.first_name ?? '',
    lastName: view.last_name ?? '',
    city: view.city ?? '',
    nationality: view.nationality ?? '',
    headline: view.headline ?? '',
    bio: view.bio ?? '',
    experience: mapLegacyExperiences(view.experiences),
    specialisations: view.expertise_tags ?? [], // LOSSY: closest semantic for v1
    languages: view.languages.map((l) => l.language), // LOSSY: drops proficiency
    sectors: view.sectors ?? [],
    markets: view.market_knowledge ?? [], // LOSSY: closest semantic for v1
    salaryExpectation:
      view.desired_salary_max ?? view.desired_salary_min ?? 0, // LOSSY: collapses range to single value
    salaryCurrency: view.desired_salary_currency ?? 'EUR',
    availability: normalizeAvailability(view.availability),
    sharingEnabled: false, // FROZEN: sharing UX out of scope per GPT D5 (Phase 2.1)
    shareSlug: null, // FROZEN: sharing UX out of scope per GPT D5 (Phase 2.1)
    photoUrl: view.avatar_url,
  }
}

// Build the standard editor response: { surface, view, profile }.
// Used by both GET and POST (Phase 2.2 D8-A — POST returns same shape as GET).
function buildEditorResponse(resolved: ProfiLuxResolved) {
  const projection = projectFor(resolved, 'editor') as EditorProjection
  return {
    surface: projection.surface,
    view: projection.view,
    profile: toLegacyProfile(projection.view),
  }
}

// =============================================================================
// GET — Matrix v1 (Phase 2.1, ledger 0c04c8b9)
// Reads members.* via resolveProfiLux + projectFor('editor').
// Returns { surface, view, profile } — Matrix v1 native + legacy shim.
// =============================================================================

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Resolve email → member.id (resolver takes id, session has email)
  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle()

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 })
  }
  if (!member) {
    return NextResponse.json({ surface: 'editor', view: null, profile: null })
  }

  // Single resolver call — Rule A applied internally
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
    return NextResponse.json({ surface: 'editor', view: null, profile: null })
  }

  return NextResponse.json(buildEditorResponse(resolved))
}

// =============================================================================
// POST — Matrix v1 (Phase 2.2, ledger 4397dd97)
// Writes editor body to members.* flat columns only.
// Recomputes profile_completeness against post-write resolved view.
// Returns { surface, view, profile } — same shape as GET (D8-A).
//
// SCOPE — Option δ (locked by GPT, Phase 2.2):
// The following editor body fields are accepted but NOT persisted in v1:
//   - experience[]      (no L2 column; Matrix v1 §6.4/§9 — L1 passthrough only)
//   - languages[]       (no L2 column; L1 passthrough only)
//   - sectors[]         (no L2 column; L1 passthrough only)
//   - specialisations[] (no L2 column; expertise_tags semantically different)
//   - markets[]         (no L2 column; market_knowledge vs desired_locations ambiguous)
//   - sharingEnabled, shareSlug (frozen per GPT D5, sharing UX out of scope)
// Storage for these fields is part of Phase 4 editor rebuild (ledger 8f82b3ac).
// Phase 2.2 charter: persist only fields with existing L2 columns. Save returns
// 200; arrays silently drop on round-trip until Phase 4 lands. Documented data
// loss; per GPT D7-A no UI banner in this phase.
//
// FORBIDDEN per STATE DO NOT + GPT rulings:
//   - No writes to cv_parsed_data jsonb (UI → L1 silent writes forbidden)
//   - No schema migrations
//   - No writes to the frozen profilux standalone table
//   - No touching legacy calculateProfileCompleteness (STATE C5)
// =============================================================================

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // Resolve email → member.id
  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle()

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 })
  }
  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // L2 flat write payload — only fields with existing members.* columns.
  // Editor's array fields (experience, languages, sectors, specialisations,
  // markets) and frozen sharing fields are intentionally absent here.
  const updatePayload = {
    first_name: body.firstName ?? null,
    last_name: body.lastName ?? null,
    city: body.city ?? null,
    nationality: body.nationality ?? null,
    headline: body.headline ?? null,
    bio: body.bio ?? null,
    availability: body.availability ?? null, // editor enum written verbatim; GET normalize handles round-trip
    desired_salary_max:
      typeof body.salaryExpectation === 'number' && body.salaryExpectation > 0
        ? body.salaryExpectation
        : null, // single editor value → max bucket; min untouched (Phase 4 owns range UX)
    desired_salary_currency: body.salaryCurrency ?? null,
    updated_at: new Date().toISOString(),
  }

  const { error: updateErr } = await supabase
    .from('members')
    .update(updatePayload)
    .eq('id', member.id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // Recompute completeness against the post-write resolved view.
  // Order matters: write first, then resolve fresh state, then persist score.
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
    // Reflect new score in the response without re-resolving
    resolved = { ...resolved, profile_completeness: score }
  }

  return NextResponse.json(buildEditorResponse(resolved))
}
