/**
 * Types for member profiles, work experience, education, languages, and documents.
 * Maps to the members table + related tables in Supabase.
 */

export interface WorkExperience {
  id: string
  member_id: string
  job_title: string
  company: string
  city: string | null
  country: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
  department: string | null
  description: string | null
  reason_for_leaving: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface EducationRecord {
  id: string
  member_id: string
  institution: string
  degree_level: string
  field_of_study: string
  city: string | null
  country: string | null
  start_year: number | null
  graduation_year: number | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface MemberLanguage {
  id: string
  member_id: string
  language: string
  proficiency: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic'
  created_at: string
}

export interface MemberDocument {
  id: string
  member_id: string
  document_type: 'cv' | 'cover_letter' | 'portfolio' | 'certificate' | 'reference' | 'other'
  file_name: string
  file_url: string
  file_size: number | null
  mime_type: string | null
  label: string | null
  is_primary: boolean
  uploaded_at: string
}

export interface MemberProfile {
  // Core identity
  id: string
  email: string
  full_name: string
  first_name: string | null
  last_name: string | null
  headline: string | null
  bio: string | null
  phone: string | null
  city: string | null
  country: string | null
  nationality: string | null
  linkedin_url: string | null
  avatar_url: string | null
  date_of_birth: string | null
  role: string
  status: string

  // Professional summary
  job_title: string | null
  current_employer: string | null
  maison: string | null
  total_years_experience: number | null
  years_in_luxury: number | null
  seniority: string | null
  department: string | null

  // Skills & certifications
  key_skills: string[] | null
  software_tools: string[] | null
  certifications: string[] | null

  // Luxury-specific
  product_categories: string[] | null
  brands_worked_with: string[] | null
  client_segment_experience: string[] | null
  market_knowledge: string[] | null
  clienteling_experience: boolean
  clienteling_description: string | null

  // Availability & preferences
  availability: string | null
  desired_salary_min: number | null
  desired_salary_max: number | null
  desired_salary_currency: string | null
  open_to_relocation: boolean
  relocation_preferences: string | null
  desired_locations: string[] | null
  desired_contract_types: string[] | null
  desired_departments: string[] | null

  // Metadata
  notes: string | null
  created_at: string
  updated_at: string

  // Completeness
  profile_completeness: number

  // Related records (loaded separately)
  work_experiences?: WorkExperience[]
  education_records?: EducationRecord[]
  languages?: MemberLanguage[]
  documents?: MemberDocument[]
}
