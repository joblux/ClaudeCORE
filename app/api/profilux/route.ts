import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { resolveProfiLux, projectFor } from '@/lib/profilux'
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

  // Project for editor surface (identity wrap — no masking) + legacy adapter
  const projection = projectFor(resolved, 'editor') as EditorProjection
  const profile = toLegacyProfile(projection.view)

  return NextResponse.json({
    surface: projection.surface,
    view: projection.view,
    profile,
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const { data: existing } = await supabase
    .from('profilux')
    .select('id, share_slug')
    .eq('email', session.user.email)
    .single()

  const profileData = {
    email: session.user.email,
    first_name: body.firstName,
    last_name: body.lastName,
    city: body.city,
    nationality: body.nationality,
    headline: body.headline,
    bio: body.bio,
    experience: body.experience,
    specialisations: body.specialisations,
    languages: body.languages,
    sectors: body.sectors,
    markets: body.markets,
    salary_expectation: body.salaryExpectation,
    availability: body.availability,
    sharing_enabled: body.sharingEnabled,
    share_slug: existing?.share_slug || body.shareSlug || null,
    updated_at: new Date().toISOString(),
  }

  if (existing?.id) {
    const { error } = await supabase
      .from('profilux')
      .update(profileData)
      .eq('id', existing.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('profilux')
      .insert({ ...profileData, created_at: new Date().toISOString() })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
