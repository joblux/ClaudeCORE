/**
 * resolveProfiLux — Matrix v1 §6 single resolver.
 *
 * Per D3 (Mo, Apr 30): hybrid signature
 *   (memberId, supabase) => Promise<ProfiLuxResolved | null>
 * Caller passes the Supabase client (controls auth context — admin routes
 * should pass a service-role client).
 *
 * Rule A precedence (§6.2):
 *   1. members.<field> if non-empty → return it
 *   2. else cv_parsed_data.<L1 path> if present → return it
 *   3. else null/empty
 *
 * §6.3: members.email always wins (never read L1 email).
 *
 * cv_url is intentionally surfaced only via cv_meta on ProfiLuxResolved
 * (single source of truth). M6 group G6 reads cv_meta.cv_url.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CvParsedData,
  CvParsedExperience,
  CvParsedEducation,
  CvParsedLanguage,
  MemberRow,
  ProfiLuxResolved,
  ResolvedCvMeta,
  ResolvedEducation,
  ResolvedExperience,
  ResolvedLanguage,
} from './types'

/** Non-empty string per Rule A. */
function nonEmptyStr(s: string | null | undefined): boolean {
  return typeof s === 'string' && s.trim() !== ''
}

/** Pick L2 if non-empty, else L1, else null (string). */
function pickStr(
  l2: string | null | undefined,
  l1: string | null | undefined,
): string | null {
  if (nonEmptyStr(l2)) return l2 as string
  if (nonEmptyStr(l1)) return l1 as string
  return null
}

/** Coerce a possibly-null array to a guaranteed array. */
function arr<T>(v: T[] | null | undefined): T[] {
  return Array.isArray(v) ? v : []
}

function mapExperiences(
  l1: CvParsedExperience[] | undefined,
): ResolvedExperience[] {
  return arr(l1).map((e) => ({
    company: e.company ?? null,
    job_title: e.job_title ?? null,
    city: e.city ?? null,
    country: e.country ?? null,
    start_date: e.start_date ?? null,
    end_date: e.end_date ?? null,
    description: e.description ?? null,
  }))
}

function mapEducation(
  l1: CvParsedEducation[] | undefined,
): ResolvedEducation[] {
  return arr(l1).map((e) => ({
    institution: e.institution ?? null,
    degree: e.degree ?? null,
    field_of_study: e.field_of_study ?? null,
    start_year: e.start_year ?? null,
    graduation_year: e.graduation_year ?? null,
    city: e.city ?? null,
    country: e.country ?? null,
  }))
}

function mapLanguages(l1: CvParsedLanguage[] | undefined): ResolvedLanguage[] {
  return arr(l1).map((l) => ({
    language: l.language,
    proficiency: l.proficiency ?? null,
  }))
}

/**
 * Fetch a member row + apply Rule A → ProfiLuxResolved.
 * Returns null if no member with that id exists.
 */
export async function resolveProfiLux(
  memberId: string,
  supabase: SupabaseClient,
): Promise<ProfiLuxResolved | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', memberId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as MemberRow
  const cv: CvParsedData | null = row.cv_parsed_data ?? null
  const ident = cv?.identity

  // Identity (Rule A on mapped fields; email is L2-only per §6.3)
  const first_name = pickStr(row.first_name, ident?.first_name)
  const last_name = pickStr(row.last_name, ident?.last_name)
  const city = pickStr(row.city, ident?.city)
  const country = pickStr(row.country, ident?.country)
  const nationality = pickStr(row.nationality, ident?.nationality)
  const phone = pickStr(row.phone, ident?.phone)

  // Professional core mapped from most-recent experience when L2 NULL
  const recent = arr<CvParsedExperience>(cv?.experiences)[0]
  const job_title = pickStr(row.job_title, recent?.job_title)
  const current_employer = pickStr(row.current_employer, recent?.company)

  // Education flat from first L1 record when L2 NULL
  const firstEdu = arr<CvParsedEducation>(cv?.education)[0]
  const university = pickStr(row.university ?? null, firstEdu?.institution)
  const field_of_study = pickStr(
    row.field_of_study ?? null,
    firstEdu?.field_of_study,
  )
  const graduation_year =
    row.graduation_year !== null && row.graduation_year !== undefined
      ? row.graduation_year
      : firstEdu?.graduation_year ?? null

  const cv_meta: ResolvedCvMeta = {
    cv_url: row.cv_url ?? null,
    cv_parsed_at: row.cv_parsed_at ?? null,
    schema_version: cv?.schema_version ?? null,
    parsed_at: cv?.parsed_at ?? null,
    confidence: cv?.confidence ?? null,
    needs_review: arr(cv?.needs_review),
  }

  const resolved: ProfiLuxResolved = {
    // Identity
    id: row.id,
    email: row.email, // §6.3: always L2
    first_name,
    last_name,
    city,
    country,
    nationality,
    phone,
    bio: row.bio,
    headline: row.headline,
    avatar_url: row.avatar_url,
    linkedin_url: row.linkedin_url,
    date_of_birth: row.date_of_birth,
    // Professional core
    job_title,
    current_employer,
    seniority: row.seniority,
    total_years_experience: row.total_years_experience,
    years_in_luxury: row.years_in_luxury,
    department: row.department,
    speciality: row.speciality,
    maison: row.maison,
    // Capability arrays (NULL → [])
    key_skills: arr(row.key_skills),
    software_tools: arr(row.software_tools),
    certifications: arr(row.certifications),
    product_categories: arr(row.product_categories),
    brands_worked_with: arr(row.brands_worked_with),
    client_segment_experience: arr(row.client_segment_experience),
    market_knowledge: arr(row.market_knowledge),
    expertise_tags: arr(row.expertise_tags),
    keywords: arr(row.keywords),
    // Clienteling
    clienteling_experience: row.clienteling_experience,
    clienteling_description: row.clienteling_description,
    // Availability + salary
    availability: row.availability,
    desired_salary_min: row.desired_salary_min,
    desired_salary_max: row.desired_salary_max,
    desired_salary_currency: row.desired_salary_currency,
    open_to_relocation: row.open_to_relocation,
    relocation_preferences: row.relocation_preferences,
    desired_locations: arr(row.desired_locations),
    desired_contract_types: arr(row.desired_contract_types),
    desired_departments: arr(row.desired_departments),
    // Education flat
    university,
    field_of_study,
    graduation_year,
    // L1 passthroughs
    sectors: arr(cv?.sectors),
    languages: mapLanguages(cv?.languages),
    experiences: mapExperiences(cv?.experiences),
    education: mapEducation(cv?.education),
    // System
    role: row.role,
    status: row.status,
    access_level: row.access_level,
    tier_selected: row.tier_selected,
    registration_completed: row.registration_completed,
    contact_preference: row.contact_preference,
    contribution_points: row.contribution_points,
    profile_visibility: row.profile_visibility,
    // L3 cached
    profile_completeness: row.profile_completeness,
    m6_confirmed_at: row.m6_confirmed_at,
    // L1 metadata
    cv_meta,
    // Provenance
    created_at: row.created_at,
    updated_at: row.updated_at,
  }

  return resolved
}
