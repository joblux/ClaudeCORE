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
  is_current: boolean
  description: string | null
  raw_dates_text: string | null
}

export type CvParsedEducation = {
  institution: string | null
  /**
   * Legacy field kept for backward compatibility with consumers that
   * predate degree_level reconciliation (S-B.1A). Live cv-parse zod and
   * SYSTEM_PROMPT write `degree_level` only — `degree` is always undefined
   * in production payloads. Do not remove without a separate cleanup slice.
   */
  degree: string | null
  /**
   * Live field written by /api/members/cv-parse zod schema (since launch).
   * Reconciled into this duplicated type in S-B.1A to align lib/profilux
   * with the actual production payload shape.
   */
  degree_level: string | null
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

/**
 * resolution_state — C1 slice 1B.
 *
 * Tracks per-field user decisions on cv_identity_suggestions:
 *   - "applied"   → user accepted the L1 value and wrote it to L2
 *   - "dismissed" → user rejected the L1 value, no L2 write
 *
 * Resolver uses this to suppress repeated suggestions for the same L1 value.
 * If L1 changes (new CV parse), the value mismatch re-fires the suggestion.
 *
 * Written by /api/profilux/suggestions only (slice 1B.3+).
 * Never written by /api/members/cv-parse (parser preserves but does not touch).
 */
export type CvParsedDataResolutionItem = {
  status: 'applied' | 'dismissed'
  value: string
  at: string
}

export type CvParsedDataResolutionState = {
  identity?: {
    first_name?: CvParsedDataResolutionItem
    last_name?: CvParsedDataResolutionItem
    city?: CvParsedDataResolutionItem
    nationality?: CvParsedDataResolutionItem
  }
  /**
   * education — C1 slice S-B foundation.
   *
   * Per-row apply/dismiss tracking for cv_parsed_data.education entries.
   * Key = content-hash signature over (institution|field_of_study|graduation_year),
   * lowercased + trimmed, sha256, 64 hex chars. Hash function lives outside this type.
   *
   * status:
   *   - 'applied'   → user accepted the L1 row; education_records INSERT succeeded; l2_id set
   *   - 'dismissed' → user rejected the L1 row; no L2 write; l2_id is null
   *
   * l1_snapshot captures the exact L1 row at resolution time for debugging and future
   * undo paths. l2_id links to education_records.id when applied; null otherwise.
   *
   * Resolver re-fires suggestion if hash of current L1 row no longer matches any stored
   * key (institution/field_of_study/graduation_year changed on re-parse).
   *
   * Written by /api/profilux/suggestions/education only (slice S-B.1+, not in S-B.0).
   * Never written by /api/members/cv-parse (parser preserves but does not touch).
   */
  education?: Record<string, CvParsedDataResolutionEducationItem>
  /**
   * experiences — Career History V2 Slice 1.
   *
   * Per-row apply tracking for cv_parsed_data.experiences entries (L1). Mirrors
   * the education sibling: key = sha256(company|job_title|start_date), lowercased
   * + trimmed. end_date intentionally excluded so an L1 row whose end_date the
   * parser later fills/changes does NOT re-fire after the user confirmed it.
   *
   * status:
   *   - 'applied'   → user confirmed the L1 row; work_experiences INSERT succeeded; l2_id set
   *   - 'dismissed' → reserved (no UI wiring v1; type slot kept for symmetry with education)
   *
   * Written by /api/profilux/suggestions/experiences only.
   * Never written by /api/members/cv-parse (parser preserves but does not touch).
   */
  experiences?: Record<string, CvParsedDataResolutionExperienceItem>
}

/**
 * resolution_state.education entry — C1 slice S-B foundation.
 *
 * Sibling to CvParsedDataResolutionItem (identity). Different shape:
 * collection-shaped resolution requires a snapshot of the L1 row and a link
 * to the resulting L2 row.
 */
export type CvParsedDataResolutionEducationItem = {
  status: 'applied' | 'dismissed'
  signature: string
  l1_snapshot: {
    institution: string | null
    degree_level: string | null
    field_of_study: string | null
    graduation_year: number | null
  }
  l2_id: string | null
  at: string
}

/**
 * resolution_state.experiences entry — Career History V2 Slice 1.
 *
 * Sibling to CvParsedDataResolutionEducationItem. l1_snapshot captures the
 * matched server-side L1 row at confirm time (the four fields actually carried
 * across the L1→L2 promotion). l2_id links to work_experiences.id on apply.
 */
export type CvParsedDataResolutionExperienceItem = {
  status: 'applied' | 'dismissed'
  signature: string
  l1_snapshot: {
    company: string | null
    job_title: string | null
    start_date: string | null
    end_date: string | null
  }
  l2_id: string | null
  at: string
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
  resolution_state?: CvParsedDataResolutionState
}

// =============================================================================
// Section visibility + masked fields (PF-2 P1)
// =============================================================================
//
// Substrate columns added in migration 20260515_profilux_section_visibility_masked_fields.
// section_visibility consumed by projectFor('public') this slice. masked_fields
// is substrate-only — no consumer yet; client/share surfaces follow in next slice.

/**
 * PF-D V3.1 — Strategic Initiatives (jsonb array-of-objects).
 *
 * Pack D Phase 2 path γ — paired semantic object (title + optional description).
 * Stored in members.strategic_initiatives (jsonb NULL). title required;
 * description optional. Editor projection only — public/client/ats omit v1.
 */
export type ProfiLuxStrategicInitiative = {
  title: string
  description: string | null
}

/**
 * PF-D V3.2 — Portfolio (jsonb array-of-objects).
 *
 * Pack D Phase 2 path γ — paired semantic object (title + url). Both required.
 * URL must be http(s)-only at write time (validated in POST /api/profilux).
 * Stored in members.portfolio (jsonb NULL). Editor projection only —
 * public/client/ats/admin/dashboard omit v1.
 */
export type ProfiLuxPortfolioItem = {
  title: string
  url: string
}

/**
 * PF-D V3.3 — Press & Features (jsonb array-of-objects).
 *
 * Pack D Phase 2 path γ — { title, publication, url } trio, all required.
 * URL must be http(s)-only at write time (validated in POST /api/profilux).
 * Stored in members.press_features (jsonb NULL). Editor projection only —
 * public/client/ats/admin/dashboard omit v1.
 */
export type ProfiLuxPressFeatureItem = {
  title: string
  publication: string
  url: string
}

/**
 * PF-D V3.4 — References (jsonb array-of-objects).
 *
 * Pack D Phase 2 path γ — { name, role, company } trio, all required.
 * No contact fields (email/phone/relationship intentionally absent v1).
 * Stored in members."references" (jsonb NULL — column name is a SQL reserved
 * word, quoted in DDL; Supabase JS handles quoting via bare property access).
 * Editor projection only — public/client/ats/admin/dashboard omit v1 (strict
 * because reference content is sensitive).
 */
export type ProfiLuxReferenceItem = {
  name: string
  role: string
  company: string
}

/**
 * PF-D V3.5 — Internships (jsonb array-of-objects).
 *
 * Pack D Phase 2 path γ — { company, role, period } trio, all required.
 * Stored in members.internships (jsonb NULL). Editor projection only —
 * public/client/ats/admin/dashboard omit v1. No location, description,
 * start_date, end_date — period is a free-text label (e.g. "Summer 2024").
 */
export type ProfiLuxInternshipItem = {
  company: string
  role: string
  period: string
}

/**
 * Slice 2b — Certifications (jsonb array-of-objects).
 *
 * Mirrors ProfiLuxStrategicInitiative posture: title required, optional
 * paired fields. year is FREE-TEXT (string) — mirrors internships.period
 * precedent (no number coercion). Stored in members.certifications (jsonb).
 */
export type ProfiLuxCertificationItem = {
  title: string
  institution: string | null
  year: string | null
}

/**
 * Slice 2b — Awards (jsonb array-of-objects).
 *
 * Mirrors ProfiLuxCertificationItem posture: title required, body and year
 * optional. year is FREE-TEXT (string). Stored in members.awards (jsonb).
 */
export type ProfiLuxAwardItem = {
  title: string
  body: string | null
  year: string | null
}

export const SECTION_IDS = ['identity','current_role','career_path','education','languages','luxury_fit','skills_markets','clienteling','compensation','availability','awards','certifications','memberships','strategic_initiatives','portfolio','press_features','references','internships'] as const
export type SectionId = typeof SECTION_IDS[number]
export type SectionVisibility = Partial<Record<SectionId, boolean>>

export const MASKABLE_FIELDS = ['contact','phone','email','current_employer','salary','availability','references'] as const
export type MaskableField = typeof MASKABLE_FIELDS[number]
export type MaskedFields = Partial<Record<MaskableField, boolean>>

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
  certifications: ProfiLuxCertificationItem[] | null
  awards: ProfiLuxAwardItem[] | null
  memberships: string[] | null
  strategic_initiatives: ProfiLuxStrategicInitiative[] | null
  portfolio: ProfiLuxPortfolioItem[] | null
  press_features: ProfiLuxPressFeatureItem[] | null
  references: ProfiLuxReferenceItem[] | null
  internships: ProfiLuxInternshipItem[] | null
  activated_sections: string[] | null
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
  // System / read-only
  role: string // member_role enum, NOT NULL, default 'professional'
  status: string // member_status enum, NOT NULL, default 'pending'
  access_level: string | null // default 'basic'
  tier_selected: boolean | null // default false
  registration_completed: boolean | null
  contact_preference: string | null // default 'email_only'
  contribution_points: number | null // default 0
  profile_visibility: string | null // default 'team_only'
  section_visibility: SectionVisibility | null
  masked_fields: MaskedFields | null
  // Consent (B.3.3) — gates matching/recruiter surfaces. NOT NULL DEFAULT false.
  matching_opt_in: boolean
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
  id?: string
  company: string | null
  job_title: string | null
  city: string | null
  country: string | null
  start_date: string | null
  end_date: string | null
  is_current?: boolean
  description: string | null
}

