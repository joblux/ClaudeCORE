'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useSession } from 'next-auth/react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Helpers ─────────────────────────────────────────────────────────
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  talent: { bg: 'rgba(33,150,243,0.12)', text: '#2196F3' },
  market: { bg: 'rgba(76,175,80,0.12)', text: '#4CAF50' },
  brand: { bg: 'rgba(255,152,0,0.12)', text: '#FF9800' },
  finance: { bg: 'rgba(156,39,176,0.12)', text: '#9C27B0' },
}

const SIGNAL_COLORS: Record<string, string> = {
  talent: '#2196F3',
  market: '#4CAF50',
  brand: '#FF9800',
  finance: '#9C27B0',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'UNDER REVIEW', color: '#FF9800' },
  approved: { label: 'VERIFIED', color: '#4CAF50' },
  rejected: { label: 'REJECTED', color: '#f44336' },
}

const TIER_LABELS: Record<string, string> = {
  rising: 'EMERGING PROFESSIONAL',
  pro: 'ESTABLISHED PROFESSIONAL',
  professional: 'ESTABLISHED PROFESSIONAL',
  executive: 'SENIOR & EXECUTIVE',
  business: 'LUXURY EMPLOYER',
  insider: 'TRUSTED CONTRIBUTOR',
}

// ── Skeleton loader ─────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-[#2a2a2a] rounded animate-pulse ${className}`} />
}

