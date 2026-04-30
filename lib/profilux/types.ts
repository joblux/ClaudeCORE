/**
 * ProfiLux Matrix v1 — types
 *
 * Spec: docs/PROFILUX_MATRIX_V1.md
 * Authority: docs/JOBLUX_STATE.md (supreme; this file is subordinate per §12.1)
 *
 * v1 scope:
 *   - L1 = members.cv_parsed_data (jsonb)
 *   - L2 = members.* flat columns
 *   - L3 = members.profile_completeness, members.m6_confirmed_at,
 *          plus L1 metadata read-through
 *
 * No relational L2 (work_experiences / education_records / member_languages /
 * member_sectors are §9 dormant in v1).
 */

// =============================================================================
// L1 — CvParsedData
// =============================================================================
//
// Shape duplicated from app/api/members/cv-parse/route.ts CvParsedDataSchema
// (zod schema, that route line ~178).
//
// SOURCE OF TRUTH for drift: app/api/members/cv-parse/route.ts CvParsedDataSchema.
// Per Matrix v1 §12.2, if the cv-parse zod schema changes, this type must
// follow in the same change set. Do not change one without the other.
//
// Reason for duplication (not zod inference): Mo decision D2 — keep cv-parse
// route untouched while utilities are built.

export type CvParsedExperience = {
  company: string | null
  job_title: string | null
  city: string | null
  country: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
}

export type CvParsedEducation = {
  institution: string | null
  degree: string | null
  field_of_study: string | null
  start_year: number | null
  graduation_year: number | null
  city: string | null
  country: string | null
}

export type CvParsedLanguage = {
  language: string
  proficiency:
    | 'native'
    | 'fluent'
    | 'professional'
    | 'conversational'
    | 'basic'
    | null
}

export type CvParsedConfidence = {
  identity: number
  experiences: number
  education: number
  sectors: number
  languages: number
}

export type CvParsedNeedsReviewItem = {
  section: 'identity' | 'experiences' | 'education' | 'sectors' | 'languages'
  index: number
  reason: string
}

export type CvParsedIdentity = {
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  country: string | null
  nationality: string | null
}

export type CvParsedData = {
  identity: CvParsedIdentity
  experiences: CvParsedExperience[]
  education: CvParsedEducation[]
  sectors: string[]
  languages: CvParsedLanguage[]
  availability: null
  confidence: CvParsedConfidence
  needs_review: CvParsedNeedsReviewItem[]
  parsed_at?: string
  schema_version?: string
  source?: Record<string, unknown>
}

// =============================================================================
// MemberRow — typed view of relevant members.* columns
// =============================================================================
//
// Hand-typed from verified live schema (Apr 30 2026, 57-column query against
// information_schema.columns). Not derived from types/member-profile.ts —
// that type is L2-shaped + relational; this one is the raw DB row.

export type MemberRow = {
  id: string
  email: string // NOT NULL per schema
  // Identity (L2)
  first_name: string | null
  last_name: string | null
  city: string | null
  country: string | null
  nationality: string | null
  phone: string | null
  bio: string | null
  headline: string | null
  avatar_url: string | null
  linkedin_url: string | null
  date_of_birth: string | null
  // Professional core (L2)
  job_title: string | null
  current_employer: string | null
  seniority: string | null
  total_years_experience: number | null
  years_in_luxury: number | null
  department: string | null
  speciality: string | null
  maison: string | null
  // Capability arrays (L2)
  key_skills: string[] | null
  software_tools: string[] | null
  certifications: string[] | null
  product_categories: string[] | null
  brands_worked_with: string[] | null
  client_segment_experience: string[] | null
  market_knowledge: string[] | null
  expertise_tags: string[] | null
  keywords: string[] | null // default '{}'::text[] in schema
  // Clienteling (L2)
  clienteling_experience: boolean // default false
  clienteling_description: string | null
  // Availability + salary (L2)
  availability: string | null // default 'not_actively_looking'
  desired_salary_min: number | null
  desired_salary_max: number | null
  desired_salary_currency: string | null
  open_to_relocation: boolean // default false
  relocation_preferences: string | null
  desired_locations: string[] | null
  desired_contract_types: string[] | null
  desired_departments: string[] | null
  // Education flat (L2)
  university: string | null
  field_of_study: string | null
  graduation_year: number | null
  // System / read-only
  role: string // member_role enum, NOT NULL, default 'professional'
  status: string // member_status enum, NOT NULL, default 'pending'
  access_level: string | null // default 'basic'
  tier_selected: boolean | null // default false
  registration_completed: boolean | null
  contact_preference: string | null // default 'email_only'
  contribution_points: number | null // default 0
  profile_visibility: string | null // default 'team_only'
  // L1 provenance
  cv_url: string | null
  cv_parsed_at: string | null
  cv_parsed_data: CvParsedData | null
  // L3 cached
  profile_completeness: number | null // default 0
  m6_confirmed_at: string | null
  // Timestamps
  created_at?: string
  updated_at?: string
}