export type ResolvedEducation = {
  /**
   * Present on L2 rows (education_records.id), absent on L1 passthrough
   * rows (cv_parsed_data.education entries). Mirrors ResolvedExperience.id
   * semantics. UI uses presence/absence to gate edit/delete affordances.
   */
  id?: string
  institution: string | null
  /**
   * Legacy field kept for backward compatibility (admin route reads it).
   * Always null in production today — live CV parser writes degree_level,
   * not degree. Slated for removal in a future type-drift cleanup slice.
   */
  degree: string | null
  /**
   * Real degree string from L2 (education_records.degree_level) when
   * present, or from L1 (cv_parsed_data.education[].degree_level) on
   * passthrough rows. Added in S-B.1A.
   */
  degree_level: string | null
  field_of_study: string | null
  start_year: number | null
  graduation_year: number | null
  city: string | null
  country: string | null
}

export type ResolvedLanguage = {
  /**
   * Present on L2 rows (member_languages.id), absent on L1 passthrough
   * rows (cv_parsed_data.languages entries). Mirrors ResolvedExperience.id
   * and ResolvedEducation.id semantics. UI uses presence/absence to gate
   * edit/delete affordances.
   */
  id?: string
  language: string
  proficiency:
    | 'native'
    | 'fluent'
    | 'professional'
    | 'conversational'
    | 'basic'
    | null
}

