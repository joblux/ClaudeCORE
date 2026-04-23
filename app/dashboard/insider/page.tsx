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
  draft: { label: 'DRAFT', color: '#666' },
  submitted: { label: 'SUBMITTED', color: '#FF9800' },
  review: { label: 'UNDER REVIEW', color: '#FF9800' },
  revision_requested: { label: 'REVISION REQUESTED', color: '#e68a00' },
  published: { label: 'PUBLISHED', color: '#4CAF50' },
  archived: { label: 'ARCHIVED', color: '#666' },
  rejected: { label: 'REJECTED', color: '#f44336' },
}

const navItems = [
  { section: 'DASHBOARD', items: [
    { label: 'Overview', id: 'overview' },
    { label: 'My contributions', id: 'contributions' },
    { label: 'Impact tracker', id: 'impact' },
  ]},
  { section: 'CONTRIBUTE', items: [
    { label: 'Write a perspective', id: 'write-voice' },
    { label: 'Submit salary data', id: 'submit-salary' },
    { label: 'Flag correction', id: 'submit-correction' },
  ]},
  { section: 'INTELLIGENCE', items: [
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
      <p style={{ fontSize: 13, color: '#999', marginBottom: actionLabel ? 14 : 0, maxWidth: 400, margin: '0 auto' }}>{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} style={{ display: 'inline-block', marginTop: 14, padding: '9px 20px', fontSize: 12, fontWeight: 500, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, textDecoration: 'none' }}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

// ── WRITE A PERSPECTIVE ──────────────────────────────────────────────────────
function WriteVoiceSection({ session }: { session: any }) {
  const user = session?.user as any
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    bodyText: '',
    authorName: user?.name || '',
    authorRole: '',
    coverImageUrl: '',
    externalLink: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Load my previously submitted voices via authenticated API
  const [myVoices, setMyVoices] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/insider/my-voices')
      .then(r => r.json())
      .then(data => setMyVoices(data.voices || []))
      .catch(() => {})
  }, [submitted])

  const handleSubmit = async () => {
    if (!form.title || !form.excerpt || !form.bodyText) {
      setError('Title, hook quote, and body are required.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/insider/submit-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmitted(true)
      setForm({ title: '', excerpt: '', bodyText: '', authorName: user?.name || '', authorRole: '', coverImageUrl: '', externalLink: '' })
    } catch (e: any) {
      setError(e.message)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 680 }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #1D9E75', borderRadius: 8, padding: '32px 28px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
          <div style={{ fontSize: 16, color: '#fff', fontWeight: 500, marginBottom: 6 }}>Perspective submitted</div>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>
            Your piece is now under editorial review. We'll notify you once it's approved and live on JOBLUX.
          </p>
          <button onClick={() => setSubmitted(false)} style={{ padding: '8px 20px', fontSize: 12, border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, background: 'transparent', color: '#a58e28', cursor: 'pointer' }}>
            Write another
          </button>
        </div>
        {myVoices.length > 0 && (
          <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '4px 20px' }}>
            {myVoices.map((v, i) => {
              const st = STATUS_LABELS[v.status] || { label: v.status?.toUpperCase(), color: '#999' }
              return (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < myVoices.length - 1 ? '1px solid #1e1e1e' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#ccc' }}>{v.title}</div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{timeAgo(v.created_at)}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: st.color }}>{st.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Intro */}
      <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#a58e28', letterSpacing: '1.5px', marginBottom: 6 }}>INSIDER VOICES</div>
        <p style={{ fontSize: 13, color: '#999', lineHeight: 1.6, margin: 0 }}>
          Share your perspective on luxury careers, talent, and the industry. Your piece will appear on the Insights page | attributed to your role and maison | after editorial review.
        </p>
      </div>

      {/* Form */}
      <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '24px' }}>
        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Headline *
          </label>
          <input
            type="text"
            placeholder="e.g. Why luxury retail needs a new talent model"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Hook quote */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Hook quote * <span style={{ fontSize: 10, color: '#666', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— 1–2 sentences shown on the card preview</span>
          </label>
          <textarea
            placeholder="The most powerful thing you can say in 1–2 sentences. This is what people see before clicking."
            value={form.excerpt}
            onChange={e => setForm({ ...form, excerpt: e.target.value })}
            rows={2}
            style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
          />
        </div>

        {/* Full body */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Your full perspective * <span style={{ fontSize: 10, color: '#666', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— 300–800 words recommended</span>
          </label>
          <textarea
            placeholder="Write your perspective here. Be specific. Use examples from your experience. Avoid generalities | JOBLUX readers are senior professionals who value precision."
            value={form.bodyText}
            onChange={e => setForm({ ...form, bodyText: e.target.value })}
            rows={12}
            style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7 }}
          />
          {form.bodyText && (
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
              {form.bodyText.split(' ').filter(Boolean).length} words
            </div>
          )}
        </div>

        {/* Author info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Your name</label>
            <input
              type="text"
              placeholder="How you want to appear"
              value={form.authorName}
              onChange={e => setForm({ ...form, authorName: e.target.value })}
              style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Role & Maison</label>
            <input
              type="text"
              placeholder="e.g. Retail Director, Hermès"
              value={form.authorRole}
              onChange={e => setForm({ ...form, authorRole: e.target.value })}
              style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Cover image URL + external link */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Cover image URL <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input
              type="url"
              placeholder="https://..."
              value={form.coverImageUrl}
              onChange={e => setForm({ ...form, coverImageUrl: e.target.value })}
              style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>External link <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input
              type="url"
              placeholder="LinkedIn, company, referenced article..."
              value={form.externalLink}
              onChange={e => setForm({ ...form, externalLink: e.target.value })}
              style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#dc2626', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !form.title || !form.excerpt || !form.bodyText}
          style={{ padding: '11px 28px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, background: submitting || !form.title || !form.excerpt || !form.bodyText ? '#2a2a2a' : '#a58e28', color: submitting || !form.title || !form.excerpt || !form.bodyText ? '#666' : '#000', cursor: submitting || !form.title || !form.excerpt || !form.bodyText ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
        >
          {submitting ? 'Submitting...' : 'Submit for review →'}
        </button>
        <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
          Submitted pieces go to editorial review before publishing. You'll be notified on approval.
        </div>
      </div>

      {/* My previous voices */}
      {myVoices.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10 }}>My submitted perspectives</div>
          <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '4px 20px' }}>
            {myVoices.map((v, i) => {
              const st = STATUS_LABELS[v.status] || { label: v.status?.toUpperCase(), color: '#999' }
              return (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < myVoices.length - 1 ? '1px solid #1e1e1e' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#ccc' }}>{v.title}</div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{timeAgo(v.created_at)}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: st.color }}>{st.label}</span>
                  {v.status === 'published' && v.slug && (
                    <Link href={`/insights/${v.slug}`} style={{ fontSize: 11, color: '#a58e28', textDecoration: 'none' }}>View →</Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function InsiderDashboard() {
  const { data: session } = useSession()
  const memberId = (session?.user as any)?.memberId

  const [loading, setLoading] = useState(true)
  const [contributions, setContributions] = useState<any[]>([])
  const [contributionStats, setContributionStats] = useState<any>(null)
  const [signals, setSignals] = useState<any[]>([])
  const [overviewVoices, setOverviewVoices] = useState<any[]>([])
  const [activeNav, setActiveNav] = useState('overview')

  const firstName = (session?.user?.name || 'there').split(' ')[0]

  useEffect(() => {
    if (!session) return

    async function fetchAll() {
      try {
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
        const { data: sigData } = await supabase
          .from('signals')
          .select('id, slug, headline, category, published_at')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(5)
        if (sigData) setSignals(sigData)

        // Fetch my submitted voices
        const voicesRes = await fetch('/api/insider/my-voices')
        if (voicesRes.ok) {
          const vData = await voicesRes.json()
          setOverviewVoices(vData.voices || [])
        }
      } catch (err) {
        console.error('Insider dashboard fetch error:', err)
      }
      setLoading(false)
    }

    fetchAll()
  }, [session, memberId])

  useEffect(() => {
    if (activeNav === 'signals-link') { window.location.href = '/signals'; return }
    if (activeNav === 'brands-link') { window.location.href = '/brands'; return }
    if (activeNav === 'events-link') { window.location.href = '/events'; return }
    if (activeNav === 'submit-salary') { window.location.href = '/dashboard/insider/submit-salary'; return }
    if (activeNav === 'submit-correction') { window.location.href = '/dashboard/insider/submit-correction'; return }
  }, [activeNav])

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
        <div style={{ padding: '24px 16px 20px', borderBottom: '1px solid #1e1e1e' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 8 }}>
            {firstName[0]?.toUpperCase() || 'T'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{firstName}</div>
          <div style={{ fontSize: 11, color: '#a58e28', marginTop: 4 }}>TRUSTED CONTRIBUTOR</div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 300, color: '#fff' }}>{totalPoints}<span style={{ fontSize: 11, color: '#999', marginLeft: 4 }}>pts</span></div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(section => (
            <div key={section.section} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#555', letterSpacing: '1.5px', padding: '6px 8px 4px' }}>{section.section}</div>
              {section.items.map(item => {
                const isContribute = ['write-voice', 'submit-salary', 'submit-correction'].includes(item.id)
                const icons: Record<string, string> = { 'write-voice': '✍ ', 'submit-salary': '💰 ', 'submit-correction': '🔍 ' }
                return (
                <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '7px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 13,
                  background: activeNav === item.id ? '#1e1e1e' : 'transparent',
                  color: isContribute ? '#a58e28' : (activeNav === item.id ? '#fff' : '#999'),
                  fontWeight: isContribute ? 500 : 400,
                }}>
                  {icons[item.id] || ''}{item.label}
                </button>)
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 400, color: '#fff', margin: 0 }}>
            {loading ? 'Loading...' : activeNav === 'write-voice' ? 'Write a Perspective' : `Welcome back, ${firstName}`}
          </h1>
          <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
            {activeNav === 'write-voice' ? 'Share your expertise as a Trusted Contributor' : 'Trusted Contributor — your contributions power JOBLUX intelligence'}
          </p>
        </div>

        {/* WRITE A PERSPECTIVE */}
        {activeNav === 'write-voice' && <WriteVoiceSection session={session} />}

        {/* OVERVIEW */}
        {activeNav === 'overview' && (<>
          {/* Role framing */}
          <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#999', lineHeight: 1.6 }}>
              As a <span style={{ color: '#a58e28', fontWeight: 500 }}>Trusted Contributor</span>, your salary data, interview experiences, market signals, and perspectives power JOBLUX intelligence. You have access to all public intelligence plus contributor tools.
            </div>
          </div>

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

          {/* Write a perspective CTA */}
          <div style={{ background: 'rgba(165,142,40,0.06)', border: '1px solid rgba(165,142,40,0.2)', borderRadius: 8, padding: '18px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#a58e28', fontWeight: 600, marginBottom: 4 }}>Share your expertise</div>
              <div style={{ fontSize: 12, color: '#999', lineHeight: 1.5 }}>As a Trusted Contributor, you can publish perspectives on the Insights page. Your byline, your audience.</div>
            </div>
            <button onClick={() => setActiveNav('write-voice')} style={{ padding: '9px 20px', fontSize: 12, fontWeight: 600, border: '1px solid rgba(165,142,40,0.4)', borderRadius: 6, background: 'transparent', color: '#a58e28', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Write a perspective →
            </button>
          </div>

          {/* My perspectives */}
          {overviewVoices.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase' }}>My perspectives</div>
                <button onClick={() => setActiveNav('write-voice')} style={{ fontSize: 12, color: '#a58e28', background: 'none', border: 'none', cursor: 'pointer' }}>Write new →</button>
              </div>
              <div style={{ background: '#1a1a1a', border: '1px solid #1e1e1e', borderRadius: 6, padding: '4px 20px' }}>
                {overviewVoices.slice(0, 5).map((v: any, i: number) => {
                  const st = STATUS_LABELS[v.status] || { label: (v.status || '').toUpperCase(), color: '#999' }
                  return (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < Math.min(overviewVoices.length, 5) - 1 ? '1px solid #1e1e1e' : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: '#ccc' }}>{v.title}</div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{timeAgo(v.created_at)}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: st.color }}>{st.label}</span>
                      {v.status === 'published' && v.slug && (
                        <Link href={`/insights/${v.slug}`} style={{ fontSize: 11, color: '#a58e28', textDecoration: 'none' }}>View →</Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
                description="As a Trusted Contributor, your salary data, interview experiences, and market signals power JOBLUX intelligence."
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
                    <span style={{ fontSize: 13, color: '#ccc', flex: 1, lineHeight: 1.4 }}>{s.headline || s.title}</span>
                    <span style={{ fontSize: 11, color: '#999', whiteSpace: 'nowrap' }}>{timeAgo(s.published_at)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyCard title="No signals yet" description="Market intelligence will appear here as it gets published." />
            )}
          </div>
        </>)}

        {/* CONTRIBUTIONS TAB */}
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

        {/* IMPACT TAB */}
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
