export interface InterviewExperience {
  id: string
  contribution_id: string
  job_title: string
  department: string | null
  seniority: string | null
  location: string | null
  interview_year: number | null
  process_duration: string | null
  number_of_rounds: number | null
  interview_format: string | null
  process_description: string
  questions_asked: string | null
  tips: string | null
  outcome: string | null
  difficulty: string | null
  overall_experience: string | null
  created_at: string
}

export interface InterviewExperienceListItem {
  id: string
  brand_name: string
  brand_slug: string
  job_title: string
  department: string | null
  seniority: string | null
  location: string | null
  interview_year: number | null
  number_of_rounds: number | null
  interview_format: string | null
  difficulty: string | null
  overall_experience: string | null
  outcome: string | null
  is_anonymous: boolean
  created_at: string
}

export interface InterviewStats {
  total_experiences: number
  unique_brands: number
  difficulty_distribution: Record<string, number>
  common_formats: Record<string, number>
}

export interface BrandInterviewSummary {
  brand_name: string
  brand_slug: string
  brand_sector: string | null
  total_experiences: number
  difficulty_breakdown: Record<string, number>
  avg_rounds: number | null
  common_format: string | null
  common_departments: string[]
  year_range: { min: number; max: number } | null
}

export interface InterviewListResponse {
  experiences: InterviewExperienceListItem[]
  stats: InterviewStats
  brands: { name: string; slug: string }[]
  total: number
  page: number
  limit: number
}

export interface BrandInterviewResponse {
  brand: { name: string; slug: string; sector: string | null }
  summary: BrandInterviewSummary
  experiences: InterviewExperienceListItem[]
  total: number
  page: number
  limit: number
}

export interface InterviewDetailResponse {
  experience: InterviewExperienceListItem & {
    process_description?: string
    questions_asked?: string
    tips?: string
  }
  access_level: string
}

export const DIFFICULTY_OPTIONS = [
  'Easy',
  'Moderate',
  'Challenging',
  'Difficult',
  'Very Difficult',
] as const

export const DIFFICULTY_SCALE: Record<string, number> = {
  'Easy': 1,
  'Moderate': 2,
  'Challenging': 3,
  'Difficult': 4,
  'Very Difficult': 5,
}

export const EXPERIENCE_SENTIMENT: Record<string, { label: string; color: string }> = {
  'Positive': { label: 'Positive', color: '#5a7a5a' },
  'Neutral': { label: 'Neutral', color: '#a58e28' },
  'Negative': { label: 'Negative', color: '#8b5e5e' },
}

export const OUTCOME_LABELS: Record<string, string> = {
  'Offered': 'Offered',
  'Rejected': 'Rejected',
  'Withdrew': 'Withdrew',
  'Pending': 'Pending',
  'Ghost': 'No Response',
}

export const ACCESS_LEVELS: Record<string, number> = {
  'basic': 0,
  'standard': 1,
  'premium': 2,
  'full': 3,
}
