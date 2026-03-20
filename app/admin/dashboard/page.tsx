'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useRequireAdmin } from '@/lib/auth-hooks'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const GOLD = '#a58e28'

const STAGE_COLORS: Record<string, string> = {
  applied: '#6B7280',
  screening: '#3B82F6',
  shortlisted: '#8B5CF6',
  submitted_to_client: '#F59E0B',
  client_reviewing: '#F97316',
  interview_1: '#EC4899',
  interview_2: '#EC4899',
  interview_final: '#EC4899',
  offer_made: '#10B981',
}

const STAGE_LABELS: Record<string, string> = {
  applied: 'Applied',
  screening: 'Screening',
  shortlisted: 'Shortlisted',
  submitted_to_client: 'Submitted',
  client_reviewing: 'Reviewing',
  interview_1: 'Interview 1',
  interview_2: 'Interview 2',
  interview_final: 'Final',
  offer_made: 'Offer',
}

export default function AdminDashboardPage() {
  const { isAdmin, isLoading: authLoading } = useRequireAdmin()
  const [data, setData] = useState<any>(null)
  const [atsStats, setAtsStats] = useState<any>(null)
  const [weeklyGrowth, setWeeklyGrowth] = useState<{ week: string; count: number }[]>([])
  const [activityFeed, setActivityFeed] = useState<any[]>([])
  const [autoApproved, setAutoApproved] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) return

    Promise.all([
      fetch('/api/admin/dashboard').then(r => r.json()).catch(() => null),
      fetch('/api/applications/stats').then(r => r.json()).catch(() => null),
    ]).then(([dashData, stats]) => {
      setData(dashData)
      setAtsStats(stats)
    }).finally(() => setLoading(false))

    fetchWeeklyGrowth()
    fetchActivityFeed()
    fetchAutoApproved()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  async function fetchWeeklyGrowth() {
    const weeks: { week: string; count: number }[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      const { count } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
        .neq('role', 'admin')
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString())
      const label = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      weeks.push({ week: label, count: count ?? 0 })
    }
    setWeeklyGrowth(weeks)
  }

  async function fetchActivityFeed() {
    const [members, contributions] = await Promise.all([
      supabase
        .from('members')
        .select('id, full_name, email, status, role, created_at')
        .neq('role', 'admin')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('contributions')
        .select('id, contribution_type, brand_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const items: any[] = []
    for (const m of members.data || []) {
      items.push({
        type: 'member',
        text: `${m.full_name || m.email} registered as ${m.role}`,
        status: m.status,
        date: m.created_at,
        href: `/admin/members/${m.id}`,
      })
    }
    for (const c of contributions.data || []) {
      items.push({
        type: 'contribution',
        text: `New ${c.contribution_type?.replace('_', ' ')} for ${c.brand_name || 'Unknown'}`,
        status: c.status,
        date: c.created_at,
        href: '/admin/contributions',
      })
    }
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setActivityFeed(items.slice(0, 20))
  }

  async function fetchAutoApproved() {
    const { data } = await supabase
      .from('member_ai_reviews')
      .select('member_id, confidence, created_at')
      .eq('auto_approved', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!data || data.length === 0) {
      setAutoApproved([])
      return
    }

    // Fetch member details for these
    const memberIds = data.map(d => d.member_id)
    const { data: members } = await supabase
      .from('members')
      .select('id, full_name, role, maison')
      .in('id', memberIds)

    const memberMap = new Map((members || []).map(m => [m.id, m]))
    setAutoApproved(data.map(d => ({
      ...d,
      member: memberMap.get(d.member_id),
    })))
  }

  function relativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <p className="text-sm text-[#999]">Loading dashboard...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <p className="text-sm text-red-500">Failed to load dashboard data.</p>
      </div>
    )
  }

  const { overview } = data

  const kpis = [
    { label: 'Total Members', value: overview.totalMembers, trend: overview.newThisWeek > 0 ? `+${overview.newThisWeek} this week` : null },
    { label: 'Pending Approvals', value: overview.pendingApprovals, highlight: overview.pendingApprovals > 0 },
    { label: 'Active Assignments', value: overview.publishedBriefs },
    { label: 'Open Applications', value: atsStats?.active_candidates ?? 0 },
    { label: 'Unread Messages', value: 0 },
    { label: 'Pending Contributions', value: overview.pendingContributions, highlight: overview.pendingContributions > 0 },
  ]

  const maxWeekly = Math.max(...weeklyGrowth.map(w => w.count), 1)
  const stages = atsStats?.by_stage || []
  const maxStage = Math.max(...stages.map((s: any) => s.count), 1)

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <div className="bg-white border-b border-[#e8e2d8] px-6 py-5">
        <p className="jl-overline-gold mb-1">Administration</p>
        <h1 className="jl-serif text-2xl text-[#1a1a1a]">Command Centre</h1>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Row 1 — KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className={`bg-white border rounded-sm p-4 ${kpi.highlight ? 'border-[#a58e28]' : 'border-[#e8e2d8]'}`}
            >
              <p className="text-[0.6rem] text-[#999] uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className={`jl-serif text-2xl ${kpi.highlight ? 'text-[#a58e28]' : 'text-[#1a1a1a]'}`}>
                {kpi.value}
              </p>
              {kpi.trend && <p className="text-[0.65rem] text-[#a58e28] mt-0.5">{kpi.trend}</p>}
            </div>
          ))}
        </div>

        {/* Row 2 — Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Member Growth Chart */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-5">
            <h2 className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#a58e28] mb-4">
              Member Growth (12 weeks)
            </h2>
            {weeklyGrowth.length > 0 ? (
              <div>
                <div className="flex items-end gap-1 h-[140px]">
                  {weeklyGrowth.map((w, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full rounded-t-sm transition-all"
                        style={{
                          height: `${Math.max((w.count / maxWeekly) * 100, 2)}%`,
                          backgroundColor: GOLD,
                          opacity: 0.7 + (i / weeklyGrowth.length) * 0.3,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 mt-2">
                  {weeklyGrowth.map((w, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className="text-[0.45rem] text-[#666] truncate">{w.week}</div>
                      <div className="text-[0.5rem] text-[#a58e28]">{w.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#666]">Loading chart data...</p>
            )}
          </div>

          {/* Application Pipeline */}
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-5">
            <h2 className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#a58e28] mb-4">
              Application Pipeline
            </h2>
            {stages.length > 0 ? (
              <div className="space-y-2.5">
                {stages
                  .filter((s: any) => STAGE_LABELS[s.stage])
                  .map((s: any) => (
                    <div key={s.stage} className="flex items-center gap-3">
                      <span className="text-xs text-[#888] w-20 flex-shrink-0 truncate">
                        {STAGE_LABELS[s.stage]}
                      </span>
                      <div className="flex-1 h-5 bg-[#f0ece4] rounded overflow-hidden">
                        <div
                          className="h-full rounded transition-all flex items-center pl-2"
                          style={{
                            width: `${Math.max((s.count / maxStage) * 100, 8)}%`,
                            backgroundColor: STAGE_COLORS[s.stage] || '#999',
                          }}
                        >
                          <span className="text-[0.6rem] text-white font-semibold">{s.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-[#999]">No candidates in pipeline yet.</p>
            )}
          </div>
        </div>

        {/* Row 3 — Activity + Auto-Approved */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Activity Feed */}
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-5">
            <h2 className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#a58e28] mb-4">
              Recent Activity
            </h2>
            {activityFeed.length === 0 ? (
              <p className="text-sm text-[#999]">No recent activity.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {activityFeed.map((item, i) => (
                  <Link key={i} href={item.href} className="flex items-start gap-3 group">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.type === 'member' ? 'bg-[#1a1a1a]' : 'bg-[#a58e28]/10'
                    }`}>
                      <span className="text-[0.5rem] font-bold text-[#a58e28]">
                        {item.type === 'member' ? 'M' : 'C'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors truncate">
                        {item.text}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[0.6rem] px-1.5 py-0.5 rounded-sm ${
                          item.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                          item.status === 'approved' ? 'bg-green-50 text-green-700' :
                          'bg-gray-50 text-gray-600'
                        }`}>{item.status}</span>
                        <span className="text-[0.6rem] text-[#ccc]">{relativeTime(item.date)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recently Auto-Approved */}
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-5">
            <h2 className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#a58e28] mb-4">
              Recently Auto-Approved by AI
            </h2>
            {autoApproved.length === 0 ? (
              <p className="text-sm text-[#999]">No auto-approved members yet.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {autoApproved.map((item, i) => (
                  <Link key={i} href={`/admin/members/${item.member_id}`} className="flex items-center justify-between group">
                    <div className="min-w-0">
                      <p className="text-xs text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors truncate">
                        {item.member?.full_name || 'Unknown'}
                      </p>
                      <p className="text-[0.6rem] text-[#999]">
                        {item.member?.role} · {item.member?.maison || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]" title="High confidence" />
                      <span className="text-[0.6rem] text-[#ccc]">{relativeTime(item.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 4 — Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin" className="bg-white border border-[#e8e2d8] rounded-sm p-4 hover:border-[#a58e28] transition-colors text-center">
            <p className="text-sm font-medium text-[#1a1a1a]">Review Pending Members</p>
            <p className="text-[0.6rem] text-[#999] mt-1">Approve or reject applications</p>
          </Link>
          <Link href="/admin/contributions" className="bg-white border border-[#e8e2d8] rounded-sm p-4 hover:border-[#a58e28] transition-colors text-center">
            <p className="text-sm font-medium text-[#1a1a1a]">Review Contributions</p>
            <p className="text-[0.6rem] text-[#999] mt-1">Approve member submissions</p>
          </Link>
          <Link href="/admin/assignments/new" className="bg-white border border-[#e8e2d8] rounded-sm p-4 hover:border-[#a58e28] transition-colors text-center">
            <p className="text-sm font-medium text-[#1a1a1a]">Create Assignment</p>
            <p className="text-[0.6rem] text-[#999] mt-1">New search assignment</p>
          </Link>
          <Link href="/admin/messages" className="bg-white border border-[#e8e2d8] rounded-sm p-4 hover:border-[#a58e28] transition-colors text-center">
            <p className="text-sm font-medium text-[#1a1a1a]">Compose Message</p>
            <p className="text-[0.6rem] text-[#999] mt-1">Send to members or clients</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
