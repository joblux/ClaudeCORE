export type UserType = 'candidate' | 'employer' | 'influencer'
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type MembershipTier = 'free' | 'premium'

export type LuxuryCategory =
  | 'fashion'
  | 'leather_goods'
  | 'watches'
  | 'jewellery'
  | 'automotive'
  | 'hospitality'
  | 'beauty'
  | 'fragrance'
  | 'spirits'
  | 'aviation'
  | 'yachting'
  | 'real_estate'
  | 'art'
  | 'education'
  | 'retail'

export type LuxuryFunction =
  | 'retail'
  | 'buying'
  | 'wholesale'
  | 'marketing'
  | 'hr'
  | 'finance'
  | 'operations'
  | 'digital'
  | 'creative'
  | 'executive'
  | 'legal'
  | 'supply_chain'

export type LuxuryMarket =
  | 'paris'
  | 'london'
  | 'new_york'
  | 'dubai'
  | 'singapore'
  | 'milan'
  | 'tokyo'
  | 'shanghai'
  | 'hong_kong'
  | 'zurich'
  | 'los_angeles'
  | 'miami'

export type AvailabilityStatus =
  | 'open'
  | 'discreet'
  | 'not_looking'

export type ContractType =
  | 'permanent'
  | 'freelance'
  | 'interim'
  | 'all'

export type MaisonTier =
  | 'ultra_luxury'
  | 'first_tier'
  | 'accessible_luxury'
  | 'independent'
  | 'emerging'

// ── CAREER HISTORY ────────────────────────────────────
export interface CareerEntry {
  id:          string
  maison:      string
  role:        string
  from_month:  number
  from_year:   number
  to_month:    number | null
  to_year:     number | null
  is_current:  boolean
  location:    string | null
}

// ── EDUCATION ─────────────────────────────────────────
export interface EducationEntry {
  id:          string
  institution: string
  degree:      string
  year:        number | null
}

// ── USER PROFILE ──────────────────────────────────────
export interface Profile {
  id:                string
  user_id:           string
  user_type:         UserType
  status:            UserStatus
  email:             string
  full_name:         string
  photo_url:         string | null
  current_title:     string | null
  current_maison:    string | null
  location_city:     LuxuryMarket | null
  nationality:       string | null
  languages:         string[]
  years_in_luxury:   number | null
  work_permit:       string | null
  bio:               string | null

  // Candidate specific
  career_history:    CareerEntry[]
  education:         EducationEntry[]
  categories:        LuxuryCategory[]
  functions:         LuxuryFunction[]
  target_markets:    LuxuryMarket[]
  maison_tier_pref:  MaisonTier | null
  availability:      AvailabilityStatus | null
  available_from:    string | null
  notice_period:     string | null
  relocation:        boolean | null
  relocation_cities: LuxuryMarket[]
  contract_type:     ContractType | null
  salary_min:        number | null
  salary_currency:   string | null
  deal_breakers:     string | null

  // Employer specific
  company_name:      string | null
  company_size:      string | null
  company_markets:   LuxuryMarket[]
  hiring_markets:    LuxuryMarket[]
  preferred_seniority: string | null
  hiring_frequency:  string | null
  nda_required:      boolean | null
  contact_method:    string | null
  reason_for_joining: string | null

  // Influencer specific
  instagram_handle:  string | null
  linkedin_handle:   string | null
  instagram_followers: number | null
  content_categories: LuxuryCategory[]
  collaboration_type: string | null

  // Admin fields
  internal_notes:    string | null
  tags:              string[]
  source:            string | null
  referral_code:     string | null
  referred_by:       string | null
  last_active:       string | null
  engagement_score:  number | null

  created_at:        string
  updated_at:        string
}

// ── JOB MANDATE ───────────────────────────────────────
export interface JobMandate {
  id:              string
  title:           string
  maison_display:  string
  category:        LuxuryCategory
  function:        LuxuryFunction
  market:          LuxuryMarket
  city:            string
  seniority:       string
  salary_min:      number
  salary_max:      number
  salary_currency: string
  contract_type:   ContractType
  is_confidential: boolean
  description:     string | null
  requirements:    string | null
  status:          'open' | 'closed' | 'filled'
  created_at:      string
  expires_at:      string | null
}

// ── ARTICLE ───────────────────────────────────────────
export interface Article {
  id:           string
  title:        string
  slug:         string
  excerpt:      string | null
  content:      string
  category:     'bloglux' | 'interview' | 'travel' | 'salary' | 'career'
  author_name:  string
  author_id:    string | null
  cover_image:  string | null
  published:    boolean
  published_at: string | null
  read_time:    number | null
  tags:         string[]
  created_at:   string
}

// ── NEWSLETTER SUBSCRIBER ─────────────────────────────
export interface Subscriber {
  id:           string
  email:        string
  name:         string | null
  subscribed:   boolean
  created_at:   string
}

// ── DATABASE SCHEMA ───────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    Profile
        Insert: Partial<Profile>
        Update: Partial<Profile>
      }
      job_mandates: {
        Row:    JobMandate
        Insert: Partial<JobMandate>
        Update: Partial<JobMandate>
      }
      articles: {
        Row:    Article
        Insert: Partial<Article>
        Update: Partial<Article>
      }
      subscribers: {
        Row:    Subscriber
        Insert: Partial<Subscriber>
        Update: Partial<Subscriber>
      }
    }
  }
}