/**
 * Identity prefill suggestions — S1.5.
 *
 * Computed in resolveProfiLux pre-Rule-A. A key is present iff:
 *   L1 cv_parsed_data.identity[key] non-empty (trimmed)
 *   AND raw members.<key> null/empty (trimmed).
 * Ineligible keys are omitted entirely (not null).
 *
 * Read-only. UI consumes this via EditorView.cv_identity_suggestions.
 * Does NOT expose raw L2 anywhere in the projection tree.
 */
export type CvIdentitySuggestions = {
  first_name?: string
  last_name?: string
  city?: string
  nationality?: string
}

/**
 * Education prefill suggestions — C1 slice S-B.1B.1.
 *
 * Collection-shaped sibling to CvIdentitySuggestions. Computed in
 * resolveProfiLux from cv_parsed_data.education[] rows, with suppression
 * via cv_parsed_data.resolution_state.education[<signature>] (S-B.0 type).
 *
 * Eligibility: an L1 row appears here iff its computed signature is NOT
 * present in resolution_state.education with status 'applied' or
 * 'dismissed'. Hash-only re-fire rule: if L1 changes (institution,
 * field_of_study, or graduation_year), the new hash misses
 * resolution_state and the suggestion fires again.
 *
 * Read-only. UI consumes via EditorView.cv_education_suggestions.
 * The signature field is the apply/dismiss endpoint contract (S-B.1B.3+).
 */
