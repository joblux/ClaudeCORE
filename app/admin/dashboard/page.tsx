'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const TIER_COLORS: Record<string, string> = {
  rising: '#94a3b8',
  pro: '#60a5fa',
  professional: '#a58e28',
  executive: '#1a1a1a',
  business: '#059669',
  insider: '#7c3aed',
}

const CONTRIB_LABELS: Record<string, string> = {
  wikilux_insight: 'WikiLux Insights',
  salary_data: 'Salary Data',
  interview_experience: 'Interviews',
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <p className="text-sm text-[#999]">Loading dashboard…</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <p className="text-sm text-red-500">Failed to load dashboard data.</p>
      </main>
    )
  }

  const { overview, membersByTier, contributionsByType, recentMembers, recentContributions } = data

  // Build action items
  const actions: { label: string; count: number; href: string; urgent: boolean }[] = []
  if (overview.pendingApprovals > 0) {
    actions.push({
      label: `${overview.pendingApprovals} member${overview.pendingApprovals > 1 ? 's' : ''} waiting for approval`,
      count: overview.pendingApprovals,
      href: '/admin',
      urgent: true,
    })
  }
  if (overview.pendingContributions > 0) {
    actions.push({
      label: `${overview.pendingContributions} contribution${overview.pendingContributions > 1 ? 's' : ''} pending review`,
      count: overview.pendingContributions,
      href: '/admin/contributions',
      urgent: true,
    })
  }
  if (overview.publishedBriefs === 0) {
    actions.push({
      label: 'No active job briefs — post one to attract talent',
      count: 0,
      href: '/admin/briefs/new',
      urgent: false,
    })
  }

  return (
    <main className="min-h-screen bg-[#fafaf5]">
      {/* Header */}
      <section className="border-b border-[#e8e2d8] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="jl-overline-gold mb-1">Administration</p>
          <h1 className="jl-serif text-2xl text-[#1a1a1a]">Command Centre</h1>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ─── Action Items ─── */}
        {actions.length > 0 && (
          <div className="mb-8 space-y-2">
            {actions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className={`flex items-center justify-between p-4 rounded-sm border transition-colors ${
                  action.urgent
                    ? 'bg-[#a58e28]/5 border-[#a58e28]/30 hover:border-[#a58e28]'
                    : 'bg-white border-[#e8e2d8] hover:border-[#a58e28]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      action.urgent ? 'bg-[#a58e28]' : 'bg-[#ccc]'
                    }`}
                  />
                  <span className="text-sm text-[#1a1a1a]">{action.label}</span>
                </div>
                <span className="text-xs text-[#a58e28]">Review →</span>
              </Link>
            ))}
          </div>
        )}

        {/* ─── Key Metrics ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-5">
            <p className="text-xs text-[#999] uppercase tracking-wide">Total Members</p>
            <p className="jl-serif text-3xl text-[#1a1a1a] mt-1">{overview.totalMembers}</p>
            {overview.newThisWeek > 0 && (
              <p className="text-xs text-[#a58e28] mt-1">+{overview.newThisWeek} this week</p>
            )}
          </div>
          <Link href="/admin" className="bg-white border border-[#e8e2d8] rounded-sm p-5 hover:border-[#a58e28] transition-colors">
            <p className="text-xs text-[#999] uppercase tracking-wide">Pending Approval</p>
            <p className={`jl-serif text-3xl mt-1 ${overview.pendingApprovals > 0 ? 'text-[#a58e28]' : 'text-[#1a1a1a]'}`}>
              {overview.pendingApprovals}
            </p>
          </Link>
          <Link href="/admin/contributions" className="bg-white border border-[#e8e2d8] rounded-sm p-5 hover:border-[#a58e28] transition-colors">
            <p className="text-xs text-[#999] uppercase tracking-wide">Pending Contributions</p>
            <p className={`jl-serif text-3xl mt-1 ${overview.pendingContributions > 0 ? 'text-[#a58e28]' : 'text-[#1a1a1a]'}`}>
              {overview.pendingContributions}
            </p>
          </Link>
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-5">
            <p className="text-xs text-[#999] uppercase tracking-wide">Active Briefs</p>
            <p className="jl-serif text-3xl text-[#1a1a1a] mt-1">{overview.publishedBriefs}</p>
            <p className="text-xs text-[#999] mt-1">{overview.totalBriefs} total</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* ─── Members by Tier ─── */}
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28]">
                Members by Tier
              </h2>
              <Link href="/admin" className="text-xs text-[#a58e28] hover:text-[#1a1a1a]">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {membersByTier.map((tier: any) => (
                <div key={tier.tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: TIER_COLORS[tier.tier] || '#ccc' }}
                    />
                    <span className="text-sm text-[#1a1a1a]">{tier.label}</span>
                  </div>
                  <span className="text-sm font-medium text-[#1a1a1a]">{tier.count}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#e8e2d8] flex justify-between">
                <span className="text-xs text-[#999]">Total</span>
                <span className="text-xs font-medium text-[#1a1a1a]">{overview.totalMembers}</span>
              </div>
            </div>
          </div>

          {/* ─── Contributions Overview ─── */}
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28]">
                Contributions
              </h2>
              <Link href="/admin/contributions" className="text-xs text-[#a58e28] hover:text-[#1a1a1a]">
                Review →
              </Link>
            </div>
            {Object.keys(contributionsByType).length === 0 ? (
              <p className="text-sm text-[#999]">No contributions yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(contributionsByType).map(([type, stats]: [string, any]) => (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#1a1a1a]">{CONTRIB_LABELS[type] || type}</span>
                      <span className="text-[#999]">{stats.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#e8e2d8] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#a58e28] rounded-full"
                        style={{
                          width: stats.total > 0 ? `${(stats.approved / stats.total) * 100}%` : '0%',
                        }}
                      />
                    </div>
                    <p className="text-xs text-[#999] mt-0.5">
                      {stats.approved} approved · {stats.pending} pending
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-3 mt-3 border-t border-[#e8e2d8] flex justify-between">
              <span className="text-xs text-[#999]">Total</span>
              <span className="text-xs font-medium text-[#1a1a1a]">{overview.totalContributions}</span>
            </div>
          </div>

          {/* ─── Quick Actions ─── */}
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
            <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/admin"
                className="flex items-center gap-3 p-3 border border-[#e8e2d8] rounded-sm hover:border-[#a58e28] transition-colors"
              >
                <span className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] text-[#a58e28] text-xs rounded-sm">M</span>
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Manage Members</p>
                  <p className="text-xs text-[#999]">Approve, reject, search members</p>
                </div>
              </Link>
              <Link
                href="/admin/briefs/new"
                className="flex items-center gap-3 p-3 border border-[#e8e2d8] rounded-sm hover:border-[#a58e28] transition-colors"
              >
                <span className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] text-[#a58e28] text-xs rounded-sm">B</span>
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Post a Brief</p>
                  <p className="text-xs text-[#999]">Create a new job assignment</p>
                </div>
              </Link>
              <Link
                href="/admin/contributions"
                className="flex items-center gap-3 p-3 border border-[#e8e2d8] rounded-sm hover:border-[#a58e28] transition-colors"
              >
                <span className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] text-[#a58e28] text-xs rounded-sm">C</span>
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Review Contributions</p>
                  <p className="text-xs text-[#999]">Approve member submissions</p>
                </div>
              </Link>
              <Link
                href="/admin/articles"
                className="flex items-center gap-3 p-3 border border-[#e8e2d8] rounded-sm hover:border-[#a58e28] transition-colors"
              >
                <span className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] text-[#a58e28] text-xs rounded-sm">A</span>
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Manage Articles</p>
                  <p className="text-xs text-[#999]">Bloglux editorial</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Recent Activity ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Members */}
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28]">
                Recent Members
              </h2>
              <Link href="/admin" className="text-xs text-[#a58e28] hover:text-[#1a1a1a]">
                View all →
              </Link>
            </div>
            {recentMembers.length === 0 ? (
              <p className="text-sm text-[#999]">No members yet.</p>
            ) : (
              <div className="space-y-3">
                {recentMembers.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">
                        {m.full_name || m.email}
                      </p>
                      <p className="text-xs text-[#999] truncate">
                        {m.job_title && m.maison
                          ? `${m.job_title} at ${m.maison}`
                          : m.city && m.country
                          ? `${m.city}, ${m.country}`
                          : m.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-sm ${
                          m.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : m.status === 'approved'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {m.status}
                      </span>
                      <span className="text-xs text-[#999]">{formatDate(m.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Contributions */}
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28]">
                Recent Contributions
              </h2>
              <Link href="/admin/contributions" className="text-xs text-[#a58e28] hover:text-[#1a1a1a]">
                View all →
              </Link>
            </div>
            {recentContributions.length === 0 ? (
              <p className="text-sm text-[#999]">No contributions yet.</p>
            ) : (
              <div className="space-y-3">
                {recentContributions.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">
                        {c.brand_name || 'Unknown brand'}
                      </p>
                      <p className="text-xs text-[#999]">
                        {CONTRIB_LABELS[c.contribution_type] || c.contribution_type} ·{' '}
                        {c.is_anonymous ? 'Anonymous' : c.members?.full_name || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-sm ${
                          c.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : c.status === 'approved'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {c.status}
                      </span>
                      <span className="text-xs text-[#999]">{formatDate(c.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
