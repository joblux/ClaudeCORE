'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { SearchAssignment } from '@/types/search-assignment'
import { CURRENCY_SYMBOLS } from '@/lib/assignment-options'

// ── Tier labels ──────────────────────────────────────────────────────
const TIER_LABELS: Record<string, string> = {
  rising: 'Rising Member',
  pro: 'Pro Member',
  professional: 'Pro+ Member',
  executive: 'Executive Member',
  business: 'Business Member',
  insider: 'Insider Member',
  admin: 'Administrator',
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

// ── Arrow icon ───────────────────────────────────────────────────────
function ArrowRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════════
// Dashboard Client Component
// ══════════════════════════════════════════════════════════════════════

interface Props {
  firstName: string
  role: string
  email: string
  isAdmin: boolean
}

export default function DashboardClient({ firstName, role, email, isAdmin }: Props) {
  const tierLabel = TIER_LABELS[role] || 'Member'
  const isSenior = ['professional', 'executive', 'insider'].includes(role)
  const isBusiness = role === 'business'

  // ── State ────────────────────────────────────────────────────────
  const [opportunities, setOpportunities] = useState<SearchAssignment[]>([])
  const [profileCompleteness, setProfileCompleteness] = useState(0)
  const [completenessHint, setCompletenessHint] = useState('')
  const [contributionPoints, setContributionPoints] = useState(0)
  const [applicationCount, setApplicationCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // ── Data loading ─────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        // Fetch opportunities
        const oppRes = await fetch('/api/opportunities?limit=5')
        const oppData = await oppRes.json()
        setOpportunities(oppData.opportunities || [])

        // Fetch profile data for completeness
        const profileRes = await fetch(`/api/members/profile?email=${encodeURIComponent(email)}`)
        const profileData = await profileRes.json()
        if (profileData.member) {
          // Calculate completeness
          const m = profileData.member
          let score = 0
          const total = 10
          if (m.first_name && m.last_name) score++
          if (m.headline) score++
          if (m.city && m.country) score++
          if (m.job_title && m.seniority) score++
          if (profileData.workExperiences?.length > 0) score++
          if (profileData.educationRecords?.length > 0) score++
          if (profileData.languages?.length > 0) score++
          if (m.key_skills?.length > 0) score++
          if (m.product_categories?.length > 0) score++
          if (profileData.documents?.length > 0) score++
          setProfileCompleteness(Math.round((score / total) * 100))

          // Hint
          if (!m.first_name || !m.last_name) setCompletenessHint('Add your full name to get started')
          else if (!m.headline) setCompletenessHint('Add a headline to stand out')
          else if (profileData.documents?.length === 0) setCompletenessHint('Upload your CV to unlock full opportunity matching')
          else if (score < total) setCompletenessHint('Complete more sections to improve your match rate')
          else setCompletenessHint('Your profile is complete!')

          setContributionPoints(m.contribution_points || 0)
        }

        // Fetch application count
        try {
          const appRes = await fetch('/api/opportunities/applications')
          if (appRes.ok) {
            const appData = await appRes.json()
            setApplicationCount(Array.isArray(appData) ? appData.length : appData.count || 0)
          }
        } catch { /* silent */ }
      } catch { /* silent */ }
      setLoading(false)
    }
    load()
  }, [email])

  // ── Quick action items ───────────────────────────────────────────
  const quickActions = [
    { label: 'Upload CV', href: '/profile', desc: 'Improve your match rate' },
    { label: 'Browse WikiLux', href: '/wikilux', desc: '500+ brand encyclopedias' },
    { label: 'Interview Intelligence', href: '/interviews', desc: 'Real interview experiences' },
    { label: 'Invite a colleague', href: '/invite', desc: 'Grow the JOBLUX community' },
    { label: 'Contribute an insight', href: '/contribute', desc: 'Earn contribution points' },
  ]

  if (isSenior) {
    quickActions.push({ label: 'Salary Intelligence', href: '/salaries', desc: 'Compensation benchmarks' })
  }
  if (isBusiness) {
    quickActions.push(
      { label: 'Post a Brief', href: '/admin/briefs/new', desc: 'Create a hiring assignment' },
      { label: 'Post an Internship', href: '/dashboard/internships/new', desc: 'Reach luxury professionals' },
    )
  }

  // ── KPI data ─────────────────────────────────────────────────────
  const kpis = [
    { label: 'Matched Opportunities', value: String(opportunities.length), gold: false },
    { label: 'Applications', value: String(applicationCount), gold: false },
    { label: 'Profile Views', value: '—', gold: false },
    { label: 'Contribution Points', value: String(contributionPoints), gold: true },
  ]

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════

  return (
    <div className="bg-[#f8f7f4] min-h-screen">

      {/* ── Welcome Strip ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="jl-container py-8 lg:py-10">
          <div className="lg:flex lg:justify-between lg:items-end">
            <div>
              <div className="jl-overline-gold mb-2">Member Dashboard</div>
              <h1 className="jl-serif text-2xl md:text-3xl lg:text-[22px] font-medium text-[#1a1a1a] mb-1.5">
                Welcome back, {firstName}
              </h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#a58e28]/10 text-[#a58e28] text-[0.65rem] font-semibold tracking-wider uppercase rounded-full">
                  {tierLabel}
                </span>
                {contributionPoints > 0 && (
                  <span className="text-xs text-gray-500">{contributionPoints} contribution points</span>
                )}
              </div>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1 text-sm text-[#a58e28] hover:text-[#7a6a1e] font-medium transition-colors"
              >
                Edit profile
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="jl-container py-8 lg:py-10">

        {/* ── KPI Metric Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white border border-gray-200/60 rounded-xl p-4 lg:p-5"
            >
              <div className="text-[0.65rem] uppercase tracking-wider text-gray-400 mb-1.5">
                {kpi.label}
              </div>
              <div className={`text-2xl font-medium ${kpi.gold ? 'text-[#a58e28]' : 'text-gray-900'}`}>
                {loading ? '…' : kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Content — Two Columns on Desktop ──────────────── */}
        <div className="lg:grid lg:grid-cols-[1.6fr_1fr] gap-6 mb-8">

          {/* LEFT — Matched Opportunities ─────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#1a1a1a] tracking-wide uppercase">
                Matched Opportunities
              </h2>
              <Link
                href="/opportunities"
                className="text-sm text-[#a58e28] hover:text-[#7a6a1e] font-medium transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="bg-white border border-gray-200/60 rounded-xl p-8 text-center">
                <p className="text-sm text-gray-400">Loading opportunities...</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="bg-white border border-gray-200/60 rounded-xl p-8 text-center">
                <p className="text-sm text-gray-500 mb-3">No matched opportunities yet.</p>
                <p className="text-xs text-gray-400 mb-4">Complete your profile to improve matching.</p>
                <Link href="/profile" className="jl-btn jl-btn-gold text-xs">
                  Complete Profile
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {opportunities.slice(0, 5).map((opp) => {
                  const salary = salaryDisplay(opp)
                  const displayMaison = opp.is_confidential
                    ? 'Confidential'
                    : opp.maison
                  return (
                    <Link
                      key={opp.id}
                      href={`/opportunities/${opp.slug || opp.id}`}
                      className="block group"
                    >
                      <div className="bg-white border border-gray-200/60 rounded-xl p-4 lg:p-5 hover:border-[#a58e28]/40 transition-all duration-200">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {displayMaison && (
                                <span className="text-[0.6rem] uppercase tracking-wider text-[#a58e28] font-medium">
                                  {displayMaison}
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium text-sm text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors truncate">
                              {opp.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {(opp.city || opp.country) && (
                                <span className="text-xs text-gray-500">
                                  {[opp.city, opp.country].filter(Boolean).join(', ')}
                                </span>
                              )}
                              {salary && (
                                <span className="text-xs text-gray-500">{salary}</span>
                              )}
                              <span className="text-xs text-gray-400">{timeAgo(opp.activated_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="hidden sm:inline-flex items-center px-2.5 py-1 bg-[#a58e28]/10 text-[#a58e28] text-[0.6rem] font-semibold rounded-full">
                              Match
                            </span>
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

          {/* RIGHT — Sidebar Stack ────────────────────────────────── */}
          <div className="mt-6 lg:mt-0 space-y-4">

            {/* Card 1: Profile Completeness */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider">
                  Profile Completeness
                </h3>
                <span className="text-lg font-medium text-[#a58e28]">
                  {loading ? '…' : `${profileCompleteness}%`}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-[#a58e28] rounded-full transition-all duration-700"
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>
              {completenessHint && (
                <p className="text-xs text-gray-500">{completenessHint}</p>
              )}
              {profileCompleteness < 100 && (
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 text-xs text-[#a58e28] font-medium mt-2 hover:text-[#7a6a1e] transition-colors"
                >
                  Complete profile <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Card 2: Quick Actions */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <h3 className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="divide-y divide-gray-100">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a58e28] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors font-medium">
                        {action.label}
                      </span>
                      <span className="hidden lg:inline text-xs text-gray-400 ml-2">
                        {action.desc}
                      </span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#a58e28] transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Card 3: Your Messages */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider">
                  Messages
                </h3>
                <Link
                  href="/dashboard/messages"
                  className="text-xs text-[#a58e28] hover:text-[#7a6a1e] font-medium transition-colors"
                >
                  View all
                </Link>
              </div>
              <p className="text-xs text-gray-400">Check messages from the JOBLUX recruitment team.</p>
            </div>
          </div>
        </div>

        {/* ── Bottom Row — Two Columns ──────────────────────────────── */}
        <div className="lg:grid lg:grid-cols-2 gap-6 mb-8">

          {/* LEFT: Recent Activity */}
          <div className="mb-6 lg:mb-0">
            <h2 className="text-sm font-semibold text-[#1a1a1a] tracking-wide uppercase mb-4">
              Recent Activity
            </h2>
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-[#a58e28] flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#1a1a1a]">Profile updated</p>
                    <p className="text-xs text-gray-400">Recently</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#1a1a1a]">Joined JOBLUX</p>
                    <p className="text-xs text-gray-400">Member since joining</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Recommended for You */}
          <div>
            <h2 className="text-sm font-semibold text-[#1a1a1a] tracking-wide uppercase mb-4">
              Recommended for You
            </h2>
            <div className="bg-white border border-gray-200/60 rounded-xl p-5 lg:p-6">
              <div className="space-y-4">
                <Link href="/wikilux" className="flex items-start gap-4 group">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[0.55rem] uppercase tracking-wider text-gray-400">WikiLux</span>
                  </div>
                  <div>
                    <span className="text-[0.55rem] uppercase tracking-wider text-[#a58e28] font-medium">Brand Intelligence</span>
                    <h4 className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors mt-0.5">
                      Explore 500+ luxury brand encyclopedias
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">History, culture, hiring insights</p>
                  </div>
                </Link>
                <Link href="/salaries" className="flex items-start gap-4 group">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[0.55rem] uppercase tracking-wider text-gray-400">Salaries</span>
                  </div>
                  <div>
                    <span className="text-[0.55rem] uppercase tracking-wider text-[#a58e28] font-medium">Career Intelligence</span>
                    <h4 className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors mt-0.5">
                      Salary benchmarks across luxury
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">Compare compensation by role and market</p>
                  </div>
                </Link>
                <Link href="/interviews" className="flex items-start gap-4 group">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-[0.55rem] uppercase tracking-wider text-gray-400">Interviews</span>
                  </div>
                  <div>
                    <span className="text-[0.55rem] uppercase tracking-wider text-[#a58e28] font-medium">Interview Intelligence</span>
                    <h4 className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors mt-0.5">
                      Real interview experiences from 150+ maisons
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">Prepare with insider knowledge</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Admin Section (if admin) ──────────────────────────────── */}
        {isAdmin && (
          <div className="mt-4">
            <div className="jl-section-label mb-4"><span>Administration</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { num: 'A1', title: 'Admin Panel', desc: 'Command centre — stats, notifications, overview.', href: '/admin/dashboard' },
                { num: 'A2', title: 'Post a Brief', desc: 'Create a new hiring assignment.', href: '/admin/briefs/new' },
                { num: 'A3', title: 'Review Contributions', desc: 'Approve member contributions.', href: '/admin/contributions' },
                { num: 'A4', title: 'Manage Articles', desc: 'Bloglux editorial and publishing.', href: '/admin/articles' },
              ].map((card) => (
                <Link
                  key={card.num}
                  href={card.href}
                  className="bg-white border border-[#a58e28]/30 rounded-xl p-5 group hover:border-[#a58e28] transition-all duration-200"
                >
                  <div className="jl-serif text-2xl font-light text-[#a58e28] mb-3">{card.num}</div>
                  <h3 className="font-sans text-sm font-semibold text-[#a58e28] mb-2">{card.title}</h3>
                  <p className="font-sans text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
