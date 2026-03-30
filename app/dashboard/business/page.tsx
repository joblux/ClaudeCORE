'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

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
    { label: 'Add salary data', id: 'add-salary' },
    { label: 'Add culture insight', id: 'add-culture' },
    { label: 'Add interview data', id: 'add-interview' },
  ]},
  { section: 'ACCOUNT', items: [
    { label: 'Profile info', id: 'profile' },
  ]},
]

export default function BusinessDashboard() {
  const { data: session } = useSession()
  const [activeNav, setActiveNav] = useState('overview')
  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMember() {
      try {
        const res = await fetch('/api/members/me')
        if (res.ok) setMember(await res.json())
      } catch (e) { console.error('Failed to fetch member data:', e) }
      finally { setLoading(false) }
    }
    if (session) fetchMember()
  }, [session])

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
      {/* Muted global header */}
      <div style={{ background: '#111', borderBottom: '1px solid #1e1e1e', padding: '10px 0', opacity: 0.5 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#a58e28', letterSpacing: '2px' }}>JOBLUX.</span>
          </Link>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Brands', 'Insights', 'Signals', 'Careers', 'Events'].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`} style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>{item}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', gap: 0, minHeight: 'calc(100vh - 45px)' }}>
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

          {activeNav === 'overview' && (<>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
              {[{ label: 'Active searches', value: '0', sub: 'Managed by JOBLUX' }, { label: 'Contributions', value: '0', sub: 'Salary + culture data' }, { label: 'Signals', value: '\u2014', sub: 'Market intelligence' }].map(c => (
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
                <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>No active searches yet</div>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 14, maxWidth: 400, margin: '0 auto 14px' }}>When you submit a search assignment, your dedicated consultant will manage it and you will track progress here.</p>
                <div style={{ display: 'inline-block', padding: '9px 20px', fontSize: 12, fontWeight: 500, color: '#999', border: '1px solid #333', borderRadius: 4, cursor: 'default' }}>Coming soon</div>
              </div>
            </div>

            {/* Market signals */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Market signals</div>
                <Link href="/signals" style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>View all →</Link>
              </div>
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#999' }}>Market intelligence relevant to your sector will appear here.</p>
              </div>
            </div>

            {/* Contributions */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', marginBottom: 10, textTransform: 'uppercase' }}>Your contributions</div>
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>Share your expertise</div>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 14, maxWidth: 420, margin: '0 auto 14px' }}>Your salary data, culture insights, and interview experiences help build the most accurate luxury industry intelligence.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{ padding: '7px 14px', fontSize: 12, color: '#999', border: '1px solid #333', borderRadius: 4 }}>Coming soon</span>
                </div>
              </div>
            </div>
          </>)}

          {activeNav === 'searches' && (
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>No active searches</div>
              <p style={{ fontSize: 13, color: '#999', marginBottom: 14 }}>Search assignment submission is coming soon.</p>
              <span style={{ padding: '9px 20px', fontSize: 12, color: '#999', border: '1px solid #333', borderRadius: 4 }}>Coming soon</span>
            </div>
          )}

          {activeNav === 'signals' && (
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#999' }}>Market intelligence for your sector will appear here.</p>
              <Link href="/signals" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: '#ccc', textDecoration: 'underline' }}>Browse all signals →</Link>
            </div>
          )}

          {activeNav === 'benchmarks' && (
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#999' }}>Salary benchmarks for roles in your sector will appear here.</p>
              <Link href="/salary" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: '#ccc', textDecoration: 'underline' }}>Browse salary data →</Link>
            </div>
          )}

          {activeNav === 'contributions' && (
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>No contributions yet</div>
              <p style={{ fontSize: 13, color: '#999' }}>Contribution forms are coming soon.</p>
            </div>
          )}

          {(activeNav === 'add-salary' || activeNav === 'add-culture' || activeNav === 'add-interview') && (
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '36px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6 }}>Coming soon</div>
              <p style={{ fontSize: 13, color: '#999' }}>This feature is being finalized.</p>
            </div>
          )}

          {activeNav === 'profile' && (
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '24px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', marginBottom: 14, textTransform: 'uppercase' }}>Profile information</div>
              {[
                { label: 'Name', value: [firstName, lastName].filter(Boolean).join(' ') || '\u2014' },
                { label: 'Email', value: member?.email || session?.user?.email || '\u2014' },
                { label: 'Company', value: companyName || '\u2014' },
                { label: 'Job title', value: jobTitle || '\u2014' },
                { label: 'Country', value: member?.country || '\u2014' },
                { label: 'Status', value: member?.status === 'approved' ? 'Active' : member?.status || '\u2014' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e1e1e' }}>
                  <span style={{ fontSize: 13, color: '#999' }}>{r.label}</span>
                  <span style={{ fontSize: 13, color: '#fff' }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
