import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Metadata } from 'next'
import SalariesClient from './SalariesClient'

export const metadata: Metadata = {
  title: 'Salary Intelligence — Luxury Industry Compensation Data | JOBLUX',
  description: 'Salary benchmarks for 15 roles across 8 global markets. Compensation data for Louis Vuitton, Chanel, Hermès and 150+ luxury maisons.',
  alternates: { canonical: 'https://www.joblux.com/salaries' },
  openGraph: {
    title: 'Salary Intelligence | JOBLUX',
    description: 'Salary benchmarks across luxury. Compensation data for 150+ maisons.',
  },
}

export default async function SalariesPage() {
  const supabase = createServerSupabaseClient()

  // Fetch first page of salary benchmarks (20 records, ordered by brand_name)
  const { data: firstPageData, count } = await supabase
    .from('salary_benchmarks')
    .select('*', { count: 'exact' })
    .order('brand_name')
    .range(0, 19)

  // Fetch all benchmarks for filter options
  const { data: allBenchmarks } = await supabase
    .from('salary_benchmarks')
    .select('brand_name, department, seniority, city, country, currency')

  // Map first page entries
  const initialEntries = (firstPageData || []).map((b: any) => ({
    id: b.id,
    brand_name: b.brand_name,
    brand_slug: b.brand_slug,
    job_title: b.job_title,
    department: b.department,
    seniority: b.seniority,
    city: b.city,
    country: b.country,
    currency: b.currency,
    salary_min: b.salary_min,
    salary_max: b.salary_max,
    salary_median: b.salary_median ?? Math.round((b.salary_min + b.salary_max) / 2),
    bonus_min: b.bonus_min,
    bonus_max: b.bonus_max,
    total_comp_min: b.total_comp_min,
    total_comp_max: b.total_comp_max,
    data_points: 1,
    confidence: b.confidence || 'benchmark',
    sources: { benchmark: 1, contribution: 0 },
  }))

  const initialTotal = count ?? initialEntries.length

  // Build filter options and stats from all benchmarks
  const brands = new Set<string>()
  const depts = new Set<string>()
  const seniorities = new Set<string>()
  const cities = new Set<string>()
  const countries = new Set<string>()
  const currencies = new Set<string>()

  ;(allBenchmarks || []).forEach((b: any) => {
    if (b.brand_name) brands.add(b.brand_name)
    if (b.department) depts.add(b.department)
    if (b.seniority) seniorities.add(b.seniority)
    if (b.city) cities.add(b.city)
    if (b.country) countries.add(b.country)
    if (b.currency) currencies.add(b.currency)
  })

  const initialFilters = {
    brands: Array.from(brands).sort(),
    departments: Array.from(depts).sort(),
    seniority_levels: Array.from(seniorities).sort(),
    cities: Array.from(cities).sort(),
    countries: Array.from(countries).sort(),
    currencies: Array.from(currencies).sort(),
  }

  const initialStats = {
    total_data_points: (allBenchmarks || []).length,
    unique_brands: brands.size,
    unique_cities: cities.size,
  }

  return (
    <SalariesClient
      initialEntries={initialEntries}
      initialTotal={initialTotal}
      initialStats={initialStats}
      initialFilters={initialFilters}
    />
  )
}