// ── Empty state component ───────────────────────────────────────────
function EmptySection({ icon, title, description, actionLabel, actionHref }: {
  icon: string; title: string; description: string; actionLabel?: string; actionHref?: string
}) {
  return (
    <div className="text-center py-6">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-sm text-[#ccc] mb-1">{title}</p>
      <p className="text-xs text-[#999] mb-3 max-w-xs mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-xs text-[#a58e28] border border-[rgba(165,142,40,0.3)] rounded px-3 py-1.5 hover:bg-[rgba(165,142,40,0.1)] transition-colors">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════

export default function CandidateDashboard() {
  const { data: session } = useSession()
  const memberId = (session?.user as any)?.memberId
  const role = (session?.user as any)?.role

  // ── State ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [memberData, setMemberData] = useState<any>(null)
  const [profilux, setProfilux] = useState<any>(null)
  const [roles, setRoles] = useState<any[]>([])
  const [signals, setSignals] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [contributions, setContributions] = useState<any[]>([])
  const [contributionStats, setContributionStats] = useState<any>(null)

  // ── Fetch all data ────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return

    async function fetchAll() {
      try {
        // 1. Member info
        const memberRes = await fetch('/api/members/me')
        if (memberRes.ok) setMemberData(await memberRes.json())

        // 2. Profilux completion
        const profiluxRes = await fetch('/api/profilux')
        if (profiluxRes.ok) {
          const pData = await profiluxRes.json()
          setProfilux(pData.profile || pData)
        }

        // 3. Active careers (search assignments)
        const rolesRes = await fetch('/api/assignments?status=active&limit=4')
        if (rolesRes.ok) {
          const rData = await rolesRes.json()
          setRoles(rData.assignments || rData.data || [])
        }

        // 4. Latest signals (direct Supabase, same pattern as signals page)
        const { data: sigData } = await supabase
          .from('signals')
          .select('id, slug, title, category, brand, published_at')
          .order('published_at', { ascending: false })
          .limit(4)
        if (sigData) setSignals(sigData)

        // 5. Upcoming events
        const now = new Date().toISOString()
        const { data: evData } = await supabase
          .from('events')
          .select('id, slug, title, start_date, location, sector')
          .gte('start_date', now)
          .order('start_date', { ascending: true })
          .limit(3)
        if (evData) setEvents(evData)

        // 6. My contributions
        if (memberId) {
          const contribRes = await fetch('/api/contributions?limit=5')
          if (contribRes.ok) {
            const cData = await contribRes.json()
            // Filter to only this user's contributions (API returns approved + own)
            const mine = (cData.contributions || []).filter((c: any) => c.member_id === memberId)
            setContributions(mine.slice(0, 3))
          }

          // Contribution points
          const pointsRes = await fetch('/api/contributions/my-points')
          if (pointsRes.ok) setContributionStats(await pointsRes.json())
        }

      } catch (err) {
        console.error('Dashboard fetch error:', err)
      }
      setLoading(false)
    }

    fetchAll()
  }, [session, memberId])

  // ── Derived values ────────────────────────────────────────────────
  const firstName = memberData?.first_name || (session?.user?.name || 'there').split(' ')[0]
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const tierLabel = TIER_LABELS[role || ''] || 'PROFESSIONAL'

  // Profilux completion calculation
  const profiluxCompletion = (() => {
    if (!profilux) return 0
    let filled = 0
    let total = 8
    if (profilux.firstName || profilux.first_name) filled++
    if (profilux.lastName || profilux.last_name) filled++
    if (profilux.headline || profilux.job_title) filled++
    if (profilux.bio) filled++
    if (profilux.city) filled++
    if ((profilux.experience || []).length > 0 || (profilux.work_experiences || []).length > 0) filled++
    if ((profilux.specialisations || []).length > 0) filled++
    if ((profilux.languages || []).length > 0) filled++
    return Math.round((filled / total) * 100)
  })()

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-7 pt-10 pb-16">

        {/* ── Welcome ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-normal text-white mb-1" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              {loading ? <Skeleton className="h-8 w-64" /> : `Good morning, ${firstName}`}
            </h1>
            <p className="text-sm text-[#999]">{today} · Here&apos;s your intelligence briefing</p>
          </div>
          <div className="text-right">
            <div className="inline-block border border-[#a58e28] text-[#a58e28] text-[10px] font-semibold tracking-[2px] px-3 py-1 rounded mb-2">
              {tierLabel}
            </div>
            <Link href="/dashboard/candidate/profilux" className="block text-xs text-[#999] hover:text-[#ccc] transition-colors">
              Edit profile →
            </Link>
          </div>
        </div>

        {/* ── Profilux bar ── */}
        <div className="bg-[#222] border border-[rgba(165,142,40,0.2)] rounded-xl p-4 flex items-center gap-5 mb-8">
          <div className="flex-shrink-0">
            <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-1">PROFILUX</div>
            <div className="text-xs text-[#999]">Your confidential professional profile</div>
          </div>
          <div className="flex-1">
            <div className="h-[3px] bg-[#2a2a2a] rounded-full mb-1">
              <div className="h-full bg-[#1D9E75] rounded-full transition-all" style={{ width: `${profiluxCompletion}%` }} />
            </div>
            <div className="text-[11px] text-[#999]">
              {profiluxCompletion === 100
                ? 'Profile complete'
                : `${profiluxCompletion}% complete · Fill in to unlock full matching`}
            </div>
          </div>
          <Link href="/dashboard/candidate/profilux" className="bg-white text-[#1a1a1a] text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-85 transition-opacity whitespace-nowrap">
            {profiluxCompletion === 100 ? 'View profile →' : 'Continue →'}
          </Link>
        </div>

        {/* ── Careers (matched roles) ── */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">CAREERS</span>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <Link href="/careers" className="text-xs text-[#999] hover:text-[#ccc] transition-colors">View all →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : roles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {roles.map((role: any) => (
              <Link key={role.id} href={`/careers/${role.slug || role.id}`} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:border-[#3a3a3a] transition-colors block">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-[1px] text-[#a58e28]">{(role.seniority_level || role.seniority || '').toUpperCase()}</span>
                    {role.activated_at && (Date.now() - new Date(role.activated_at).getTime() < 7 * 86400000) && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border border-[#4CAF50] text-[#4CAF50]" style={{ background: 'rgba(76,175,80,0.08)' }}>NEW</span>
                    )}
                  </div>
                  {role.salary_display === 'true' && role.salary_min && (
                    <span className="text-sm font-medium text-[#a58e28]">
                      {role.salary_currency || '€'}{Math.round(role.salary_min / 1000)}K{role.salary_max ? `–${Math.round(role.salary_max / 1000)}K` : '+'}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-[#e0e0e0] mb-1.5">{role.title}</div>
                <div className="flex gap-2 text-[11px] text-[#999]">
                  {role.city && <span>{role.city}</span>}
                  {role.department && <><span>·</span><span>{role.department}</span></>}
                  {role.brand_name && <><span>·</span><span>{role.brand_name}</span></>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl mb-8">
            <EmptySection
              icon="◎"
              title="No active opportunities yet"
              description="New career opportunities are published regularly. Complete your Profilux profile to get matched when they go live."
              actionLabel="Browse Careers →"
              actionHref="/careers"
            />
          </div>
        )}

        {/* ── Signals + Events ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

          {/* Signals */}
          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">LATEST SIGNALS</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <Link href="/signals" className="text-xs text-[#999] hover:text-[#ccc]">All signals →</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-8" />)}</div>
            ) : signals.length > 0 ? (
              <div className="divide-y divide-[#1e1e1e]">
                {signals.map(s => (
                  <Link key={s.id} href={`/signals/${s.slug || s.id}`} className="flex gap-3 py-3 hover:bg-[#2a2a2a] -mx-2 px-2 rounded transition-colors block">
                    <span className="w-[6px] h-[6px] rounded-full flex-shrink-0 mt-1.5" style={{ background: SIGNAL_COLORS[s.category] || '#888' }} />
                    <span className="text-xs text-[#ccc] flex-1 leading-relaxed">{s.title}</span>
                    <span className="text-[10px] text-[#999] whitespace-nowrap">{timeAgo(s.published_at)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptySection icon="⚡" title="No signals yet" description="Intelligence signals will appear here as the platform goes live." />
            )}
          </div>

          {/* Events */}
          <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">UPCOMING EVENTS</span>
              <div className="flex-1 h-px bg-[#2a2a2a]" />
              <Link href="/events" className="text-xs text-[#999] hover:text-[#ccc]">Full calendar →</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
            ) : events.length > 0 ? (
              <div className="divide-y divide-[#1e1e1e]">
                {events.map(e => {
                  const d = new Date(e.start_date)
                  return (
                    <Link key={e.id} href={`/events/${e.slug || e.id}`} className="flex gap-4 py-3 hover:bg-[#2a2a2a] -mx-2 px-2 rounded transition-colors block">
                      <div className="text-center min-w-[36px]">
                        <div className="text-xl font-light text-white leading-none">{d.getDate()}</div>
                        <div className="text-[9px] text-[#999] tracking-wider mt-0.5">{d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#ccc] leading-snug mb-0.5">{e.title}</div>
                        {e.location && <div className="text-[11px] text-[#999]">{e.location}</div>}
                        {e.sector && <div className="text-[10px] text-[#a58e28] mt-0.5">{e.sector}</div>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <EmptySection icon="◷" title="No upcoming events" description="Industry events will be listed here once the calendar is seeded." />
            )}
          </div>
        </div>

        {/* ── Contributions ── */}
        <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">MY CONTRIBUTIONS</span>
            <div className="flex-1 h-px bg-[#2a2a2a]" />
            {contributionStats && (
              <span className="text-xs text-[#999]">{contributionStats.points || 0} pts</span>
            )}
            <Link href="/contribute" className="text-xs text-[#999] hover:text-[#ccc]">Add data →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-10" />)}</div>
          ) : contributions.length > 0 ? (
            <div className="divide-y divide-[#1e1e1e]">
              {contributions.map(c => {
                const typeIcons: Record<string, string> = { salary_data: '💰', interview_experience: '🎤', wikilux_insight: '💡' }
                const typeLabels: Record<string, string> = { salary_data: 'Salary data', interview_experience: 'Interview experience', wikilux_insight: 'Market signal' }
                const st = STATUS_LABELS[c.status] || { label: c.status?.toUpperCase(), color: '#999' }
                return (
                  <div key={c.id} className="flex items-center gap-3 py-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style={{ background: 'rgba(165,142,40,0.08)', border: '1px solid rgba(165,142,40,0.15)' }}>
                      {typeIcons[c.contribution_type] || '📊'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-[#ccc] block truncate">{typeLabels[c.contribution_type] || c.contribution_type} · {c.brand_name || 'General'}</span>
                      <span className="text-[11px] text-[#999]">{timeAgo(c.created_at)}</span>
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: st.color }}>{st.label}</span>
                  </div>
                )
              })}
            </div>
          ) : null}
          <div className="mt-3 border border-dashed border-[#2a2a2a] rounded-lg p-3 text-center">
            <p className="text-[11px] text-[#999] mb-2">
              {contributions.length === 0
                ? 'Contribute salary data, interview experiences, or market signals to build the intelligence for everyone.'
                : 'Keep contributing to unlock deeper intelligence access.'}
            </p>
            <Link href="/contribute" className="text-[11px] text-[#a58e28] border border-[rgba(165,142,40,0.3)] rounded px-3 py-1 hover:bg-[rgba(165,142,40,0.1)] transition-colors">
              + Add contribution
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
