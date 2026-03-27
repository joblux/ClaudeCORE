'use client'

import { useState, useEffect } from 'react'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const GOLD = '#a58e28'
const BLACK = '#1a1a1a'
const CREAM = '#fafaf5'
const BORDER = '#e8e2d8'

interface ContentCounts {
  brands: number
  articles: number
  salaries: number
  interviews: number
  contributions: number
}

interface TierCount {
  tier: string
  count: number
}

interface CountryCount {
  country: string
  count: number
}

interface StatusCounts {
  approved: number
  pending: number
  rejected: number
}

interface DayCount {
  date: string
  count: number
}

interface AssignmentStatus {
  status: string
  count: number
}

interface ContributionType {
  type: string
  count: number
}

interface InvitationStats {
  total: number
  opened: number
  joined: number
}

async function safeCount(table: string, filter?: { column: string; value: string }): Promise<number> {
  try {
    let q = supabase.from(table).select('*', { count: 'exact', head: true })
    if (filter) q = q.eq(filter.column, filter.value)
    const { count } = await q
    return count ?? 0
  } catch {
    return 0
  }
}

export default function AdminAnalyticsPage() {
  useRequireAdmin()

  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<ContentCounts>({ brands: 0, articles: 0, salaries: 0, interviews: 0, contributions: 0 })
  const [tiers, setTiers] = useState<TierCount[]>([])
  const [countries, setCountries] = useState<CountryCount[]>([])
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ approved: 0, pending: 0, rejected: 0 })
  const [regTrend, setRegTrend] = useState<DayCount[]>([])
  const [assignmentStatuses, setAssignmentStatuses] = useState<AssignmentStatus[]>([])
  const [applicationStages, setApplicationStages] = useState<AssignmentStatus[]>([])
  const [contribTypes, setContribTypes] = useState<ContributionType[]>([])
  const [inviteStats, setInviteStats] = useState<InvitationStats>({ total: 0, opened: 0, joined: 0 })
  const [ga4Id, setGa4Id] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      await Promise.all([
        fetchContentCounts(),
        fetchMemberAnalytics(),
        fetchRecruitmentAnalytics(),
        fetchEngagementAnalytics(),
      ])
    } catch (err) {
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchContentCounts() {
    const [brands, articles, salaries, interviews, contributions] = await Promise.all([
      safeCount('wikilux_content'),
      safeCount('articles'),
      safeCount('salaries'),
      safeCount('interviews'),
      safeCount('contributions', { column: 'status', value: 'approved' }),
    ])
    setContent({ brands, articles, salaries, interviews, contributions })
  }

  async function fetchMemberAnalytics() {
    // Members by tier
    try {
      const { data: tierData } = await supabase
        .from('members')
        .select('tier')
      if (tierData) {
        const counts: Record<string, number> = {}
        tierData.forEach((m: any) => {
          const t = m.tier || 'unknown'
          counts[t] = (counts[t] || 0) + 1
        })
        setTiers(Object.entries(counts).map(([tier, count]) => ({ tier, count })).sort((a, b) => b.count - a.count))
      }
    } catch { /* table may not exist */ }

    // Members by country (top 10)
    try {
      const { data: countryData } = await supabase
        .from('members')
        .select('country')
      if (countryData) {
        const counts: Record<string, number> = {}
        countryData.forEach((m: any) => {
          const c = m.country || 'Unknown'
          counts[c] = (counts[c] || 0) + 1
        })
        setCountries(
          Object.entries(counts)
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        )
      }
    } catch { /* */ }

    // Members by approval status
    try {
      const [approved, pending, rejected] = await Promise.all([
        safeCount('members', { column: 'status', value: 'approved' }),
        safeCount('members', { column: 'status', value: 'pending' }),
        safeCount('members', { column: 'status', value: 'rejected' }),
      ])
      setStatusCounts({ approved, pending, rejected })
    } catch { /* */ }

    // Registration trend (last 30 days)
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const { data: regData } = await supabase
        .from('members')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })
      if (regData) {
        const dayCounts: Record<string, number> = {}
        regData.forEach((m: any) => {
          const day = m.created_at?.slice(0, 10)
          if (day) dayCounts[day] = (dayCounts[day] || 0) + 1
        })
        // Fill in missing days
        const days: DayCount[] = []
        for (let i = 0; i < 30; i++) {
          const d = new Date()
          d.setDate(d.getDate() - 29 + i)
          const key = d.toISOString().slice(0, 10)
          days.push({ date: key, count: dayCounts[key] || 0 })
        }
        setRegTrend(days)
      }
    } catch { /* */ }
  }

  async function fetchRecruitmentAnalytics() {
    // Assignments by status
    try {
      const { data } = await supabase.from('search_assignments').select('status')
      if (data) {
        const counts: Record<string, number> = {}
        data.forEach((r: any) => {
          const s = r.status || 'unknown'
          counts[s] = (counts[s] || 0) + 1
        })
        setAssignmentStatuses(Object.entries(counts).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count))
      }
    } catch {
      // Try job_briefs as fallback
      try {
        const { data } = await supabase.from('job_briefs').select('status')
        if (data) {
          const counts: Record<string, number> = {}
          data.forEach((r: any) => {
            const s = r.status || 'unknown'
            counts[s] = (counts[s] || 0) + 1
          })
          setAssignmentStatuses(Object.entries(counts).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count))
        }
      } catch { /* */ }
    }

    // Applications by stage
    try {
      const { data } = await supabase.from('applications').select('stage')
      if (data) {
        const counts: Record<string, number> = {}
        data.forEach((r: any) => {
          const s = r.stage || 'unknown'
          counts[s] = (counts[s] || 0) + 1
        })
        setApplicationStages(Object.entries(counts).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count))
      }
    } catch { /* */ }
  }

  async function fetchEngagementAnalytics() {
    // Contributions by type
    try {
      const { data } = await supabase.from('contributions').select('type')
      if (data) {
        const counts: Record<string, number> = {}
        data.forEach((r: any) => {
          const t = r.type || 'unknown'
          counts[t] = (counts[t] || 0) + 1
        })
        setContribTypes(Object.entries(counts).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count))
      }
    } catch { /* */ }

    // Invitation stats
    try {
      const total = await safeCount('invitations')
      let opened = 0
      let joined = 0
      try {
        const { count: o } = await supabase.from('invitations').select('*', { count: 'exact', head: true }).not('opened_at', 'is', null)
        opened = o ?? 0
      } catch { /* */ }
      try {
        const { count: j } = await supabase.from('invitations').select('*', { count: 'exact', head: true }).not('joined_at', 'is', null)
        joined = j ?? 0
      } catch { /* */ }
      setInviteStats({ total, opened, joined })
    } catch { /* */ }
  }

  const maxTier = Math.max(...tiers.map(t => t.count), 1)
  const maxCountry = Math.max(...countries.map(c => c.count), 1)
  const maxAssignment = Math.max(...assignmentStatuses.map(a => a.count), 1)
  const maxAppStage = Math.max(...applicationStages.map(a => a.count), 1)
  const maxContrib = Math.max(...contribTypes.map(c => c.count), 1)

  // SVG line chart helpers
  const trendMax = Math.max(...regTrend.map(d => d.count), 1)
  const svgW = 600
  const svgH = 120
  const svgPad = 20
  const trendPoints = regTrend.map((d, i) => {
    const x = svgPad + (i / Math.max(regTrend.length - 1, 1)) * (svgW - 2 * svgPad)
    const y = svgH - svgPad - (d.count / trendMax) * (svgH - 2 * svgPad)
    return `${x},${y}`
  }).join(' ')

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <p className="text-sm text-[#999]">Loading analytics...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Header */}
        <div>
          <p className="jl-overline-gold mb-1">Admin</p>
          <h1 className="text-2xl jl-serif font-semibold text-[#1a1a1a]">Analytics</h1>
        </div>

        {/* ── Section 1: Content Overview ─────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">Content Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'WikiLux Content', value: content.brands },
              { label: 'Articles', value: content.articles },
              { label: 'Salaries', value: content.salaries },
              { label: 'Interviews', value: content.interviews },
              { label: 'Approved Contributions', value: content.contributions },
            ].map((item) => (
              <div key={item.label} className="jl-card p-5 text-center">
                <p className="text-3xl font-bold text-[#a58e28]">{item.value}</p>
                <p className="text-xs text-[#888] mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Member Analytics ─────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">Member Analytics</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Members by Tier */}
            <div className="jl-card p-5">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Members by Tier</h3>
              <div className="space-y-2">
                {tiers.length === 0 && <p className="text-xs text-[#999]">No data</p>}
                {tiers.map((t) => (
                  <div key={t.tier} className="flex items-center gap-3">
                    <span className="text-xs text-[#555] w-24 capitalize truncate">{t.tier}</span>
                    <div className="flex-1 h-5 bg-[#f0ede5] rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${(t.count / maxTier) * 100}%`, backgroundColor: GOLD }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#1a1a1a] w-10 text-right">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Members by Country (top 10) */}
            <div className="jl-card p-5">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Top 10 Countries</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e8e2d8]">
                    <th className="text-left py-1 text-[#888] font-medium">Country</th>
                    <th className="text-right py-1 text-[#888] font-medium">Members</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.length === 0 && (
                    <tr><td colSpan={2} className="text-[#999] py-2">No data</td></tr>
                  )}
                  {countries.map((c, i) => (
                    <tr key={c.country} className={i % 2 === 0 ? 'bg-[#0d1117]' : ''}>
                      <td className="py-1.5 text-[#1a1a1a]">{c.country}</td>
                      <td className="py-1.5 text-right font-semibold text-[#1a1a1a]">{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Members by Approval Status */}
            <div className="jl-card p-5">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Approval Status</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Approved', count: statusCounts.approved, color: '#10B981' },
                  { label: 'Pending', count: statusCounts.pending, color: '#F59E0B' },
                  { label: 'Rejected', count: statusCounts.rejected, color: '#EF4444' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${s.color}10` }}>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
                    <p className="text-xs text-[#666] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Trend */}
            <div className="jl-card p-5">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Registrations (Last 30 Days)</h3>
              {regTrend.length === 0 ? (
                <p className="text-xs text-[#999]">No data</p>
              ) : (
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 140 }}>
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const y = svgH - svgPad - frac * (svgH - 2 * svgPad)
                    return <line key={frac} x1={svgPad} y1={y} x2={svgW - svgPad} y2={y} stroke="#e8e2d8" strokeWidth="0.5" />
                  })}
                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke={GOLD}
                    strokeWidth="2"
                    points={trendPoints}
                  />
                  {/* Dots */}
                  {regTrend.map((d, i) => {
                    const x = svgPad + (i / Math.max(regTrend.length - 1, 1)) * (svgW - 2 * svgPad)
                    const y = svgH - svgPad - (d.count / trendMax) * (svgH - 2 * svgPad)
                    return <circle key={d.date} cx={x} cy={y} r="2.5" fill={GOLD} />
                  })}
                  {/* X-axis labels (every 5 days) */}
                  {regTrend.filter((_, i) => i % 5 === 0).map((d, i) => {
                    const idx = regTrend.indexOf(d)
                    const x = svgPad + (idx / Math.max(regTrend.length - 1, 1)) * (svgW - 2 * svgPad)
                    return (
                      <text key={d.date} x={x} y={svgH - 2} fontSize="8" fill="#999" textAnchor="middle">
                        {d.date.slice(5)}
                      </text>
                    )
                  })}
                </svg>
              )}
            </div>
          </div>
        </section>

        {/* ── Section 3: Recruitment Analytics ────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">Recruitment Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assignments by Status */}
            <div className="jl-card p-5">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Assignments by Status</h3>
              <div className="space-y-2">
                {assignmentStatuses.length === 0 && <p className="text-xs text-[#999]">No data</p>}
                {assignmentStatuses.map((a) => (
                  <div key={a.status} className="flex items-center gap-3">
                    <span className="text-xs text-[#555] w-28 capitalize truncate">{a.status.replace(/_/g, ' ')}</span>
                    <div className="flex-1 h-5 bg-[#f0ede5] rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${(a.count / maxAssignment) * 100}%`, backgroundColor: '#3B82F6' }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#1a1a1a] w-10 text-right">{a.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications by Stage */}
            <div className="jl-card p-5">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Applications by Stage</h3>
              <div className="space-y-2">
                {applicationStages.length === 0 && <p className="text-xs text-[#999]">No data</p>}
                {applicationStages.map((a) => (
                  <div key={a.status} className="flex items-center gap-3">
                    <span className="text-xs text-[#555] w-28 capitalize truncate">{a.status.replace(/_/g, ' ')}</span>
                    <div className="flex-1 h-5 bg-[#f0ede5] rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${(a.count / maxAppStage) * 100}%`, backgroundColor: '#8B5CF6' }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#1a1a1a] w-10 text-right">{a.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Engagement Analytics ─────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">Engagement Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contributions by Type */}
            <div className="jl-card p-5">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Contributions by Type</h3>
              <div className="space-y-2">
                {contribTypes.length === 0 && <p className="text-xs text-[#999]">No data</p>}
                {contribTypes.map((c) => (
                  <div key={c.type} className="flex items-center gap-3">
                    <span className="text-xs text-[#555] w-32 capitalize truncate">{c.type.replace(/_/g, ' ')}</span>
                    <div className="flex-1 h-5 bg-[#f0ede5] rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{ width: `${(c.count / maxContrib) * 100}%`, backgroundColor: GOLD }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#1a1a1a] w-10 text-right">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invitation Stats */}
            <div className="jl-card p-5">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Invitation Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Sent', count: inviteStats.total, color: '#6B7280' },
                  { label: 'Opened', count: inviteStats.opened, color: '#3B82F6' },
                  { label: 'Joined', count: inviteStats.joined, color: '#10B981' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${s.color}10` }}>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
                    <p className="text-xs text-[#666] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 5: GA4 + Search Console Placeholder ──── */}
        <section>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">External Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="jl-card p-6">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-2">Google Analytics 4</h3>
              <p className="text-xs text-[#888] mb-4">
                Connect your GA4 property to see website traffic, user behaviour, and conversion
                data directly in this dashboard. Enter your GA4 Measurement ID below to get started.
              </p>
              <label className="jl-label text-xs mb-1 block">GA4 Measurement ID</label>
              <input
                type="text"
                className="jl-input w-full"
                placeholder="G-XXXXXXXXXX"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value)}
              />
              <p className="text-[10px] text-[#aaa] mt-2">
                Integration coming soon. This field is a placeholder.
              </p>
            </div>

            <div className="jl-card p-6">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-2">Google Search Console</h3>
              <p className="text-xs text-[#888] mb-4">
                Connect Search Console to monitor search performance, keyword rankings, and
                indexing status. This integration will display impressions, clicks, and CTR
                for your most important pages.
              </p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f5f3ed] border border-[#e8e2d8]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#a58e28" strokeWidth="1.5" />
                  <path d="M8 5v3M8 10.5v.5" stroke="#a58e28" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-xs text-[#888]">Search Console integration coming soon</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
