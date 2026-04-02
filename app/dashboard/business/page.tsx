'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useSession, signOut } from 'next-auth/react'

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
  { section: 'SEARCHES', items: [
    { label: 'Overview', id: 'overview' },
    { label: 'Active searches', id: 'searches' },
  ]},
  { section: 'INTELLIGENCE', items: [
    { label: 'Market signals', id: 'signals' },
    { label: 'Salary benchmarks', id: 'benchmarks' },
  ]},
  { section: 'CONTRIBUTE', items: [
    { label: 'My contributions', id: 'contributions' },
  ]},
  { section: 'ACCOUNT', items: [
    { label: 'Profile info', id: 'profile' },
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
        // For now just get count | employers will be linked to assignments later
        const assignRes = await fetch('/api/assignments?status=active&limit=1')
        if (assignRes.ok) {
          const aData = await assignRes.json()
          setSearchCount(aData.total || 0)
        }

      } catch (err) {
        console.error('Business dashboard fetch error:', err)
      }
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
              {[
                { label: 'Active searches', value: String(searchCount), sub: 'Managed by JOBLUX' },
                { label: 'Contributions', value: String(contributionStats?.summary?.total || 0), sub: `${contributionStats?.points || 0} pts earned` },
                { label: 'Latest signals', value: String(signals.length), sub: 'Market intelligence' },
              ].map(c => (
                <div key={c.label} style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '18px 20px' }}>
                  <div style={{ fontSize: 24, fontWeight: 300, color: '#fff' }}>{c.value}</div>
                  <div style={{ fontSize: 13, color: '#ccc', marginTop: 4 }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Active searches */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', marginBottom: 10, textTransform: 'uppercase' }}>Active search assignments</div>
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '36px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>
                  {searchCount > 0 ? `${searchCount} active assignment${searchCount > 1 ? 's' : ''}` : 'No active searches yet'}
                </div>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 14, maxWidth: 400, margin: '0 auto 14px' }}>
                  {searchCount > 0
                    ? 'Your dedicated JOBLUX consultant is managing your search assignments.'
                    : 'When you need to hire, submit a search assignment and your dedicated JOBLUX consultant will manage it confidentially.'}
                </p>
                <Link href="/services/recruitment" style={{ display: 'inline-block', padding: '9px 20px', fontSize: 12, fontWeight: 500, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, textDecoration: 'none' }}>
                  Learn about our search process →
                </Link>
              </div>
            </div>

            {/* Market signals */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Market signals</div>
                <Link href="/signals" style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>View all →</Link>
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
                <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#999' }}>Market intelligence relevant to your sector will appear here.</p>
                </div>
              )}
            </div>

            {/* Contributions */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Your contributions</div>
                <Link href="/contribute" style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>Add data →</Link>
              </div>
              {contributions.length > 0 ? (
                <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '4px 20px' }}>
                  {contributions.slice(0, 5).map((c, i) => {
                    const typeLabels: Record<string, string> = { salary_data: 'Salary data', interview_experience: 'Interview', wikilux_insight: 'Market signal' }
                    const statusColors: Record<string, string> = { pending: '#FF9800', approved: '#4CAF50', rejected: '#f44336' }
                    return (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < Math.min(contributions.length, 5) - 1 ? '1px solid #1e1e1e' : 'none' }}>
                        <span style={{ fontSize: 13, color: '#ccc', flex: 1 }}>{typeLabels[c.contribution_type] || c.contribution_type} · {c.brand_name || 'General'}</span>
                        <span style={{ fontSize: 11, color: statusColors[c.status] || '#999', fontWeight: 600 }}>{(c.status || '').toUpperCase()}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>Share your expertise</div>
                  <p style={{ fontSize: 13, color: '#999', marginBottom: 14, maxWidth: 420, margin: '0 auto 14px' }}>Salary data and market signals help build accurate luxury industry intelligence.</p>
                  <Link href="/contribute" style={{ display: 'inline-block', padding: '9px 20px', fontSize: 12, fontWeight: 500, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, textDecoration: 'none' }}>
                    + Add contribution
                  </Link>
                </div>
              )}
            </div>
          </>)}

          {/* ── SEARCHES tab ── */}
          {activeNav === 'searches' && (
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>
                {searchCount > 0 ? 'Your search assignments are managed by your JOBLUX consultant.' : 'No active searches'}
              </div>
              <p style={{ fontSize: 13, color: '#999', marginBottom: 14 }}>Contact your JOBLUX consultant to discuss a confidential search.</p>
              <Link href="/services/recruitment" style={{ display: 'inline-block', padding: '9px 20px', fontSize: 12, fontWeight: 500, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, textDecoration: 'none' }}>
                Our recruitment process →
              </Link>
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

          {/* ── CONTRIBUTIONS tab ── */}
          {activeNav === 'contributions' && (
            contributions.length > 0 ? (
              <div>
                <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '4px 20px', marginBottom: 14 }}>
                  {contributions.map((c, i) => {
                    const typeLabels: Record<string, string> = { salary_data: 'Salary data', interview_experience: 'Interview', wikilux_insight: 'Market signal' }
                    const statusColors: Record<string, string> = { pending: '#FF9800', approved: '#4CAF50', rejected: '#f44336' }
                    return (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < contributions.length - 1 ? '1px solid #1e1e1e' : 'none' }}>
                        <span style={{ fontSize: 13, color: '#ccc', flex: 1 }}>{typeLabels[c.contribution_type] || c.contribution_type} · {c.brand_name || 'General'}</span>
                        <span style={{ fontSize: 11, color: '#999' }}>{timeAgo(c.created_at)}</span>
                        <span style={{ fontSize: 11, color: statusColors[c.status] || '#999', fontWeight: 600 }}>{(c.status || '').toUpperCase()}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Link href="/contribute" style={{ fontSize: 12, color: '#a58e28', textDecoration: 'none' }}>+ Add another contribution</Link>
                </div>
              </div>
            ) : (
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>No contributions yet</div>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 14 }}>Share market signals to help build luxury industry intelligence.</p>
                <Link href="/contribute" style={{ display: 'inline-block', padding: '9px 20px', fontSize: 12, fontWeight: 500, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, textDecoration: 'none' }}>
                  + Add contribution
                </Link>
              </div>
            )
          )}

          {/* ── PROFILE tab ── */}
          {activeNav === 'profile' && (
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '24px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', marginBottom: 14, textTransform: 'uppercase' }}>Profile information</div>
              {[
                { label: 'Name', value: [firstName, lastName].filter(Boolean).join(' ') || '\u2014' },
                { label: 'Email', value: member?.email || session?.user?.email || '\u2014' },
                { label: 'Company', value: companyName || '\u2014' },
                { label: 'Job title', value: jobTitle || '\u2014' },
                { label: 'Country', value: member?.country || '\u2014' },
                { label: 'City', value: member?.city || '\u2014' },
                { label: 'Status', value: member?.status === 'approved' ? 'Active' : member?.status || '\u2014' },
                { label: 'Approved', value: member?.approved_at ? new Date(member.approved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '\u2014' },
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
