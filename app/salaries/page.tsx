'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useMember } from '@/lib/auth-hooks'
import { DEPARTMENTS, SENIORITY_LEVELS, CURRENCY_SYMBOLS, COMMON_CITIES } from '@/lib/assignment-options'
import { ACCESS_RANK, LUXURY_SKILLS } from '@/types/salary'
import type { SalaryRangeData, BenchmarkResult, CompareResult, CalculatorResult } from '@/types/salary'
import SalaryRangeBar, { formatSalaryFull } from '@/components/salary/SalaryRangeBar'
import SalaryComparisonChart from '@/components/salary/SalaryComparisonChart'
import AccessTierLadder from '@/components/salary/AccessTierLadder'

type TabKey = 'browse' | 'benchmark' | 'compare' | 'calculator'

export default function SalariesPage() {
  const { isAuthenticated, isLoading: authLoading } = useMember()
  const [activeTab, setActiveTab] = useState<TabKey>('browse')
  const [accessLevel, setAccessLevel] = useState('basic')

  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/contributions/my-points')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.access_level) setAccessLevel(data.access_level) })
      .catch(() => {})
  }, [isAuthenticated])

  const accessRank = ACCESS_RANK[accessLevel] ?? 0

  if (authLoading) {
    return (
      <div className="jl-container py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#e8e2d8] border-t-[#a58e28] rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="jl-container py-20 text-center">
        <h1 className="jl-serif text-2xl text-[#1a1a1a] mb-3">Sign in to access Salary Intelligence</h1>
        <Link href="/join" className="jl-btn-primary">Request Access</Link>
      </div>
    )
  }

  const tabs: { key: TabKey; label: string; requiredRank: number; points: number }[] = [
    { key: 'browse', label: 'Browse', requiredRank: 0, points: 0 },
    { key: 'benchmark', label: 'Benchmark', requiredRank: 1, points: 10 },
    { key: 'compare', label: 'Compare', requiredRank: 2, points: 25 },
    { key: 'calculator', label: 'Calculator', requiredRank: 3, points: 50 },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#222222] py-14 md:py-20">
        <div className="jl-container text-center">
          <div className="jl-overline-gold mb-4 tracking-[0.2em]">Salary Intelligence</div>
          <h1 className="jl-serif text-4xl md:text-5xl lg:text-6xl font-light text-white mb-5">
            Know Your Worth
          </h1>
          <p className="font-sans text-sm md:text-base text-[#bbb] max-w-2xl mx-auto leading-relaxed">
            Salary benchmarks, comparisons, and personalised estimates across the world&rsquo;s most prestigious maisons.
          </p>
        </div>
      </section>

      {/* Tab bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#e8e2d8]">
        <div className="jl-container">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => {
              const isLocked = accessRank < tab.requiredRank
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-5 py-3.5 text-xs tracking-wide border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-[#a58e28] text-[#a58e28] font-semibold'
                      : 'border-transparent text-[#888] hover:text-[#555]'
                  }`}
                >
                  {isLocked && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  )}
                  {tab.label}
                  {tab.points > 0 && isLocked && (
                    <span className="text-[0.55rem] text-[#ccc]">{tab.points}pts</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="jl-container py-8">
        {activeTab === 'browse' && <BrowseTab accessLevel={accessLevel} />}
        {activeTab === 'benchmark' && (
          accessRank >= 1 ? <BenchmarkTab /> : <LockedTab tool="Benchmark" points={10} level="Standard" />
        )}
        {activeTab === 'compare' && (
          accessRank >= 2 ? <CompareTab /> : <LockedTab tool="Compare" points={25} level="Premium" />
        )}
        {activeTab === 'calculator' && (
          accessRank >= 3 ? <CalculatorTab /> : <LockedTab tool="Calculator" points={50} level="Full" />
        )}
      </div>
    </div>
  )
}

/* ── BROWSE TAB ─────────────────────────────────────── */
function BrowseTab({ accessLevel }: { accessLevel: string }) {
  const [entries, setEntries] = useState<SalaryRangeData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [filters, setFilters] = useState<any>({})
  const limit = 20

  const [search, setSearch] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterSeniority, setFilterSeniority] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterCurrency, setFilterCurrency] = useState('')

  const searchTimeout = useRef<NodeJS.Timeout>()
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [search])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))
    if (debouncedSearch) params.set('brand', debouncedSearch)
    if (filterBrand) params.set('brand', filterBrand)
    if (filterDept) params.set('department', filterDept)
    if (filterSeniority) params.set('seniority', filterSeniority)
    if (filterCity) params.set('city', filterCity)
    if (filterCurrency) params.set('currency', filterCurrency)

    try {
      const res = await fetch(`/api/salaries?${params}`)
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setEntries(data.entries || [])
      setTotal(data.total || 0)
      setStats(data.stats)
      setFilters(data.filters || {})
    } catch { setEntries([]) } finally { setLoading(false) }
  }, [page, debouncedSearch, filterBrand, filterDept, filterSeniority, filterCity, filterCurrency])

  useEffect(() => { fetchData() }, [fetchData])

  const hasFilters = search || filterBrand || filterDept || filterSeniority || filterCity || filterCurrency
  const clearFilters = () => { setSearch(''); setFilterBrand(''); setFilterDept(''); setFilterSeniority(''); setFilterCity(''); setFilterCurrency(''); setPage(1) }
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        {stats && stats.total_data_points > 0 && (
          <div className="flex flex-wrap gap-4 text-xs text-[#999] tracking-wide uppercase mb-6">
            <span>{stats.total_data_points} data points</span>
            <span className="text-[#a58e28]">&middot;</span>
            <span>{stats.unique_brands} maisons</span>
            <span className="text-[#a58e28]">&middot;</span>
            <span>{stats.unique_cities} cities</span>
          </div>
        )}

        <div className="mb-6 space-y-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by role, brand, or city..." className="jl-input w-full pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            {(filters.brands || []).length > 0 && (
              <select value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setPage(1) }} className="jl-select text-xs min-w-[130px]">
                <option value="">All Brands</option>
                {(filters.brands || []).map((b: string) => <option key={b} value={b}>{b}</option>)}
              </select>
            )}
            <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1) }} className="jl-select text-xs min-w-[130px]">
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterSeniority} onChange={(e) => { setFilterSeniority(e.target.value); setPage(1) }} className="jl-select text-xs min-w-[130px]">
              <option value="">All Levels</option>
              {SENIORITY_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {(filters.cities || []).length > 0 && (
              <select value={filterCity} onChange={(e) => { setFilterCity(e.target.value); setPage(1) }} className="jl-select text-xs min-w-[120px]">
                <option value="">All Cities</option>
                {(filters.cities || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            {(filters.currencies || []).length > 0 && (
              <select value={filterCurrency} onChange={(e) => { setFilterCurrency(e.target.value); setPage(1) }} className="jl-select text-xs min-w-[100px]">
                <option value="">All Currencies</option>
                {(filters.currencies || []).map((c: string) => <option key={c} value={c}>{CURRENCY_SYMBOLS[c] || c} {c}</option>)}
              </select>
            )}
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors tracking-wide uppercase">Clear all</button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="jl-card animate-pulse">
              <div className="flex justify-between mb-2"><div className="h-4 bg-[#f0ece4] rounded w-1/3" /><div className="h-4 bg-[#f0ece4] rounded w-1/4" /></div>
              <div className="h-3 bg-[#f0ece4] rounded w-1/2 mb-3" />
              <div className="h-2 bg-[#f0ece4] rounded w-full" />
            </div>
          ))}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="jl-serif text-xl text-[#1a1a1a] mb-2">
              {hasFilters ? 'No salary data matches your search' : 'Salary Intelligence is building'}
            </p>
            <p className="text-sm text-[#888] mb-4">
              {hasFilters ? 'Try broadening your filters' : 'Be the first to contribute salary data and help the community'}
            </p>
            <Link href="/contribute" className="jl-btn-primary">Contribute Salary Data</Link>
          </div>
        ) : (
          <>
            <div className="text-xs text-[#888] mb-3">{total} entr{total !== 1 ? 'ies' : 'y'}</div>
            <div className="space-y-3">
              {entries.map(entry => <SalaryCard key={entry.id} entry={entry} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="jl-btn text-xs disabled:opacity-30">Previous</button>
                <span className="text-xs text-[#888] px-4">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="jl-btn text-xs disabled:opacity-30">Next</button>
              </div>
            )}
          </>
        )}
      </div>

      <aside className="hidden lg:block space-y-6">
        <div className="jl-card border-[#a58e28]">
          <h3 className="jl-serif text-lg text-[#1a1a1a] mb-2">Contribute Your Salary</h3>
          <p className="text-xs text-[#888] leading-relaxed mb-4">Share your compensation data anonymously and earn 10 points towards unlocking advanced tools.</p>
          <Link href="/contribute" className="jl-btn-gold w-full text-center">Contribute</Link>
        </div>
        <div className="jl-card">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] mb-3">How It Works</h3>
          <ol className="space-y-2 text-xs text-[#666] leading-relaxed">
            <li className="flex gap-2"><span className="text-[#a58e28] font-semibold flex-shrink-0">01</span>AI-generated benchmarks from market data</li>
            <li className="flex gap-2"><span className="text-[#a58e28] font-semibold flex-shrink-0">02</span>Enriched with web research and industry reports</li>
            <li className="flex gap-2"><span className="text-[#a58e28] font-semibold flex-shrink-0">03</span>Verified by anonymous member contributions</li>
            <li className="flex gap-2"><span className="text-[#a58e28] font-semibold flex-shrink-0">04</span>Curated by the JOBLUX editorial team</li>
          </ol>
        </div>
        <div className="jl-card">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] mb-3">Access Tiers</h3>
          <AccessTierLadder currentLevel={accessLevel} />
        </div>
      </aside>
    </div>
  )
}

