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
    { label: 'Settings', id: 'settings' },
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
        if (res.ok) {
          const data = await res.json()
          setMember(data)
        }
      } catch (e) {
        console.error('Failed to fetch member data:', e)
      } finally {
        setLoading(false)
      }
    }
    if (session) fetchMember()
  }, [session])

  const firstName = member?.first_name || (session?.user as any)?.firstName || session?.user?.name?.split(' ')[0] || ''
  const lastName = member?.last_name || ''
  const companyName = member?.company_name || 'Your company'
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: 220, background: '#141414', borderRight: '1px solid #1e1e1e', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e1e1e' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 400, color: '#a58e28', letterSpacing: '2px' }}>JOBLUX.</span>
          </Link>
        </div>
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#a58e28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 10 }}>{initials}</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{[firstName, lastName].filter(Boolean).join(' ') || 'Employer'}</div>
          <div style={{ fontSize: 11, color: '#a58e28', fontWeight: 600, letterSpacing: '0.5px', marginTop: 2 }}>LUXURY EMPLOYER</div>
          {companyName !== 'Your company' && <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{companyName}</div>}
        </div>
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {navItems.map(section => (
            <div key={section.section} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#555', letterSpacing: '1.5px', padding: '8px 8px 4px' }}>{section.section}</div>
              {section.items.map(item => (
                <button key={item.id} onClick={() => setActiveNav(item.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, background: activeNav === item.id ? '#1e1e1e' : 'transparent', color: activeNav === item.id ? '#fff' : '#999' }}>{item.label}</button>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e1e1e' }}>
          <Link href="/recruitment" style={{ display: 'block', padding: '10px 0', textAlign: 'center', fontSize: 12, fontWeight: 500, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 6, textDecoration: 'none' }}>Contact your dedicated consultant</Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{ display: 'block', width: '100%', marginTop: 8, padding: '8px 0', textAlign: 'center', fontSize: 11, color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1000 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 400, color: '#fff', margin: 0 }}>Welcome back, {firstName || 'there'}</h1>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', padding: '4px 12px', borderRadius: 4, letterSpacing: '0.5px' }}>LUXURY EMPLOYER</span>
          </div>
          <p style={{ fontSize: 13, color: '#999', marginTop: 6 }}>{today}</p>
        </div>

        {activeNav === 'overview' && (<>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {[{ label: 'Active searches', value: '0', sub: 'Managed by JOBLUX' }, { label: 'Contributions', value: '0', sub: 'Salary + culture data' }, { label: 'Signals', value: '\u2014', sub: 'Market intelligence' }].map(c => (
              <div key={c.label} style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '20px 24px' }}>
                <div style={{ fontSize: 28, fontWeight: 300, color: '#a58e28' }}>{c.value}</div>
                <div style={{ fontSize: 13, color: '#fff', marginTop: 4 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{c.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#a58e28', letterSpacing: '1.5px', marginBottom: 12 }}>ACTIVE SEARCH ASSIGNMENTS</div>
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>No active searches yet</div>
              <p style={{ fontSize: 13, color: '#999', marginBottom: 16, maxWidth: 400, margin: '0 auto 16px' }}>When you submit a brief, your dedicated JOBLUX consultant will manage the search and you will track progress here.</p>
              <Link href="/recruitment" style={{ display: 'inline-block', padding: '10px 24px', fontSize: 12, fontWeight: 500, color: '#fff', background: '#a58e28', borderRadius: 6, textDecoration: 'none' }}>Submit a brief</Link>
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#a58e28', letterSpacing: '1.5px' }}>MARKET SIGNALS</div>
              <Link href="/signals" style={{ fontSize: 12, color: '#999', textDecoration: 'none' }}>View all →</Link>
            </div>
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#999' }}>Market intelligence relevant to your sector will appear here.</p>
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#a58e28', letterSpacing: '1.5px', marginBottom: 12 }}>YOUR CONTRIBUTIONS</div>
            <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>Share your expertise</div>
              <p style={{ fontSize: 13, color: '#999', marginBottom: 16, maxWidth: 420, margin: '0 auto 16px' }}>Your salary data, culture insights, and interview experiences help build the most accurate luxury industry intelligence.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/contribute/salary" style={{ padding: '8px 16px', fontSize: 12, color: '#ccc', border: '1px solid #333', borderRadius: 6, textDecoration: 'none' }}>Add salary data</Link>
                <Link href="/contribute/culture" style={{ padding: '8px 16px', fontSize: 12, color: '#ccc', border: '1px solid #333', borderRadius: 6, textDecoration: 'none' }}>Add culture insight</Link>
                <Link href="/contribute/interview" style={{ padding: '8px 16px', fontSize: 12, color: '#ccc', border: '1px solid #333', borderRadius: 6, textDecoration: 'none' }}>Add interview data</Link>
              </div>
            </div>
          </div>
        </>)}

        {activeNav === 'searches' && (
          <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>No active searches</div>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>Submit a brief to start your first executive search.</p>
            <Link href="/recruitment" style={{ display: 'inline-block', padding: '10px 24px', fontSize: 12, fontWeight: 500, color: '#fff', background: '#a58e28', borderRadius: 6, textDecoration: 'none' }}>Submit a brief</Link>
          </div>
        )}

        {activeNav === 'signals' && (
          <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#999' }}>Market intelligence for your sector will appear here.</p>
            <Link href="/signals" style={{ display: 'inline-block', marginTop: 12, fontSize: 12, color: '#a58e28', textDecoration: 'none' }}>Browse all signals →</Link>
          </div>
        )}

        {activeNav === 'benchmarks' && (
          <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#999' }}>Salary benchmarks for roles in your sector will appear here.</p>
            <Link href="/salary" style={{ display: 'inline-block', marginTop: 12, fontSize: 12, color: '#a58e28', textDecoration: 'none' }}>Browse salary data →</Link>
          </div>
        )}

        {activeNav === 'contributions' && (
          <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>No contributions yet</div>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>Share salary data, culture insights, or interview experiences to enrich the platform.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contribute/salary" style={{ padding: '8px 16px', fontSize: 12, color: '#ccc', border: '1px solid #333', borderRadius: 6, textDecoration: 'none' }}>Add salary data</Link>
              <Link href="/contribute/culture" style={{ padding: '8px 16px', fontSize: 12, color: '#ccc', border: '1px solid #333', borderRadius: 6, textDecoration: 'none' }}>Add culture insight</Link>
            </div>
          </div>
        )}

        {(activeNav === 'add-salary' || activeNav === 'add-culture' || activeNav === 'add-interview') && (
          <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>Coming soon</div>
            <p style={{ fontSize: 13, color: '#999' }}>This feature is being finalized.</p>
          </div>
        )}

        {activeNav === 'settings' && (
          <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '24px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#a58e28', letterSpacing: '1.5px', marginBottom: 16 }}>ACCOUNT</div>
            {[{ label: 'Name', value: [firstName, lastName].filter(Boolean).join(' ') || '\u2014' }, { label: 'Email', value: member?.email || session?.user?.email || '\u2014' }, { label: 'Company', value: companyName !== 'Your company' ? companyName : '\u2014' }, { label: 'Job title', value: jobTitle || '\u2014' }, { label: 'Country', value: member?.country || '\u2014' }, { label: 'Status', value: member?.status === 'approved' ? 'Active' : member?.status || '\u2014' }].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e1e1e' }}>
                <span style={{ fontSize: 13, color: '#999' }}>{r.label}</span>
                <span style={{ fontSize: 13, color: '#fff' }}>{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
