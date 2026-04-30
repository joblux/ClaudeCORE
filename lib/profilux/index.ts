/**
 * Barrel export — Matrix v1 utilities.
 *
 * Consumer call sites:
 *   import { resolveProfiLux, projectFor, computeM6Eligible,
 *            computeProfileCompleteness } from '@/lib/profilux'
 *
 * The _m6Groups module is private (underscore prefix) and is NOT exported
 * here. Surfaces and routes consume only the four utilities + types.
 */

export { resolveProfiLux } from './resolveProfiLux'
export { computeM6Eligible } from './computeM6Eligible'
export { computeProfileCompleteness } from './computeProfileCompleteness'
export { projectFor } from './projectFor'

export type {
  // L1
  CvParsedConfidence,
  CvParsedData,
  CvParsedEducation,
  CvParsedExperience,
  CvParsedIdentity,
  CvParsedLanguage,
  CvParsedNeedsReviewItem,
  // L2
  MemberRow,
  // Resolved
  ProfiLuxResolved,
  ResolvedCvMeta,
  ResolvedEducation,
  ResolvedExperience,
  ResolvedLanguage,
  // Surface + projections
  AdminProjection,
  AtsProjection,
  ClientProjection,
  DashboardProjection,
  EditorProjection,
  ProjectedView,
  PublicExperience,
  PublicProjection,
  Surface,
} from './types'
