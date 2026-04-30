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
  ProfiLuxResolved,
  ProjectedView,
  PublicExperience,
  PublicProjection,
  Surface,
} from './types'

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
      }
      return editor
    }

    case 'public': {
      const pub: PublicProjection = {
        surface: 'public',
        first_name: view.first_name,
        last_name: toInitial(view.last_name), // V1
        avatar_url: view.avatar_url,
        headline: view.headline,
        bio: view.bio,
        city: view.city,
        country: view.country,
        // V7: nationality, DOB hidden — not included
        job_title: view.job_title,
        // V3: current_employer hidden — not included
        seniority: view.seniority,
        total_years_experience: view.total_years_experience,
        years_in_luxury: view.years_in_luxury,
        department: view.department,
        speciality: view.speciality,
        maison: view.maison,
        // V7: software_tools, keywords hidden — not included
        key_skills: view.key_skills,
        certifications: view.certifications,
        product_categories: view.product_categories,
        // V4: brands_worked_with hidden — not included
        client_segment_experience: view.client_segment_experience,
        market_knowledge: view.market_knowledge,
        expertise_tags: view.expertise_tags,
        clienteling_experience: view.clienteling_experience,
        // V7: clienteling_description hidden — not included
        sectors: view.sectors,
        languages: view.languages,
        experiences: anonymizeExperiences(view.experiences), // V5
        // V7: graduation_year hidden — not included
        university: view.university,
        field_of_study: view.field_of_study,
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
        current_employer: view.current_employer, // V3: visible
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
        university: view.university,
        field_of_study: view.field_of_study,
        // V7: graduation_year hidden
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
