import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const CITY_SYMBOLS: Record<string, string> = {
  EUR: '€', GBP: '£', USD: '$', AED: 'AED ', CHF: 'CHF ',
}

interface SalaryRow {
  job_title: string
  city: string | null
  currency: string | null
  salary_min: number | null
  salary_max: number | null
}

function formatK(n: number): string {
  return `${Math.round(n / 1000)}K`
}

function buildRange(row: SalaryRow): string {
  const sym = CITY_SYMBOLS[row.currency || 'EUR'] || row.currency || ''
  if (row.salary_min && row.salary_max) return `${sym}${formatK(row.salary_min)}–${formatK(row.salary_max)}`
  if (row.salary_min) return `From ${sym}${formatK(row.salary_min)}`
  if (row.salary_max) return `Up to ${sym}${formatK(row.salary_max)}`
  return ''
}

const TARGET_CITIES = ['Paris', 'London', 'New York', 'Dubai', 'Geneva']

export async function SalarySnapshot() {
  const supabase = createServerSupabaseClient()

  const { data } = await supabase
    .from('salary_benchmarks')
    .select('job_title, city, currency, salary_min, salary_max')
    .in('city', TARGET_CITIES)
    .order('salary_max', { ascending: false })
    .limit(50)

  if (!data || data.length === 0) return null

  // Pick one row per city, ensuring each picked row has a different job_title AND a different city
  const usedCities = new Set<string>()
  const usedTitles = new Set<string>()
  const picked: SalaryRow[] = []
  for (const row of data) {
    if (!row.city || usedCities.has(row.city) || usedTitles.has(row.job_title)) continue
    usedCities.add(row.city)
    usedTitles.add(row.job_title)
    picked.push(row)
    if (picked.length >= 5) break
  }

  if (picked.length === 0) return null

  return (
    <div>
      <div className="jl-section-label">
        <span>Salary Intelligence</span>
      </div>

      <div className="space-y-0">
        {picked.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2.5 border-b border-[#f5f0e8] last:border-0"
          >
            <div>
              <div className="font-sans text-xs font-medium text-[#1a1a1a]">{item.job_title}</div>
              {item.city && (
                <div className="font-sans text-[0.65rem] text-[#aaa] mt-0.5">{item.city}</div>
              )}
            </div>
            <div className="text-right">
              <div className="font-sans text-xs font-semibold text-[#1a1a1a]">{buildRange(item)}</div>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/salaries"
        className="inline-block mt-3 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors"
      >
        Full salary guide →
      </Link>
    </div>
  )
}
