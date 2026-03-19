/**
 * JobBrief — The main type for job briefs stored in Supabase.
 * Maps 1:1 to the job_briefs table columns.
 */
export interface JobBrief {
  id: string
  reference_number: string | null
  title: string
  slug: string
  maison: string | null
  is_confidential: boolean
  status: 'draft' | 'published' | 'on_hold' | 'closed' | 'filled'
  source: string

  // Location
  location: string | null
  city: string | null
  country: string | null
  region: string | null
  address: string | null
  remote_policy: string | null
  relocation_offered: boolean
  visa_sponsorship: boolean

  // Role details
  department: string | null
  seniority: string | null
  contract_type: string | null
  reports_to: string | null
  team_size: number | null
  start_date: string | null

  // Compensation
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  salary_period: string | null
  salary_display: string | null
  bonus_commission: string | null
  benefits: string[] | null

  // Description
  description: string | null
  responsibilities: string | null
  requirements: string | null
  qualifications: string | null
  nice_to_haves: string | null
  about_maison: string | null

  // Luxury-specific
  product_category: string[] | null
  client_segment: string | null
  languages_required: string[] | null
  clienteling_experience: boolean
  travel_percentage: string | null
  luxury_sector_experience: string | null

  // SEO
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string | null
  structured_data: any | null

  // Internal / admin-only fields
  client_contact_name: string | null
  client_contact_email: string | null
  client_contact_phone: string | null
  fee_agreement: string | null
  fee_amount: string | null
  priority: string
  internal_notes: string | null
  assigned_recruiter: string | null
  posted_by: string | null

  // Dates
  published_at: string | null
  closing_date: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}
