import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { computeEducationSignature } from '@/lib/profilux/educationSignature'
import { resolveProfiLux } from '@/lib/profilux'
import type { ProfiLuxResolved } from '@/lib/profilux'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// GET /api/members/cv-merge/diff — Phase C.2
//
// Read-only diff between members.cv_parsed_pending and the RESOLVED view
// (resolveProfiLux = L2 + L1). "matched" means "already visible to the user".
//
// No DB writes. cv_parsed_pending remains untouched.
// =============================================================================

const IDENTITY_FIELDS = [
  'first_name',
  'last_name',
  'city',
  'country',
  'nationality',
  'phone',
] as const
type IdentityField = (typeof IDENTITY_FIELDS)[number]

type IdentityStatus = 'unchanged' | 'changed' | 'added'
type CollectionStatus = 'matched' | 'added'

const norm = (s: unknown): string =>
  typeof s === 'string' ? s.trim().toLowerCase() : ''

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select(
      'id, cv_parsed_pending'
    )
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
    return NextResponse.json({ pending: null, diff: null })
  }

  let resolved: ProfiLuxResolved | null
  try {
    resolved = await resolveProfiLux(member.id, supabase)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'resolveProfiLux failed' }, { status: 500 })
  }
  if (!resolved) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // -- identity ----------------------------------------------------------------
  const resolvedIdentity: Record<IdentityField, unknown> = {
    first_name: resolved.first_name,
    last_name: resolved.last_name,
    city: resolved.city,
    country: resolved.country,
    nationality: resolved.nationality,
    phone: resolved.phone,
  }
  const pendingIdentity = (pending.identity ?? {}) as Record<string, unknown>
  const identity: Array<{
    field: IdentityField
    current: string | null
    pending: string
    status: IdentityStatus
  }> = []
  for (const field of IDENTITY_FIELDS) {
    const raw = pendingIdentity[field]
    const pVal = typeof raw === 'string' ? raw.trim() : ''
    if (pVal === '') continue
    const cRaw = resolvedIdentity[field]
    const cVal = typeof cRaw === 'string' ? cRaw.trim() : ''
    let status: IdentityStatus
    if (cVal === '') status = 'added'
    else if (cVal === pVal) status = 'unchanged'
    else status = 'changed'
    identity.push({
      field,
      current: cVal === '' ? null : cVal,
      pending: pVal,
      status,
    })
  }

  // -- experiences -------------------------------------------------------------
  const currentWeKeys = new Set<string>(
    resolved.experiences.map((r) => `${norm(r.company)}|${r.start_date ?? ''}`)
  )
  const pendingExperiencesRaw = Array.isArray(pending.experiences) ? pending.experiences : []
  const experiences: Array<{
    index: number
    key: string
    status: CollectionStatus
    item: Record<string, unknown>
  }> = []
  pendingExperiencesRaw.forEach((exp: any, index: number) => {
    if (!exp || typeof exp !== 'object') return
    const company = typeof exp.company === 'string' ? exp.company : ''
    const jobTitle = typeof exp.job_title === 'string' ? exp.job_title : ''
    if (company.trim() === '' && jobTitle.trim() === '') return
    const key = `${norm(company)}|${typeof exp.start_date === 'string' ? exp.start_date : ''}`
    const status: CollectionStatus = currentWeKeys.has(key) ? 'matched' : 'added'
    experiences.push({ index, key, status, item: exp })
  })

  // -- education ---------------------------------------------------------------
  const currentEduSignatures = new Set<string>(
    resolved.education.map((r) =>
      computeEducationSignature({
        institution: r.institution ?? null,
        field_of_study: r.field_of_study ?? null,
        graduation_year: r.graduation_year ?? null,
      })
    )
  )
  const pendingEducationRaw = Array.isArray(pending.education) ? pending.education : []
  const education: Array<{
    signature: string
    status: CollectionStatus
    item: Record<string, unknown>
  }> = []
  pendingEducationRaw.forEach((edu: any) => {
    if (!edu || typeof edu !== 'object') return
    const inst = typeof edu.institution === 'string' ? edu.institution : ''
    if (inst.trim() === '') return
    const signature = computeEducationSignature({
      institution: inst,
      field_of_study: typeof edu.field_of_study === 'string' ? edu.field_of_study : null,
      graduation_year: typeof edu.graduation_year === 'number' ? edu.graduation_year : null,
    })
    const status: CollectionStatus = currentEduSignatures.has(signature) ? 'matched' : 'added'
    education.push({ signature, status, item: edu })
  })

  // -- languages ---------------------------------------------------------------
  const currentLangKeys = new Set<string>(resolved.languages.map((r) => norm(r.language)))
  const pendingLanguagesRaw = Array.isArray(pending.languages) ? pending.languages : []
  const languages: Array<{
    key: string
    status: CollectionStatus
    item: Record<string, unknown>
  }> = []
  pendingLanguagesRaw.forEach((lng: any) => {
    if (!lng || typeof lng !== 'object') return
    const language = typeof lng.language === 'string' ? lng.language : ''
    if (language.trim() === '') return
    const key = norm(language)
    const status: CollectionStatus = currentLangKeys.has(key) ? 'matched' : 'added'
    languages.push({ key, status, item: lng })
  })

  // -- sectors -----------------------------------------------------------------
  const currentSectorSet = new Set<string>(resolved.sectors)
  const pendingSectorsRaw = Array.isArray(pending.sectors) ? pending.sectors : []
  const sectors: Array<{ sector: string; status: CollectionStatus }> = []
  for (const s of pendingSectorsRaw) {
    if (typeof s !== 'string') continue
    const value = s.trim()
    if (value === '') continue
    const status: CollectionStatus = currentSectorSet.has(value) ? 'matched' : 'added'
    sectors.push({ sector: value, status })
  }

  return NextResponse.json({
    pending: {
      parsed_at: typeof pending.parsed_at === 'string' ? pending.parsed_at : null,
      source: pending.source ?? null,
    },
    diff: {
      identity,
      experiences,
      education,
      languages,
      sectors,
    },
  })
}
