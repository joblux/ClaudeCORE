export interface SalaryRangeData {
  id: string
  brand_name: string
  brand_slug: string | null
  job_title: string
  department: string | null
  seniority: string | null
  city: string
  country: string
  currency: string
  salary_min: number
  salary_max: number
  salary_median: number | null
  bonus_min: number | null
  bonus_max: number | null
  total_comp_min: number | null
  total_comp_max: number | null
  data_points: number
  confidence: string
  sources: { benchmark: number; contribution: number }
}

export interface SalaryListResponse {
  entries: SalaryRangeData[]
  total: number
  page: number
  limit: number
  stats: {
    total_data_points: number
    unique_brands: number
    unique_cities: number
    unique_roles: number
  }
  filters: {
    brands: string[]
    departments: string[]
    seniority_levels: string[]
    cities: string[]
    countries: string[]
    currencies: string[]
  }
}

export interface BenchmarkResult {
  role: string
  city: string
  salary_min: number
  salary_max: number
  salary_median: number
  percentile_25: number
  percentile_75: number
  currency: string
  data_points: number
  confidence: string
  user_percentile: number | null
  other_cities: { city: string; median: number; currency: string }[]
}

export interface CompareItem {
  label: string
  salary_min: number
  salary_max: number
  salary_median: number
  bonus_min: number | null
  bonus_max: number | null
  total_comp_min: number | null
  total_comp_max: number | null
  data_points: number
  currency: string
  cost_index: number | null
}

export interface CompareResult {
  compare_type: 'city' | 'brand'
  role: string
  items: CompareItem[]
}

export interface CalculatorInput {
  job_title: string
  department: string
  seniority: string
  city: string
  country: string
  brand?: string
  years_experience: number
  skills: string[]
}

export interface CalculatorResult {
  estimated_low: number
  estimated_mid: number
  estimated_high: number
  bonus_low: number
  bonus_high: number
  total_comp_low: number
  total_comp_high: number
  currency: string
  confidence: string
  data_points: number
  factors: string[]
  recommendations: string[]
}

export interface SalaryBenchmark {
  id: string
  brand_name: string
  brand_slug: string | null
  job_title: string
  department: string | null
  seniority: string | null
  city: string
  country: string
  currency: string
  salary_min: number
  salary_max: number
  salary_median: number | null
  bonus_min: number | null
  bonus_max: number | null
  total_comp_min: number | null
  total_comp_max: number | null
  source: string
  confidence: string
  year_of_data: number | null
  notes: string | null
  created_at: string
}

export const SALARY_ACCESS = {
  browse: { level: 'basic', points: 0, label: 'Browse' },
  benchmark: { level: 'standard', points: 10, label: 'Benchmark' },
  compare: { level: 'premium', points: 25, label: 'Compare' },
  calculator: { level: 'full', points: 50, label: 'Calculator' },
} as const

export const ACCESS_RANK: Record<string, number> = {
  basic: 0,
  standard: 1,
  premium: 2,
  full: 3,
}

export const COST_OF_LIVING_INDEX: Record<string, number> = {
  'Paris': 100,
  'London': 115,
  'New York': 120,
  'Dubai': 85,
  'Singapore': 95,
  'Hong Kong': 110,
  'Milan': 90,
  'Tokyo': 105,
  'Shanghai': 75,
  'Zurich': 130,
  'Geneva': 125,
  'Monaco': 140,
  'Los Angeles': 110,
  'Miami': 95,
  'Riyadh': 70,
  'Doha': 80,
  'Mumbai': 45,
  'Seoul': 85,
  'Sydney': 100,
}

export const LUXURY_SKILLS = [
  'Clienteling',
  'CRM / Client Relations',
  'Visual Merchandising',
  'Omnichannel Retail',
  'Haute Couture Knowledge',
  'Fine Jewellery Expertise',
  'Watch Expertise',
  'Leather Goods Knowledge',
  'Fragrance & Beauty',
  'Multilingual',
  'High Net Worth Clientele',
  'Event Management',
  'Buying & Merchandising',
  'Digital Marketing',
  'E-commerce',
  'Supply Chain',
  'P&L Management',
  'Team Leadership',
  'Store Operations',
  'Brand Management',
] as const
