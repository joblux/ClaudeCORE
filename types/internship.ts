export interface InternshipListing {
  id: string
  submitted_by: string
  status: 'pending_review' | 'approved' | 'rejected' | 'expired' | 'closed'
  company_name: string
  company_website: string | null
  title: string
  slug: string | null
  department: string | null
  description: string
  responsibilities: string | null
  requirements: string | null
  nice_to_haves: string | null
  city: string
  country: string
  remote_policy: 'on_site' | 'hybrid' | 'remote'
  duration: string
  start_date: string | null
  is_paid: boolean
  compensation_details: string | null
  luxury_sector: string | null
  product_categories: string[]
  languages_required: string[]
  seo_title: string | null
  seo_description: string | null
  structured_data: any
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  admin_notes: string | null
  approved_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  submitter?: { full_name: string; email: string; maison?: string }
}

export const INTERNSHIP_STATUSES = [
  { value: 'pending_review', label: 'Pending Review', color: '#a58e28' },
  { value: 'approved', label: 'Approved', color: '#2a7a3c' },
  { value: 'rejected', label: 'Rejected', color: '#cc4444' },
  { value: 'expired', label: 'Expired', color: '#888' },
  { value: 'closed', label: 'Closed', color: '#555' },
]

export const INTERNSHIP_DURATIONS = [
  '1 month', '2 months', '3 months', '4 months', '5 months', '6 months',
  '7 months', '8 months', '9 months', '10 months', '11 months', '12 months', 'Flexible',
]

export const REMOTE_POLICIES = [
  { value: 'on_site', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
]
