'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { SearchAssignment } from '@/types/search-assignment'
import { CURRENCY_SYMBOLS } from '@/lib/assignment-options'

// ── Tier config ──────────────────────────────────────────────────────
const TIER_LABELS: Record<string, string> = {
  rising: 'Rising',
  pro: 'Pro',
  professional: 'Pro+',
  executive: 'Pro+',
  business: 'Business',
  insider: 'Insider',
  admin: 'Admin',
}

const TIER_SUBTITLES: Record<string, string> = {
  rising: 'Professional account',
  pro: 'Professional account',
  professional: 'Professional account',
  executive: 'Professional account',
  business: 'Employer account',
  insider: 'Intelligence partner',
  admin: 'Administrator',
}

const TIER_WELCOME: Record<string, string> = {
  rising: 'Welcome to JOBLUX. Your starting point into luxury industry careers intelligence. Explore salary data, interview insights, and brand intelligence — and contribute what you know to deepen the ecosystem.',
  pro: 'Your intelligence workspace. Deeper access to salary benchmarks, interview intelligence, and brand insights across the luxury industry. Your contributions strengthen the data for everyone.',
  professional: 'Strategic intelligence access. Comprehensive salary data, interview patterns, and sector-level insights across the luxury industry. Your seniority and contributions unlock the deepest layer of intelligence.',
  executive: 'Strategic intelligence access. Comprehensive salary data, interview patterns, and sector-level insights across the luxury industry. Your seniority and contributions unlock the deepest layer of intelligence.',
  business: 'Private hiring access for luxury employers. Submit confidential search briefs, access market intelligence on compensation and talent movement, and work with JOBLUX\'s recruitment consultants to identify exceptional candidates.',
  insider: 'Your trusted contributor workspace. As an Insider, your knowledge directly shapes the intelligence ecosystem. Contribute insights, review intelligence quality, and access the platform\'s deepest intelligence layer.',
}

// ── Helpers ──────────────────────────────────────────────────────────
function formatSalary(amount: number): string {
  if (amount >= 1000) return `${Math.round(amount / 1000)}K`
  return String(amount)
}

