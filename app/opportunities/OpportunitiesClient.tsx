'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CURRENCY_SYMBOLS } from '@/lib/assignment-options'
import type { SearchAssignment } from '@/types/search-assignment'

/** Format a salary number to a readable string (e.g. 120000 -> "120K") */
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
function salaryDisplay(assignment: SearchAssignment): string | null {
  if (assignment.salary_display !== 'true') return null
  if (!assignment.salary_min && !assignment.salary_max) return null
  const sym = CURRENCY_SYMBOLS[assignment.salary_currency || 'EUR'] || assignment.salary_currency || ''
  if (assignment.salary_min && assignment.salary_max) {
    return `${sym}${formatSalary(assignment.salary_min)}–${sym}${formatSalary(assignment.salary_max)}`
  }
  if (assignment.salary_min) return `From ${sym}${formatSalary(assignment.salary_min)}`
  if (assignment.salary_max) return `Up to ${sym}${formatSalary(assignment.salary_max)}`
  return null
}

export default function OpportunitiesClient({ initialOpportunities }: { initialOpportunities: SearchAssignment[] }) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [seniorityFilter, setSeniorityFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [contractFilter, setContractFilter] = useState('')
  const [remoteFilter, setRemoteFilter] = useState('')

  // Build dynamic filter options from actual data
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>()
    initialOpportunities.forEach((b) => {
      if (b.city) locs.add(b.city)
    })
    return Array.from(locs).sort()
  }, [initialOpportunities])

  const uniqueDepartments = useMemo(() => {
    const vals = new Set<string>()
    initialOpportunities.forEach((b) => { if (b.department) vals.add(b.department) })
    return Array.from(vals).sort()
  }, [initialOpportunities])

  const uniqueSeniority = useMemo(() => {
    const vals = new Set<string>()
    initialOpportunities.forEach((b) => { if (b.seniority) vals.add(b.seniority) })
    return Array.from(vals).sort()
  }, [initialOpportunities])

  const uniqueContractTypes = useMemo(() => {
    const vals = new Set<string>()
    initialOpportunities.forEach((b) => { if (b.contract_type) vals.add(b.contract_type) })
    return Array.from(vals).sort()
  }, [initialOpportunities])

  const uniqueRemotePolicies = useMemo(() => {
    const vals = new Set<string>()
    initialOpportunities.forEach((b) => { if (b.remote_policy) vals.add(b.remote_policy) })
    return Array.from(vals).sort()
  }, [initialOpportunities])

  // Client-side filtering
  const filtered = useMemo(() => {
    return initialOpportunities.filter((b) => {
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
  }, [initialOpportunities, searchQuery, deptFilter, seniorityFilter, locationFilter, contractFilter, remoteFilter])

  return (
    <div className="bg-[#f5f4f0] min-h-screen">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="border-b-2 border-[#1a1a1a] py-10 bg-white">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Confidential Search Assignments</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
            Current assignments
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-xl">
            Active search assignments handled with full discretion by JOBLUX. All introductions are managed privately — no direct contact until both parties are ready.
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
            {uniqueDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Seniority */}
          <select className="jl-input" value={seniorityFilter} onChange={(e) => setSeniorityFilter(e.target.value)}>
            <option value="">All Seniority</option>
            {uniqueSeniority.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Location */}
          <select className="jl-input" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="">All Locations</option>
            {uniqueLocations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>

          {/* Contract Type */}
          <select className="jl-input" value={contractFilter} onChange={(e) => setContractFilter(e.target.value)}>
            <option value="">All Contract Types</option>
            {uniqueContractTypes.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
          </select>

          {/* Remote Policy */}
          <select className="jl-input" value={remoteFilter} onChange={(e) => setRemoteFilter(e.target.value)}>
            <option value="">All Work Models</option>
            {uniqueRemotePolicies.map((r) => <option key={r} value={r}>{r}</option>)}
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
            {`${filtered.length} ${filtered.length === 1 ? 'Position' : 'Positions'}`}
          </span>
        </div>

        {/* ── Opportunity cards ───────────────────────────────────── */}
        {filtered.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16 px-6">
            <p className="jl-serif text-xl text-[#1a1a1a] mb-3">No open positions at the moment.</p>
            <p className="text-sm text-[#888] mb-6">
              New opportunities are added regularly. Request access to be notified when positions become available.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/join" className="jl-btn jl-btn-primary">Request Access</Link>
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
            {filtered.map((assignment) => {
              const salary = salaryDisplay(assignment)
              const displayMaison = assignment.is_confidential
                ? 'Confidential — Leading Luxury Maison'
                : assignment.maison

              return (
                <Link
                  key={assignment.id}
                  href={`/opportunities/${assignment.slug || assignment.id}`}
                  className="block"
                >
                  <div className="jl-card group cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Maison name */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="jl-overline-gold">{displayMaison}</span>
                          {assignment.is_confidential && (
                            <span className="jl-badge text-[0.55rem]">Confidential</span>
                          )}
                        </div>

                        {/* Position title */}
                        <h3 className="jl-serif text-lg font-light text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors">
                          {assignment.title}
                        </h3>

                        {/* Details row */}
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          {/* Location */}
                          {(assignment.city || assignment.country) && (
                            <span className="font-sans text-xs text-[#888]">
                              {[assignment.city, assignment.country].filter(Boolean).join(', ')}
                            </span>
                          )}

                          {/* Remote policy badge */}
                          {assignment.remote_policy && (
                            <span className="jl-badge-outline text-[0.55rem]">{assignment.remote_policy}</span>
                          )}

                          {/* Department badge */}
                          {assignment.department && (
                            <span className="jl-badge text-[0.55rem]">{assignment.department}</span>
                          )}

                          {/* Seniority badge */}
                          {assignment.seniority && (
                            <span className="jl-badge-outline text-[0.55rem]">{assignment.seniority}</span>
                          )}

                          {/* Contract type */}
                          {assignment.contract_type && (
                            <span className="font-sans text-xs text-[#888]">{assignment.contract_type}</span>
                          )}
                        </div>

                        {/* Salary + posted date */}
                        <div className="flex items-center gap-4">
                          {salary && (
                            <span className="font-sans text-xs font-semibold text-[#1a1a1a]">
                              {salary}{assignment.salary_period && assignment.salary_period !== 'Annual' ? ` / ${assignment.salary_period.toLowerCase()}` : ''}
                            </span>
                          )}
                          <span className="font-sans text-xs text-[#bbb]">
                            {timeAgo(assignment.activated_at)}
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
          <p className="font-sans text-sm text-[#999] mb-4">
            Submit a confidential hiring brief. JOBLUX presents pre-screened candidates from our intelligence network.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/join?type=employer" className="jl-btn jl-btn-primary">Submit a Search Assignment</Link>
            <Link href="/join" className="jl-btn jl-btn-outline">Request Access</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
