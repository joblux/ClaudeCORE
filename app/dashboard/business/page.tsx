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
  { section: 'DASHBOARD', items: [
    { label: 'Overview', id: 'overview' },
  ]},
  { section: 'RECRUITING', items: [
    { label: 'Submit a brief', id: 'submit-brief' },
    { label: 'Request status', id: 'request-status' },
  ]},
  { section: 'INTELLIGENCE', items: [
    { label: 'Market signals', id: 'signals' },
    { label: 'Salary benchmarks', id: 'benchmarks' },
  ]},
  { section: 'ACCOUNT', items: [
    { label: 'Company info', id: 'profile' },
  ]},
]

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
  const [briefsLoading, setBriefsLoading] = useState(false)

  useEffect(() => {
    if (!session) return

    async function fetchAll() {
      try {
        // Member info
        const memberRes = await fetch('/api/members/me')
        if (memberRes.ok) setMember(await memberRes.json())

        // Latest signals
        const { data: sigData } = await supabase
          .from('signals')
          .select('id, slug, title, category, brand, published_at')
          .order('published_at', { ascending: false })
          .limit(5)
        if (sigData) setSignals(sigData)

        // My contributions
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

        // Search assignments count (employer's active searches)
        const assignRes = await fetch('/api/assignments?status=active&limit=1')
        if (assignRes.ok) {
          const aData = await assignRes.json()
          setSearchCount(aData.total || 0)
        }

        // My business briefs
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
  const jobTitle = member?.job_title || ''
  const initials = [firstName, lastName].filter(Boolean).map(n => n[0]).join('').toUpperCase() || 'E'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#999', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#0f0f0f', minHeight: '100vh' }}>
      {/* Dashboard body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', gap: 0, minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{ width: 200, borderRight: '1px solid #1e1e1e', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Profile */}
          <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #1e1e1e' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 8 }}>{initials}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{[firstName, lastName].filter(Boolean).join(' ') || 'Employer'}</div>
            {companyName && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{companyName}</div>}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 8px' }}>
            {navItems.map(section => (
              <div key={section.section} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#555', letterSpacing: '1.5px', padding: '6px 8px 4px' }}>{section.section}</div>
                {section.items.map(item => (
                  <button key={item.id} onClick={() => setActiveNav(item.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 13, background: activeNav === item.id ? '#1e1e1e' : 'transparent', color: activeNav === item.id ? '#fff' : '#999' }}>{item.label}</button>
                ))}
              </div>
            ))}
          </nav>

          {/* Bottom actions */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #1e1e1e' }}>
            <button onClick={() => signOut({ callbackUrl: '/' })} style={{ display: 'block', width: '100%', padding: '8px 0', textAlign: 'center', fontSize: 11, color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px 40px', maxWidth: 900 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, color: '#fff', margin: 0 }}>Welcome back, {firstName || 'there'}</h1>
            <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>{today}</p>
          </div>

          {/* ── OVERVIEW ── */}
          {activeNav === 'overview' && (<>
            {/* 1. Start a search CTA */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', marginBottom: 10, textTransform: 'uppercase' }}>Start a search</div>
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>Need to hire?</div>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 14, maxWidth: 440, margin: '0 auto 14px' }}>
                  Share your hiring requirement. Each brief is reviewed discreetly and handled according to scope and urgency.
                </p>
                <button onClick={() => setActiveNav('submit-brief')} style={{ display: 'inline-block', padding: '10px 24px', fontSize: 12, fontWeight: 600, color: '#000', background: '#a58e28', borderRadius: 4, border: 'none', cursor: 'pointer' }}>
                  Submit a brief &rarr;
                </button>
              </div>
            </div>

            {/* 2. Request status */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', marginBottom: 10, textTransform: 'uppercase' }}>Request status</div>
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '24px', textAlign: 'center' }}>
                {myBriefs.length > 0 ? (
                  <>
                    <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>{myBriefs.length} brief{myBriefs.length > 1 ? 's' : ''} submitted</div>
                    <p style={{ fontSize: 13, color: '#999' }}>View the Request status tab for details.</p>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: '#999' }}>No active requests yet. Submit a brief to begin.</p>
                )}
              </div>
            </div>

            {/* 3. How it works */}
            <div style={{ background: 'rgba(165,142,40,0.06)', border: '1px solid rgba(165,142,40,0.2)', borderRadius: 8, padding: '20px 24px', marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#a58e28', letterSpacing: '1.5px', marginBottom: 8 }}>HOW IT WORKS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {[
                  { step: '1', label: 'Share your brief', desc: 'Tell us about the role and context.' },
                  { step: '2', label: 'We reach out', desc: 'If the brief is a fit, we discuss the mandate and align on scope.' },
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
            </div>

            {/* 4. Market signals */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Market signals</div>
                <Link href="/signals" style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>View all &rarr;</Link>
              </div>
              {signals.length > 0 ? (
                <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '4px 20px' }}>
                  {signals.slice(0, 3).map((s, i) => (
                    <Link key={s.id} href={`/signals/${s.slug || s.id}`} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: i < Math.min(signals.length, 3) - 1 ? '1px solid #1e1e1e' : 'none', textDecoration: 'none', alignItems: 'flex-start' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: SIGNAL_COLORS[s.category] || '#888', flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontSize: 13, color: '#ccc', flex: 1, lineHeight: 1.4 }}>{s.title}</span>
                      <span style={{ fontSize: 11, color: '#999', whiteSpace: 'nowrap' }}>{timeAgo(s.published_at)}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#999' }}>Relevant market intelligence will appear here based on your company profile and activity.</p>
                </div>
              )}
            </div>
          </>)}

          {/* ── SUBMIT A BRIEF ── */}
          {activeNav === 'submit-brief' && (
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 400, color: '#fff', margin: '0 0 8px' }}>Business Brief</h2>
              <p style={{ fontSize: 13, color: '#999', lineHeight: 1.5, marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>
                Share your hiring or intelligence requirement. Each brief is handled discreetly and in accordance with our{' '}
                <a href="/terms/business" target="_blank" rel="noopener noreferrer" style={{ color: '#999', textDecoration: 'underline' }}>Terms of Business</a>.
              </p>
              <BusinessBriefForm />
            </div>
          )}

          {/* ── REQUEST STATUS ── */}
          {activeNav === 'request-status' && (
            <div>
              {myBriefs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myBriefs.map(b => {
                    const badgeColors: Record<string, { bg: string; text: string }> = {
                      new: { bg: '#e3f2fd', text: '#1565c0' },
                      under_review: { bg: '#fff8e1', text: '#f57f17' },
                      closed: { bg: '#f5f5f5', text: '#757575' },
                    }
                    const badge = badgeColors[b.status] || badgeColors.new
                    const date = b.created_at ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
                    return (
                      <div key={b.id} style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '20px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{b.company_name}</div>
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '3px 10px', borderRadius: 3, background: badge.bg, color: badge.text, flexShrink: 0 }}>
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
                    Submit a brief &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── SIGNALS tab ── */}
          {activeNav === 'signals' && (
            signals.length > 0 ? (
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '4px 20px' }}>
                {signals.map((s, i) => (
                  <Link key={s.id} href={`/signals/${s.slug || s.id}`} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: i < signals.length - 1 ? '1px solid #1e1e1e' : 'none', textDecoration: 'none', alignItems: 'flex-start' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: SIGNAL_COLORS[s.category] || '#888', flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 13, color: '#ccc', flex: 1, lineHeight: 1.4 }}>{s.title}</span>
                    <span style={{ fontSize: 11, color: '#999', whiteSpace: 'nowrap' }}>{timeAgo(s.published_at)}</span>
                  </Link>
                ))}
                <div style={{ padding: '12px 0', textAlign: 'center' }}>
                  <Link href="/signals" style={{ fontSize: 12, color: '#ccc', textDecoration: 'underline' }}>Browse all signals →</Link>
                </div>
              </div>
            ) : (
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#999' }}>Market intelligence for your sector will appear here.</p>
                <Link href="/signals" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: '#ccc', textDecoration: 'underline' }}>Browse all signals →</Link>
              </div>
            )
          )}

          {/* ── BENCHMARKS tab ── */}
          {activeNav === 'benchmarks' && (
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '28px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>Salary benchmarks help you make competitive offers in the luxury sector.</p>
              <Link href="/salaries" style={{ display: 'inline-block', padding: '9px 20px', fontSize: 12, fontWeight: 500, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, textDecoration: 'none' }}>
                Browse salary data →
              </Link>
            </div>
          )}

          {/* ── PROFILE tab ── */}
          {activeNav === 'profile' && (
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '24px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', marginBottom: 14, textTransform: 'uppercase' }}>Company information</div>
              {[
                { label: 'Company', value: companyName || '\u2014' },
                { label: 'Organisation type', value: member?.org_type || '\u2014' },
                { label: 'Contact name', value: [firstName, lastName].filter(Boolean).join(' ') || '\u2014' },
                { label: 'Contact title', value: jobTitle || '\u2014' },
                { label: 'Email', value: member?.email || session?.user?.email || '\u2014' },
                { label: 'Country', value: member?.country || '\u2014' },
                { label: 'City', value: member?.city || '\u2014' },
                { label: 'Status', value: member?.status === 'approved' ? 'Active' : member?.status || '\u2014' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e1e1e' }}>
                  <span style={{ fontSize: 13, color: '#999' }}>{r.label}</span>
                  <span style={{ fontSize: 13, color: '#fff' }}>{r.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Link href="/account" style={{ fontSize: 12, color: '#999', textDecoration: 'underline' }}>Manage account →</Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
