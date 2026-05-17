/**
 * projectFor — Matrix v1 §7 single projector.
 *
 * Pure function. No DB. No async.
 * Single switch over Surface, returns surface-specific shape.
 *
 * Masks per Mo's V1–V9 decisions (locked Apr 30):
 *   V1: public last_name → initial only
 *   V2: client share last_name → full
 *   V3: current_employer → hidden public, visible client
 *   V4: brands_worked_with → hidden public, visible client
 *   V5: public experiences → company anonymized to null (UI placeholder)
 *   V6: dashboard → identity strip + L3 status + membership + CV status
 *   V7: public hides nationality, DOB, graduation_year, salary, availability,
 *       software_tools, keywords, clienteling_description
 *   V8: client share hides email, phone, linkedin_url
 *   V9: ATS = full operational, no L1 raw, no admin overlay
 *
 * No per-field toggles in v1 (deterministic only).
 */

import type {
  AdminProjection,
  AtsProjection,
  ClientProjection,
  CvParsedData,
  DashboardProjection,
  EditorProjection,
  MaskableField,
  ProfiLuxResolved,
  ProjectedView,
  PublicExperience,
  PublicProjection,
  SectionId,
  Surface,
  EditorView,
  EditorAvailability,
} from './types'
import { computeM6Groups } from './_m6Groups'

function isMasked(view: ProfiLuxResolved, field: MaskableField): boolean {
  return view.masked_fields?.[field] === true
}

/** "Laurent" → "L."; null/empty → null. */
function toInitial(name: string | null): string | null {
  if (!name || typeof name !== 'string') return null
  const trimmed = name.trim()
  if (trimmed === '') return null
  return `${trimmed[0].toUpperCase()}.`
}

/** Strip company from each experience (V5). */
function anonymizeExperiences(
  exps: ProfiLuxResolved['experiences'],
): PublicExperience[] {
  return exps.map((e) => ({
    company: null,
    job_title: e.job_title,
    city: e.city,
    country: e.country,
    start_date: e.start_date,
    end_date: e.end_date,
    description: e.description,
  }))
}

export function projectFor(
  view: ProfiLuxResolved,
  surface: Surface,
  // For admin, caller may optionally pass the raw L1 jsonb so the projection
  // can carry it without a re-fetch. Other surfaces ignore it.
  cvParsedDataRaw?: CvParsedData | null,
): ProjectedView {
  switch (surface) {
    case 'dashboard': {
      const memberSince = view.created_at ?? null
      const cvNeedsReviewCount = view.cv_meta?.needs_review?.length ?? 0
      const dash: DashboardProjection = {
        surface: 'dashboard',
        first_name: view.first_name,
        last_name: view.last_name,
        avatar_url: view.avatar_url,
        headline: view.headline,
        job_title: view.job_title,
        current_employer: view.current_employer,
        city: view.city,
        country: view.country,
        profile_completeness: view.profile_completeness,
        m6_confirmed_at: view.m6_confirmed_at,
        access_level: view.access_level,
        contribution_points: view.contribution_points,
        member_since: memberSince,
        cv_parsed_at: view.cv_meta?.cv_parsed_at ?? null,
        cv_confidence: view.cv_meta?.confidence ?? null,
        cv_needs_review_count: cvNeedsReviewCount,
      }
      return dash
    }

    case 'editor': {
      const editor: EditorProjection = {
        surface: 'editor',
        view,
        editor: projectEditorView(view),
      }
      return editor
    }

    case 'public': {
      // PF-2 P1 — per-section public visibility. Absent key = shared (default).
      // Explicit false = mute fields rendered on /[slug] for that section.
      const sv = view.section_visibility ?? {}
      const isHidden = (id: SectionId) => sv[id] === false

      // identity (V1: last_name still initial-only after muting; null stays null)
      const idFirstName  = isHidden('identity') ? null : view.first_name
      const idLastName   = isHidden('identity') ? null : toInitial(view.last_name)
      const idAvatar     = isHidden('identity') ? null : view.avatar_url
      const idHeadline   = isHidden('identity') ? null : view.headline
      const idBio        = isHidden('identity') ? null : view.bio
      const idCity       = isHidden('identity') ? null : view.city
      const idCountry    = isHidden('identity') ? null : view.country

      // current_role
      const crJobTitle   = isHidden('current_role') ? null : view.job_title
      const crSeniority  = isHidden('current_role') ? null : view.seniority
      const crTotalYears = isHidden('current_role') ? null : view.total_years_experience
      const crLuxYears   = isHidden('current_role') ? null : view.years_in_luxury

      // career_path
      const cpExperiences = isHidden('career_path') ? [] : view.experiences

      // languages
      const lgLanguages = isHidden('languages') ? [] : view.languages

      // luxury_fit
      const lfSectors            = isHidden('luxury_fit') ? [] : view.sectors
      const lfProductCategories  = isHidden('luxury_fit') ? [] : view.product_categories
      const lfExpertiseTags      = isHidden('luxury_fit') ? [] : view.expertise_tags

      // skills_markets
      const smKeySkills       = isHidden('skills_markets') ? [] : view.key_skills
      const smMarketKnowledge = isHidden('skills_markets') ? [] : view.market_knowledge

      // clienteling
      const clClienteling = isHidden('clienteling') ? false : view.clienteling_experience

      const pub: PublicProjection = {
        surface: 'public',
        first_name: idFirstName,
        last_name: idLastName, // V1
        avatar_url: idAvatar,
        headline: idHeadline,
        bio: idBio,
        city: idCity,
        country: idCountry,
        // V7: nationality, DOB hidden — not included
        job_title: crJobTitle,
        // V3: current_employer hidden — not included
        seniority: crSeniority,
        total_years_experience: crTotalYears,
        years_in_luxury: crLuxYears,
        department: view.department,
        speciality: view.speciality,
        maison: view.maison,
        // V7: software_tools, keywords hidden — not included
        key_skills: smKeySkills,
        certifications: view.certifications,
        product_categories: lfProductCategories,
        // V4: brands_worked_with hidden — not included
        client_segment_experience: view.client_segment_experience,
        market_knowledge: smMarketKnowledge,
        expertise_tags: lfExpertiseTags,
        clienteling_experience: clClienteling,
        // V7: clienteling_description hidden — not included
        sectors: lfSectors,
        languages: lgLanguages,
        experiences: anonymizeExperiences(cpExperiences), // V5
      }
      return pub
    }

    case 'client': {
      const client: ClientProjection = {
        surface: 'client',
        first_name: view.first_name,
        last_name: view.last_name, // V2: full
        avatar_url: view.avatar_url,
        headline: view.headline,
        bio: view.bio,
        city: view.city,
        country: view.country,
        // V8: email, phone, linkedin_url hidden — not included
        // V7: nationality, DOB hidden — not included
        job_title: view.job_title,
        current_employer: isMasked(view, 'current_employer')
          ? null
          : view.current_employer,
        seniority: view.seniority,
        total_years_experience: view.total_years_experience,
        years_in_luxury: view.years_in_luxury,
        department: view.department,
        speciality: view.speciality,
        maison: view.maison,
        key_skills: view.key_skills,
        certifications: view.certifications,
        product_categories: view.product_categories,
        brands_worked_with: view.brands_worked_with, // V4: visible
        client_segment_experience: view.client_segment_experience,
        market_knowledge: view.market_knowledge,
        expertise_tags: view.expertise_tags,
        // V7: software_tools, keywords, clienteling_description hidden
        clienteling_experience: view.clienteling_experience,
        sectors: view.sectors,
        languages: view.languages,
        experiences: view.experiences, // V5: full
      }
      return client
    }

    case 'admin': {
      const admin: AdminProjection = {
        surface: 'admin',
        view,
        cv_parsed_data_raw: cvParsedDataRaw ?? null,
      }
      return admin
    }

    case 'ats': {
      const ats: AtsProjection = {
        surface: 'ats',
        view,
      }
      return ats
    }
  }
}


