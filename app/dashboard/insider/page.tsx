'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useSession } from 'next-auth/react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

const SIGNAL_COLORS: Record<string, string> = {
  talent: '#2196F3', market: '#4CAF50', brand: '#FF9800', finance: '#9C27B0',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'UNDER REVIEW', color: '#FF9800' },
  approved: { label: 'VERIFIED', color: '#4CAF50' },
  rejected: { label: 'REJECTED', color: '#f44336' },
}

const navItems = [
  { section: 'DASHBOARD', items: [
    { label: 'Overview', id: 'overview' },
    { label: 'My contributions', id: 'contributions' },
    { label: 'Impact tracker', id: 'impact' },
  ]},
  { section: 'CONTRIBUTE', items: [
    { label: 'Add salary data', id: 'add-salary' },
    { label: 'Add interview data', id: 'add-interview' },
    { label: 'Add market signal', id: 'add-signal' },
  ]},
  { section: 'EXPLORE', items: [
    { label: 'Signals', id: 'signals-link' },
    { label: 'Brands', id: 'brands-link' },
    { label: 'Events', id: 'events-link' },
  ]},
]

function EmptyCard({ title, description, actionLabel, actionHref }: {
  title: string; description: string; actionLabel?: string; actionHref?: string
}) {
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '36px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>{title}</div>
      <p style={{ fontSize: 13, color: '#999', marginBottom: actionLabel ? 14 : 0, maxWidth: 400, margin: '0 auto' + (actionLabel ? ' 14px' : '') }}>{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} style={{ display: 'inline-block', padding: '9px 20px', fontSize: 12, fontWeight: 500, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, textDecoration: 'none' }}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

export default function InsiderDashboard() {
  const { data: session } = useSession()
  const memberId = (session?.user as any)?.memberId

  const [loading, setLoading] = useState(true)
  const [contributions, setContributions] = useState<any[]>([])
  const [contributionStats, setContributionStats] = useState<any>(null)
  const [signals, setSignals] = useState<any[]>([])
  const [activeNav, setActiveNav] = useState('overview')

  const firstName = (session?.user?.name || 'there').split(' ')[0]

  useEffect(() => {
    if (!session) return

    async function fetchAll() {
      try {
        // My contributions
        if (memberId) {
          const contribRes = await fetch('/api/contributions?limit=20')
          if (contribRes.ok) {
            const cData = await contribRes.json()
            const mine = (cData.contributions || []).filter((c: any) => c.member_id === memberId)
            setContributions(mine)
          }

          const pointsRes = await fetch('/api/contributions/my-points')
          if (pointsRes.ok) setContributionStats(await pointsRes.json())
        }

        // Latest signals
        const { data: sigData } = await supabase
          .from('signals')
          .select('id, slug, title, category, brand, published_at')
          .order('published_at', { ascending: false })
          .limit(5)
        if (sigData) setSignals(sigData)

      } catch (err) {
        console.error('Insider dashboard fetch error:', err)
      }
      setLoading(false)
    }

    fetchAll()
  }, [session, memberId])

  // Navigate to external pages for explore links
  useEffect(() => {
    if (activeNav === 'signals-link') { window.location.href = '/signals'; return }
    if (activeNav === 'brands-link') { window.location.href = '/wikilux'; return }
    if (activeNav === 'events-link') { window.location.href = '/events'; return }
    if (activeNav === 'add-salary' || activeNav === 'add-interview' || activeNav === 'add-signal') {
      window.location.href = '/contribute'
      return
    }
  }, [activeNav])

  // Derived stats
  const approvedCount = contributions.filter(c => c.status === 'approved').length
  const pendingCount = contributions.filter(c => c.status === 'pending').length
  const totalPoints = contributionStats?.points || 0
  const salaryCount = contributions.filter(c => c.contribution_type === 'salary_data').length
  const interviewCount = contributions.filter(c => c.contribution_type === 'interview_experience').length
  const signalCount = contributions.filter(c => c.contribution_type === 'wikilux_insight').length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, background: '#111', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column' }}>
        {/* Profile */}
        <div style={{ padding: '24px 16px 20px', borderBottom: '1px solid #1e1e1e' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 8 }}>
            {firstName[0]?.toUpperCase() || 'T'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{firstName}</div>
          <div style={{ fontSize: 11, color: '#a58e28', marginTop: 4 }}>TRUSTED CONTRIBUTOR</div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 300, color: '#fff' }}>{totalPoints}<span style={{ fontSize: 11, color: '#999', marginLeft: 4 }}>pts</span></div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(section => (
            <div key={section.section} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#555', letterSpacing: '1.5px', padding: '6px 8px 4px' }}>{section.section}</div>
              {section.items.map(item => (
                <button key={item.id} onClick={() => setActiveNav(item.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 13, background: activeNav === item.id ? '#1e1e1e' : 'transparent', color: activeNav === item.id ? '#fff' : '#999' }}>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 900 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, color: '#fff', margin: 0 }}>
            {loading ? 'Loading...' : `Welcome back, ${firstName}`}
          </h1>
          <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Your contributor dashboard</p>
        </div>

        {/* ── OVERVIEW ── */}
        {activeNav === 'overview' && (<>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Total contributions', value: String(contributions.length), sub: `${approvedCount} verified · ${pendingCount} pending` },
              { label: 'Points earned', value: String(totalPoints), sub: contributionStats?.next_level ? `${contributionStats.next_level.points_needed} pts to ${contributionStats.next_level.level}` : 'Keep contributing' },
              { label: 'By type', value: `${salaryCount}S · ${interviewCount}I · ${signalCount}M`, sub: 'Salary · Interview · Signal' },
            ].map(c => (
              <div key={c.label} style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '18px 20px' }}>
                <div style={{ fontSize: 24, fontWeight: 300, color: '#fff' }}>{c.value}</div>
                <div style={{ fontSize: 13, color: '#ccc', marginTop: 4 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent contributions */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Recent contributions</div>
              <Link href="/contribute" style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>+ Add new →</Link>
            </div>
            {contributions.length > 0 ? (
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '4px 20px' }}>
                {contributions.slice(0, 5).map((c, i) => {
                  const typeIcons: Record<string, string> = { salary_data: '💰', interview_experience: '🎤', wikilux_insight: '💡' }
                  const typeLabels: Record<string, string> = { salary_data: 'Salary data', interview_experience: 'Interview experience', wikilux_insight: 'Market signal' }
                  const st = STATUS_LABELS[c.status] || { label: (c.status || '').toUpperCase(), color: '#999' }
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < Math.min(contributions.length, 5) - 1 ? '1px solid #1e1e1e' : 'none' }}>
                      <span style={{ fontSize: 16 }}>{typeIcons[c.contribution_type] || '📊'}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, color: '#ccc', display: 'block' }}>{typeLabels[c.contribution_type] || c.contribution_type} · {c.brand_name || 'General'}</span>
                        <span style={{ fontSize: 11, color: '#999' }}>{timeAgo(c.created_at)}</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: st.color }}>{st.label}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyCard
                title="No contributions yet"
                description="As a Trusted Contributor, your salary data, interview experiences, and market signals are what powers JOBLUX intelligence."
                actionLabel="+ Add your first contribution"
                actionHref="/contribute"
              />
            )}
          </div>

          {/* Latest signals */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Latest signals</div>
              <Link href="/signals" style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>All signals →</Link>
            </div>
            {signals.length > 0 ? (
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '4px 20px' }}>
                {signals.map((s, i) => (
                  <Link key={s.id} href={`/signals/${s.slug || s.id}`} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: i < signals.length - 1 ? '1px solid #1e1e1e' : 'none', textDecoration: 'none', alignItems: 'flex-start' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: SIGNAL_COLORS[s.category] || '#888', flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 13, color: '#ccc', flex: 1, lineHeight: 1.4 }}>{s.title}</span>
                    <span style={{ fontSize: 11, color: '#999', whiteSpace: 'nowrap' }}>{timeAgo(s.published_at)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyCard title="No signals yet" description="Market intelligence will appear here as it gets published." />
            )}
          </div>
        </>)}

        {/* ── CONTRIBUTIONS tab ── */}
        {activeNav === 'contributions' && (
          contributions.length > 0 ? (
            <div>
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '4px 20px', marginBottom: 14 }}>
                {contributions.map((c, i) => {
                  const typeIcons: Record<string, string> = { salary_data: '💰', interview_experience: '🎤', wikilux_insight: '💡' }
                  const typeLabels: Record<string, string> = { salary_data: 'Salary data', interview_experience: 'Interview experience', wikilux_insight: 'Market signal' }
                  const st = STATUS_LABELS[c.status] || { label: (c.status || '').toUpperCase(), color: '#999' }
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < contributions.length - 1 ? '1px solid #1e1e1e' : 'none' }}>
                      <span style={{ fontSize: 16 }}>{typeIcons[c.contribution_type] || '📊'}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, color: '#ccc', display: 'block' }}>{typeLabels[c.contribution_type] || c.contribution_type} · {c.brand_name || 'General'}</span>
                        <span style={{ fontSize: 11, color: '#999' }}>{timeAgo(c.created_at)}</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: st.color }}>{st.label}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ textAlign: 'center' }}>
                <Link href="/contribute" style={{ fontSize: 12, color: '#a58e28', textDecoration: 'none' }}>+ Add another contribution</Link>
              </div>
            </div>
          ) : (
            <EmptyCard
              title="No contributions yet"
              description="Start contributing salary data, interview experiences, or market signals."
              actionLabel="+ Add contribution"
              actionHref="/contribute"
            />
          )
        )}

        {/* ── IMPACT tab ── */}
        {activeNav === 'impact' && (
          <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '24px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', marginBottom: 14, textTransform: 'uppercase' }}>Impact overview</div>
            {[
              { label: 'Total contributions', value: String(contributions.length) },
              { label: 'Approved', value: String(approvedCount) },
              { label: 'Pending review', value: String(pendingCount) },
              { label: 'Salary data points', value: String(salaryCount) },
              { label: 'Interview experiences', value: String(interviewCount) },
              { label: 'Market signals', value: String(signalCount) },
              { label: 'Total points', value: String(totalPoints) },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e1e1e' }}>
                <span style={{ fontSize: 13, color: '#999' }}>{r.label}</span>
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{r.value}</span>
              </div>
            ))}
            {contributionStats?.next_level && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginBottom: 4 }}>
                  <span>Next level: {contributionStats.next_level.level}</span>
                  <span>{contributionStats.next_level.points_needed} pts to go</span>
                </div>
                <div style={{ width: '100%', height: 4, background: '#2a2a2a', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#a58e28', borderRadius: 2, width: `${Math.min(100, (totalPoints / contributionStats.next_level.points_required) * 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
