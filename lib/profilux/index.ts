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
export { computeEducationSignature } from './educationSignature'
export type { EducationSignatureInput } from './educationSignature'

export type {
  // L1
  CvParsedConfidence,
  CvParsedData,
  CvEducationSuggestion,
  CvEducationSuggestions,
  CvParsedEducation,
  CvParsedExperience,
  CvParsedIdentity,
  CvParsedLanguage,
  CvParsedNeedsReviewItem,
  // L2
  MemberRow,
  // Resolved
  ProfiLuxPortfolioItem,
  ProfiLuxResolved,
  ProfiLuxStrategicInitiative,
  ResolvedCvMeta,
  ResolvedEducation,
  ResolvedExperience,
  ResolvedLanguage,
  // Surface + projections
  AdminEducationRecord,
  AdminLanguage,
  AdminMemberDetail,
  AdminMemberDocument,
  AdminProjection,
  AdminWorkExperience,
  AtsProjection,
  ClientProjection,
  DashboardProjection,
  EditorProjection,
  ProjectedView,
  PublicExperience,
  PublicProjection,
  Surface,
} from './types'
