/**
 * experienceSignature — Career History V2 Slice 1.
 *
 * Pure helper. Computes a deterministic content-hash signature for an
 * experience row (L1 from cv_parsed_data.experiences). Used by:
 *   - resolveProfiLux: hash each L1 row to gate suppression via
 *     cv_parsed_data.resolution_state.experiences[<sig>].
 *   - /api/profilux/suggestions/experiences: server-side recompute over the
 *     matched authoritative L1 row, used as the resolution_state key.
 *
 * SIGNATURE SHAPE (mirrors educationSignature):
 *   sha256(
 *     normalize(company)    || '|' ||
 *     normalize(job_title)  || '|' ||
 *     normalize(start_date)
 *   ) → 64 hex chars
 *
 *   normalize(string | null) = (value ?? '').trim().toLowerCase()
 *
 * start_date is normalized as a STRING (it's `string | null` in L1, never a
 * number — partial-precision dates like "2020-07", "2018" come through as
 * strings). Trim+lowercase gives stable identity even across parser whitespace
 * drift.
 *
 * end_date INTENTIONALLY EXCLUDED from the hash. The CV parser sometimes fills
 * end_date on re-parse for a role the user has already confirmed (e.g. an
 * ongoing role gets an end-of-engagement date later). Including it would
 * re-fire the suggestion for a row the user already promoted to L2.
 *
 * is_current / description / city / country also excluded — too noisy / not
 * identity-discriminating. The three chosen fields are the strongest
 * discriminators for the same underlying role across re-parses.
 *
 * EDGE CASES:
 * - All three fields null/empty → hash of '||'. Two such empty rows collide.
 *   Acceptable: one suggestion shown instead of two; user can confirm once.
 *   The route layer additionally requires company non-empty as a separate
 *   defense (matching the work_experiences write contract).
 * - Whitespace-only string → trimmed to empty → behaves like null.
 *
 * SERVER-ONLY: uses Node `crypto`. Not safe to import client-side.
 */

import { createHash } from 'crypto'

export type ExperienceSignatureInput = {
  company: string | null
  job_title: string | null
  start_date: string | null
}

/**
 * Shared experience-field normalizer. SINGLE source of truth for the
 * trim+lowercase rule applied to (company, job_title, start_date) on both
 * sides of Career History V2 Slice 1: the signature hash here and the
 * tuple-match in /api/profilux/suggestions/experiences. Widened to `unknown`
 * so the route can pass raw JSON-body values without an upstream cast.
 * Non-string inputs (null/undefined/number/object) normalize to '' — same
 * behavior the prior local helpers had.
 */
export function normalizeExperienceField(value: unknown): string {
  return (typeof value === 'string' ? value : '').trim().toLowerCase()
}

export function computeExperienceSignature(row: ExperienceSignatureInput): string {
  const composite =
    normalizeExperienceField(row.company) +
    '|' +
    normalizeExperienceField(row.job_title) +
    '|' +
    normalizeExperienceField(row.start_date)
  return createHash('sha256').update(composite).digest('hex')
}
