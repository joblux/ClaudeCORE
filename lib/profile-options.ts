/**
 * Profile-specific dropdown options.
 * Imports shared options from job-brief-options.ts where they overlap.
 */

// Re-export shared options for convenience
export {
  DEPARTMENTS,
  SENIORITY_LEVELS,
  CONTRACT_TYPES,
  PRODUCT_CATEGORIES,
  CLIENT_SEGMENTS,
  LANGUAGES,
  SALARY_CURRENCIES,
  COUNTRIES,
  COMMON_CITIES,
} from './job-brief-options'

export const AVAILABILITY_OPTIONS = [
  { value: 'immediately', label: 'Immediately' },
  { value: '1_month', label: '1 month notice' },
  { value: '2_months', label: '2 months notice' },
  { value: '3_months', label: '3 months notice' },
  { value: '6_months', label: '6 months notice' },
  { value: 'not_actively_looking', label: 'Not actively looking' },
] as const

export const DEGREE_LEVELS = [
  'High school',
  "Bachelor's",
  "Master's",
  'MBA',
  'PhD',
  'Professional diploma',
  'Other',
] as const

export const LANGUAGE_PROFICIENCIES = [
  { value: 'native', label: 'Native' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'basic', label: 'Basic' },
] as const

export const REASONS_FOR_LEAVING = [
  'Career growth',
  'Relocation',
  'Restructuring',
  'End of contract',
  'Personal reasons',
  'Other',
  'Prefer not to say',
] as const

export const MARKET_REGIONS = [
  'Europe',
  'Middle East',
  'Greater China',
  'Japan',
  'South-East Asia',
  'Americas',
  'Africa',
] as const

export const DOCUMENT_TYPES = [
  { value: 'cv', label: 'CV / Resume' },
  { value: 'cover_letter', label: 'Cover Letter' },
  { value: 'portfolio', label: 'Portfolio / Lookbook' },
  { value: 'certificate', label: 'Certificate / Diploma' },
  { value: 'reference', label: 'Reference' },
  { value: 'other', label: 'Other' },
] as const
