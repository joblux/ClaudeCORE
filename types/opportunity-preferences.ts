export interface OpportunityPreferences {
  id: string
  member_id: string
  preferred_sectors: string[]
  preferred_locations: { city: string; country: string }[]
  preferred_seniority: string[]
  preferred_departments: string[]
  preferred_contract_types: string[]
  open_to_internships: boolean
  open_to_remote: boolean
  min_salary: number | null
  salary_currency: string
  alerts_enabled: boolean
  alert_frequency: 'instant' | 'weekly' | 'off'
  created_at: string
  updated_at: string
}
