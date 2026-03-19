'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { DEPARTMENTS, SENIORITY_LEVELS, CONTRACT_TYPES, REMOTE_POLICIES, CURRENCY_SYMBOLS } from '@/lib/job-brief-options'
import type { JobBrief } from '@/types/job-brief'

/** Format a salary number to a readable string (e.g. 120000 → "120K") */
function formatSalary(amount: number): string {
  if (amount >= 1000) return `${Math.round(amount / 1000)}K`
  return String(amount)
}

/** Get relative "Posted X days ago" text */
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const now = new Date()
  const posted = new Date(dateStr)
  const diffMs = now.getTime() - posted.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Posted today'
  if (days === 1) return 'Posted yesterday'
  if (days < 30) return `Posted ${days} days ago`
  const months = Math.floor(days / 30)
  return `Posted ${months} ${months === 1 ? 'month' : 'months'} ago`
}

/** Build salary display string */
function salaryDisplay(brief: JobBrief): string | null {
  if (brief.salary_display !== 'true') return null
  if (!brief.salary_min && !brief.salary_max) return null
  const sym = CURRENCY_SYMBOLS[brief.salary_currency || 'EUR'] || brief.salary_currency || ''
  if (brief.salary_min && brief.salary_max) {
    return `${sym}${formatSalary(brief.salary_min)}–${sym}${formatSalary(brief.salary_max)}`
  }
  if (brief.salary_min) return `From ${sym}${formatSalary(brief.salary_min)}`
  if (brief.salary_max) return `Up to ${sym}${formatSalary(brief.salary_max)}`
  return null
}

