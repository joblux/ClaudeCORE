'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useSession, signOut } from 'next-auth/react'
import BusinessBriefForm from '@/components/business/BusinessBriefForm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type MemberData = {
  first_name: string | null
  last_name: string | null
  company_name: string | null
  job_title: string | null
  org_type: string | null
  country: string | null
  city: string | null
  email: string
  avatar_url: string | null
  status: string
  approved_at: string | null
}

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

const navItems = [
  { section: 'OVERVIEW', items: [{ label: 'Dashboard', id: 'overview' }]},
  { section: 'RECRUITING', items: [
    { label: 'Submit a brief', id: 'submit-brief' },
    { label: 'Request status', id: 'request-status' },
  ]},
  { section: 'CONTRIBUTE', items: [
    { label: 'My contributions', id: 'contributions' },
    { label: 'Add data', id: 'adddata' },
  ]},
]

const resourceLinks = [
  { label: 'WikiLux', href: '/brands' },
  { label: 'BlogLux', href: '/insights' },
  { label: 'Escape', href: '/escape' },
]

const STATUS_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  new: { bg: 'rgba(77,166,255,0.1)', color: '#4da6ff', border: '1px solid rgba(77,166,255,0.3)' },
  received: { bg: 'rgba(77,166,255,0.1)', color: '#4da6ff', border: '1px solid rgba(77,166,255,0.3)' },
  accepted: { bg: 'rgba(93,202,165,0.1)', color: '#5dcaa5', border: '1px solid rgba(93,202,165,0.3)' },
  under_review: { bg: 'rgba(93,202,165,0.1)', color: '#5dcaa5', border: '1px solid rgba(93,202,165,0.3)' },
  active: { bg: 'rgba(165,142,40,0.08)', color: '#a58e28', border: '1px solid rgba(165,142,40,0.25)' },
  in_progress: { bg: 'rgba(165,142,40,0.08)', color: '#a58e28', border: '1px solid rgba(165,142,40,0.25)' },
  done: { bg: 'rgba(255,255,255,0.04)', color: '#999', border: '1px solid #2a2a2a' },
  completed: { bg: 'rgba(255,255,255,0.04)', color: '#999', border: '1px solid #2a2a2a' },
  closed: { bg: 'rgba(255,255,255,0.02)', color: '#555', border: '1px solid #1e1e1e' },
}

const SALARY_ROWS = [
  { role: 'Store Director', region: 'Paris', range: '€85K–110K', trend: '+4%' },
  { role: 'Head of Digital', region: 'Paris', range: '€90K–120K', trend: '+7%' },
  { role: 'Retail Director', region: 'Europe', range: '€95K–130K', trend: '+3%' },
  { role: 'Workshop Manager', region: 'France', range: '€55K–70K', trend: '+2%' },
]

const UPCOMING_EVENTS = [
  { date: 'Apr 28', title: 'Watches & Wonders', location: 'Geneva' },
  { date: 'May 12', title: 'LVMH Innovation Award', location: 'Paris' },
  { date: 'Jun 03', title: 'Pitti Uomo 110', location: 'Florence' },
]

const LATEST_INSIGHTS = [
  { kind: 'Analysis', title: 'How luxury groups are rethinking talent strategy in 2026' },
  { kind: 'Report', title: 'Salary benchmarks — European retail leadership' },
  { kind: 'Editorial', title: 'The quiet return of the generalist executive' },
]

const ATS_LOGOS = ['Workday', 'Greenhouse', 'Lever', 'SAP SuccessFactors', 'SmartRecruiters']