function SalaryCard({ entry }: { entry: SalaryRangeData }) {
  const e = entry
  return (
    <div className="jl-card">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="font-sans text-sm font-semibold text-[#1a1a1a]">{e.job_title}</h3>
          <p className="text-xs text-[#a58e28]">{e.brand_name}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {e.seniority && <span className="jl-badge-outline text-[0.6rem]">{e.seniority}</span>}
          <span className={`text-[0.55rem] px-1.5 py-0.5 rounded-sm ${
            e.confidence === 'aggregated' ? 'bg-[#a58e28]/10 text-[#a58e28]' :
            e.confidence === 'verified' ? 'bg-[#5a7a5a]/10 text-[#5a7a5a]' :
            'bg-[#e8e2d8] text-[#888]'
          }`}>{e.confidence}</span>
        </div>
      </div>
      <div className="text-[0.65rem] text-[#888] mb-3">
        {e.city}, {e.country}
        {e.department && <> &middot; {e.department}</>}
        {e.data_points > 1 && <> &middot; {e.data_points} data points</>}
      </div>
      <SalaryRangeBar min={e.salary_min} max={e.salary_max} median={e.salary_median} currency={e.currency} />
      {(e.bonus_min != null || e.bonus_max != null) && (
        <div className="mt-2 text-[0.6rem] text-[#999]">
          Bonus: {e.bonus_min != null ? formatSalaryFull(e.bonus_min, e.currency) : '—'} — {e.bonus_max != null ? formatSalaryFull(e.bonus_max, e.currency) : '—'}
        </div>
      )}
    </div>
  )
}