function salaryDisplay(a: SearchAssignment): string | null {
  if (a.salary_display !== 'true') return null
  if (!a.salary_min && !a.salary_max) return null
  const sym = CURRENCY_SYMBOLS[a.salary_currency || 'EUR'] || a.salary_currency || ''
  if (a.salary_min && a.salary_max) return `${sym}${formatSalary(a.salary_min)}–${sym}${formatSalary(a.salary_max)}`
  if (a.salary_min) return `From ${sym}${formatSalary(a.salary_min)}`
  if (a.salary_max) return `Up to ${sym}${formatSalary(a.salary_max)}`
  return null
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function ArrowRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════════

interface Props {
  firstName: string
  role: string
  email: string
  isAdmin: boolean
}

export default function DashboardClient({ firstName, role, email, isAdmin }: Props) {
  const tierLabel = TIER_LABELS[role] || role
  const tierSubtitle = TIER_SUBTITLES[role] || 'Professional account'
  const isBusiness = ['business', 'insider'].includes(role)

  const [opportunities, setOpportunities] = useState<SearchAssignment[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [profileCompleteness, setProfileCompleteness] = useState(0)
  const [completenessHint, setCompletenessHint] = useState('')
  const [contributionPoints, setContributionPoints] = useState(0)
  const [applicationCount, setApplicationCount] = useState(0)
  const [internshipCount, setInternshipCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        if (isBusiness) {
          // Business: fetch assignments instead of opportunities
          try {
            const res = await fetch('/api/assignments?status=active')
            const data = await res.json()
            setAssignments(data.assignments || [])
          } catch { /* silent */ }
        } else {
          // Professional: fetch opportunities
          const oppRes = await fetch('/api/opportunities?limit=5')
          const oppData = await oppRes.json()
          setOpportunities(oppData.opportunities || [])
        }

        const profileRes = await fetch(`/api/members/profile?email=${encodeURIComponent(email)}`)
        const profileData = await profileRes.json()
        if (profileData.member) {
          const m = profileData.member

          let score = 0
          let total = 0
          if (isBusiness) {
            total = 4
            if (m.company_name || m.maison) score++
            if (m.sector || m.department) score++
            if (m.bio || m.headline) score++
            if (m.email || m.phone) score++
          } else {
            total = 5
            if (m.headline) score++
            if (profileData.workExperiences?.length > 0) score++
            if (profileData.documents?.length > 0) score++
            if (m.city && m.country) score++
            if (m.contact_preference || m.email) score++
          }
          setProfileCompleteness(Math.round((score / total) * 100))

          if (isBusiness) {
            if (!m.company_name && !m.maison) setCompletenessHint('Add your company name to get started')
            else if (!m.bio && !m.headline) setCompletenessHint('Add a company description')
            else if (score < total) setCompletenessHint('Complete more sections to strengthen your profile')
            else setCompletenessHint('Your company profile is complete!')
          } else {
            if (!m.headline) setCompletenessHint('Add a headline to stand out')
            else if (profileData.documents?.length === 0) setCompletenessHint('Upload your CV to unlock full opportunity matching')
            else if (!(m.city && m.country)) setCompletenessHint('Add your location to improve matching')
            else if (score < total) setCompletenessHint('Complete more sections to improve your relevance')
            else setCompletenessHint('Your profile is complete!')
          }

          setContributionPoints(m.contribution_points || 0)
        }

        if (!isBusiness) {
          try {
            const appRes = await fetch('/api/opportunities/applications')
            if (appRes.ok) {
              const appData = await appRes.json()
              setApplicationCount(Array.isArray(appData) ? appData.length : appData.count || 0)
            }
          } catch { /* silent */ }
        }
      } catch { /* silent */ }
      setLoading(false)
    }
    load()
  }, [email, isBusiness])

  // ══════════════════════════════════════════════════════════════════
  // SHARED: Welcome strip
  // ══════════════════════════════════════════════════════════════════

  const welcomeStrip = (
    <div className="bg-white border-b border-[#e8e2d8]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 xl:px-16 py-10 lg:py-12">
        <div className="lg:flex lg:justify-between lg:items-end">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl lg:text-4xl font-light text-[#1a1a1a] mb-2">
              Welcome back, {firstName}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-1 bg-[#a58e28]/10 text-[#a58e28] text-[0.65rem] font-semibold tracking-[0.12em] uppercase rounded-full">
                {tierLabel}
              </span>
              <span className="text-sm text-[#555]">{tierSubtitle}</span>
              {contributionPoints > 0 && !isBusiness && (
                <span className="text-[0.6rem] text-[#aaa]">{contributionPoints} points</span>
              )}
            </div>
            {TIER_WELCOME[role] && (
              <p className="text-sm text-[#888] leading-relaxed mt-3 max-w-xl">{TIER_WELCOME[role]}</p>
            )}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1 text-sm text-[#a58e28] hover:text-[#7a6a1e] font-medium transition-colors mt-3"
              >
                Open Command Centre →
              </Link>
            )}
          </div>
          <div className="mt-4 lg:mt-0">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 text-sm text-[#a58e28] hover:text-[#7a6a1e] font-medium transition-colors"
            >
              Edit profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  // ══════════════════════════════════════════════════════════════════
  // BUSINESS / INSIDER DASHBOARD
  // ══════════════════════════════════════════════════════════════════

  if (isBusiness) {
    const businessKpis = [
      { label: 'Active Assignments', value: String(assignments.length), gold: false },
      { label: 'Internships Posted', value: String(internshipCount), gold: false },
      { label: 'Candidates Viewed', value: '—', gold: false },
      { label: 'Messages', value: '—', gold: false },
    ]

    const businessActions = [
      { label: 'Post a free internship', href: '/dashboard/internships/new', desc: 'Reach luxury professionals' },
      { label: 'Submit a search request', href: '/admin/briefs/new', desc: 'Find exceptional talent' },
      { label: 'Browse WikiLux', href: '/wikilux', desc: '500+ brand encyclopedias' },
      { label: 'Contact JOBLUX team', href: '/contact', desc: 'Get in touch with us' },
    ]

    return (
      <div className="bg-[#f8f7f4] min-h-screen">
        {welcomeStrip}

        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 xl:px-16 py-10 lg:py-12">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
            {businessKpis.map((kpi) => (
              <div key={kpi.label} className="bg-white border border-gray-200/60 rounded-xl p-4 lg:p-5">
                <div className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-1.5">{kpi.label}</div>
                <div className="text-2xl font-medium text-[#1a1a1a]">{loading ? '…' : kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Main: Two columns */}
          <div className="lg:grid lg:grid-cols-[1.6fr_1fr] gap-6 mb-10">

            {/* LEFT: Your Search Assignments */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Playfair_Display'] text-2xl lg:text-3xl font-light text-[#1a1a1a]">
                  Your Search Assignments
                </h2>
              </div>

              {loading ? (
                <div className="bg-white border border-gray-200/60 rounded-xl p-8 text-center">
                  <p className="text-sm text-[#555]">Loading assignments...</p>
                </div>
              ) : assignments.length === 0 ? (
                <div className="bg-white border border-gray-200/60 rounded-xl p-10 text-center">
                  <p className="text-base font-medium text-[#1a1a1a] mb-2">No active search assignments</p>
                  <p className="text-sm text-[#555] leading-relaxed mb-6">
                    Submit your first search request to find exceptional talent through the JOBLUX network.
                  </p>
                  <Link href="/admin/briefs/new" className="inline-flex px-6 py-2.5 bg-[#a58e28] text-white text-[0.7rem] font-semibold tracking-wider uppercase rounded-md hover:bg-[#8a7622] transition-colors">
                    Submit Search Request
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignments.slice(0, 5).map((a: any) => (
                    <Link key={a.id} href={`/admin/assignments/new?id=${a.id}`} className="block group">
                      <div className="bg-white border border-gray-200/60 rounded-xl p-4 lg:p-5 hover:border-[#a58e28]/40 transition-all">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-[0.6rem] uppercase tracking-[0.12em] text-[#a58e28] font-semibold mb-0.5">
                              {a.maison || 'Confidential'}
                            </div>
                            <h3 className="text-base font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors truncate">
                              {a.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-[#555]">{a.city || '—'}</span>
                              <span className={`text-[0.6rem] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded ${
                                a.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-[#999]'
                              }`}>{a.status}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#a58e28] transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Sidebar */}
            <div className="mt-6 lg:mt-0 space-y-4">

              {/* Company Profile Completeness */}
              <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999]">Company Profile</h4>
                  <span className="text-lg font-medium text-[#a58e28]">{loading ? '…' : `${profileCompleteness}%`}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-[#a58e28] rounded-full transition-all duration-700" style={{ width: `${profileCompleteness}%` }} />
                </div>
                {completenessHint && <p className="text-sm text-[#555]">{completenessHint}</p>}
                {profileCompleteness < 100 && (
                  <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-[#a58e28] font-medium mt-2 hover:text-[#7a6a1e] transition-colors">
                    Complete profile <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
                <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-3">Quick Actions</h4>
                <div className="divide-y divide-gray-100">
                  {businessActions.map((action) => (
                    <Link key={action.label} href={action.href} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a58e28] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors font-medium">{action.label}</span>
                        <span className="hidden lg:inline text-[0.6rem] text-[#aaa] ml-2">{action.desc}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#a58e28] transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999]">Messages</h4>
                  <Link href="/dashboard/messages" className="text-sm text-[#a58e28] hover:text-[#7a6a1e] font-medium transition-colors">View all</Link>
                </div>
                <p className="text-sm text-[#555]">Messages from the JOBLUX recruitment team.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════
  // PRO / RISING / PRO+ DASHBOARD (+ Admin overlay)
  // ══════════════════════════════════════════════════════════════════

  const proKpis = [
    { label: 'Tracked Assignments', value: String(opportunities.length), gold: false },
    { label: 'Expressions of Interest', value: String(applicationCount), gold: false },
    { label: 'Relevance Indicator', value: `${profileCompleteness}%`, gold: false },
    { label: 'Contribution Points', value: String(contributionPoints), gold: true },
  ]

  const proActions = [
    { label: 'Browse assignments', href: '/opportunities', desc: 'Confidential search assignments' },
    { label: 'Upload CV', href: '/profile', desc: 'Improve your relevance' },
    { label: 'Contribute an insight', href: '/contribute', desc: 'Earn contribution points' },
    { label: 'Browse intelligence', href: '/wikilux', desc: '500+ brand profiles' },
  ]

  return (
    <div className="bg-[#f8f7f4] min-h-screen">
      {welcomeStrip}

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 xl:px-16 py-10 lg:py-12">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
          {proKpis.map((kpi) => (
            <div key={kpi.label} className="bg-white border border-gray-200/60 rounded-xl p-4 lg:p-5">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-1.5">{kpi.label}</div>
              <div className={`text-2xl font-medium ${kpi.gold ? 'text-[#a58e28]' : 'text-[#1a1a1a]'}`}>
                {loading ? '…' : kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* Main: Two columns */}
        <div className="lg:grid lg:grid-cols-[1.6fr_1fr] gap-6 mb-10">

          {/* LEFT: Matched Opportunities */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Playfair_Display'] text-2xl lg:text-3xl font-light text-[#1a1a1a]">
                Tracked Assignments
              </h2>
              <Link href="/opportunities" className="text-sm text-[#a58e28] hover:text-[#7a6a1e] font-medium transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="bg-white border border-gray-200/60 rounded-xl p-8 text-center">
                <p className="text-sm text-[#555]">Loading assignments...</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="bg-white border border-gray-200/60 rounded-xl p-10 text-center">
                <p className="text-base font-medium text-[#1a1a1a] mb-2">No matched opportunities yet</p>
                <p className="text-sm text-[#555] leading-relaxed mb-6">Complete your profile to improve matching.</p>
                <Link href="/profile" className="inline-flex px-6 py-2.5 bg-[#a58e28] text-white text-[0.7rem] font-semibold tracking-wider uppercase rounded-md hover:bg-[#8a7622] transition-colors">
                  Complete Profile
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {opportunities.slice(0, 5).map((opp) => {
                  const salary = salaryDisplay(opp)
                  const displayMaison = opp.is_confidential ? 'Confidential' : opp.maison
                  return (
                    <Link key={opp.id} href={`/opportunities/${opp.slug || opp.id}`} className="block group">
                      <div className="bg-white border border-gray-200/60 rounded-xl p-4 lg:p-5 hover:border-[#a58e28]/40 transition-all duration-200">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {displayMaison && (
                              <div className="text-[0.6rem] uppercase tracking-[0.12em] text-[#a58e28] font-semibold mb-0.5">{displayMaison}</div>
                            )}
                            <h3 className="text-base font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors truncate">{opp.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {(opp.city || opp.country) && <span className="text-sm text-[#555]">{[opp.city, opp.country].filter(Boolean).join(', ')}</span>}
                              {salary && <span className="text-sm text-[#555]">{salary}</span>}
                              <span className="text-[0.6rem] text-[#aaa]">{timeAgo(opp.activated_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="hidden sm:inline-flex items-center px-2.5 py-1 bg-[#a58e28]/10 text-[#a58e28] text-[0.6rem] font-semibold rounded-full">Match</span>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#a58e28] transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="mt-6 lg:mt-0 space-y-4">

            {/* Profile Completeness */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999]">Profile Completeness</h4>
                <span className="text-lg font-medium text-[#a58e28]">{loading ? '…' : `${profileCompleteness}%`}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-[#a58e28] rounded-full transition-all duration-700" style={{ width: `${profileCompleteness}%` }} />
              </div>
              {completenessHint && <p className="text-sm text-[#555]">{completenessHint}</p>}
              {profileCompleteness < 100 && (
                <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-[#a58e28] font-medium mt-2 hover:text-[#7a6a1e] transition-colors">
                  Complete profile <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-3">Quick Actions</h4>
              <div className="divide-y divide-gray-100">
                {proActions.map((action) => (
                  <Link key={action.label} href={action.href} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a58e28] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors font-medium">{action.label}</span>
                      <span className="hidden lg:inline text-[0.6rem] text-[#aaa] ml-2">{action.desc}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#a58e28] transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999]">Messages</h4>
                <Link href="/dashboard/messages" className="text-sm text-[#a58e28] hover:text-[#7a6a1e] font-medium transition-colors">View all</Link>
              </div>
              <p className="text-sm text-[#555]">Messages from the JOBLUX recruitment team.</p>
            </div>

            {/* Contribution Progress */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-3">Contribution Progress</h4>
              <p className="text-sm text-[#555]">Track your salary, interview, and insight contributions.</p>
              <p className="text-[0.6rem] text-[#aaa] mt-2 italic">Coming soon</p>
            </div>

            {/* Tracked Sectors & Brands */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-3">Tracked Sectors & Brands</h4>
              <p className="text-sm text-[#555]">Follow brands and sectors to receive targeted intelligence.</p>
              <p className="text-[0.6rem] text-[#aaa] mt-2 italic">Coming soon</p>
            </div>

            {/* Saved Intelligence */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-3">Saved Intelligence</h4>
              <p className="text-sm text-[#555]">Bookmarked salary data, interview experiences, and articles.</p>
              <p className="text-[0.6rem] text-[#aaa] mt-2 italic">Coming soon</p>
            </div>

            {/* Discreet Requests */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-3">Discreet Requests</h4>
              <p className="text-sm text-[#555]">Private enquiries and expressions of interest.</p>
              <p className="text-[0.6rem] text-[#aaa] mt-2 italic">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Bottom: Recommended */}
        <div className="border-t border-[#e8e2d8] pt-10 lg:pt-12">
          <h2 className="font-['Playfair_Display'] text-2xl lg:text-3xl font-light text-[#1a1a1a] mb-6 lg:mb-8">
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Link href="/wikilux" className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6 group hover:border-[#a58e28]/40 transition-all">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#a58e28] mb-2">Brand Intelligence</div>
              <h3 className="text-lg font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors mb-1">WikiLux</h3>
              <p className="text-sm text-[#555] leading-relaxed">Explore 500+ luxury brand encyclopedias</p>
            </Link>
            <Link href="/salaries" className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6 group hover:border-[#a58e28]/40 transition-all">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#a58e28] mb-2">Career Intelligence</div>
              <h3 className="text-lg font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors mb-1">Salary Benchmarks</h3>
              <p className="text-sm text-[#555] leading-relaxed">Compare compensation by role and market</p>
            </Link>
            <Link href="/interviews" className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6 group hover:border-[#a58e28]/40 transition-all">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#a58e28] mb-2">Interview Intelligence</div>
              <h3 className="text-lg font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors mb-1">Inside the Maisons</h3>
              <p className="text-sm text-[#555] leading-relaxed">Real interview experiences from 150+ houses</p>
            </Link>
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="border-t border-[#e8e2d8] pt-10 lg:pt-12 mt-10">
            <h2 className="font-['Playfair_Display'] text-2xl lg:text-3xl font-light text-[#1a1a1a] mb-6 lg:mb-8">
              Administration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { title: 'Command Centre', desc: 'Stats, pipeline, system status.', href: '/admin/dashboard' },
                { title: 'Post a Brief', desc: 'Create a new hiring assignment.', href: '/admin/briefs/new' },
                { title: 'Review Contributions', desc: 'Approve contributions.', href: '/admin/contributions' },
                { title: 'Manage Articles', desc: 'BlogLux editorial and publishing.', href: '/admin/articles' },
              ].map((card) => (
                <Link key={card.title} href={card.href} className="bg-white border border-[#a58e28]/30 rounded-xl p-5 group hover:border-[#a58e28] transition-all">
                  <h3 className="text-lg font-medium text-[#a58e28] mb-2">{card.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{card.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