// =============================================================================
// ProfiLuxResolved — output of resolveProfiLux(memberId, supabase)
// =============================================================================
//
// Single shape every read path consumes (Matrix v1 §6.1, §10.2).
// L2 wins over L1 per Rule A (§6.2). L1 fills NULL gaps for mapped fields.
//
// cv_url is intentionally surfaced only via cv_meta on ProfiLuxResolved
// (single source of truth). M6 group G6 reads cv_meta.cv_url.

export type ResolvedExperience = {
  company: string | null
  job_title: string | null
  city: string | null
  country: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
}

export type ResolvedEducation = {
  institution: string | null
  degree: string | null
  field_of_study: string | null
  start_year: number | null
  graduation_year: number | null
  city: string | null
  country: string | null
}

export type ResolvedLanguage = {
  language: string
  proficiency:
    | 'native'
    | 'fluent'
    | 'professional'
    | 'conversational'
    | 'basic'
    | null
}

export type ResolvedCvMeta = {
  cv_url: string | null
  cv_parsed_at: string | null
  schema_version: string | null
  parsed_at: string | null
  confidence: CvParsedConfidence | null
  needs_review: CvParsedNeedsReviewItem[]
}

export type ProfiLuxResolved = {
  // Identity
  id: string
  email: string // always L2 (§6.3)
  first_name: string | null
  last_name: string | null
  city: string | null
  country: string | null
  nationality: string | null
  phone: string | null
  bio: string | null
  headline: string | null
  avatar_url: string | null
  linkedin_url: string | null
  date_of_birth: string | null
  // Professional core
  job_title: string | null
  current_employer: string | null
  seniority: string | null
  total_years_experience: number | null
  years_in_luxury: number | null
  department: string | null
  speciality: string | null
  maison: string | null
  // Capability arrays (always arrays, NULL → [])
  key_skills: string[]
  software_tools: string[]
  certifications: string[]
  product_categories: string[]
  brands_worked_with: string[]
  client_segment_experience: string[]
  market_knowledge: string[]
  expertise_tags: string[]
  keywords: string[]
  // Clienteling
  clienteling_experience: boolean
  clienteling_description: string | null
  // Availability + salary
  availability: string | null
  desired_salary_min: number | null
  desired_salary_max: number | null
  desired_salary_currency: string | null
  open_to_relocation: boolean
  relocation_preferences: string | null
  desired_locations: string[]
  desired_contract_types: string[]
  desired_departments: string[]
  // Education flat
  university: string | null
  field_of_study: string | null
  graduation_year: number | null
  // L1 passthroughs (no L2 store v1, §6.4)
  sectors: string[]
  languages: ResolvedLanguage[]
  experiences: ResolvedExperience[]
  education: ResolvedEducation[]
  // System
  role: string
  status: string
  access_level: string | null
  tier_selected: boolean | null
  registration_completed: boolean | null
  contact_preference: string | null
  contribution_points: number | null
  profile_visibility: string | null
  // L3 cached
  profile_completeness: number | null
  m6_confirmed_at: string | null
  // L1 metadata (resolver-internal, see §10.1)
  cv_meta: ResolvedCvMeta
  // Provenance
  created_at?: string
  updated_at?: string
}

