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
  CvParsedData,
  EditorProjection,
  ProfiLuxResolved,
} from '@/lib/profilux'
import type { CvParsedDataResolutionItem } from '@/lib/profilux/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// POST /api/profilux/suggestions — C1 slice 1B.3
//
// Body: { action: 'apply', field: 'first_name' | 'last_name' | 'city' | 'nationality', value: string }
//
// Apply contract (K2 atomic) — and dismiss contract (1B.4):
//   - Writes L2 identity column AND cv_parsed_data.resolution_state.identity.<field>
//     in a single members UPDATE (atomic at row level).
//   - If either write fails, the whole request errors.
//   - Recomputes profile_completeness against post-write state.
//
// Path A (read-modify-write jsonb):
//   - SELECT current cv_parsed_data → merge resolution_state in JS → UPDATE.
//   - Race tradeoff documented: concurrent applies on different fields by the
//     same member could lose one resolution_state entry (last write wins).
//     Acceptable for single-user identity flow. RPC with jsonb_set is the
//     upgrade path if strictness needed.
//
// Dismiss action (1B.4): writes ONLY resolution_state (no L2 column write).
// Out of scope: education, experiences, sectors, languages.
// =============================================================================

const ALLOWED_FIELDS = new Set(['first_name', 'last_name', 'city', 'nationality'])

type IdentityField = 'first_name' | 'last_name' | 'city' | 'nationality'

type ActionBody = {
  action: 'apply' | 'dismiss'
  field: IdentityField
  value: string
}

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

  // Validate body shape
  if (body?.action !== 'apply' && body?.action !== 'dismiss') {
    return NextResponse.json({ error: 'Invalid or unsupported action' }, { status: 400 })
  }
  if (typeof body?.field !== 'string' || !ALLOWED_FIELDS.has(body.field)) {
    return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
  }
  if (typeof body?.value !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid value' }, { status: 400 })
  }
  const trimmedValue = body.value.trim()
  if (trimmedValue === '') {
    return NextResponse.json({ error: 'Value cannot be empty' }, { status: 400 })
  }

  const action: ActionBody = {
    action: body.action,
    field: body.field,
    value: trimmedValue,
  }

  // Resolve member by email + read current cv_parsed_data (for jsonb merge)
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

  // Build merged cv_parsed_data (read-modify-write).
  const currentCv = (member.cv_parsed_data ?? {}) as Partial<CvParsedData>
  const currentResolution = currentCv.resolution_state ?? {}
  const currentIdentity = currentResolution.identity ?? {}
  const newItem: CvParsedDataResolutionItem = {
    status: action.action === 'apply' ? 'applied' : 'dismissed',
    value: action.value,
    at: new Date().toISOString(),
  }
  const mergedCv = {
    ...currentCv,
    resolution_state: {
      ...currentResolution,
      identity: {
        ...currentIdentity,
        [action.field]: newItem,
      },
    },
  }

  // Single atomic UPDATE.
  // apply  → writes L2 column + cv_parsed_data jsonb in one row write.
  // dismiss → writes cv_parsed_data jsonb only; L2 column untouched.
  const updatePayload: Record<string, unknown> = {
    cv_parsed_data: mergedCv,
    updated_at: new Date().toISOString(),
  }
  if (action.action === 'apply') {
    updatePayload[action.field] = action.value
  }

  const { error: updateErr } = await supabase
    .from('members')
    .update(updatePayload)
    .eq('id', member.id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // Recompute completeness against post-write state (G1 may flip on identity writes).
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
