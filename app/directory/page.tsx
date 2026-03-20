'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useMember } from '@/lib/auth-hooks'
import { DIRECTORY_ACCESS_ROLES, TIER_BADGE_STYLES, TIER_LABELS } from '@/types/directory'
import type { DirectoryMemberCard } from '@/types/directory'

export default function DirectoryPage() {
  const { isAuthenticated, isLoading: authLoading, role } = useMember()
  const hasAccess = DIRECTORY_ACCESS_ROLES.includes((role || '') as any)

  const [members, setMembers] = useState<DirectoryMemberCard[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 20

  // Filters
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterSeniority, setFilterSeniority] = useState('')
  const [filterMaison, setFilterMaison] = useState('')

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<{
    countries: string[]
    departments: string[]
    seniority_levels: string[]
    top_maisons: string[]
  }>({ countries: [], departments: [], seniority_levels: [], top_maisons: [] })

  const hasFilters = search || filterCountry || filterDepartment || filterSeniority || filterMaison
  const searchTimeout = useRef<NodeJS.Timeout>()
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [search])

  const fetchData = useCallback(async () => {
    if (!hasAccess) return
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (filterCountry) params.set('country', filterCountry)
    if (filterDepartment) params.set('department', filterDepartment)
    if (filterSeniority) params.set('seniority', filterSeniority)
    if (filterMaison) params.set('maison', filterMaison)

    try {
      const res = await fetch(`/api/directory?${params}`)
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setMembers(data.members || [])
      setTotal(data.total || 0)
      setFilterOptions(data.filters || { countries: [], departments: [], seniority_levels: [], top_maisons: [] })
    } catch {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filterCountry, filterDepartment, filterSeniority, filterMaison, hasAccess])

  useEffect(() => { fetchData() }, [fetchData])

  const clearFilters = () => {
    setSearch('')
    setFilterCountry('')
    setFilterDepartment('')
    setFilterSeniority('')
    setFilterMaison('')
    setPage(1)
  }

  const totalPages = Math.ceil(total / limit)

  if (authLoading) {
    return (
      <div className="jl-container py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#e8e2d8] border-t-[#a58e28] rounded-full animate-spin" />
      </div>
    )
  }

  // Access gate for lower tiers
  if (!hasAccess) {
    return <AccessGate />
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#fafaf5] border-b border-[#e8e2d8] py-14 md:py-20">
        <div className="jl-container text-center">
          <div className="jl-overline-gold mb-4 tracking-[0.2em]">Member Directory</div>
          <h1 className="jl-serif text-4xl md:text-5xl font-light text-[#1a1a1a] mb-4">
            The Network
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-xl mx-auto leading-relaxed mb-6">
            Connect with luxury professionals across the world&rsquo;s most prestigious maisons.
          </p>
          {total > 0 && !loading && (
            <div className="flex items-center justify-center gap-4 text-xs text-[#999] tracking-wide uppercase">
              <span>{total} member{total !== 1 ? 's' : ''}</span>
              <span className="text-[#a58e28]">&middot;</span>
              <span>{filterOptions.countries.length} countr{filterOptions.countries.length !== 1 ? 'ies' : 'y'}</span>
              <span className="text-[#a58e28]">&middot;</span>
              <span>{filterOptions.top_maisons.length}+ maisons</span>
            </div>
          )}
        </div>
      </section>

      {/* Search */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#e8e2d8]">
        <div className="jl-container py-4">
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, title, maison, or skill..."
              className="jl-input w-full pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterCountry}
              onChange={(e) => { setFilterCountry(e.target.value); setPage(1) }}
              className="jl-select text-xs min-w-[140px]"
            >
              <option value="">All Countries</option>
              {filterOptions.countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filterDepartment}
              onChange={(e) => { setFilterDepartment(e.target.value); setPage(1) }}
              className="jl-select text-xs min-w-[150px]"
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={filterSeniority}
              onChange={(e) => { setFilterSeniority(e.target.value); setPage(1) }}
              className="jl-select text-xs min-w-[150px]"
            >
              <option value="">All Levels</option>
              {filterOptions.seniority_levels.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={filterMaison}
              onChange={(e) => { setFilterMaison(e.target.value); setPage(1) }}
              className="jl-select text-xs min-w-[160px]"
            >
              <option value="">All Maisons</option>
              {filterOptions.top_maisons.map(m => (
                <option key={m} value={m}>{m}</option>
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
              {debouncedSearch && (
                <span className="jl-badge-outline text-[0.65rem]">
                  &ldquo;{debouncedSearch}&rdquo;
                  <button onClick={() => setSearch('')} className="ml-1.5 text-[#999]">&times;</button>
                </span>
              )}
              {filterCountry && (
                <span className="jl-badge-outline text-[0.65rem]">
                  {filterCountry}
                  <button onClick={() => { setFilterCountry(''); setPage(1) }} className="ml-1.5 text-[#999]">&times;</button>
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
              {filterMaison && (
                <span className="jl-badge-outline text-[0.65rem]">
                  {filterMaison}
                  <button onClick={() => { setFilterMaison(''); setPage(1) }} className="ml-1.5 text-[#999]">&times;</button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="jl-container py-10">
        {loading ? (
          <LoadingSkeleton />
        ) : members.length === 0 ? (
          <div className="text-center py-16">
            <p className="jl-serif text-xl text-[#1a1a1a] mb-2">No members match your criteria</p>
            <p className="text-sm text-[#888] mb-4">Try broadening your search or adjusting filters</p>
            {hasFilters && (
              <button onClick={clearFilters} className="jl-btn-outline">Clear filters</button>
            )}
          </div>
        ) : (
          <>
            <div className="text-xs text-[#888] mb-4 tracking-wide">
              {total} member{total !== 1 ? 's' : ''}
              {hasFilters ? ' matching your criteria' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((m) => (
                <MemberCard key={m.id} member={m} />
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
                <span className="text-xs text-[#888] px-4">Page {page} of {totalPages}</span>
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
      </div>
    </div>
  )
}

function Avatar({ firstName, lastName, avatarUrl, size = 48 }: { firstName: string | null; lastName: string | null; avatarUrl: string | null; size?: number }) {
  const initials = `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '?'
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: '#1a1a1a', color: '#a58e28', fontSize: size * 0.35, fontWeight: 600 }}
    >
      {initials}
    </div>
  )
}

function MemberCard({ member }: { member: DirectoryMemberCard }) {
  const m = member
  const displayName = [m.first_name, m.last_name].filter(Boolean).join(' ') || 'Member'
  const employer = m.maison || m.current_employer

  return (
    <Link href={`/directory/${m.id}`} className="jl-card group block">
      <div className="flex items-start gap-3 mb-3">
        <Avatar firstName={m.first_name} lastName={m.last_name} avatarUrl={m.avatar_url} size={48} />
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors truncate">
            {displayName}
          </h3>
          <p className="text-xs text-[#666] truncate">
            {m.headline || m.job_title || 'Luxury Professional'}
          </p>
          {employer && (
            <p className="text-xs text-[#a58e28] truncate">{employer}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[0.65rem] text-[#888] mb-3">
        {m.department && <span className="jl-badge text-[0.6rem]">{m.department}</span>}
        {m.seniority && <span className="jl-badge-outline text-[0.6rem]">{m.seniority}</span>}
      </div>

      <div className="flex items-center gap-1.5 text-[0.65rem] text-[#888] mb-3">
        {(m.city || m.country) && (
          <span>{[m.city, m.country].filter(Boolean).join(', ')}</span>
        )}
        {m.years_in_luxury && (
          <>
            {(m.city || m.country) && <span>&middot;</span>}
            <span>{m.years_in_luxury} yr{m.years_in_luxury !== 1 ? 's' : ''} in luxury</span>
          </>
        )}
      </div>

      {m.key_skills && m.key_skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {m.key_skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-[0.6rem] text-[#999] border border-[#e8e2d8] px-1.5 py-0.5 rounded-sm">
              {skill}
            </span>
          ))}
          {m.key_skills.length > 3 && (
            <span className="text-[0.6rem] text-[#ccc]">+{m.key_skills.length - 3}</span>
          )}
        </div>
      )}

      {/* Profile completeness bar */}
      {m.profile_completeness != null && m.profile_completeness > 0 && (
        <div className="mt-auto pt-3 border-t border-[#f0ece4]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[0.6rem] text-[#ccc]">Profile</span>
            <span className="text-[0.6rem] text-[#ccc]">{m.profile_completeness}%</span>
          </div>
          <div className="h-0.5 bg-[#f0ece4] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, m.profile_completeness)}%`, backgroundColor: '#a58e28' }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="jl-card animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-[#f0ece4] flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-[#f0ece4] rounded w-2/3 mb-1.5" />
              <div className="h-3 bg-[#f0ece4] rounded w-1/2" />
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="h-5 bg-[#f0ece4] rounded w-16" />
            <div className="h-5 bg-[#f0ece4] rounded w-20" />
          </div>
          <div className="h-3 bg-[#f0ece4] rounded w-1/3" />
        </div>
      ))}
    </div>
  )
}

function AccessGate() {
  return (
    <div className="min-h-[70vh] relative">
      {/* Blurred preview behind */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="bg-[#fafaf5] py-14 text-center blur-sm opacity-50">
          <div className="jl-container">
            <div className="text-xs text-[#a58e28] tracking-widest uppercase mb-3">Member Directory</div>
            <div className="text-4xl font-light text-[#1a1a1a] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>The Network</div>
          </div>
        </div>
        <div className="jl-container py-8 blur-sm opacity-30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-[#e8e2d8] rounded p-5 bg-white">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#e8e2d8]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#e8e2d8] rounded w-2/3" />
                    <div className="h-3 bg-[#e8e2d8] rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gate overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a58e28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="jl-serif text-2xl md:text-3xl text-[#1a1a1a] mb-3">Directory Access</h1>
          <p className="text-sm text-[#888] leading-relaxed mb-6">
            The Member Directory is available to Business, Insider, and Executive members.
            Upgrade your membership to browse and connect with luxury professionals worldwide.
          </p>
          <Link href="/about" className="jl-btn-primary">
            Learn About Membership Tiers
          </Link>
        </div>
      </div>
    </div>
  )
}