export type CvEducationSuggestion = {
  signature: string
  institution: string | null
  degree_level: string | null
  field_of_study: string | null
  graduation_year: number | null
  city: string | null
  country: string | null
  start_year: number | null
}

export type CvEducationSuggestions = CvEducationSuggestion[]

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
  certifications: ProfiLuxCertificationItem[]
  awards: ProfiLuxAwardItem[]
  memberships: string[]
  strategic_initiatives: ProfiLuxStrategicInitiative[]
  portfolio: ProfiLuxPortfolioItem[]
  press_features: ProfiLuxPressFeatureItem[]
  references: ProfiLuxReferenceItem[]
  internships: ProfiLuxInternshipItem[]
  activated_sections: string[]
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
  section_visibility: SectionVisibility
  masked_fields: MaskedFields
  // Consent (B.3.3) — gates matching/recruiter surfaces.
  matching_opt_in: boolean
  // L3 cached
  profile_completeness: number | null
  m6_confirmed_at: string | null
  // L1 metadata (resolver-internal, see §10.1)
  cv_meta: ResolvedCvMeta
  cv_identity_suggestions: CvIdentitySuggestions
  cv_education_suggestions: CvEducationSuggestions
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
// Phase 4.A-0: §7.6 native flat shape (EditorView) added alongside raw `view`.
// `view` retained for backward compatibility with /api/profilux legacy adapter.

export type EditorAvailability =
  | 'not_specified'
  | 'actively_looking'
  | 'quietly_considering'
  | 'passively_exploring'
  | 'not_available'
  | null

export type EditorCvMeta = {
  cv_url: string | null
  cv_parsed_at: string | null
  needs_review: number
}

export type EditorView = {
  // Identity
  first_name: string | null
  last_name: string | null
  city: string | null
  country: string | null
  nationality: string | null
  phone: string | null
  // Position
  job_title: string | null
  current_employer: string | null
  seniority: string | null
  total_years_experience: number | null
  // Luxury fit
  years_in_luxury: number | null
  sectors: string[]
  product_categories: string[]
  expertise_tags: string[]
  brands_worked_with: string[]
  certifications: ProfiLuxCertificationItem[]
  awards: ProfiLuxAwardItem[]
  memberships: string[]
  strategic_initiatives: ProfiLuxStrategicInitiative[]
  portfolio: ProfiLuxPortfolioItem[]
  press_features: ProfiLuxPressFeatureItem[]
  references: ProfiLuxReferenceItem[]
  internships: ProfiLuxInternshipItem[]
  activated_sections: string[]
  // Experience + education (L1)
  experiences: ResolvedExperience[]
  education: ResolvedEducation[]
  // Availability + targets (Readiness — NOT M6 admission)
  availability: EditorAvailability
  desired_locations: string[]
  desired_departments: string[]
  desired_contract_types: string[]
  desired_salary_min: number | null
  desired_salary_max: number | null
  desired_salary_currency: string | null
  open_to_relocation: boolean | null
  relocation_preferences: string | null
  // Narrative
  headline: string | null
  bio: string | null
  avatar_url: string | null
  linkedin_url: string | null
  // Languages, markets, skills
  languages: ResolvedLanguage[]
  market_knowledge: string[]
  key_skills: string[]
  // Clienteling
  clienteling_experience: boolean | null
  clienteling_description: string | null
  // CV meta (read-only)
  cv_meta: EditorCvMeta
  // Computed (read-only)
  profile_completeness: number
  cv_identity_suggestions: CvIdentitySuggestions
  cv_education_suggestions: CvEducationSuggestions
  // A2.7-B — Per-group readiness booleans, server-computed via computeM6Groups.
  // Surfaces M6 readiness on View tab Readiness card. Authoritative source;
  // do not re-derive client-side.
  m6_groups: {
    G1: boolean
    G2: boolean
    G3: boolean
    G4: boolean
    G5: boolean
    G6: boolean
  }
  section_visibility: SectionVisibility
  masked_fields: MaskedFields
  // Consent (B.3.3) — surfaces the matching opt-in toggle in Settings.
  matching_opt_in: boolean
}

