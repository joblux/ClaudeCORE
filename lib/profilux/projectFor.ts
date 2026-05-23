/**
 * projectFor — Matrix v1 §7 single projector.
 *
 * Pure function. No DB. No async.
 * Single switch over Surface, returns surface-specific shape.
 *
 * Public surface (Slice 1.2): controlled CV share — candidate-driven via
 * section_visibility + masked_fields + activated_sections. No automatic
 * V1 (last_name initial) or V5 (anonymized experiences) masking; full
 * dossier minus what the candidate has hidden.
 *
 * Other surfaces retain Mo's V2/V4/V6/V8/V9 decisions (locked Apr 30):
 *   V2: client share last_name → full
 *   V4: brands_worked_with → visible client
 *   V6: dashboard → identity strip + L3 status + membership + CV status
 *   V8: client share hides email, phone, linkedin_url
 *   V9: ATS = full operational, no L1 raw, no admin overlay
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
      // Slice 1.2 — Controlled CV share. View − Edit/Manage/PDF − candidate-masked.
      // Three levers, all candidate-controlled:
      //   section_visibility[id] !== false  → core section shown
      //   masked_fields[field] === true     → that field nulled
      //   activated_sections (page-side)    → library section render-gated
      const sv = view.section_visibility ?? {}
      const mf = view.masked_fields ?? {}
      const shown  = (id: SectionId)    => sv[id] !== false
      const masked = (f: MaskableField) => mf[f] === true

      const showIdentity      = shown('identity')
      const showCurrentRole   = shown('current_role')
      const showCareerPath    = shown('career_path')
      const showEducation     = shown('education')
      const showLanguages     = shown('languages')
      const showLuxuryFit     = shown('luxury_fit')
      const showSkillsMarkets = shown('skills_markets')
      const showClienteling   = shown('clienteling')
      const showAvailability  = shown('availability') && !masked('availability')
      const showCompensation  = shown('compensation')

      const pub: PublicProjection = {
        surface: 'public',
        // Identity — FULL last_name when shown (no automatic V1 initial).
        first_name: showIdentity ? view.first_name : null,
        last_name:  showIdentity ? view.last_name  : null,
        avatar_url: showIdentity ? view.avatar_url : null,
        headline:   showIdentity ? view.headline   : null,
        bio:        showIdentity ? view.bio        : null,
        city:       showIdentity ? view.city       : null,
        country:    showIdentity ? view.country    : null,
        // Contact — mask-only, no section gate. 'contact' is the canonical
        // single lever (email + phone). Legacy 'phone' still respected so any
        // pre-Slice-1.3 phone-only mask keeps phone hidden until cleared.
        // DB semantics unchanged: true = hidden everywhere.
        email: masked('contact') ? null : view.email,
        phone: (masked('contact') || masked('phone')) ? null : view.phone,
        // Current role + employer. masked('current_employer') hides ONLY the
        // current employer; experiences[].company below stays real history.
        job_title:              showCurrentRole ? view.job_title : null,
        current_employer:       showCurrentRole && !masked('current_employer') ? view.current_employer : null,
        seniority:              showCurrentRole ? view.seniority : null,
        total_years_experience: showCurrentRole ? view.total_years_experience : null,
        years_in_luxury:        showCurrentRole ? view.years_in_luxury : null,
        department:  view.department,
        speciality:  view.speciality,
        maison:      view.maison,
        // Capability arrays.
        key_skills:                showSkillsMarkets ? view.key_skills : [],
        certifications:            view.certifications,
        product_categories:        showLuxuryFit ? view.product_categories : [],
        brands_worked_with:        view.brands_worked_with,
        client_segment_experience: view.client_segment_experience,
        market_knowledge:          showSkillsMarkets ? view.market_knowledge : [],
        expertise_tags:            showLuxuryFit ? view.expertise_tags : [],
        // Clienteling.
        clienteling_experience:  showClienteling ? view.clienteling_experience : false,
        clienteling_description: showClienteling ? view.clienteling_description : null,
        // Availability + targets — gated by section_visibility AND mask.
        availability:           showAvailability ? view.availability : null,
        desired_locations:      showAvailability ? view.desired_locations : [],
        desired_departments:    showAvailability ? view.desired_departments : [],
        desired_contract_types: showAvailability ? view.desired_contract_types : [],
        // Compensation — section gate + salary mask.
        desired_salary_min:      showCompensation && !masked('salary') ? view.desired_salary_min : null,
        desired_salary_max:      showCompensation && !masked('salary') ? view.desired_salary_max : null,
        desired_salary_currency: showCompensation && !masked('salary') ? view.desired_salary_currency : null,
        // L1 passthrough — real experiences + education, candidate-controlled.
        sectors:     showLuxuryFit ? view.sectors : [],
        languages:   showLanguages ? view.languages : [],
        experiences: showCareerPath ? view.experiences : [],
        education:   showEducation ? view.education : [],
        // Library sections — page renders gated on activated_sections + non-empty.
        awards:                view.awards,
        memberships:           view.memberships,
        strategic_initiatives: view.strategic_initiatives,
        portfolio:             view.portfolio,
        press_features:        view.press_features,
        references:            masked('references') ? [] : view.references,
        internships:           view.internships,
        activated_sections:    view.activated_sections,
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
        education: view.education,
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
// - availability normalized to canonical EditorAvailability union
// - profile_completeness coerced to number (?? 0)

function normalizeEditorAvailability(value: string | null): EditorAvailability {
  if (value == null) return null
  switch (value) {
    case 'not_specified':
    case 'not_actively_looking':
      return 'not_specified'
    case 'actively_looking':
      return 'actively_looking'
    case 'quietly_considering':
      return 'quietly_considering'
    case 'passively_exploring':
      return 'passively_exploring'
    case 'not_available':
    case 'unavailable':
      return 'not_available'
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
    portfolio: view.portfolio,
    press_features: view.press_features,
    references: view.references,
    internships: view.internships,
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
