/**
 * Types for the internal messaging system.
 * Conversations link JOBLUX recruiters with candidates or client contacts.
 */

export interface Conversation {
  id: string
  search_assignment_id: string | null
  application_id: string | null
  participant_type: 'candidate' | 'client'
  member_id: string | null
  client_name: string | null
  client_email: string | null
  client_company: string | null
  subject: string | null
  status: 'active' | 'archived' | 'closed'
  last_message_at: string | null
  last_message_preview: string | null
  unread_count: number
  assigned_recruiter: string | null
  created_at: string
  updated_at: string

  // Joined data
  member?: { id: string; full_name: string; email: string; avatar_url: string | null; job_title: string | null }
  search_assignment?: { id: string; title: string; maison: string | null; reference_number: string | null }
  messages?: Message[]
  message_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_type: 'recruiter' | 'candidate' | 'client' | 'system'
  sender_name: string
  sender_email: string | null
  body: string
  body_html: string | null
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed'
  read_at: string | null
  scheduled_for: string | null
  sent_at: string
  email_message_id: string | null
  email_sent: boolean
  created_at: string
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  id: string
  message_id: string
  file_name: string
  file_url: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

export interface MessageTemplate {
  id: string
  name: string
  category: string
  subject: string
  body: string
  body_html: string | null
  participant_type: 'candidate' | 'client'
  is_default: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export const TEMPLATE_CATEGORIES = {
  candidate: [
    { key: 'candidate_first_contact', label: 'First Contact' },
    { key: 'candidate_opportunity', label: 'New Opportunity' },
    { key: 'candidate_cv_request', label: 'CV Request' },
    { key: 'candidate_interview_prep', label: 'Interview Preparation' },
    { key: 'candidate_interview_feedback', label: 'Interview Feedback' },
    { key: 'candidate_rejection', label: 'Rejection' },
    { key: 'candidate_offer', label: 'Offer' },
    { key: 'candidate_general', label: 'General' },
  ],
  client: [
    { key: 'client_cv_submission', label: 'CV Submission' },
    { key: 'client_followup', label: 'Follow Up' },
    { key: 'client_interview_request', label: 'Interview Request' },
    { key: 'client_feedback_request', label: 'Feedback Request' },
    { key: 'client_offer_negotiation', label: 'Offer Negotiation' },
    { key: 'client_general', label: 'General' },
  ],
} as const

export const MERGE_FIELDS = [
  '{{candidate_name}}',
  '{{candidate_first_name}}',
  '{{opportunity_title}}',
  '{{maison}}',
  '{{city}}',
  '{{recruiter_name}}',
  '{{client_name}}',
  '{{interview_date}}',
  '{{salary_range}}',
] as const