// =============================================================================
// projectEditorView — Phase 4.A-0
// =============================================================================
//
// §7.6 native flat shape projector. Strict subset of ProfiLuxResolved:
// - System fields (id, email, role, status, ...) dropped
// - cv_meta tightened to { cv_url, cv_parsed_at, needs_review: number }
// - availability normalized to 4-value EditorAvailability union
// - profile_completeness coerced to number (?? 0)

function normalizeEditorAvailability(value: string | null): EditorAvailability {
  if (value == null) return null
  switch (value) {
    case 'actively_looking':
      return 'active'
    case 'not_actively_looking':
    case 'open':
    case 'considering':
    case 'open_to_opportunities':
      return 'open'
    case 'passively_exploring':
    case 'passive':
      return 'passive'
    case 'unavailable':
      return 'unavailable'
    default:
      return null
  }
}

export function projectEditorView(view: ProfiLuxResolved): EditorView {
  return {
    // Identity
    first_name: view.first_name,
    last_name: view.last_name,
    city: view.city,
    country: view.country,
    nationality: view.nationality,
    phone: view.phone,
    // Position
    job_title: view.job_title,
    current_employer: view.current_employer,
    seniority: view.seniority,
    total_years_experience: view.total_years_experience,
    // Luxury fit
    years_in_luxury: view.years_in_luxury,
    sectors: view.sectors,
    product_categories: view.product_categories,
    expertise_tags: view.expertise_tags,
    brands_worked_with: view.brands_worked_with,
    certifications: view.certifications,
    awards: view.awards,
    memberships: view.memberships,
    strategic_initiatives: view.strategic_initiatives,
    activated_sections: view.activated_sections,
    // Experience + education
    experiences: view.experiences,
    education: view.education,
    // Availability + targets
    availability: normalizeEditorAvailability(view.availability),
    desired_locations: view.desired_locations,
    desired_departments: view.desired_departments,
    desired_contract_types: view.desired_contract_types,
    desired_salary_min: view.desired_salary_min,
    desired_salary_max: view.desired_salary_max,
    desired_salary_currency: view.desired_salary_currency,
    open_to_relocation: view.open_to_relocation,
    relocation_preferences: view.relocation_preferences,
    // Narrative
    headline: view.headline,
    bio: view.bio,
    avatar_url: view.avatar_url,
    linkedin_url: view.linkedin_url,
    // Languages, markets, skills
    languages: view.languages,
    market_knowledge: view.market_knowledge,
    key_skills: view.key_skills,
    // Clienteling
    clienteling_experience: view.clienteling_experience,
    clienteling_description: view.clienteling_description,
    // CV meta
    cv_meta: {
      cv_url: view.cv_meta?.cv_url ?? null,
      cv_parsed_at: view.cv_meta?.cv_parsed_at ?? null,
      needs_review: view.cv_meta?.needs_review?.length ?? 0,
    },
    // Computed
    profile_completeness: view.profile_completeness ?? 0,
    cv_identity_suggestions: view.cv_identity_suggestions,
    cv_education_suggestions: view.cv_education_suggestions,
    // A2.7-B — server-authoritative M6 group truth, same predicates as scorer
    m6_groups: computeM6Groups(view),
    section_visibility: view.section_visibility ?? {},
    masked_fields: view.masked_fields ?? {},
    // B.3.3: matching consent. Editor surface only — public/client/ats
    // projections intentionally omit this flag.
    matching_opt_in: view.matching_opt_in ?? false,
  }
}