export default function BusinessDashboard() {
  const { data: session } = useSession()
  const memberId = (session?.user as any)?.memberId
  const [activeNav, setActiveNav] = useState('overview')
  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)
  const [signals, setSignals] = useState<any[]>([])
  const [contributions, setContributions] = useState<any[]>([])
  const [contributionStats, setContributionStats] = useState<any>(null)
  const [searchCount, setSearchCount] = useState(0)
  const [myBriefs, setMyBriefs] = useState<any[]>([])

  useEffect(() => {
    if (!session) return

    async function fetchAll() {
      try {
        const memberRes = await fetch('/api/members/me')
        if (memberRes.ok) setMember(await memberRes.json())

        const { data: sigData } = await supabase
          .from('signals')
          .select('id, slug, headline, category, brand_tags, published_at')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(5)
        if (sigData) setSignals(sigData)

        if (memberId) {
          const contribRes = await fetch('/api/contributions?limit=10')
          if (contribRes.ok) {
            const cData = await contribRes.json()
            const mine = (cData.contributions || []).filter((c: any) => c.member_id === memberId)
            setContributions(mine)
          }

          const pointsRes = await fetch('/api/contributions/my-points')
          if (pointsRes.ok) setContributionStats(await pointsRes.json())
        }

        const assignRes = await fetch('/api/assignments?status=published&limit=1')
        if (assignRes.ok) {
          const aData = await assignRes.json()
          setSearchCount(aData.total || 0)
        }

        if (memberId) {
          const { data: briefData } = await supabase
            .from('business_briefs')
            .select('id, company_name, brief_type, status, created_at')
            .eq('created_by', memberId)
            .order('created_at', { ascending: false })
          if (briefData) setMyBriefs(briefData)
        }
      } catch {}
      setLoading(false)
    }

    fetchAll()
  }, [session, memberId])

  const firstName = member?.first_name || (session?.user as any)?.firstName || session?.user?.name?.split(' ')[0] || ''
  const lastName = member?.last_name || ''
  const companyName = member?.company_name || ''
  const initials = [firstName, lastName].filter(Boolean).map(n => n[0]).join('').toUpperCase() || 'E'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const activeBriefsCount = myBriefs.filter(b => b.status !== 'closed').length

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Loading...</div>
      </div>
    )
  }

  const statCards = [
    { label: 'Market signals', value: signals.length, color: '#4da6ff' },
    { label: 'Brands tracked', value: 176, color: '#5dcaa5' },
    { label: 'Active briefs', value: activeBriefsCount, color: '#a58e28' },
    { label: 'Upcoming events', value: 9, color: '#ef9f27' },
  ]

  const panelStyle: React.CSSProperties = {
    background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '18px 20px',
  }
  const panelHeaderStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12,
  }
  const panelRowDivider: React.CSSProperties = { borderBottom: '1px solid #1e1e1e' }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#0f0f0f', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', gap: 0, minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{ width: 220, borderRight: '1px solid #1e1e1e', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Profile */}
          <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #1e1e1e' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 8 }}>{initials}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{[firstName, lastName].filter(Boolean).join(' ') || 'Employer'}</div>
            {companyName && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{companyName}</div>}
            <Link href="/account" style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: '#999', textDecoration: 'none' }}>Settings</Link>
          </div>

          {/* Nav */}
          <nav style={{ padding: '12px 8px' }}>
            {navItems.map(section => (
              <div key={section.section} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#555', letterSpacing: '1.5px', padding: '6px 8px 4px' }}>{section.section}</div>
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 13, background: activeNav === item.id ? '#1e1e1e' : 'transparent', color: activeNav === item.id ? '#fff' : '#999' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}

            {/* Resources */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#555', letterSpacing: '1.5px', padding: '6px 8px 4px' }}>RESOURCES</div>
              {resourceLinks.map(r => (
                <a
                  key={r.label}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 8px', borderRadius: 4, fontSize: 13, color: '#999', textDecoration: 'none' }}
                >
                  {r.label}
                </a>
              ))}
            </div>

            {/* Invite */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#555', letterSpacing: '1.5px', padding: '6px 8px 4px' }}>INVITE</div>
              <a
                href="/invite"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 8px', borderRadius: 4, fontSize: 13, color: '#999', textDecoration: 'none' }}
              >
                Invite
              </a>
            </div>
          </nav>

          {/* Bottom actions */}
          <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <a
              href="/faq"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#999' }}
            >
              Help
            </a>
            <button onClick={() => signOut({ callbackUrl: '/' })} style={{ display: 'block', width: '100%', padding: '6px 0', textAlign: 'left', fontSize: 12, color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px 40px', minWidth: 0 }}>
          {/* ── OVERVIEW ── */}
          {activeNav === 'overview' && (<>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, color: '#fff', margin: 0 }}>Welcome back, {firstName || 'there'}</h1>
              <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>{today}</p>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              {statCards.map(card => (
                <div key={card.label} style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '16px 18px' }}>
                  <div style={{ fontSize: 11, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>{card.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 300, color: card.color, lineHeight: 1 }}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {/* Market signals */}
              <div style={panelStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={panelHeaderStyle}>Market signals</div>
                  <Link href="/signals" style={{ fontSize: 11, color: '#999', textDecoration: 'none' }}>View all →</Link>
                </div>
                {signals.length > 0 ? (
                  <div>
                    {signals.slice(0, 4).map((s, i, arr) => (
                      <Link key={s.id} href={`/signals/${s.slug || s.id}`} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #1e1e1e' : 'none', textDecoration: 'none', alignItems: 'flex-start' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: SIGNAL_COLORS[s.category] || '#888', flexShrink: 0, marginTop: 5 }} />
                        <span style={{ fontSize: 12, color: '#ccc', flex: 1, lineHeight: 1.4 }}>{s.headline}</span>
                        <span style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap' }}>{timeAgo(s.published_at)}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: '#999', margin: 0 }}>No signals yet.</p>
                )}
              </div>

              {/* Salary benchmarks */}
              <div style={panelStyle}>
                <div style={panelHeaderStyle}>Salary benchmarks</div>
                <div>
                  {SALARY_ROWS.map((r, i) => (
                    <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', ...(i < SALARY_ROWS.length - 1 ? panelRowDivider : {}) }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#ccc' }}>{r.role}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{r.region}</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#fff', marginRight: 12 }}>{r.range}</div>
                      <div style={{ fontSize: 11, color: '#5dcaa5' }}>{r.trend}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Upcoming events */}
              <div style={panelStyle}>
                <div style={panelHeaderStyle}>Upcoming events</div>
                <div>
                  {UPCOMING_EVENTS.map((e, i) => (
                    <div key={e.title} style={{ display: 'flex', gap: 14, padding: '10px 0', alignItems: 'flex-start', ...(i < UPCOMING_EVENTS.length - 1 ? panelRowDivider : {}) }}>
                      <div style={{ fontSize: 11, color: '#a58e28', fontWeight: 500, width: 54, flexShrink: 0, letterSpacing: '0.5px', marginTop: 2 }}>{e.date}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#ccc' }}>{e.title}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{e.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest insights */}
              <div style={panelStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={panelHeaderStyle}>Latest insights</div>
                  <Link href="/insights" style={{ fontSize: 11, color: '#999', textDecoration: 'none' }}>View all →</Link>
                </div>
                <div>
                  {LATEST_INSIGHTS.map((x, i) => (
                    <div key={x.title} style={{ padding: '10px 0', ...(i < LATEST_INSIGHTS.length - 1 ? panelRowDivider : {}) }}>
                      <div style={{ fontSize: 10, color: '#a58e28', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 3 }}>{x.kind}</div>
                      <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.4 }}>{x.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>)}

          {/* ── SUBMIT A BRIEF ── */}
          {activeNav === 'submit-brief' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, color: '#fff', margin: 0 }}>Submit a brief</h1>
                <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Share your hiring requirement — reviewed discreetly by the JOBLUX team.</p>
              </div>

              {/* How it works */}
              <div style={{ background: 'rgba(165,142,40,0.06)', border: '1px solid rgba(165,142,40,0.2)', borderRadius: 8, padding: '20px 24px', marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#a58e28', letterSpacing: '1.5px', marginBottom: 14 }}>HOW IT WORKS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 18 }}>
                  {[
                    { step: '1', label: 'Share your brief', desc: 'Tell us about the role and context.' },
                    { step: '2', label: 'We reach out', desc: 'If the brief is a fit, we align on scope.' },
                    { step: '3', label: 'We search', desc: 'Your JOBLUX consultant runs a discreet search.' },
                    { step: '4', label: 'Review candidates', desc: 'We present shortlisted candidates for review.' },
                  ].map(s => (
                    <div key={s.step}>
                      <div style={{ fontSize: 20, fontWeight: 300, color: '#a58e28', marginBottom: 4 }}>{s.step}</div>
                      <div style={{ fontSize: 13, color: '#ccc', fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: '#999', lineHeight: 1.4 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{ paddingTop: 14, borderTop: '1px solid rgba(165,142,40,0.2)' }}>
                  <div style={{ fontSize: 10, color: '#999', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Compatible with your ATS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ATS_LOGOS.map(l => (
                      <span key={l} style={{ fontSize: 11, color: '#ccc', padding: '5px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a2a', borderRadius: 3 }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              <BusinessBriefForm />
            </div>
          )}

          {/* ── REQUEST STATUS ── */}
          {activeNav === 'request-status' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, color: '#fff', margin: 0 }}>Request status</h1>
                <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Track the progress of briefs you have submitted.</p>
              </div>
              {myBriefs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myBriefs.map(b => {
                    const badge = STATUS_BADGE[b.status] || STATUS_BADGE.new
                    const date = b.created_at ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
                    return (
                      <div key={b.id} style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '20px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{b.company_name}</div>
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 3, background: badge.bg, color: badge.color, border: badge.border, flexShrink: 0 }}>
                            {b.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#999' }}>{b.brief_type}</div>
                        <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{date}</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '28px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#999', marginBottom: 14 }}>No active requests yet. Submit a brief to begin.</p>
                  <button onClick={() => setActiveNav('submit-brief')} style={{ padding: '9px 20px', fontSize: 12, fontWeight: 500, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, background: 'transparent', cursor: 'pointer' }}>
                    Submit a brief →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── MY CONTRIBUTIONS ── */}
          {activeNav === 'contributions' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, color: '#fff', margin: 0 }}>My contributions</h1>
                <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Data you&apos;ve contributed to the intelligence ecosystem</p>
              </div>

              {contributions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {contributions.map((c: any) => {
                    const approved = c.status === 'approved' || c.approved === true
                    return (
                      <div key={c.id} style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 10, color: '#a58e28', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>{c.type || c.contribution_type || 'Data'}</div>
                          <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.4 }}>{c.description || c.title || c.summary || '—'}</div>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 3, flexShrink: 0,
                          background: approved ? 'rgba(93,202,165,0.1)' : 'rgba(165,142,40,0.08)',
                          color: approved ? '#5dcaa5' : '#a58e28',
                          border: approved ? '1px solid rgba(93,202,165,0.3)' : '1px solid rgba(165,142,40,0.25)',
                        }}>
                          {approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '28px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#999', margin: 0 }}>No contributions yet. Add data to strengthen the intelligence ecosystem.</p>
                </div>
              )}

              <div style={{ marginTop: 18 }}>
                <button onClick={() => setActiveNav('adddata')} style={{ fontSize: 12, color: '#a58e28', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'none' }}>
                  Add data →
                </button>
              </div>
            </div>
          )}

          {/* ── ADD DATA ── */}
          {activeNav === 'adddata' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, color: '#fff', margin: 0 }}>Add data</h1>
                <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Intelligence is built on contribution</p>
              </div>

              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '28px 24px' }}>
                <p style={{ fontSize: 13, color: '#ccc', margin: '0 0 18px', lineHeight: 1.5 }}>
                  This loads the contribution form — same as /contribute.
                </p>
                <a
                  href="/contribute"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', padding: '10px 20px', fontSize: 12, fontWeight: 600, color: '#000', background: '#a58e28', borderRadius: 4, textDecoration: 'none' }}
                >
                  Open contribution form →
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
