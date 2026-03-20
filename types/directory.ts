export interface DirectoryMemberCard {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  headline: string | null
  job_title: string | null
  maison: string | null
  current_employer: string | null
  department: string | null
  seniority: string | null
  city: string | null
  country: string | null
  years_in_luxury: number | null
  key_skills: string[]
  product_categories: string[]
  profile_completeness: number | null
  created_at: string
}

export interface DirectoryMemberProfile extends DirectoryMemberCard {
  full_name: string | null
  role: string | null
  bio: string | null
  nationality: string | null
  total_years_experience: number | null
  brands_worked_with: string[]
  client_segment_experience: string[]
  market_knowledge: string[]
  areas_of_expertise: string | null
  speciality: string | null
  linkedin_url: string | null // only for admin/business viewers
  work_experiences: DirectoryWorkExperience[]
  education_records: DirectoryEducation[]
  languages: DirectoryLanguage[]
  contribution_count: number
}

export interface DirectoryWorkExperience {
  id: string
  company: string | null
  job_title: string | null
  city: string | null
  country: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
}

export interface DirectoryEducation {
  id: string
  institution: string | null
  degree_level: string | null
  field_of_study: string | null
  graduation_year: number | null
}

export interface DirectoryLanguage {
  id: string
  language: string
  proficiency: string
}

export interface DirectoryListResponse {
  members: DirectoryMemberCard[]
  total: number
  page: number
  limit: number
  filters: {
    countries: string[]
    departments: string[]
    seniority_levels: string[]
    top_maisons: string[]
  }
}

export const DIRECTORY_ACCESS_ROLES = ['business', 'insider', 'executive', 'admin'] as const

export const TIER_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  rising: { bg: '#e8e2d8', text: '#888' },
  pro: { bg: '#1a1a1a', text: '#fff' },
  professional: { bg: '#1a1a1a', text: '#a58e28' },
  executive: { bg: '#a58e28', text: '#1a1a1a' },
  business: { bg: '#a58e28', text: '#1a1a1a' },
  insider: { bg: '#a58e28', text: '#1a1a1a' },
  admin: { bg: '#a58e28', text: '#fff' },
}

export const TIER_LABELS: Record<string, string> = {
  rising: 'Rising',
  pro: 'Pro',
  professional: 'Pro+',
  executive: 'Executive',
  business: 'Business',
  insider: 'Insider',
  admin: 'Admin',
}
