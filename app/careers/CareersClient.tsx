'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

const TAB_SLUG_MAP: Record<string, string> = { 'salary-intelligence': 'salary', 'interview-experiences': 'interview' }
const TAB_TO_SLUG: Record<string, string> = { 'assignments': '', 'salary': 'salary-intelligence', 'interview': 'interview-experiences' }

interface Assignment {
  id: string
  slug: string
  title: string
  description: string
  maison: string
  location: string
  city: string
  country: string
  region: string
  seniority: string
  contract_type: string
  salary_display: string
  is_confidential: boolean
  activated_at: string
}

interface Salary {
  id: string
  brand_name: string
  brand_slug: string
  job_title: string
  department: string
  seniority: string
  city: string
  country: string
  currency: string
  salary_min: number
  salary_max: number
  salary_median: number
}

interface Interview {
  id: string
  brand_name: string
  brand_slug: string
  job_title: string
  department: string
  seniority: string
  location: string
  interview_year: number
  number_of_rounds: number
  interview_format: string
  difficulty: number
  overall_experience: string
  outcome: string
}

interface CareersClientProps {
  assignments: Assignment[]
  salaries: Salary[]
  interviews: Interview[]
}

export default function CareersClient({
  assignments,
  salaries,
  interviews,
}: CareersClientProps) {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') || ''
  const activeTab = TAB_SLUG_MAP[tabParam] || 'assignments'
  const [salarySubTab, setSalarySubTab] = useState('browse')

  // Reset salary sub-tab when switching to salary tab
  useEffect(() => { if (activeTab === 'salary') setSalarySubTab('browse') }, [activeTab])

  // Contribution points state
  const [contributionPoints, setContributionPoints] = useState(0)
  const [isLoadingPoints, setIsLoadingPoints] = useState(true)

  // Salary filters
  const [salarySearch, setSalarySearch] = useState('')
  const [salaryBrand, setSalaryBrand] = useState('all')
  const [salaryDept, setSalaryDept] = useState('all')
  const [salaryLevel, setSalaryLevel] = useState('all')
  const [salaryCity, setSalaryCity] = useState('all')
  const [salaryCurrency, setSalaryCurrency] = useState('all')

  // Interview filters
  const [interviewSearch, setInterviewSearch] = useState('')
  const [interviewBrand, setInterviewBrand] = useState('all')
  const [interviewDept, setInterviewDept] = useState('all')
  const [interviewLevel, setInterviewLevel] = useState('all')
  const [interviewYear, setInterviewYear] = useState('all')
  const [interviewDifficulty, setInterviewDifficulty] = useState('all')

  // Interview detail modal
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [interviewDetail, setInterviewDetail] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Benchmark form
  const [benchmarkForm, setBenchmarkForm] = useState({
    job_title: '',
    city: '',
    department: '',
    seniority: '',
    brand: '',
    current_salary: '',
  })
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null)
  const [loadingBenchmark, setLoadingBenchmark] = useState(false)

  // Compare form
  const [compareForm, setCompareForm] = useState({
    job_title: '',
    department: '',
    compare_by: 'city',
    seniority: '',
    locations: '',
  })
  const [compareResults, setCompareResults] = useState<any>(null)
  const [loadingCompare, setLoadingCompare] = useState(false)

  // Calculator form
  const [calculatorForm, setCalculatorForm] = useState({
    job_title: '',
    city: '',
    department: '',
    seniority: '',
    years_experience: '',
    brand: '',
    education: '',
    languages: '',
  })
  const [calculatorResults, setCalculatorResults] = useState<any>(null)
  const [loadingCalculator, setLoadingCalculator] = useState(false)

  // Fetch contribution points
  useEffect(() => {
    if (session?.user) {
      fetch('/api/contributions/my-points')
        .then(res => res.json())
        .then(data => {
          setContributionPoints(data.points || 0)
          setIsLoadingPoints(false)
        })
        .catch(() => setIsLoadingPoints(false))
    } else {
      setIsLoadingPoints(false)
    }
  }, [session])

  // Calculate access level based on points
  const getAccessLevel = () => {
    if (contributionPoints >= 50) return 'full'
    if (contributionPoints >= 25) return 'premium'
    if (contributionPoints >= 10) return 'standard'
    return 'basic'
  }

  const accessLevel = getAccessLevel()
  const canAccessBenchmark = true
  const canAccessCompare = true
  const canAccessCalculator = true

  // Filter salaries
  const filteredSalaries = salaries.filter(s => {
    if (salarySearch && !s.job_title.toLowerCase().includes(salarySearch.toLowerCase()) && !s.brand_name.toLowerCase().includes(salarySearch.toLowerCase())) return false
    if (salaryBrand !== 'all' && s.brand_slug !== salaryBrand) return false
    if (salaryDept !== 'all' && s.department !== salaryDept) return false
    if (salaryLevel !== 'all' && s.seniority !== salaryLevel) return false
    if (salaryCity !== 'all' && s.city !== salaryCity) return false
    if (salaryCurrency !== 'all' && s.currency !== salaryCurrency) return false
    return true
  })

  // Filter interviews
  const filteredInterviews = interviews.filter(i => {
    if (interviewSearch && !i.brand_name.toLowerCase().includes(interviewSearch.toLowerCase()) && !i.job_title.toLowerCase().includes(interviewSearch.toLowerCase())) return false
    if (interviewBrand !== 'all' && i.brand_slug !== interviewBrand) return false
    if (interviewDept !== 'all' && i.department !== interviewDept) return false
    if (interviewLevel !== 'all' && i.seniority !== interviewLevel) return false
    if (interviewYear !== 'all' && String(i.interview_year) !== interviewYear) return false
    if (interviewDifficulty !== 'all' && String(i.difficulty) !== interviewDifficulty) return false
    return true
  })

  // Show only 2 salaries for basic access
  const visibleSalaries = accessLevel === 'basic' ? filteredSalaries.slice(0, 2) : filteredSalaries
  const blurredSalaries: typeof filteredSalaries = []

  // Handle benchmark submission
  const handleBenchmark = async () => {
    if (!benchmarkForm.job_title || !benchmarkForm.city) return
    setLoadingBenchmark(true)
    try {
      const res = await fetch('/api/luxai/salary-benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(benchmarkForm),
      })
      const data = await res.json()
      setBenchmarkResults(data)
    } catch (error) {
      console.error('Benchmark error:', error)
    }
    setLoadingBenchmark(false)
  }

  // Handle compare submission
  const handleCompare = async () => {
    if (!compareForm.job_title || !compareForm.locations) return
    setLoadingCompare(true)
    try {
      const res = await fetch('/api/luxai/salary-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compareForm),
      })
      const data = await res.json()
      setCompareResults(data)
    } catch (error) {
      console.error('Compare error:', error)
    }
    setLoadingCompare(false)
  }

  // Handle calculator submission
  const handleCalculator = async () => {
    if (!calculatorForm.job_title || !calculatorForm.city) return
    setLoadingCalculator(true)
    try {
      const res = await fetch('/api/luxai/salary-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculatorForm),
      })
      const data = await res.json()
      setCalculatorResults(data)
    } catch (error) {
      console.error('Calculator error:', error)
    }
    setLoadingCalculator(false)
  }

  // Handle interview detail view
  const handleViewInterview = async (interview: Interview) => {
    if (!session) return
    setSelectedInterview(interview)
    setLoadingDetail(true)
    try {
      const res = await fetch('/api/luxai/interview-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interview_id: interview.id }),
      })
      const data = await res.json()
      setInterviewDetail(data)
    } catch (error) {
      console.error('Interview detail error:', error)
    }
    setLoadingDetail(false)
  }

  // Extract unique filter options
  const uniqueBrands = Array.from(new Set(salaries.map(s => s.brand_slug)))
  const uniqueDepts = Array.from(new Set(salaries.map(s => s.department)))
  const uniqueLevels = Array.from(new Set(salaries.map(s => s.seniority)))
  const uniqueCities = Array.from(new Set(salaries.map(s => s.city)))
  const uniqueCurrencies = Array.from(new Set(salaries.map(s => s.currency)))

  const uniqueInterviewBrands = Array.from(new Set(interviews.map(i => i.brand_slug)))
  const uniqueInterviewDepts = Array.from(new Set(interviews.map(i => i.department)))
  const uniqueInterviewLevels = Array.from(new Set(interviews.map(i => i.seniority)))
  const uniqueInterviewYears = Array.from(new Set(interviews.map(i => String(i.interview_year))))

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-7 pt-10 pb-16">
        <h1 className="text-4xl font-normal text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Careers
        </h1>
        <p className="text-sm text-[#999] mb-1.5">
          Confidential opportunities, salary intelligence, and interview preparation
        </p>
        <p className="text-[11px] text-[#777] mb-6">Real career experiences combined with structured intelligence.</p>

        {/* Main Tabs */}
        <div className="flex border-b border-[#2a2a2a] mb-8 gap-0">
          {[
            { id: 'assignments', label: 'Assignments', count: String(assignments.length) },
            { id: 'salary', label: 'Salary intelligence', count: `${salaries.length} data points` },
            { id: 'interview', label: 'Interview prep', count: `${interviews.length} experiences` },
          ].map(tab => {
            const tabSlug = TAB_TO_SLUG[tab.id]
            const href = tabSlug ? `/careers?tab=${tabSlug}` : '/careers'
            return (
              <Link
                key={tab.id}
                href={href}
                scroll={false}
                className="pb-3 mr-8 text-sm relative transition-colors whitespace-nowrap"
                style={{ color: activeTab === tab.id ? '#fff' : '#555' }}
              >
                {tab.label}
                <span className="text-[11px] ml-1" style={{ color: '#444' }}>{tab.count}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1D9E75]" />
                )}
              </Link>
            )
          })}
        </div>

        {/* TAB 1: ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div>
            {/* Info banner */}
            <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-4 flex items-start gap-4 mb-6">
              <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-base flex-shrink-0">🔒</div>
              <p className="text-xs text-[#999] leading-relaxed">
                <span className="text-[#ccc] font-medium">These are exclusive JOBLUX search assignments.</span> Brand names are disclosed after initial screening to protect the confidentiality of all parties. Every role is verified, active, and at manager level or above.
              </p>
            </div>

            {/* Assignment cards */}
            <div className="space-y-3">
              {assignments.map(a => {
                const isNew = a.activated_at && (Date.now() - new Date(a.activated_at).getTime()) < 7 * 24 * 3600000
                const displayMaison = a.is_confidential ? null : a.maison
                const locationStr = a.location || [a.city, a.country].filter(Boolean).join(', ')
                return (
                  <Link key={a.id} href={`/careers/${a.slug || a.id}`} className="block">
                    <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {a.seniority && <span className="text-[10px] font-bold tracking-[1.5px] text-[#fff]">{a.seniority.toUpperCase()}</span>}
                          {isNew && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-[#1D9E75] text-[#1D9E75]" style={{ background: 'rgba(29,158,117,0.08)' }}>
                              NEW
                            </span>
                          )}
                        </div>
                        {a.salary_display && (
                          <div className="text-sm font-medium text-[#fff]">{a.salary_display}</div>
                        )}
                      </div>
                      <h3 className="text-base font-medium text-white mb-2 leading-snug">{a.title}</h3>
                      {displayMaison && displayMaison !== 'Confidential' && <p className="text-xs text-[#999] mb-1">{displayMaison}</p>}
                      {a.description && <p className="text-sm text-[#999] leading-relaxed mb-3 line-clamp-2">{a.description}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        {locationStr && <span className="text-[11px] text-[#999]">{locationStr}</span>}
                        {a.contract_type && (
                          <>
                            <span className="text-[11px] text-[#777]">·</span>
                            <span className="text-[11px] text-[#999] capitalize">{a.contract_type}</span>
                          </>
                        )}
                        {a.region && (
                          <>
                            <span className="text-[11px] text-[#777]">·</span>
                            <span className="text-[11px] text-[#999]">{a.region}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SALARY INTELLIGENCE */}
        {activeTab === 'salary' && (
          <div>
            <p className="text-[11px] text-[#777] mb-4">Modeled compensation refined with vetted market inputs.</p>
            {/* Sub-tabs */}
            <div className="flex gap-0 border-b border-[#2a2a2a] mb-5">
              {[
                { id: 'browse', label: 'Browse', locked: false, points: 0 },
                { id: 'benchmark', label: 'Benchmark', locked: !canAccessBenchmark, points: 10 },
                { id: 'compare', label: 'Compare', locked: !canAccessCompare, points: 25 },
                { id: 'calculator', label: 'Calculator', locked: !canAccessCalculator, points: 50 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => !tab.locked && setSalarySubTab(tab.id)}
                  className="pb-2.5 mr-5 text-[13px] relative transition-colors whitespace-nowrap flex items-center gap-1.5"
                  style={{ color: salarySubTab === tab.id ? '#fff' : '#666', cursor: tab.locked ? 'not-allowed' : 'pointer' }}
                >
                  {tab.locked && (
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  )}
                  {tab.label}
                  {tab.locked && <span className="text-[10px] text-[#777]">{tab.points}pts</span>}
                  {salarySubTab === tab.id && !tab.locked && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1D9E75]" />
                  )}
                </button>
              ))}
            </div>

            {/* BROWSE */}
            {salarySubTab === 'browse' && (
              <>
                {/* Stats */}
                <div className="flex gap-6 items-center text-xs text-[#777] uppercase tracking-wide mb-5">
                  <span>{salaries.length} data points</span>
                  <span className="text-[#777]">·</span>
                  <span>{uniqueBrands.length} maisons</span>
                  <span className="text-[#777]">·</span>
                  <span>{uniqueCities.length} cities</span>
                </div>

                <div className="grid grid-cols-[1fr_320px] gap-8">
                  <div>
                    {/* Filters */}
                    <div className="flex gap-2 mb-5">
                      <div className="relative flex-1">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 stroke-[#666]" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input
                          type="text"
                          placeholder="Search by role, brand, or city..."
                          value={salarySearch}
                          onChange={e => setSalarySearch(e.target.value)}
                          className="w-full bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 pl-10 pr-3.5 text-white placeholder-[#666] outline-none focus:border-[#1D9E75]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mb-5 flex-wrap">
                      <select value={salaryBrand} onChange={e => setSalaryBrand(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 px-3.5 text-white outline-none focus:border-[#1D9E75]">
                        <option value="all">All Brands</option>
                        {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <select value={salaryDept} onChange={e => setSalaryDept(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 px-3.5 text-white outline-none focus:border-[#1D9E75]">
                        <option value="all">All Departments</option>
                        {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select value={salaryLevel} onChange={e => setSalaryLevel(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 px-3.5 text-white outline-none focus:border-[#1D9E75]">
                        <option value="all">All Levels</option>
                        {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <select value={salaryCity} onChange={e => setSalaryCity(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 px-3.5 text-white outline-none focus:border-[#1D9E75]">
                        <option value="all">All Cities</option>
                        {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={salaryCurrency} onChange={e => setSalaryCurrency(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 px-3.5 text-white outline-none focus:border-[#1D9E75]">
                        <option value="all">All Currencies</option>
                        {uniqueCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="text-xs text-[#777] mb-3">{filteredSalaries.length} entries</div>

                    {/* Cards grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {visibleSalaries.map(s => (
                        <div key={s.id} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-sm font-medium text-white mb-1">{s.job_title}</div>
                              <div className="text-xs text-[#999]">{s.brand_name}</div>
                            </div>
                            <div className="bg-[#2a2a2a] rounded px-2 py-1 text-[10px] text-[#999]">{s.seniority}</div>
                          </div>
                          <div className="text-[11px] text-[#777] mb-4">{s.city}, {s.country} · {s.department}</div>
                          <div className="flex justify-between items-center pt-3 border-t border-[#2a2a2a]">
                            <span className="text-xs text-[#777]">Range</span>
                            <span className="text-sm font-medium text-white">{s.currency}{s.salary_min / 1000}K–{s.salary_max / 1000}K</span>
                          </div>
                        </div>
                      ))}

                      {blurredSalaries.map(s => (
                        <div key={s.id} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 relative overflow-hidden">
                          <div className="absolute inset-0 backdrop-blur-sm bg-[rgba(34,34,34,0.6)] flex items-center justify-center z-10 rounded-xl">
                            <a href="/contribute" className="text-white text-xs flex items-center gap-2">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0110 0v4"/>
                              </svg>
                              Contribute to unlock
                            </a>
                          </div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-sm font-medium text-white mb-1">{s.job_title}</div>
                              <div className="text-xs text-[#999]">{s.brand_name}</div>
                            </div>
                            <div className="bg-[#2a2a2a] rounded px-2 py-1 text-[10px] text-[#999]">{s.seniority}</div>
                          </div>
                          <div className="text-[11px] text-[#777] mb-4">{s.city}, {s.country} · {s.department}</div>
                          <div className="flex justify-between items-center pt-3 border-t border-[#2a2a2a]">
                            <span className="text-xs text-[#777]">Range</span>
                            <span className="text-sm font-medium text-white">{s.currency}{s.salary_min / 1000}K–{s.salary_max / 1000}K</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div>
                    <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 mb-5">
                      <h3 className="text-lg font-normal mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Contribute Your Salary</h3>
                      <p className="text-xs text-[#999] leading-relaxed mb-4">Contribute your salary data | it takes one minute and strengthens the intelligence for everyone.</p>
                      <Link href="/contribute" className="block w-full bg-[#1D9E75] text-white text-[13px] font-semibold py-2.5 rounded-md text-center hover:bg-[#17855f] transition-colors">
                        Contribute
                      </Link>
                    </div>

                    <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 mb-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#999] mb-4">How It Works</h3>
                      <ol className="space-y-3">
                        {[
                          'AI-generated benchmarks from market data',
                          'Enriched with web research and industry reports',
                          'Verified by anonymous member contributions',
                          'Curated by the JOBLUX editorial team',
                        ].map((text, i) => (
                          <li key={i} className="flex gap-2.5 text-xs text-[#999] leading-relaxed">
                            <span className="text-[#777] font-semibold flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                            <span>{text}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#999] mb-4">Access Tiers</h3>
                      <div className="space-y-2 text-xs text-[#999] leading-relaxed">
                        <div><strong className="text-white">Basic (0pts):</strong> Browse 2 visible entries</div>
                        <div><strong className="text-white">Standard (10pts):</strong> Full browse + Benchmark</div>
                        <div><strong className="text-white">Premium (25pts):</strong> + Compare tool</div>
                        <div><strong className="text-white">Full (50pts):</strong> + Calculator</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* BENCHMARK */}
            {salarySubTab === 'benchmark' && (
              <div className="max-w-3xl">
                <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-8">
                  <h2 className="text-2xl font-normal mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Salary Benchmark</h2>
                  <p className="text-sm text-[#999] mb-6">See how your salary compares to the market.</p>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Job Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Store Director"
                        value={benchmarkForm.job_title}
                        onChange={e => setBenchmarkForm({ ...benchmarkForm, job_title: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">City *</label>
                      <select
                        value={benchmarkForm.city}
                        onChange={e => setBenchmarkForm({ ...benchmarkForm, city: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      >
                        <option value="">Select city</option>
                        {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Department</label>
                      <select
                        value={benchmarkForm.department}
                        onChange={e => setBenchmarkForm({ ...benchmarkForm, department: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      >
                        <option value="">Any</option>
                        {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Seniority</label>
                      <select
                        value={benchmarkForm.seniority}
                        onChange={e => setBenchmarkForm({ ...benchmarkForm, seniority: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      >
                        <option value="">Any</option>
                        {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Brand / Maison</label>
                      <input
                        type="text"
                        placeholder="e.g. Chanel"
                        value={benchmarkForm.brand}
                        onChange={e => setBenchmarkForm({ ...benchmarkForm, brand: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">My Current Salary (optional)</label>
                      <input
                        type="number"
                        placeholder="e.g. 65000"
                        value={benchmarkForm.current_salary}
                        onChange={e => setBenchmarkForm({ ...benchmarkForm, current_salary: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleBenchmark}
                    disabled={loadingBenchmark || !benchmarkForm.job_title || !benchmarkForm.city}
                    className="bg-[#1D9E75] text-white text-sm font-semibold py-3 px-8 rounded-md hover:bg-[#17855f] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {loadingBenchmark ? 'Generating...' : 'Get Benchmark'}
                  </button>

                  {benchmarkResults && (
                    <div className="mt-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                      <h3 className="text-base font-medium mb-4">Your Benchmark Results</h3>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-[#222] border border-[#2a2a2a] rounded-lg p-4 text-center">
                          <div className="text-[11px] text-[#777] uppercase tracking-wide mb-1.5">Market Median</div>
                          <div className="text-xl font-semibold text-white">{benchmarkResults.median}</div>
                        </div>
                        <div className="bg-[#222] border border-[#2a2a2a] rounded-lg p-4 text-center">
                          <div className="text-[11px] text-[#777] uppercase tracking-wide mb-1.5">Market Range</div>
                          <div className="text-xl font-semibold text-white">{benchmarkResults.range}</div>
                        </div>
                        <div className="bg-[#222] border border-[#2a2a2a] rounded-lg p-4 text-center">
                          <div className="text-[11px] text-[#777] uppercase tracking-wide mb-1.5">Your Position</div>
                          <div className="text-xl font-semibold text-white">{benchmarkResults.percentile}</div>
                        </div>
                      </div>
                      <p className="text-xs text-[#777] leading-relaxed">{benchmarkResults.analysis}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* COMPARE */}
            {salarySubTab === 'compare' && (
              <div className="max-w-3xl">
                <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-8">
                  <h2 className="text-2xl font-normal mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Compare Salaries</h2>
                  <p className="text-sm text-[#999] mb-6">Side-by-side comparison across cities or brands.</p>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Job Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Store Manager"
                        value={compareForm.job_title}
                        onChange={e => setCompareForm({ ...compareForm, job_title: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Department</label>
                      <select
                        value={compareForm.department}
                        onChange={e => setCompareForm({ ...compareForm, department: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      >
                        <option value="">Any</option>
                        {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Compare By</label>
                      <select
                        value={compareForm.compare_by}
                        onChange={e => setCompareForm({ ...compareForm, compare_by: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      >
                        <option value="city">City</option>
                        <option value="brand">Brand</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Seniority</label>
                      <select
                        value={compareForm.seniority}
                        onChange={e => setCompareForm({ ...compareForm, seniority: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      >
                        <option value="">Any</option>
                        {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Cities or Brands to Compare (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Paris, London, New York"
                        value={compareForm.locations}
                        onChange={e => setCompareForm({ ...compareForm, locations: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCompare}
                    disabled={loadingCompare || !compareForm.job_title || !compareForm.locations}
                    className="bg-[#1D9E75] text-white text-sm font-semibold py-3 px-8 rounded-md hover:bg-[#17855f] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {loadingCompare ? 'Generating...' : 'Compare'}
                  </button>

                  {compareResults && (
                    <div className="mt-6">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-[#2a2a2a]">
                            <th className="text-left text-xs font-medium text-[#999] uppercase tracking-wide pb-3 px-3">Location</th>
                            <th className="text-left text-xs font-medium text-[#999] uppercase tracking-wide pb-3 px-3">Median Salary</th>
                            <th className="text-left text-xs font-medium text-[#999] uppercase tracking-wide pb-3 px-3">Range</th>
                            <th className="text-left text-xs font-medium text-[#999] uppercase tracking-wide pb-3 px-3">Data Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {compareResults.comparisons?.map((row: any, i: number) => (
                            <tr key={i} className="border-b border-[#1e1e1e] hover:bg-[#2a2a2a]">
                              <td className="py-3 px-3 text-sm text-white">{row.location}</td>
                              <td className="py-3 px-3 text-sm text-white">{row.median}</td>
                              <td className="py-3 px-3 text-sm text-white">{row.range}</td>
                              <td className="py-3 px-3 text-sm text-white">{row.data_points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CALCULATOR */}
            {salarySubTab === 'calculator' && (
              <div className="max-w-3xl">
                <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-8">
                  <h2 className="text-2xl font-normal mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Salary Calculator</h2>
                  <p className="text-sm text-[#999] mb-6">Get a personalized salary estimate based on your profile.</p>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Job Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Store Director"
                        value={calculatorForm.job_title}
                        onChange={e => setCalculatorForm({ ...calculatorForm, job_title: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">City *</label>
                      <select
                        value={calculatorForm.city}
                        onChange={e => setCalculatorForm({ ...calculatorForm, city: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      >
                        <option value="">Select city</option>
                        {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Department *</label>
                      <select
                        value={calculatorForm.department}
                        onChange={e => setCalculatorForm({ ...calculatorForm, department: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      >
                        <option value="">Select department</option>
                        {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Seniority *</label>
                      <select
                        value={calculatorForm.seniority}
                        onChange={e => setCalculatorForm({ ...calculatorForm, seniority: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      >
                        <option value="">Select level</option>
                        {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Years of Experience</label>
                      <input
                        type="number"
                        placeholder="e.g. 8"
                        value={calculatorForm.years_experience}
                        onChange={e => setCalculatorForm({ ...calculatorForm, years_experience: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Brand / Maison</label>
                      <input
                        type="text"
                        placeholder="e.g. Hermès"
                        value={calculatorForm.brand}
                        onChange={e => setCalculatorForm({ ...calculatorForm, brand: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Education Level</label>
                      <select
                        value={calculatorForm.education}
                        onChange={e => setCalculatorForm({ ...calculatorForm, education: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      >
                        <option value="">Select</option>
                        <option value="bachelors">Bachelor's</option>
                        <option value="masters">Master's</option>
                        <option value="mba">MBA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#999] uppercase tracking-wide mb-1.5">Languages (count)</label>
                      <input
                        type="number"
                        placeholder="e.g. 3"
                        value={calculatorForm.languages}
                        onChange={e => setCalculatorForm({ ...calculatorForm, languages: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-sm py-2.5 px-3 text-white outline-none focus:border-[#1D9E75]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCalculator}
                    disabled={loadingCalculator || !calculatorForm.job_title || !calculatorForm.city}
                    className="bg-[#1D9E75] text-white text-sm font-semibold py-3 px-8 rounded-md hover:bg-[#17855f] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {loadingCalculator ? 'Calculating...' : 'Calculate'}
                  </button>

                  {calculatorResults && (
                    <div className="mt-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
                      <h3 className="text-base font-medium mb-4">Your Estimated Salary Range</h3>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-[#222] border border-[#2a2a2a] rounded-lg p-4 text-center">
                          <div className="text-[11px] text-[#777] uppercase tracking-wide mb-1.5">Low End</div>
                          <div className="text-xl font-semibold text-white">{calculatorResults.low}</div>
                        </div>
                        <div className="bg-[#222] border border-[#2a2a2a] rounded-lg p-4 text-center">
                          <div className="text-[11px] text-[#777] uppercase tracking-wide mb-1.5">Target</div>
                          <div className="text-xl font-semibold text-white">{calculatorResults.target}</div>
                        </div>
                        <div className="bg-[#222] border border-[#2a2a2a] rounded-lg p-4 text-center">
                          <div className="text-[11px] text-[#777] uppercase tracking-wide mb-1.5">High End</div>
                          <div className="text-xl font-semibold text-white">{calculatorResults.high}</div>
                        </div>
                      </div>
                      <p className="text-xs text-[#777] leading-relaxed">{calculatorResults.analysis}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INTERVIEW PREP */}
        {activeTab === 'interview' && (
          <div>
            {/* Stats */}
            <div className="flex gap-6 items-center text-xs text-[#777] uppercase tracking-wide mb-5">
              <span>{interviews.length} experiences</span>
              <span className="text-[#777]">·</span>
              <span>{uniqueInterviewBrands.length} maisons</span>
              <span className="text-[#777]">·</span>
              <span>Last updated March 2026</span>
            </div>

            <div className="grid grid-cols-[1fr_320px] gap-8">
              <div>
                {/* Filters */}
                <div className="flex gap-2 mb-5">
                  <div className="relative flex-1">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 stroke-[#666]" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search brand..."
                      value={interviewSearch}
                      onChange={e => setInterviewSearch(e.target.value)}
                      className="w-full bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 pl-10 pr-3.5 text-white placeholder-[#666] outline-none focus:border-[#1D9E75]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mb-5 flex-wrap">
                  <select value={interviewBrand} onChange={e => setInterviewBrand(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 px-3.5 text-white outline-none focus:border-[#1D9E75]">
                    <option value="all">All Maisons</option>
                    {uniqueInterviewBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <select value={interviewDept} onChange={e => setInterviewDept(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 px-3.5 text-white outline-none focus:border-[#1D9E75]">
                    <option value="all">All Departments</option>
                    {uniqueInterviewDepts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={interviewLevel} onChange={e => setInterviewLevel(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 px-3.5 text-white outline-none focus:border-[#1D9E75]">
                    <option value="all">All Levels</option>
                    {uniqueInterviewLevels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select value={interviewYear} onChange={e => setInterviewYear(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 px-3.5 text-white outline-none focus:border-[#1D9E75]">
                    <option value="all">All Years</option>
                    {uniqueInterviewYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select value={interviewDifficulty} onChange={e => setInterviewDifficulty(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[13px] py-2.5 px-3.5 text-white outline-none focus:border-[#1D9E75]">
                    <option value="all">All Difficulty</option>
                    {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="text-xs text-[#777] mb-3">{filteredInterviews.length} experiences</div>

                {/* Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {filteredInterviews.map(i => (
                    <div key={i.id} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-sm font-medium text-white mb-1">{i.brand_name}</div>
                          <div className="text-xs text-[#999]">{i.job_title}</div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(d => (
                            <div key={d} className={`w-2 h-2 rounded-full ${d <= i.difficulty ? 'bg-[#1D9E75]' : 'bg-[#2a2a2a]'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="text-[11px] text-[#777] mb-3">{i.department} · {i.seniority} · {i.location}</div>
                      <div className="flex gap-2 flex-wrap mb-4">
                        <span className="bg-[#2a2a2a] rounded px-2 py-1 text-[10px] text-[#999]">{i.interview_year}</span>
                        <span className="bg-[#2a2a2a] rounded px-2 py-1 text-[10px] text-[#999]">{i.number_of_rounds} rounds</span>
                        <span className="border border-[#2a2a2a] rounded px-2 py-1 text-[10px] text-[#777]">{i.interview_format}</span>
                      </div>
                      <div className="pt-3 border-t border-[#2a2a2a]">
                        {session ? (
                          <button
                            onClick={() => handleViewInterview(i)}
                            className="text-white text-xs hover:underline"
                          >
                            View Details →
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-[#777] text-xs">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2"/>
                              <path d="M7 11V7a5 5 0 0110 0v4"/>
                            </svg>
                            Sign in to unlock
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div>
                <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 mb-5">
                  <h3 className="text-lg font-normal mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Contribute Your Experience</h3>
                  <p className="text-xs text-[#999] leading-relaxed mb-4">Contribute your interview experience | it takes one minute and strengthens the intelligence for everyone.</p>
                  <Link href="/contribute" className="block w-full bg-[#1D9E75] text-white text-[13px] font-semibold py-2.5 rounded-md text-center hover:bg-[#17855f] transition-colors">
                    Contribute
                  </Link>
                </div>

                <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#999] mb-4">Top Interviewed Maisons</h3>
                  <div className="space-y-2 text-xs text-[#999]">
                    {uniqueInterviewBrands.slice(0, 5).map((b, i) => (
                      <div key={b}><span className="text-[#777] mr-2">{String(i + 1).padStart(2, '0')}</span>{b}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#999] mb-4">How It Works</h3>
                  <ol className="space-y-3">
                    {[
                      'Contribute your interview experience anonymously',
                      'Earn points upon approval by our team',
                      'Unlock detailed interview intelligence',
                    ].map((text, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-[#999] leading-relaxed">
                        <span className="text-[#777] font-semibold flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interview Detail Modal */}
        {selectedInterview && (
          <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 overflow-y-auto py-10 px-4">
            <div className="bg-[#1a1a1a] max-w-3xl w-full rounded-xl">
              <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex justify-between items-center rounded-t-xl">
                <h2 className="text-xl font-normal" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>{selectedInterview.brand_name}</h2>
                <button onClick={() => setSelectedInterview(null)} className="text-[#999] hover:text-white text-2xl leading-none">×</button>
              </div>

              {loadingDetail ? (
                <div className="p-10 text-center text-[#999]">Loading details...</div>
              ) : interviewDetail ? (
                <div className="p-6 space-y-4">
                  <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-6">
                    <div className="text-base text-[#999] mb-4">{selectedInterview.job_title}</div>
                    <div className="flex gap-6 flex-wrap text-xs text-[#777]">
                      <span>{selectedInterview.department}</span>
                      <span>{selectedInterview.seniority}</span>
                      <span>{selectedInterview.location}</span>
                      <span>{selectedInterview.interview_year}</span>
                      <span>{selectedInterview.number_of_rounds} rounds</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(d => (
                          <div key={d} className={`w-2 h-2 rounded-full ${d <= selectedInterview.difficulty ? 'bg-[#1D9E75]' : 'bg-[#2a2a2a]'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {interviewDetail.sections?.map((section: any, i: number) => (
                    <div key={i} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-6">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#999] mb-3">{section.title}</h3>
                      <div className="text-sm text-[#ccc] leading-relaxed whitespace-pre-line">{section.content}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
