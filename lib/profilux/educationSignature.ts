/**
 * educationSignature — C1 slice S-B.1B.1.
 *
 * Pure helper. Computes a deterministic content-hash signature for an
 * education row (L1 from cv_parsed_data.education OR L2 from
 * education_records). Used by:
 *   - resolveProfiLux: build cv_education_suggestions, key into
 *     cv_parsed_data.resolution_state.education for suppression
 *   - /api/profilux/suggestions/education (S-B.1B.3+): match a
 *     client-supplied signature to an L1 row at apply/dismiss time
 *
 * SIGNATURE SHAPE (locked by S-B foundation card §1):
 *   sha256(
 *     normalize(institution)    || '|' ||
 *     normalize(field_of_study) || '|' ||
 *     normalize(graduation_year)
 *   ) → 64 hex chars
 *
 *   normalize(string | null) = (value ?? '').trim().toLowerCase()
 *   normalize(number | null) = value == null ? '' : String(value)
 *
 * DEGREE_LEVEL INTENTIONALLY EXCLUDED from the hash:
 * Haiku rewrites degree_level casing/phrasing between parses (e.g. "Bachelor
 * of Science" vs "Bachelor's"). Including it would cause false re-fires of
 * suggestions the user has already resolved.
 *
 * city / country / start_year also excluded — too sparse / too noisy to use
 * as identity anchors. The 3 chosen fields are the strongest discriminators
 * for the same underlying education record across re-parses.
 *
 * EDGE CASES:
 * - All three fields null/empty → hash of '||'. Two such empty rows collide.
 *   Acceptable: one suggestion shown instead of two; user can apply once.
 * - Whitespace-only string → trimmed to empty → behaves like null.
 * - graduation_year: 0 → string '0' → distinct from null. Pathological but
 *   consistent with the normalize() spec.
 *
 * SERVER-ONLY: uses Node `crypto`. Not safe to import client-side.
 */

import { createHash } from 'crypto'

export type EducationSignatureInput = {
  institution: string | null
  field_of_study: string | null
  graduation_year: number | null
}

function normalizeString(value: string | null): string {
  return (value ?? '').trim().toLowerCase()
}

function normalizeYear(value: number | null): string {
  return value == null ? '' : String(value)
}

export function computeEducationSignature(row: EducationSignatureInput): string {
  const composite =
    normalizeString(row.institution) +
    '|' +
    normalizeString(row.field_of_study) +
    '|' +
    normalizeYear(row.graduation_year)
  return createHash('sha256').update(composite).digest('hex')
}