// =============================================================================
// Surface + ProjectedView
// =============================================================================
//
// Six surfaces per Matrix v1 §7.2. Conservative deterministic masks per Mo's
// V1–V9 decisions. No per-field toggles in v1.

export type Surface =
  | 'dashboard'
  | 'editor'
  | 'public'
  | 'admin'
  | 'ats'
  | 'client'

// --- Dashboard projection (V6) ----------------------------------------------
export type DashboardProjection = {
  surface: 'dashboard'
  // Identity strip
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  headline: string | null
  job_title: string | null
  current_employer: string | null
  city: string | null
  country: string | null
  // L3 status
  profile_completeness: number | null
  m6_confirmed_at: string | null
  // Membership snapshot (own only)
  access_level: string | null
  contribution_points: number | null
  member_since: string | null
  // CV status
  cv_parsed_at: string | null
  cv_confidence: CvParsedConfidence | null
  cv_needs_review_count: number
}

// --- Editor projection -------------------------------------------------------
export type EditorProjection = {
  surface: 'editor'
  view: ProfiLuxResolved
}

// --- Public projection (/p/[name], V1 V3 V4 V5 V7) --------------------------
export type PublicExperience = {
  company: null // V5: anonymized — UI renders placeholder
  job_title: string | null
  city: string | null
  country: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
}

export type PublicProjection = {
  surface: 'public'
  // Identity
  first_name: string | null
  last_name: string | null // V1: initial only — first letter + '.'
  avatar_url: string | null
  headline: string | null
  bio: string | null
  city: string | null
  country: string | null
  // Professional (curated)
  job_title: string | null
  // current_employer hidden (V3)
  seniority: string | null
  total_years_experience: number | null
  years_in_luxury: number | null
  department: string | null
  speciality: string | null
  maison: string | null
  // Capability (curated; software_tools, keywords hidden V7)
  key_skills: string[]
  certifications: string[]
  product_categories: string[]
  // brands_worked_with hidden (V4)
  client_segment_experience: string[]
  market_knowledge: string[]
  expertise_tags: string[]
  // Clienteling
  clienteling_experience: boolean
  // L1 passthrough
  sectors: string[]
  languages: ResolvedLanguage[]
  experiences: PublicExperience[] // anonymized
  // Education (graduation_year hidden V7)
  university: string | null
  field_of_study: string | null
}

// --- Client share projection (V2 V3 V4 V5 V7 V8) ----------------------------
export type ClientProjection = {
  surface: 'client'
  // Identity
  first_name: string | null
  last_name: string | null // V2: full
  avatar_url: string | null
  headline: string | null
  bio: string | null
  city: string | null
  country: string | null
  // email, phone, linkedin_url hidden (V8)
  // Professional (full)
  job_title: string | null
  current_employer: string | null // V3: visible
  seniority: string | null
  total_years_experience: number | null
  years_in_luxury: number | null
  department: string | null
  speciality: string | null
  maison: string | null
  // Capability (full minus operational)
  key_skills: string[]
  certifications: string[]
  product_categories: string[]
  brands_worked_with: string[] // V4: visible
  client_segment_experience: string[]
  market_knowledge: string[]
  expertise_tags: string[]
  // Clienteling
  clienteling_experience: boolean
  // L1 passthrough
  sectors: string[]
  languages: ResolvedLanguage[]
  experiences: ResolvedExperience[] // V5: full
  // Education
  university: string | null
  field_of_study: string | null
}

// --- Admin projection (full + L1 raw) ---------------------------------------
export type AdminProjection = {
  surface: 'admin'
  view: ProfiLuxResolved
  cv_parsed_data_raw: CvParsedData | null
}

// --- ATS projection (V9) ----------------------------------------------------
export type AtsProjection = {
  surface: 'ats'
  view: ProfiLuxResolved
}

export type ProjectedView =
  | DashboardProjection
  | EditorProjection
  | PublicProjection
  | ClientProjection
  | AdminProjection
  | AtsProjection
