/**
 * Types and constants for the Applicant Tracking System (ATS).
 * Covers the full recruitment pipeline from application to placement.
 * Applications reference search_assignments (formerly job_briefs).
 */

export const PIPELINE_STAGES = [
  { key: 'applied', label: 'Applied', color: '#6B7280' },
  { key: 'screening', label: 'Screening', color: '#3B82F6' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#8B5CF6' },
  { key: 'submitted_to_client', label: 'Submitted to Client', color: '#F59E0B' },
  { key: 'client_reviewing', label: 'Client Reviewing', color: '#F97316' },
  { key: 'interview_1', label: 'Interview — 1st Round', color: '#EC4899' },
  { key: 'interview_2', label: 'Interview — 2nd Round', color: '#EC4899' },
  { key: 'interview_final', label: 'Interview — Final', color: '#EC4899' },
  { key: 'offer_made', label: 'Offer Made', color: '#10B981' },
  { key: 'offer_accepted', label: 'Offer Accepted', color: '#059669' },
  { key: 'offer_declined', label: 'Offer Declined', color: '#EF4444' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444' },
  { key: 'on_hold', label: 'On Hold', color: '#9CA3AF' },
  { key: 'withdrawn', label: 'Withdrawn', color: '#9CA3AF' },
] as const

export type PipelineStage = (typeof PIPELINE_STAGES)[number]['key']

/** Stages shown as Kanban columns (active/in-progress stages) */
export const KANBAN_STAGES = PIPELINE_STAGES.filter((s) =>
  [
    'applied', 'screening', 'shortlisted', 'submitted_to_client',
    'client_reviewing', 'interview_1', 'interview_2', 'interview_final', 'offer_made',
  ].includes(s.key)
)

/** Terminal stages — shown via filters, not as Kanban columns */
export const TERMINAL_STAGES = PIPELINE_STAGES.filter((s) =>
  ['offer_accepted', 'offer_declined', 'rejected', 'on_hold', 'withdrawn'].includes(s.key)
)

export const APPLICATION_SOURCES = [
  { value: 'self_applied', label: 'Self Applied' },
  { value: 'sourced_by_recruiter', label: 'Sourced by Recruiter' },
  { value: 'referral', label: 'Referral' },
  { value: 'imported', label: 'Imported' },
] as const

export const REJECTION_REASONS = [
  'Overqualified',
  'Underqualified',
  'Location mismatch',
  'Salary mismatch',
  'Culture fit',
  'Client rejected',
  'Position filled',
  'Insufficient luxury experience',
  'Language requirements not met',
  'Other',
] as const

export const SUBMISSION_METHODS = [
  'Email',
  'Client portal',
  'In-person meeting',
  'Phone/Video call',
  'Other',
] as const

export const NOTE_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'submission', label: 'Submission' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejection', label: 'Rejection' },
  { value: 'client_feedback', label: 'Client Feedback' },
] as const

export interface Application {
  id: string
  member_id: string
  search_assignment_id: string
  current_stage: PipelineStage
  source: string
  rating: number | null

  // Offer
  offer_salary: number | null
  offer_currency: string | null
  offer_start_date: string | null
  offer_contract_type: string | null
  offer_benefits: string | null
  offer_notes: string | null

  // Rejection
  rejection_reason: string | null
  rejection_notes: string | null

  // Submission to client
  submitted_to_client_at: string | null
  submission_method: string | null
  submission_cv_version: string | null
  client_response: string | null
  client_response_at: string | null

  assigned_recruiter: string | null
  applied_at: string
  created_at: string
  updated_at: string

  // Joined data (loaded with queries)
  member?: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
    job_title: string | null
    maison: string | null
    city: string | null
    country: string | null
    headline: string | null
    seniority: string | null
    years_in_luxury: number | null
  }
  search_assignment?: {
    id: string
    title: string
    maison: string | null
    is_confidential: boolean
    city: string | null
    country: string | null
    reference_number: string | null
    status: string
  }
  stage_history?: StageHistoryEntry[]
  notes?: ApplicationNote[]
}

export interface StageHistoryEntry {
  id: string
  application_id: string
  from_stage: string | null
  to_stage: string
  moved_by: string | null
  notes: string | null
  created_at: string
}

export interface ApplicationNote {
  id: string
  application_id: string
  author: string
  content: string
  note_type: string
  created_at: string
}

/** Helper: get stage label by key */
export function getStageLabel(key: string): string {
  return PIPELINE_STAGES.find((s) => s.key === key)?.label || key
}

/** Helper: get stage color by key */
export function getStageColor(key: string): string {
  return PIPELINE_STAGES.find((s) => s.key === key)?.color || '#6B7280'
}

/** Helper: check if a stage key is valid */
export function isValidStage(key: string): boolean {
  return PIPELINE_STAGES.some((s) => s.key === key)
}
