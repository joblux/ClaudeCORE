import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

// Verify env
const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
for (const key of required) {
  if (!process.env[key]) { console.error(`Missing env var: ${key}`); process.exit(1) }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface SalaryBenchmark {
  brand_name: string
  job_title: string
  department: string
  seniority: string
  city: string
  country: string
  currency: string
  salary_min: number
  salary_max: number
  salary_median: number
  bonus_min: number
  bonus_max: number
  total_comp_min: number
  total_comp_max: number
  source: string
  confidence: string
  year_of_data: number
}

interface RoleConfig {
  title: string
  department: string
  seniority: string
}

interface MarketConfig {
  city: string
  country: string
  currency: string
  multiplier: number // relative to Paris baseline
}

const ROLES: RoleConfig[] = [
  { title: 'Client Advisor', department: 'Retail', seniority: 'Junior' },
  { title: 'Senior Client Advisor', department: 'Retail', seniority: 'Mid-Level' },
  { title: 'Store Manager', department: 'Retail', seniority: 'Senior' },
  { title: 'Boutique Director', department: 'Retail', seniority: 'Senior' },
  { title: 'Regional Director', department: 'Retail', seniority: 'Director' },
  { title: 'Retail Director', department: 'Retail', seniority: 'Director' },
  { title: 'VP Retail', department: 'Retail', seniority: 'Executive' },
  { title: 'CRM Manager', department: 'CRM & Clienteling', seniority: 'Mid-Level' },
  { title: 'Clienteling Director', department: 'CRM & Clienteling', seniority: 'Director' },
  { title: 'Visual Merchandiser', department: 'Visual Merchandising', seniority: 'Junior' },
  { title: 'VM Manager', department: 'Visual Merchandising', seniority: 'Mid-Level' },
  { title: 'Brand Manager', department: 'Marketing', seniority: 'Mid-Level' },
  { title: 'Marketing Director', department: 'Marketing', seniority: 'Director' },
  { title: 'Creative Director', department: 'Design', seniority: 'Director' },
  { title: 'E-commerce Manager', department: 'Digital', seniority: 'Mid-Level' },
]

const MARKETS: MarketConfig[] = [
  { city: 'Paris', country: 'France', currency: 'EUR', multiplier: 1.0 },
  { city: 'London', country: 'United Kingdom', currency: 'GBP', multiplier: 1.05 },
  { city: 'Milan', country: 'Italy', currency: 'EUR', multiplier: 0.9 },
  { city: 'New York', country: 'United States', currency: 'USD', multiplier: 1.25 },
  { city: 'Dubai', country: 'United Arab Emirates', currency: 'AED', multiplier: 1.15 },
  { city: 'Hong Kong', country: 'Hong Kong', currency: 'HKD', multiplier: 1.1 },
  { city: 'Tokyo', country: 'Japan', currency: 'JPY', multiplier: 0.95 },
  { city: 'Geneva', country: 'Switzerland', currency: 'CHF', multiplier: 1.3 },
]

// Paris EUR baselines (annual, min-max)
const BASELINES: Record<string, { min: number; max: number; bonus: number }> = {
  'Client Advisor': { min: 28000, max: 38000, bonus: 10 },
  'Senior Client Advisor': { min: 35000, max: 48000, bonus: 15 },
  'Store Manager': { min: 45000, max: 65000, bonus: 20 },
  'Boutique Director': { min: 60000, max: 85000, bonus: 25 },
  'Regional Director': { min: 85000, max: 120000, bonus: 30 },
  'Retail Director': { min: 100000, max: 150000, bonus: 35 },
  'VP Retail': { min: 140000, max: 200000, bonus: 40 },
  'CRM Manager': { min: 50000, max: 70000, bonus: 15 },
  'Clienteling Director': { min: 80000, max: 120000, bonus: 25 },
  'Visual Merchandiser': { min: 30000, max: 42000, bonus: 10 },
  'VM Manager': { min: 48000, max: 68000, bonus: 15 },
  'Brand Manager': { min: 55000, max: 75000, bonus: 20 },
  'Marketing Director': { min: 90000, max: 140000, bonus: 30 },
  'Creative Director': { min: 120000, max: 200000, bonus: 35 },
  'E-commerce Manager': { min: 55000, max: 80000, bonus: 20 },
}

// Currency conversion factors from EUR
const FX: Record<string, number> = {
  EUR: 1,
  GBP: 0.86,
  USD: 1.08,
  AED: 3.97,
  HKD: 8.45,
  JPY: 163,
  CHF: 0.94,
}

function round(n: number, precision = -2): number {
  const factor = Math.pow(10, -precision)
  return Math.round(n / factor) * factor
}

function generateBenchmarks(): SalaryBenchmark[] {
  const benchmarks: SalaryBenchmark[] = []
  const brands = ['Luxury Sector Average'] // Generic benchmark

  for (const role of ROLES) {
    const baseline = BASELINES[role.title]
    if (!baseline) continue

    for (const market of MARKETS) {
      const fx = FX[market.currency]
      const m = market.multiplier

      const salaryMin = round(baseline.min * m * fx)
      const salaryMax = round(baseline.max * m * fx)
      const salaryMedian = round(((baseline.min + baseline.max) / 2) * m * fx)
      const bonusPct = baseline.bonus / 100
      const bonusMin = round(salaryMin * bonusPct)
      const bonusMax = round(salaryMax * bonusPct)

      for (const brandName of brands) {
        benchmarks.push({
          brand_name: brandName,
          job_title: role.title,
          department: role.department,
          seniority: role.seniority,
          city: market.city,
          country: market.country,
          currency: market.currency,
          salary_min: salaryMin,
          salary_max: salaryMax,
          salary_median: salaryMedian,
          bonus_min: bonusMin,
          bonus_max: bonusMax,
          total_comp_min: salaryMin + bonusMin,
          total_comp_max: salaryMax + bonusMax,
          source: 'JOBLUX Intelligence',
          confidence: 'estimated',
          year_of_data: 2025,
        })
      }
    }
  }

  return benchmarks
}

async function main() {
  console.log('Salary Benchmark Seeding')
  console.log('========================')

  const benchmarks = generateBenchmarks()
  console.log(`Generated ${benchmarks.length} benchmarks (${ROLES.length} roles x ${MARKETS.length} markets)`)

  // Insert in batches of 50
  let success = 0
  let errors = 0

  for (let i = 0; i < benchmarks.length; i += 50) {
    const batch = benchmarks.slice(i, i + 50)
    const { error } = await supabase.from('salary_benchmarks').insert(batch)

    if (error) {
      console.error(`Batch ${Math.floor(i / 50) + 1} failed:`, error.message)
      errors += batch.length
    } else {
      success += batch.length
      console.log(`Inserted batch ${Math.floor(i / 50) + 1}: ${batch.length} rows`)
    }
  }

  console.log('')
  console.log('Salary Seeding Complete')
  console.log('=======================')
  console.log(`${success} inserted, ${errors} failed`)
}

main().catch((err) => { console.error('Fatal error:', err); process.exit(1) })
