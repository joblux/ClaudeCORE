/**
 * Single source of truth for all job brief dropdown options.
 * Import from here — never hardcode options in components.
 */

export const DEPARTMENTS = [
  'Retail',
  'E-commerce',
  'Marketing & Communications',
  'Merchandising',
  'Buying',
  'Design & Creative',
  'Product Development',
  'Supply Chain & Logistics',
  'Finance & Administration',
  'Human Resources',
  'IT & Digital',
  'Legal & Compliance',
  'Client Relations (CRM)',
  'Visual Merchandising',
  'Store Operations',
  'Wholesale',
  'PR & Events',
  'Sustainability',
  'Executive / General Management',
  'Other',
] as const

export const SENIORITY_LEVELS = [
  'Intern/Trainee',
  'Junior (0–2 yrs)',
  'Mid-level (3–5 yrs)',
  'Senior (6–10 yrs)',
  'Lead / Manager',
  'Director',
  'VP / Head of',
  'C-Suite / Executive',
  'Board / Advisory',
] as const

export const CONTRACT_TYPES = [
  'Permanent (CDI)',
  'Fixed-term (CDD)',
  'Freelance / Consultant',
  'Temporary / Seasonal',
  'Internship (Stage)',
  'Apprenticeship',
  'Part-time',
  'Executive Interim',
] as const

export const REMOTE_POLICIES = [
  'On-site',
  'Hybrid',
  'Remote',
  'Flexible',
  'Travel Required',
] as const

export const SALARY_CURRENCIES = [
  'EUR',
  'GBP',
  'USD',
  'CHF',
  'AED',
  'SGD',
  'HKD',
  'JPY',
  'CNY',
  'SAR',
  'Other',
] as const

export const SALARY_PERIODS = [
  'Annual',
  'Monthly',
  'Daily',
  'Hourly',
] as const

export const BENEFITS_OPTIONS = [
  'Company car',
  'Staff discount',
  'Health insurance',
  'Pension/Retirement',
  'Stock options',
  'Relocation package',
  'Housing allowance',
  'Education budget',
  'Gym/Wellness',
  'Flexible hours',
  'Additional leave',
  'Other',
] as const

export const PRODUCT_CATEGORIES = [
  'Leather Goods',
  'Ready-to-Wear',
  'Haute Couture',
  'Shoes',
  'Jewellery',
  'Watches',
  'Fragrance',
  'Beauty / Cosmetics',
  'Eyewear',
  'Home & Lifestyle',
  'Wine & Spirits',
  'Hospitality',
  'Automotive',
  'Yachting / Aviation',
  'Art & Culture',
] as const

export const CLIENT_SEGMENTS = [
  'Ultra High Net Worth (UHNW)',
  'High Net Worth (HNW)',
  'Aspirational Luxury',
  'Mass Premium',
  'B2B / Trade',
] as const

export const LANGUAGES = [
  'English',
  'French',
  'Italian',
  'Mandarin',
  'Cantonese',
  'Japanese',
  'Korean',
  'Arabic',
  'Russian',
  'Spanish',
  'Portuguese',
  'German',
  'Hindi',
  'Other',
] as const

export const TRAVEL_PERCENTAGES = [
  'None',
  'Up to 10%',
  '10–25%',
  '25–50%',
  '50%+',
] as const

export const LUXURY_EXPERIENCE = [
  'Not required',
  '1–3 years',
  '3–5 years',
  '5–10 years',
  '10+ years',
  'Only luxury background',
] as const

export const START_DATES = [
  'Immediate',
  'Within 1 month',
  'Within 3 months',
  'Flexible',
  'Specific date',
] as const

export const BRIEF_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'closed', label: 'Closed' },
  { value: 'filled', label: 'Filled' },
] as const

export const BRIEF_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const

export const BRIEF_SOURCES = [
  'Manual Entry',
  'Import (CSV)',
  'Import (XML)',
  'Import (JSON)',
  'Import (URL Scrape)',
  'Client Submission',
  'API Feed',
] as const

export const FEE_AGREEMENTS = [
  'Percentage',
  'Flat fee',
  'Retainer',
  'No fee (free)',
  'TBD',
] as const

/** Currency symbol lookup for display */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  GBP: '£',
  USD: '$',
  CHF: 'CHF',
  AED: 'AED',
  SGD: 'S$',
  HKD: 'HK$',
  JPY: '¥',
  CNY: '¥',
  SAR: 'SAR',
}

/** Common luxury cities for suggestions */
export const COMMON_CITIES = [
  'Paris',
  'London',
  'Milan',
  'New York',
  'Dubai',
  'Singapore',
  'Hong Kong',
  'Tokyo',
  'Shanghai',
  'Zurich',
  'Geneva',
  'Monaco',
  'Los Angeles',
  'Miami',
  'Riyadh',
  'Doha',
  'Mumbai',
  'Seoul',
  'Sydney',
] as const

/** Standard country list for the dropdown */
export const COUNTRIES = [
  'France',
  'United Kingdom',
  'Italy',
  'United States',
  'UAE',
  'Singapore',
  'Hong Kong',
  'Japan',
  'China',
  'Switzerland',
  'Germany',
  'Spain',
  'Saudi Arabia',
  'Qatar',
  'South Korea',
  'Australia',
  'Canada',
  'Brazil',
  'India',
  'Mexico',
  'Thailand',
  'Turkey',
  'Netherlands',
  'Belgium',
  'Austria',
  'Monaco',
  'Bahrain',
  'Kuwait',
  'Oman',
  'Malaysia',
  'Indonesia',
  'Vietnam',
  'Taiwan',
  'New Zealand',
  'Other',
] as const