export default function JobsPage() {
  const [briefs, setBriefs] = useState<JobBrief[]>([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [seniorityFilter, setSeniorityFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [contractFilter, setContractFilter] = useState('')
  const [remoteFilter, setRemoteFilter] = useState('')

  // Fetch all published briefs once on mount
  useEffect(() => {
    fetch('/api/briefs?limit=100')
      .then((res) => res.json())
      .then((data) => setBriefs(data.briefs || []))
      .catch(() => setBriefs([]))
      .finally(() => setLoading(false))
  }, [])

  // Get unique locations from briefs for the filter dropdown
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>()
    briefs.forEach((b) => {
      if (b.city) locs.add(b.city)
    })
    return Array.from(locs).sort()
  }, [briefs])

  // Client-side filtering
  const filtered = useMemo(() => {
    return briefs.filter((b) => {
      // Search — match title, maison, or city
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const match =
          (b.title || '').toLowerCase().includes(q) ||
          (b.maison || '').toLowerCase().includes(q) ||
          (b.city || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (deptFilter && b.department !== deptFilter) return false
      if (seniorityFilter && b.seniority !== seniorityFilter) return false
      if (locationFilter && b.city !== locationFilter) return false
      if (contractFilter && b.contract_type !== contractFilter) return false
      if (remoteFilter && b.remote_policy !== remoteFilter) return false
      return true
    })
  }, [briefs, searchQuery, deptFilter, seniorityFilter, locationFilter, contractFilter, remoteFilter])

  return (
    <div>
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Current Openings</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
            Job Briefs
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-xl">
            Confidential and exclusive assignments across luxury. All positions are handled with full discretion by the JOBLUX team.
          </p>
        </div>
      </div>

      <div className="jl-container py-10">
        {/* ── Filter bar ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {/* Search */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-6">
            <input
              type="text"
              className="jl-input w-full"
              placeholder="Search by title, maison, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Department */}
          <select className="jl-input" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Seniority */}
          <select className="jl-input" value={seniorityFilter} onChange={(e) => setSeniorityFilter(e.target.value)}>
            <option value="">All Seniority</option>
            {SENIORITY_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Location */}
          <select className="jl-input" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="">All Locations</option>
            {uniqueLocations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>

          {/* Contract Type */}
          <select className="jl-input" value={contractFilter} onChange={(e) => setContractFilter(e.target.value)}>
            <option value="">All Contract Types</option>
            {CONTRACT_TYPES.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
          </select>

          {/* Remote Policy */}
          <select className="jl-input" value={remoteFilter} onChange={(e) => setRemoteFilter(e.target.value)}>
            <option value="">All Work Models</option>
            {REMOTE_POLICIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Clear filters */}
          {(searchQuery || deptFilter || seniorityFilter || locationFilter || contractFilter || remoteFilter) && (
            <button
              onClick={() => {
                setSearchQuery(''); setDeptFilter(''); setSeniorityFilter('')
                setLocationFilter(''); setContractFilter(''); setRemoteFilter('')
              }}
              className="text-xs text-[#a58e28] underline cursor-pointer bg-transparent border-none"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* ── Results count ──────────────────────────────────────── */}
        <div className="jl-section-label mb-6">
          <span>
            {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'Position' : 'Positions'}`}
          </span>
        </div>

        {/* ── Job cards ──────────────────────────────────────────── */}
        {loading ? (
          <p className="text-sm text-[#888] text-center py-10">Loading positions...</p>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16 px-6">
            <p className="jl-serif text-xl text-[#1a1a1a] mb-3">No current openings match your criteria.</p>
            <p className="text-sm text-[#888] mb-6">
              Check back soon or join JOBLUX to be notified of new opportunities.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/join" className="jl-btn jl-btn-primary">Join JOBLUX</Link>
              <button
                onClick={() => {
                  setSearchQuery(''); setDeptFilter(''); setSeniorityFilter('')
                  setLocationFilter(''); setContractFilter(''); setRemoteFilter('')
                }}
                className="jl-btn jl-btn-outline"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((brief) => {
              const salary = salaryDisplay(brief)
              const displayMaison = brief.is_confidential
                ? 'Confidential — Leading Luxury Maison'
                : brief.maison

              return (
                <Link
                  key={brief.id}
                  href={`/jobs/${brief.slug || brief.id}`}
                  className="block"
                >
                  <div className="jl-card group cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Maison name */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="jl-overline-gold">{displayMaison}</span>
                          {brief.is_confidential && (
                            <span className="jl-badge text-[0.55rem]">Confidential</span>
                          )}
                        </div>

                        {/* Job title */}
                        <h3 className="jl-serif text-lg font-light text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors">
                          {brief.title}
                        </h3>

                        {/* Details row */}
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          {/* Location */}
                          {(brief.city || brief.country) && (
                            <span className="font-sans text-xs text-[#888]">
                              {[brief.city, brief.country].filter(Boolean).join(', ')}
                            </span>
                          )}

                          {/* Remote policy badge */}
                          {brief.remote_policy && (
                            <span className="jl-badge-outline text-[0.55rem]">{brief.remote_policy}</span>
                          )}

                          {/* Department badge */}
                          {brief.department && (
                            <span className="jl-badge text-[0.55rem]">{brief.department}</span>
                          )}

                          {/* Seniority badge */}
                          {brief.seniority && (
                            <span className="jl-badge-outline text-[0.55rem]">{brief.seniority}</span>
                          )}

                          {/* Contract type */}
                          {brief.contract_type && (
                            <span className="font-sans text-xs text-[#888]">{brief.contract_type}</span>
                          )}
                        </div>

                        {/* Salary + posted date */}
                        <div className="flex items-center gap-4">
                          {salary && (
                            <span className="font-sans text-xs font-semibold text-[#1a1a1a]">
                              {salary}{brief.salary_period && brief.salary_period !== 'Annual' ? ` / ${brief.salary_period.toLowerCase()}` : ''}
                            </span>
                          )}
                          <span className="font-sans text-xs text-[#bbb]">
                            {timeAgo(brief.published_at)}
                          </span>
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex-shrink-0 text-[#e8e2d8] group-hover:text-[#a58e28] transition-colors mt-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Employer CTA ───────────────────────────────────────── */}
        <div className="mt-10 p-6 bg-[#fafaf5] border border-[#e8e2d8] text-center">
          <div className="jl-overline-gold mb-2">For Employers</div>
          <p className="font-sans text-sm text-[#666] mb-4">
            Submit a confidential hiring brief. JOBLUX presents pre-screened candidates from our vetted network.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/join?type=employer" className="jl-btn jl-btn-primary">Submit a Brief</Link>
            <Link href="/join" className="jl-btn jl-btn-outline">Join JOBLUX</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
