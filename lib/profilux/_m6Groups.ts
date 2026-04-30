/**
 * Shared M6 group predicates — single source of truth for Matrix v1 §8.2.
 *
 * Consumed by:
 *   - computeM6Eligible    (AND of the six)
 *   - computeProfileCompleteness  (weighted sum of the six)
 *
 * Underscore prefix = private helper; not part of barrel export.
 *
 * Rule A non-empty predicate (locked Apr 30):
 *   - string: !== null && !== ''
 *   - array:  !== null && length > 0
 *   - default literals (e.g. availability='not_actively_looking') are
 *     treated as non-empty per Mo's locked decision. No semantic
 *     reinterpretation in v1.
 */

import type { ProfiLuxResolved } from './types'

export type M6Groups = {
  G1: boolean // Identity
  G2: boolean // Position
  G3: boolean // Luxury relevance
  G4: boolean // Experience
  G5: boolean // Availability
  G6: boolean // CV
}

/** Non-empty string per Rule A. */
function nonEmptyString(s: string | null | undefined): boolean {
  return typeof s === 'string' && s.trim() !== ''
}

/** Non-empty array per Rule A. */
function nonEmptyArray<T>(arr: T[] | null | undefined): boolean {
  return Array.isArray(arr) && arr.length > 0
}

export function computeM6Groups(view: ProfiLuxResolved): M6Groups {
  // G1 — Identity: first_name, last_name, city, country
  const G1 =
    nonEmptyString(view.first_name) &&
    nonEmptyString(view.last_name) &&
    nonEmptyString(view.city) &&
    nonEmptyString(view.country)

  // G2 — Position: job_title, current_employer, seniority, total_years_experience
  const G2 =
    nonEmptyString(view.job_title) &&
    nonEmptyString(view.current_employer) &&
    nonEmptyString(view.seniority) &&
    typeof view.total_years_experience === 'number'

  // G3 — Luxury relevance: years_in_luxury + ≥1 sector + ≥1 of (product_categories ∪ expertise_tags)
  const G3 =
    typeof view.years_in_luxury === 'number' &&
    nonEmptyArray(view.sectors) &&
    (nonEmptyArray(view.product_categories) ||
      nonEmptyArray(view.expertise_tags))

  // G4 — Experience: ≥1 cv_parsed_data.experiences entry with both company AND job_title
  const G4 =
    Array.isArray(view.experiences) &&
    view.experiences.some(
      (e) => nonEmptyString(e.company) && nonEmptyString(e.job_title),
    )

  // G5 — Availability: availability non-empty + ≥1 of desired_locations / desired_departments / desired_contract_types
  const G5 =
    nonEmptyString(view.availability) &&
    (nonEmptyArray(view.desired_locations) ||
      nonEmptyArray(view.desired_departments) ||
      nonEmptyArray(view.desired_contract_types))

  // G6 — CV: cv_url non-empty (sourced from cv_meta — single source of truth)
  const G6 = nonEmptyString(view.cv_meta?.cv_url ?? null)

  return { G1, G2, G3, G4, G5, G6 }
}
