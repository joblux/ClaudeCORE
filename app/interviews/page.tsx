'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useMember } from '@/lib/auth-hooks'
import { DEPARTMENTS, SENIORITY_LEVELS } from '@/lib/assignment-options'
import { DIFFICULTY_OPTIONS, DIFFICULTY_SCALE, EXPERIENCE_SENTIMENT, OUTCOME_LABELS } from '@/types/interview'
import type { InterviewExperienceListItem, InterviewStats } from '@/types/interview'

export default function InterviewsPage() {
  const { isAuthenticated } = useMember()
  const [experiences, setExperiences] = useState<InterviewExperienceListItem[]>([])
  const [stats, setStats] = useState<InterviewStats | null>(null)
  const [brands, setBrands] = useState<{ name: string; slug: string }[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 12

  // Filters
  const [filterBrand, setFilterBrand] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterSeniority, setFilterSeniority] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [brandSearch, setBrandSearch] = useState('')

  const hasFilters = filterBrand || filterDepartment || filterSeniority || filterYear || filterDifficulty

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))
    if (filterBrand) params.set('brand', filterBrand)
    if (filterDepartment) params.set('department', filterDepartment)
    if (filterSeniority) params.set('seniority', filterSeniority)
    if (filterYear) params.set('year', filterYear)
    if (filterDifficulty) params.set('difficulty', filterDifficulty)

    try {
      const res = await fetch(`/api/interviews?${params}`)
      const data = await res.json()
      setExperiences(data.experiences || [])
      setStats(data.stats || null)
      setBrands(data.brands || [])
      setTotal(data.total || 0)
    } catch {
      setExperiences([])
    } finally {
      setLoading(false)
    }
  }, [page, filterBrand, filterDepartment, filterSeniority, filterYear, filterDifficulty])

  useEffect(() => { fetchData() }, [fetchData])

  const clearFilters = () => {
    setFilterBrand('')
    setFilterDepartment('')
    setFilterSeniority('')
    setFilterYear('')
    setFilterDifficulty('')
    setBrandSearch('')
    setPage(1)
  }

  const totalPages = Math.ceil(total / limit)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  )

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#222222] py-16 md:py-24">
        <div className="jl-container text-center">
          <div className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#a58e28] mb-4">Interview Intelligence</div>
          <h1 className="font-['Playfair_Display'] text-4xl lg:text-5xl font-light text-white mb-5">
            Inside the Maisons
          </h1>
          <p className="font-sans text-sm lg:text-base font-normal text-[#bbb] max-w-2xl mx-auto leading-relaxed mb-8">
            Real interview experiences from luxury professionals. Contributed by members, anonymised for your benefit.
          </p>
          {stats && stats.total_experiences > 0 && (
            <div className="flex items-center justify-center gap-4 text-xs text-[#999] tracking-wide uppercase">
              <span>{stats.total_experiences} experience{stats.total_experiences !== 1 ? 's' : ''}</span>
              <span className="text-[#a58e28]">&middot;</span>
              <span>{stats.unique_brands} maison{stats.unique_brands !== 1 ? 's' : ''}</span>
              <span className="text-[#a58e28]">&middot;</span>
              <span>Updated {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#e8e2d8]">
        <div className="jl-container py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Brand filter with search */}
            <div className="relative">
              <select
                value={filterBrand}
                onChange={(e) => { setFilterBrand(e.target.value); setPage(1) }}
                className="jl-select text-xs min-w-[160px]"
              >
                <option value="">All Maisons</option>
                {brands.map(b => (
                  <option key={b.slug} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </div>

            <select
              value={filterDepartment}
              onChange={(e) => { setFilterDepartment(e.target.value); setPage(1) }}
              className="jl-select text-xs min-w-[150px]"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={filterSeniority}
              onChange={(e) => { setFilterSeniority(e.target.value); setPage(1) }}
              className="jl-select text-xs min-w-[150px]"
            >
              <option value="">All Levels</option>
              {SENIORITY_LEVELS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => { setFilterYear(e.target.value); setPage(1) }}
              className="jl-select text-xs min-w-[100px]"
            >
              <option value="">All Years</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => { setFilterDifficulty(e.target.value); setPage(1) }}
              className="jl-select text-xs min-w-[130px]"
            >
              <option value="">All Difficulty</option>
              {DIFFICULTY_OPTIONS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors tracking-wide uppercase"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Active filter badges */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filterBrand && (
                <span className="jl-badge-outline text-[0.65rem]">
                  {brands.find(b => b.slug === filterBrand)?.name || filterBrand}
                  <button onClick={() => { setFilterBrand(''); setPage(1) }} className="ml-1.5 text-[#999]">&times;</button>
                </span>
              )}
              {filterDepartment && (
                <span className="jl-badge-outline text-[0.65rem]">
                  {filterDepartment}
                  <button onClick={() => { setFilterDepartment(''); setPage(1) }} className="ml-1.5 text-[#999]">&times;</button>
                </span>
              )}
              {filterSeniority && (
                <span className="jl-badge-outline text-[0.65rem]">
                  {filterSeniority}
                  <button onClick={() => { setFilterSeniority(''); setPage(1) }} className="ml-1.5 text-[#999]">&times;</button>
                </span>
              )}
              {filterYear && (
                <span className="jl-badge-outline text-[0.65rem]">
                  {filterYear}
                  <button onClick={() => { setFilterYear(''); setPage(1) }} className="ml-1.5 text-[#999]">&times;</button>
                </span>
              )}
              {filterDifficulty && (
                <span className="jl-badge-outline text-[0.65rem]">
                  {filterDifficulty}
                  <button onClick={() => { setFilterDifficulty(''); setPage(1) }} className="ml-1.5 text-[#999]">&times;</button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="jl-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Results area — 3 cols */}
          <div className="lg:col-span-3">
            {loading ? (
              <LoadingSkeleton />
            ) : stats && stats.total_experiences === 0 ? (
              <EmptyStateLaunch />
            ) : experiences.length === 0 && hasFilters ? (
              <div className="text-center py-16">
                <p className="text-lg lg:text-xl font-medium text-[#1a1a1a] mb-2">No matching experiences</p>
                <p className="text-sm text-[#888] mb-4">Try adjusting your filters</p>
                <button onClick={clearFilters} className="jl-btn-outline">Clear filters</button>
              </div>
            ) : (
              <>
                <div className="text-xs text-[#888] mb-4 tracking-wide">
                  {total} experience{total !== 1 ? 's' : ''}
                  {hasFilters ? ' matching your filters' : ''}
                </div>

                {/* Show limited items for unauthenticated users */}
                {!isAuthenticated ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {experiences.slice(0, 3).map((exp) => (
                        <ExperienceCard key={exp.id} exp={exp} isAuthenticated={false} />
                      ))}
                    </div>

                    {/* Teaser wall */}
                    <div className="relative mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 blur-sm opacity-30 pointer-events-none">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="border border-[#e8e2d8] rounded p-5 bg-white">
                            <div className="h-4 bg-[#e8e2d8] rounded w-1/3 mb-3" />
                            <div className="h-5 bg-[#e8e2d8] rounded w-2/3 mb-2" />
                            <div className="h-3 bg-[#e8e2d8] rounded w-1/2 mb-3" />
                            <div className="flex gap-2 mb-3">
                              <div className="h-5 bg-[#e8e2d8] rounded w-12" />
                              <div className="h-5 bg-[#e8e2d8] rounded w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white via-white/90 to-transparent">
                        <div className="text-center max-w-lg px-6">
                          <h2 className="font-['Playfair_Display'] text-2xl lg:text-3xl font-light text-[#1a1a1a] mb-3">
                            Sign in to access all interview experiences from {stats?.unique_brands || 12} major luxury houses
                          </h2>
                          <p className="text-sm text-[#888] mb-6">
                            Get real insider knowledge about interview processes, questions asked, and hiring outcomes.
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            <Link href="/join" className="px-6 py-3 bg-[#a58e28] text-white text-sm font-semibold tracking-wider uppercase rounded-md hover:bg-[#8a7622] transition-colors">
                              Join
                            </Link>
                            <Link href="/members" className="px-6 py-3 border border-[#a58e28] text-[#a58e28] text-sm font-semibold tracking-wider uppercase rounded-md hover:bg-[#a58e28] hover:text-white transition-colors">
                              Sign In
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {experiences.map((exp) => (
                        <ExperienceCard key={exp.id} exp={exp} isAuthenticated={isAuthenticated} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-10">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="jl-btn text-xs disabled:opacity-30"
                        >
                          Previous
                        </button>
                        <span className="text-xs text-[#888] px-4">
                          Page {page} of {totalPages}
                        </span>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="jl-btn text-xs disabled:opacity-30"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Sidebar — 1 col (desktop only) */}
          <aside className="hidden lg:block space-y-6">
            {/* Top Maisons */}
            {brands.length > 0 && (
              <div className="jl-card">
                <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-4">
                  Top Interviewed Maisons
                </h3>
                <ul className="space-y-2">
                  {brands.slice(0, 8).map((b, i) => (
                    <li key={b.slug}>
                      <Link
                        href={`/interviews/${b.slug}`}
                        className="flex items-center gap-2 text-sm text-[#555] hover:text-[#a58e28] transition-colors"
                      >
                        <span className="text-xs text-[#ccc] w-5">{String(i + 1).padStart(2, '0')}</span>
                        {b.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contribute CTA */}
            <div className="jl-card border-[#a58e28]">
              <h3 className="text-lg lg:text-xl font-medium text-[#1a1a1a] mb-2">Share Your Experience</h3>
              <p className="text-xs text-[#888] leading-relaxed mb-4">
                Contribute your interview experience and earn 10 points towards unlocking more intelligence.
              </p>
              <Link href="/contribute" className="jl-btn-gold w-full text-center">
                Contribute
              </Link>
            </div>

            {/* How It Works */}
            <div className="jl-card">
              <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-4">
                How It Works
              </h3>
              <ol className="space-y-3 text-xs text-[#666] leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-[#a58e28] font-semibold flex-shrink-0">01</span>
                  Contribute your interview experience anonymously
                </li>
                <li className="flex gap-2">
                  <span className="text-[#a58e28] font-semibold flex-shrink-0">02</span>
                  Earn points upon approval by our team
                </li>
                <li className="flex gap-2">
                  <span className="text-[#a58e28] font-semibold flex-shrink-0">03</span>
                  Unlock detailed interview intelligence
                </li>
              </ol>
            </div>

            {/* Salary cross-link */}
            <div className="jl-card bg-[#fafaf5] border-[#e8e2d8]">
              <p className="text-xs text-[#888] mb-2">Wondering about compensation?</p>
              <a href="/salaries" className="text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors tracking-wide">
                See Salary Intelligence &rarr;
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function DifficultyDots({ difficulty }: { difficulty: string | null }) {
  const level = difficulty ? (DIFFICULTY_SCALE[difficulty] || 0) : 0
  return (
    <div className="flex gap-0.5" title={difficulty || 'Unknown'}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: i <= level ? '#a58e28' : '#e8e2d8' }}
        />
      ))}
    </div>
  )
}

function ExperienceCard({ exp, isAuthenticated }: { exp: InterviewExperienceListItem; isAuthenticated: boolean }) {
  const sentiment = exp.overall_experience ? EXPERIENCE_SENTIMENT[exp.overall_experience] : null
  const outcomeLabel = exp.outcome ? OUTCOME_LABELS[exp.outcome] || exp.outcome : null

  return (
    <div className="jl-card group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <Link
            href={`/interviews/${exp.brand_slug}`}
            className="text-sm font-semibold text-[#1a1a1a] hover:text-[#a58e28] transition-colors"
          >
            {exp.brand_name}
          </Link>
        </div>
        <DifficultyDots difficulty={exp.difficulty} />
      </div>

      <h3 className="text-base font-medium text-[#1a1a1a] mb-2">{exp.job_title}</h3>

      <div className="flex flex-wrap gap-1.5 text-[0.65rem] text-[#888] mb-3">
        {exp.department && <span>{exp.department}</span>}
        {exp.department && exp.seniority && <span>&middot;</span>}
        {exp.seniority && <span>{exp.seniority}</span>}
        {(exp.department || exp.seniority) && exp.location && <span>&middot;</span>}
        {exp.location && <span>{exp.location}</span>}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {exp.interview_year && (
          <span className="jl-badge text-[0.6rem]">{exp.interview_year}</span>
        )}
        {exp.number_of_rounds && (
          <span className="jl-badge text-[0.6rem]">{exp.number_of_rounds} round{exp.number_of_rounds !== 1 ? 's' : ''}</span>
        )}
        {exp.interview_format && (
          <span className="jl-badge-outline text-[0.6rem]">{exp.interview_format}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        {sentiment && (
          <span
            className="text-[0.6rem] font-medium px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: sentiment.color + '15', color: sentiment.color }}
          >
            {sentiment.label}
          </span>
        )}
        {outcomeLabel && (
          <span className="text-[0.6rem] text-[#888]">{outcomeLabel}</span>
        )}
      </div>

      <div className="border-t border-[#f0ece4] pt-3 flex items-center justify-between">
        {isAuthenticated ? (
          <Link
            href={`/interviews/${exp.brand_slug}?detail=${exp.id}`}
            className="text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors tracking-wide"
          >
            View Details &rarr;
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-[#999]">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <Link href="/contribute" className="hover:text-[#a58e28] transition-colors">
              Contribute to unlock details
            </Link>
          </span>
        )}
        <span className="text-[0.6rem] text-[#ccc]">
          {new Date(exp.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="jl-card animate-pulse">
          <div className="h-4 bg-[#f0ece4] rounded w-1/3 mb-3" />
          <div className="h-5 bg-[#f0ece4] rounded w-2/3 mb-2" />
          <div className="h-3 bg-[#f0ece4] rounded w-1/2 mb-3" />
          <div className="flex gap-2 mb-3">
            <div className="h-5 bg-[#f0ece4] rounded w-12" />
            <div className="h-5 bg-[#f0ece4] rounded w-16" />
          </div>
          <div className="border-t border-[#f0ece4] pt-3">
            <div className="h-3 bg-[#f0ece4] rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyStateLaunch() {
  return (
    <div className="text-center py-16">
      <div className="max-w-lg mx-auto">
        <div className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#a58e28] mb-4">Coming Soon</div>
        <h2 className="font-['Playfair_Display'] text-2xl lg:text-3xl font-light text-[#1a1a1a] mb-4">
          Interview Intelligence is launching
        </h2>
        <p className="text-sm text-[#888] leading-relaxed mb-8">
          Be the first to contribute your interview experience at a luxury maison and help build the most valuable intelligence resource for the community.
        </p>
        <Link href="/contribute" className="jl-btn-primary">
          Share Your Experience
        </Link>

        {/* Preview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          {[
            { brand: 'Louis Vuitton', role: 'Retail Director', dept: 'Retail · Senior', rounds: 4, diff: 3 },
            { brand: 'Chanel', role: 'Marketing Manager', dept: 'Marketing · Mid-level', rounds: 3, diff: 2 },
            { brand: 'Hermès', role: 'Store Manager', dept: 'Store Operations · Senior', rounds: 5, diff: 4 },
            { brand: 'Dior', role: 'Visual Merchandiser', dept: 'Visual Merchandising · Mid-level', rounds: 2, diff: 2 },
          ].map((preview, i) => (
            <div key={i} className="jl-card relative overflow-hidden select-none">
              <div className="absolute inset-0 backdrop-blur-sm bg-white/60 z-10 flex items-center justify-center">
                <span className="text-xs text-[#a58e28] tracking-wide uppercase font-medium">Preview</span>
              </div>
              <div className="text-sm font-semibold text-[#1a1a1a] mb-1">{preview.brand}</div>
              <div className="text-base font-medium text-[#1a1a1a] mb-2">{preview.role}</div>
              <div className="text-[0.65rem] text-[#888] mb-3">{preview.dept}</div>
              <div className="flex gap-2 mb-2">
                <span className="jl-badge text-[0.6rem]">{preview.rounds} rounds</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(j => (
                  <span
                    key={j}
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: j <= preview.diff ? '#a58e28' : '#e8e2d8' }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
