import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { computeEducationSignature } from '@/lib/profilux/educationSignature'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// GET /api/members/cv-merge/diff — Phase C.2
//
// Read-only diff between members.cv_parsed_pending and the canonical L2 state
// (L2 columns + work_experiences + education_records + member_languages +
// member_sectors). Resolver is NOT used here: we deliberately compare against
// raw L2 only, since cv_parsed_data L1 fallbacks are about to be replaced by
// the pending payload on apply.
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
  'headline',
  'bio',
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
      'id, first_name, last_name, city, country, nationality, phone, headline, bio, cv_parsed_pending'
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

  // -- L2 fetches (parallel) ---------------------------------------------------
  const [weRes, erRes, mlRes, msRes] = await Promise.all([
    supabase
      .from('work_experiences')
      .select('id, company, start_date')
      .eq('member_id', member.id),
    supabase
      .from('education_records')
      .select('id, institution, field_of_study, graduation_year')
      .eq('member_id', member.id),
    supabase
      .from('member_languages')
      .select('id, language')
      .eq('member_id', member.id),
    supabase
      .from('member_sectors')
      .select('id, sector')
      .eq('member_id', member.id),
  ])

  if (weRes.error) return NextResponse.json({ error: weRes.error.message }, { status: 500 })
  if (erRes.error) return NextResponse.json({ error: erRes.error.message }, { status: 500 })
  if (mlRes.error) return NextResponse.json({ error: mlRes.error.message }, { status: 500 })
  if (msRes.error) return NextResponse.json({ error: msRes.error.message }, { status: 500 })

  // -- identity ----------------------------------------------------------------
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
    const cRaw = (member as Record<string, unknown>)[field]
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
  const l2WeKeys = new Set<string>(
    (weRes.data ?? [])
      .map((r) => `${norm(r.company)}|${r.start_date ?? ''}`)
      .filter((k) => !k.startsWith('|') || k !== '|') // skip the empty-empty case
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
    const status: CollectionStatus = l2WeKeys.has(key) ? 'matched' : 'added'
    experiences.push({ index, key, status, item: exp })
  })

  // -- education ---------------------------------------------------------------
  const l2EduSignatures = new Set<string>(
    (erRes.data ?? []).map((r) =>
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
    const status: CollectionStatus = l2EduSignatures.has(signature) ? 'matched' : 'added'
    education.push({ signature, status, item: edu })
  })

  // -- languages ---------------------------------------------------------------
  const l2LangKeys = new Set<string>((mlRes.data ?? []).map((r) => norm(r.language)))
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
    const status: CollectionStatus = l2LangKeys.has(key) ? 'matched' : 'added'
    languages.push({ key, status, item: lng })
  })

  // -- sectors -----------------------------------------------------------------
  const l2SectorSet = new Set<string>((msRes.data ?? []).map((r) => (r.sector ?? '') as string))
  const pendingSectorsRaw = Array.isArray(pending.sectors) ? pending.sectors : []
  const sectors: Array<{ sector: string; status: CollectionStatus }> = []
  for (const s of pendingSectorsRaw) {
    if (typeof s !== 'string') continue
    const value = s.trim()
    if (value === '') continue
    const status: CollectionStatus = l2SectorSet.has(value) ? 'matched' : 'added'
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