/* ── BENCHMARK TAB ──────────────────────────────────── */
function BenchmarkTab() {
  const [jobTitle, setJobTitle] = useState('')
  const [city, setCity] = useState('')
  const [department, setDepartment] = useState('')
  const [seniority, setSeniority] = useState('')
  const [brand, setBrand] = useState('')
  const [currentSalary, setCurrentSalary] = useState('')
  const [result, setResult] = useState<BenchmarkResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchBenchmark = async () => {
    if (!jobTitle || !city) return
    setLoading(true); setResult(null); setMessage('')
    const params = new URLSearchParams({ job_title: jobTitle, city })
    if (department) params.set('department', department)
    if (seniority) params.set('seniority', seniority)
    if (brand) params.set('brand', brand)
    if (currentSalary) params.set('current_salary', currentSalary)
    try {
      const res = await fetch(`/api/salaries/benchmark?${params}`)
      const data = await res.json()
      if (data.result) setResult(data.result)
      else setMessage(data.message || 'No data available')
    } catch { setMessage('Failed to fetch benchmark') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="jl-serif text-2xl text-[#1a1a1a] mb-1">Salary Benchmark</h2>
      <p className="text-sm text-[#888] mb-6">See how your salary compares to the market.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div><label className="jl-label">Job Title <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Store Director" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} /></div>
        <div><label className="jl-label">City <span className="text-red-500">*</span></label><select className="jl-select w-full" value={city} onChange={(e) => setCity(e.target.value)}><option value="">Select city</option>{COMMON_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className="jl-label">Department</label><select className="jl-select w-full" value={department} onChange={(e) => setDepartment(e.target.value)}><option value="">Any</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        <div><label className="jl-label">Seniority</label><select className="jl-select w-full" value={seniority} onChange={(e) => setSeniority(e.target.value)}><option value="">Any</option>{SENIORITY_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><label className="jl-label">Brand / Maison</label><input className="jl-input w-full" placeholder="e.g. Chanel" value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
        <div><label className="jl-label">My Current Salary (optional)</label><input className="jl-input w-full" type="number" placeholder="e.g. 65000" value={currentSalary} onChange={(e) => setCurrentSalary(e.target.value)} /></div>
      </div>
      <button onClick={fetchBenchmark} disabled={loading || !jobTitle || !city} className="jl-btn-primary disabled:opacity-50 mb-8">{loading ? 'Analysing...' : 'Get Benchmark'}</button>
      {message && <p className="text-sm text-[#888] mt-4">{message}</p>}
      {result && (
        <div className="space-y-6">
          <div className="jl-card">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] mb-1">{result.role} in {result.city}</h3>
            <p className="text-[0.65rem] text-[#999] mb-4">{result.data_points} data points &middot; {result.confidence}</p>
            <div className="mb-4">
              <SalaryRangeBar min={result.salary_min} max={result.salary_max} median={result.salary_median} percentile25={result.percentile_25} percentile75={result.percentile_75} userSalary={currentSalary ? parseInt(currentSalary) : null} currency={result.currency} height={12} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center border-t border-[#f0ece4] pt-4">
              <div><div className="jl-label">25th Percentile</div><div className="text-sm font-semibold text-[#555]">{formatSalaryFull(result.percentile_25, result.currency)}</div></div>
              <div><div className="jl-label">Median</div><div className="text-sm font-semibold text-[#a58e28]">{formatSalaryFull(result.salary_median, result.currency)}</div></div>
              <div><div className="jl-label">75th Percentile</div><div className="text-sm font-semibold text-[#555]">{formatSalaryFull(result.percentile_75, result.currency)}</div></div>
            </div>
            {result.user_percentile != null && (
              <div className="mt-4 p-3 bg-[#fafaf5] border border-[#e8e2d8] rounded-sm text-center">
                <p className="text-sm text-[#1a1a1a]">You&rsquo;re at the <span className="font-semibold text-[#a58e28]">{result.user_percentile}th percentile</span> for this role</p>
              </div>
            )}
          </div>
          {result.other_cities.length > 0 && (
            <div className="jl-card">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] mb-4">Same Role in Other Cities</h3>
              <SalaryComparisonChart items={result.other_cities.map(c => ({ label: c.city, min: Math.round(c.median * 0.8), max: Math.round(c.median * 1.2), median: c.median, currency: c.currency }))} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── COMPARE TAB ────────────────────────────────────── */
function CompareTab() {
  const [compareType, setCompareType] = useState<'city' | 'brand'>('city')
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [seniority, setSeniority] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([''])
  const [result, setResult] = useState<CompareResult | null>(null)
  const [loading, setLoading] = useState(false)

  const addItem = () => { if (selectedItems.length < 5) setSelectedItems([...selectedItems, '']) }
  const removeItem = (i: number) => { setSelectedItems(selectedItems.filter((_, idx) => idx !== i)) }
  const updateItem = (i: number, val: string) => { const next = [...selectedItems]; next[i] = val; setSelectedItems(next) }

  const fetchCompare = async () => {
    const validItems = selectedItems.filter(Boolean)
    if (!jobTitle || validItems.length < 2) return
    setLoading(true); setResult(null)
    const params = new URLSearchParams({ job_title: jobTitle, compare_type: compareType })
    if (department) params.set('department', department)
    if (seniority) params.set('seniority', seniority)
    validItems.forEach(item => params.append('items', item))
    try {
      const res = await fetch(`/api/salaries/compare?${params}`)
      const data = await res.json()
      setResult(data)
    } catch {} finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="jl-serif text-2xl text-[#1a1a1a] mb-1">Compare Salaries</h2>
      <p className="text-sm text-[#888] mb-6">Side-by-side comparison across cities or brands.</p>
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setCompareType('city'); setSelectedItems(['']) }} className={`jl-btn text-xs ${compareType === 'city' ? 'jl-btn-primary' : 'jl-btn-outline'}`}>Compare Cities</button>
        <button onClick={() => { setCompareType('brand'); setSelectedItems(['']) }} className={`jl-btn text-xs ${compareType === 'brand' ? 'jl-btn-primary' : 'jl-btn-outline'}`}>Compare Brands</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div><label className="jl-label">Job Title <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Marketing Manager" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} /></div>
        <div><label className="jl-label">Department</label><select className="jl-select w-full" value={department} onChange={(e) => setDepartment(e.target.value)}><option value="">Any</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        <div><label className="jl-label">Seniority</label><select className="jl-select w-full" value={seniority} onChange={(e) => setSeniority(e.target.value)}><option value="">Any</option>{SENIORITY_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
      </div>
      <div className="space-y-2 mb-4">
        <label className="jl-label">{compareType === 'city' ? 'Cities to Compare' : 'Brands to Compare'}</label>
        {selectedItems.map((item, i) => (
          <div key={i} className="flex gap-2">
            {compareType === 'city' ? (
              <select className="jl-select flex-1" value={item} onChange={(e) => updateItem(i, e.target.value)}>
                <option value="">Select city</option>
                {COMMON_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input className="jl-input flex-1" placeholder="e.g. Chanel" value={item} onChange={(e) => updateItem(i, e.target.value)} />
            )}
            {selectedItems.length > 1 && <button onClick={() => removeItem(i)} className="text-xs text-[#999] hover:text-[#1a1a1a] px-2">&times;</button>}
          </div>
        ))}
        {selectedItems.length < 5 && <button onClick={addItem} className="text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors">+ Add another</button>}
      </div>
      <button onClick={fetchCompare} disabled={loading || !jobTitle || selectedItems.filter(Boolean).length < 2} className="jl-btn-primary disabled:opacity-50 mb-8">{loading ? 'Comparing...' : 'Compare'}</button>
      {result && result.items && (
        <div className="space-y-6">
          <div className="jl-card">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] mb-4">{result.role} — {result.compare_type === 'city' ? 'City' : 'Brand'} Comparison</h3>
            <SalaryComparisonChart items={result.items.filter(i => i.data_points > 0).map(i => ({ label: i.label, min: i.salary_min, max: i.salary_max, median: i.salary_median, currency: i.currency, costIndex: i.cost_index }))} showCostIndex={result.compare_type === 'city'} />
          </div>
          <div className="jl-card overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-[#e8e2d8]">
                <th className="text-left py-2 font-semibold text-[#888] uppercase tracking-wider">{result.compare_type === 'city' ? 'City' : 'Brand'}</th>
                <th className="text-right py-2 font-semibold text-[#888] uppercase tracking-wider">Min</th>
                <th className="text-right py-2 font-semibold text-[#888] uppercase tracking-wider">Median</th>
                <th className="text-right py-2 font-semibold text-[#888] uppercase tracking-wider">Max</th>
                <th className="text-right py-2 font-semibold text-[#888] uppercase tracking-wider">Points</th>
              </tr></thead>
              <tbody>{result.items.map(item => (
                <tr key={item.label} className="border-b border-[#f0ece4]">
                  <td className="py-2 font-medium text-[#1a1a1a]">{item.label}</td>
                  <td className="py-2 text-right text-[#888]">{item.data_points > 0 ? formatSalaryFull(item.salary_min, item.currency) : '—'}</td>
                  <td className="py-2 text-right text-[#a58e28] font-medium">{item.data_points > 0 ? formatSalaryFull(item.salary_median, item.currency) : '—'}</td>
                  <td className="py-2 text-right text-[#888]">{item.data_points > 0 ? formatSalaryFull(item.salary_max, item.currency) : '—'}</td>
                  <td className="py-2 text-right text-[#ccc]">{item.data_points}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── CALCULATOR TAB ─────────────────────────────────── */
function CalculatorTab() {
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [seniority, setSeniority] = useState('')
  const [city, setCity] = useState('')
  const [brand, setBrand] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [result, setResult] = useState<CalculatorResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const toggleSkill = (skill: string) => { setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]) }

  const calculate = async () => {
    if (!jobTitle || !city) return
    setLoading(true); setResult(null); setMessage('')
    try {
      const res = await fetch('/api/salaries/calculator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_title: jobTitle, department, seniority, city, country: '', brand, years_experience: yearsExp ? parseInt(yearsExp) : 0, skills }) })
      const data = await res.json()
      if (data.result) setResult(data.result)
      else setMessage(data.message || 'Unable to calculate')
    } catch { setMessage('Failed to calculate') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="jl-serif text-2xl text-[#1a1a1a] mb-1">Salary Calculator</h2>
      <p className="text-sm text-[#888] mb-6">Get a personalised salary estimate based on your profile.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div><label className="jl-label">Job Title <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Retail Director" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} /></div>
        <div><label className="jl-label">City <span className="text-red-500">*</span></label><select className="jl-select w-full" value={city} onChange={(e) => setCity(e.target.value)}><option value="">Select city</option>{COMMON_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className="jl-label">Department</label><select className="jl-select w-full" value={department} onChange={(e) => setDepartment(e.target.value)}><option value="">Select</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        <div><label className="jl-label">Seniority</label><select className="jl-select w-full" value={seniority} onChange={(e) => setSeniority(e.target.value)}><option value="">Select</option>{SENIORITY_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><label className="jl-label">Brand / Maison</label><input className="jl-input w-full" placeholder="e.g. Louis Vuitton" value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
        <div><label className="jl-label">Years of Experience</label><input className="jl-input w-full" type="number" placeholder="e.g. 8" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} /></div>
      </div>
      <div className="mb-6">
        <label className="jl-label mb-2">Key Skills (select all that apply)</label>
        <div className="flex flex-wrap gap-1.5">
          {LUXURY_SKILLS.map(skill => (
            <button key={skill} onClick={() => toggleSkill(skill)} className={`text-[0.65rem] px-2.5 py-1 rounded-sm border transition-colors ${skills.includes(skill) ? 'border-[#a58e28] bg-[#a58e28]/10 text-[#a58e28]' : 'border-[#e8e2d8] text-[#888] hover:border-[#a58e28]'}`}>{skill}</button>
          ))}
        </div>
      </div>
      <button onClick={calculate} disabled={loading || !jobTitle || !city} className="jl-btn-gold text-sm px-8 py-3 disabled:opacity-50 mb-8">{loading ? 'Calculating...' : 'Calculate My Salary'}</button>
      {message && <p className="text-sm text-[#888] mt-4">{message}</p>}
      {result && (
        <div className="space-y-6">
          <div className="jl-card bg-[#222222] text-white border-[#a58e28]">
            <div className="text-center py-4">
              <div className="jl-overline-gold mb-2">Your Estimated Salary Range</div>
              <div className="jl-serif text-3xl md:text-4xl font-light mb-2">{formatSalaryFull(result.estimated_low, result.currency)} — {formatSalaryFull(result.estimated_high, result.currency)}</div>
              <div className="text-sm text-[#a58e28]">Mid-point: {formatSalaryFull(result.estimated_mid, result.currency)}</div>
              <div className="text-xs text-[#888] mt-2">{result.data_points} data points &middot; {result.confidence}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="jl-card text-center"><div className="jl-label mb-1">Base Salary</div><div className="text-sm font-semibold text-[#1a1a1a]">{formatSalaryFull(result.estimated_low, result.currency)} — {formatSalaryFull(result.estimated_high, result.currency)}</div></div>
            <div className="jl-card text-center"><div className="jl-label mb-1">Bonus Range</div><div className="text-sm font-semibold text-[#1a1a1a]">{formatSalaryFull(result.bonus_low, result.currency)} — {formatSalaryFull(result.bonus_high, result.currency)}</div></div>
            <div className="jl-card text-center"><div className="jl-label mb-1">Total Compensation</div><div className="text-sm font-semibold text-[#a58e28]">{formatSalaryFull(result.total_comp_low, result.currency)} — {formatSalaryFull(result.total_comp_high, result.currency)}</div></div>
          </div>
          {result.factors.length > 0 && (
            <div className="jl-card">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] mb-3">What Affects Your Estimate</h3>
              <ul className="space-y-2">{result.factors.map((f, i) => <li key={i} className="flex items-start gap-2 text-xs text-[#555]"><span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>{f}</li>)}</ul>
            </div>
          )}
          {result.recommendations.length > 0 && (
            <div className="jl-card border-[#a58e28] bg-[#fafaf5]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] mb-3">To Increase Your Earning Potential</h3>
              <ul className="space-y-2">{result.recommendations.map((r, i) => <li key={i} className="flex items-start gap-2 text-xs text-[#555]"><span className="text-[#a58e28] font-semibold flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>{r}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── LOCKED TAB ─────────────────────────────────────── */
function LockedTab({ tool, points, level }: { tool: string; points: number; level: string }) {
  return (
    <div className="relative min-h-[400px]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 blur-sm opacity-30 pointer-events-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-[#e8e2d8] rounded p-5 bg-white">
              <div className="h-5 bg-[#e8e2d8] rounded w-2/3 mb-3" />
              <div className="h-3 bg-[#e8e2d8] rounded w-1/2 mb-2" />
              <div className="h-2 bg-[#f0ece4] rounded w-full mb-1" />
              <div className="h-2 bg-[#f0ece4] rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a58e28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="jl-serif text-2xl text-[#1a1a1a] mb-2">Salary {tool}</h2>
          <p className="text-sm text-[#888] leading-relaxed mb-6">Earn {points} points to unlock the {tool} tool. Reach {level} access by contributing salary data, interview experiences, or brand insights.</p>
          <Link href="/contribute" className="jl-btn-primary">Contribute to Earn Points</Link>
        </div>
      </div>
    </div>
  )
}
