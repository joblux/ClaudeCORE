'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useRequireAdmin } from '@/lib/auth-hooks'
import {
  Briefcase, PenLine, UserCheck, Download, Send,
  CheckCircle2, Circle
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ── ATS stage config ─────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { key: 'applied', label: 'Sourced', color: 'bg-blue-100 text-blue-700' },
  { key: 'screening', label: 'Screening', color: 'bg-amber-100 text-amber-700' },
  { key: 'shortlisted', label: 'Interview', color: 'bg-[#111111]/15 text-[#444444]' },
  { key: 'offer_made', label: 'Placed', color: 'bg-green-100 text-green-700' },
]

// ── Tasks (loaded from admin_tasks table) ────────────────────────────────────

type AdminTask = { id: string; label: string; done: boolean; category: string; completed_at: string | null }

const CHECKLIST_VISIBLE = 8

// ── System status (TODO: pull from Coolify/Supabase/Anthropic APIs in future) ──

const SYSTEM_STATUS: { service: string; detail: string; status: 'green' | 'amber' | 'red' }[] = []

// ── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { isAdmin, isLoading: authLoading, name } = useRequireAdmin()

  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({
    members: 0, pendingMembers: 0,
    assignments: 0, activeAssignments: 0,
    articles: 0,
    brands: 0, failedBrands: 0,
    salaries: 0,
    interviews: 0, houses: 0,
  })
  const [pipelineData, setPipelineData] = useState<Record<string, number>>({})
  const [activityFeed, setActivityFeed] = useState<any[]>([])
  const [tasks, setTasks] = useState<AdminTask[]>([])

  useEffect(() => {
    fetch('/api/admin/tasks')
      .then(r => r.ok ? r.json() : { tasks: [] })
      .then(d => setTasks(d.tasks || []))
      .catch(() => {})
  }, [])

  async function toggleTask(task: AdminTask) {
    const next = !task.done
    setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: next } : t))
    try {
      await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: next }),
      })
    } catch {
      setTasks(ts => ts.map(t => t.id === task.id ? task : t))
    }
  }

  useEffect(() => {
    if (!isAdmin) return

    Promise.all([
      fetchKPIs(),
      fetchPipeline(),
      fetchActivity(),
    ]).finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  async function fetchKPIs() {
    const [
      totalMembers, pendingMembers,
      totalAssignments, activeAssignments,
      totalArticles,
      totalBrands,
      totalSalaries,
      totalInterviews,
    ] = await Promise.all([
      supabase.from('members').select('id', { count: 'exact', head: true }),
      supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('search_assignments').select('id', { count: 'exact', head: true }),
      supabase.from('search_assignments').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('bloglux_articles').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      fetch('/api/brands/stats', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ total: 0, published: 0 })),
      supabase.from('salary_benchmarks').select('id', { count: 'exact', head: true }),
      supabase.from('interview_experiences').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    ])

    setKpis({
      members: totalMembers.count ?? 0,
      pendingMembers: pendingMembers.count ?? 0,
      assignments: totalAssignments.count ?? 0,
      activeAssignments: activeAssignments.count ?? 0,
      articles: totalArticles.count ?? 0,
      brands: totalBrands.total ?? 0,
      failedBrands: 0,
      salaries: totalSalaries.count ?? 0,
      interviews: totalInterviews.count ?? 0,
      houses: 0,
    })
  }

  async function fetchPipeline() {
    try {
      const res = await fetch('/api/applications/stats')
      const data = await res.json()
      const byStage: Record<string, number> = {}
      for (const s of data?.by_stage || []) {
        byStage[s.stage] = s.count
      }
      setPipelineData(byStage)
    } catch {
      setPipelineData({})
    }
  }

  async function fetchActivity() {
    const [members, contributions] = await Promise.all([
      supabase
        .from('members')
        .select('id, full_name, email, status, role, created_at')
        .neq('role', 'admin')
        .order('created_at', { ascending: false })
        .limit(6),
      // Exclude interview_experience contributions: the interview module
      // is discarded and interview_experiences is empty, so these rows
      // are ghost activity referencing nothing real.
      supabase
        .from('contributions')
        .select('id, contribution_type, brand_name, status, created_at')
        .is('deleted_at', null)
        .neq('contribution_type', 'interview_experience')
        .order('created_at', { ascending: false })
        .limit(6),
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
    setActivityFeed(items.slice(0, 8))
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <p className="text-sm text-[#999]">Loading dashboard...</p>
      </div>
    )
  }

  const firstName = name?.split(' ')[0] || 'Mo'
  const pipelineTotal = PIPELINE_STAGES.reduce((sum, s) => sum + (pipelineData[s.key] || 0), 0)
  const tasksDone = tasks.filter(t => t.done).length
  const tasksTotal = tasks.length
  const visibleTasks = tasks.filter(t => !t.done).slice(0, CHECKLIST_VISIBLE)

  // KPI sub-labels: only render meaningful product facts. Removed
  // misleading dev/admin labels ('All seeded', 'All reviewed',
  // 'All cached') and meaningless secondary stats (e.g. 'X houses').
  const kpiCards: { label: string; value: number; sub: string | null; subColor: string }[] = [
    {
      label: 'PROFILES',
      value: kpis.members,
      sub: kpis.pendingMembers > 0 ? `+${kpis.pendingMembers} pending` : null,
      subColor: 'text-green-600',
    },
    {
      label: 'ASSIGNMENTS',
      value: kpis.assignments,
      sub: kpis.activeAssignments > 0 ? `${kpis.activeAssignments} active` : null,
      subColor: 'text-green-600',
    },
    {
      label: 'INTELLIGENCE',
      value: kpis.articles,
      sub: 'articles',
      subColor: 'text-[#999]',
    },
    {
      label: 'WIKILUX',
      value: kpis.brands,
      sub: kpis.failedBrands > 0 ? `${kpis.failedBrands} failed` : null,
      subColor: 'text-amber-600',
    },
    {
      label: 'SALARY INTELLIGENCE',
      value: kpis.salaries,
      sub: null,
      subColor: 'text-[#999]',
    },
    {
      label: 'INTERVIEWS',
      value: kpis.interviews,
      sub: null,
      subColor: 'text-[#999]',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="px-5 py-4 lg:px-6">

        {/* ── Welcome + date ── */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-medium text-[#1a1a1a]">
            {getGreeting()}, {firstName}
          </h1>
          <span className="text-xs text-[#999] hidden sm:block">{getFormattedDate()}</span>
        </div>

        {/* ── KPI row | 6 metrics ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-gray-50 rounded-lg p-3">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-1">{kpi.label}</div>
              <div className="text-xl font-medium text-[#1a1a1a]">{kpi.value}</div>
              {kpi.sub && (
                <div className={`text-[0.6rem] font-normal mt-0.5 ${kpi.subColor}`}>{kpi.sub}</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Middle row | Pipeline / Quick Actions / System Status ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr_0.8fr] gap-3 mb-4">

          {/* Column 1: ATS Pipeline overview */}
          <div className="border border-[#e8e8e8] rounded-xl p-4 bg-[#f5f5f5]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999]">ATS Pipeline</span>
              <Link href="/admin/ats" className="text-[11px] text-[#444444] hover:text-[#8a7622] font-medium transition-colors">
                View pipeline →
              </Link>
            </div>

            {pipelineTotal > 0 ? (
              <>
                <div className="flex gap-1.5 mb-3">
                  {PIPELINE_STAGES.map((stage) => {
                    const count = pipelineData[stage.key] || 0
                    if (count === 0) return null
                    return (
                      <div
                        key={stage.key}
                        className={`rounded-lg px-3 py-2 ${stage.color}`}
                        style={{ flex: Math.max(count, 1) }}
                      >
                        <div className="text-[0.6rem] font-medium">{stage.label}</div>
                        <div className="text-base font-medium">{count}</div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-[#999]">{pipelineTotal} candidates across {kpis.activeAssignments} active assignment{kpis.activeAssignments !== 1 ? 's' : ''}</p>
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-xs text-[#999]">No active assignments yet.</p>
                <p className="text-[0.6rem] font-normal text-[#aaa] mt-1">Pipeline populates when you create search assignments.</p>
              </div>
            )}
          </div>

          {/* Column 2: Quick Actions */}
          <div className="border border-[#e8e8e8] rounded-xl p-4 bg-[#f5f5f5]">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] block mb-3">Quick Actions</span>
            <div className="space-y-1.5">
              {[
                { label: 'New search assignment', href: '/admin/assignments/new', icon: Briefcase },
                { label: 'Write intelligence article', href: '/admin/articles/new', icon: PenLine },
                ...(kpis.pendingMembers > 0 ? [{ label: `Review pending profile (${kpis.pendingMembers})`, href: '/admin', icon: UserCheck }] : []),
                { label: 'Import content', href: '/admin/assignments/import', icon: Download },
                { label: 'Invite professionals', href: '/admin/invitations', icon: Send },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2 text-xs text-[#c9d1d9] hover:bg-[#fafafa] transition-colors group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#111111] flex-shrink-0" />
                    <Icon size={13} className="text-[#999] group-hover:text-[#444444] transition-colors flex-shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Column 3: System Status */}
          <div className="border border-[#e8e8e8] rounded-xl p-4 bg-[#f5f5f5]">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] block mb-3">System Status</span>
            <div className="space-y-2.5">
              {SYSTEM_STATUS.map((item) => (
                <div key={item.service} className="flex items-start gap-2.5">
                  <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                    item.status === 'green' ? 'bg-green-500' :
                    item.status === 'amber' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`} />
                  <div className="min-w-0">
                    <div className="text-xs text-[#1a1a1a] font-medium">{item.service}</div>
                    <div className="text-[0.6rem] font-normal text-[#aaa]">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* TODO: Pull real data from Coolify, Supabase, Anthropic APIs when available */}
          </div>
        </div>

        {/* ── Bottom row | Activity + Launch Checklist ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

          {/* Column 1: Recent Activity */}
          <div className="border border-[#e8e8e8] rounded-xl p-4 bg-[#f5f5f5]">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] block mb-3">Recent Activity</span>
            {activityFeed.length === 0 ? (
              <p className="text-xs text-[#999] py-4 text-center">No recent activity.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {activityFeed.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex items-center justify-between py-2 group first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.type === 'member' ? 'bg-[#f5f5f5]' : 'bg-[#111111]/10'
                      }`}>
                        <span className="text-[7px] font-bold text-[#444444]">
                          {item.type === 'member' ? 'M' : 'C'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-[#1a1a1a] group-hover:text-[#444444] transition-colors truncate">
                          {item.text}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                        item.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        item.status === 'approved' ? 'bg-green-50 text-green-700' :
                        'bg-gray-50 text-[#999]'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-[0.6rem] font-normal text-[#aaa] min-w-[45px] text-right">{relativeTime(item.date)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Tasks */}
          <div className="border border-[#e8e8e8] rounded-xl p-4 bg-[#f5f5f5]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999]">Tasks</span>
              <span className="text-[11px] font-medium text-[#444444]">{tasksDone}/{tasksTotal} done</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-[#111111] rounded-full transition-all"
                style={{ width: `${tasksTotal > 0 ? (tasksDone / tasksTotal) * 100 : 0}%` }}
              />
            </div>

            <div className="space-y-1">
              {visibleTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 py-1">
                  <button onClick={() => toggleTask(task)} className="flex-shrink-0">
                    {task.done ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <Circle size={14} className="text-gray-300 hover:text-[#666] transition-colors" />
                    )}
                  </button>
                  <span className={`text-xs ${task.done ? 'text-[#999] line-through' : 'text-[#1a1a1a]'}`}>
                    {task.label}
                  </span>
                </div>
              ))}
              {visibleTasks.length === 0 && tasksTotal > 0 && (
                <div className="text-[11px] text-[#999] py-1">All tasks complete.</div>
              )}
            </div>

            <Link
              href="/admin/tasks"
              className="text-[11px] text-[#444444] hover:text-[#111] font-medium mt-2 inline-block transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