export type EditorProjection = {
  surface: 'editor'
  view: ProfiLuxResolved
  editor: EditorView
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
  // Identity (FULL — last_name is candidate-controlled via section_visibility,
  // no automatic V1 initial doctrine; mask-or-show is candidate-driven)
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  headline: string | null
  bio: string | null
  city: string | null
  country: string | null
  // Contact (subject to masked_fields.phone / .email)
  phone: string | null
  email: string | null
  // Professional (section_visibility.current_role; current_employer also gated
  // by masked_fields.current_employer — history company names stay real)
  job_title: string | null
  current_employer: string | null
  seniority: string | null
  total_years_experience: number | null
  years_in_luxury: number | null
  department: string | null
  speciality: string | null
  maison: string | null
  // Capability arrays
  key_skills: string[]
  certifications: ProfiLuxCertificationItem[]
  product_categories: string[]
  brands_worked_with: string[]
  client_segment_experience: string[]
  market_knowledge: string[]
  expertise_tags: string[]
  // Clienteling (section_visibility.clienteling)
  clienteling_experience: boolean
  clienteling_description: string | null
  // Availability + targets (section_visibility.availability AND NOT masked.availability)
  availability: string | null
  desired_locations: string[]
  desired_departments: string[]
  desired_contract_types: string[]
  // Compensation (section_visibility.compensation; nulled if masked_fields.salary)
  desired_salary_min: number | null
  desired_salary_max: number | null
  desired_salary_currency: string | null
  // L1 passthrough — real, candidate-controlled experiences + education
  sectors: string[]
  languages: ResolvedLanguage[]
  experiences: ResolvedExperience[]
  education: ResolvedEducation[]
  // Library sections (page renders gated on activated_sections + non-empty)
  awards: ProfiLuxAwardItem[]
  memberships: string[]
  strategic_initiatives: ProfiLuxStrategicInitiative[]
  portfolio: ProfiLuxPortfolioItem[]
  press_features: ProfiLuxPressFeatureItem[]
  references: ProfiLuxReferenceItem[]
  internships: ProfiLuxInternshipItem[]
  activated_sections: string[]
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
  certifications: ProfiLuxCertificationItem[]
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
  education: ResolvedEducation[]
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

// =============================================================================
// AdminMemberDetail — Phase F-1 admin-detail adapter
// =============================================================================
//
// Adapter shape consumed by app/admin/members/[id]/page.tsx via the route at
// app/api/admin/members/[id]/route.ts. The route enriches AdminProjection['view']
// (= ProfiLuxResolved) with synthesized arrays (work_experiences,
// education_records, languages with stable IDs and is_current derivation) +
// member_documents from its own table + admin notes + full_name.
//
// This is the ONE place where ProfiLuxResolved is extended for an admin client
// surface. Other admin/recruiting surfaces should consume ProfiLuxResolved or
// projectFor() directly. Do NOT extend AdminMemberDetail for other surfaces —
// create a sibling adapter type instead.
//
// (member as any).company_name + (member as any).org_type casts in the client
// page are intentionally preserved for F-2 (business member type reconciliation).

export type AdminWorkExperience = {
  id: string
  company: string | null
  job_title: string | null
  city: string | null
  country: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  description: string | null
}

export type AdminEducationRecord = {
  id: string
  institution: string | null
  degree: string | null
  degree_level: string | null
  field_of_study: string | null
  start_year: number | null
  graduation_year: number | null
  city: string | null
  country: string | null
}

export type AdminLanguage = {
  id: string
  language: string
  proficiency:
    | 'native'
    | 'fluent'
    | 'professional'
    | 'conversational'
    | 'basic'
    | null
}

export type AdminMemberDocument = {
  id: string
  member_id: string
  document_type: 'cv' | 'cover_letter' | 'portfolio' | 'certificate' | 'reference' | 'other'
  file_name: string
  file_url: string
  file_size: number | null
  mime_type: string | null
  label: string | null
  is_primary: boolean
  uploaded_at: string
}

export type AdminMemberDetail = Omit<ProfiLuxResolved, 'languages'> & {
  full_name: string
  notes: string | null
  // F-2 Option γ — non-ProfiLux member metadata via second targeted SELECT in
  // app/api/admin/members/[id]/route.ts. Mirrors /api/members/me R6-A pattern.
  // Stays OFF ProfiLuxResolved/MemberRow/resolver/projectFor by design.
  company_name: string | null
  org_type: string | null
  work_experiences: AdminWorkExperience[]
  education_records: AdminEducationRecord[]
  languages: AdminLanguage[]
  documents: AdminMemberDocument[]
}
