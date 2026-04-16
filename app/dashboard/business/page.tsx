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
  new: { bg: 'rgba(77,166,255,0.08)', color: '#4da6ff', border: '1px solid rgba(77,166,255,0.3)' },
  received: { bg: 'rgba(77,166,255,0.08)', color: '#4da6ff', border: '1px solid rgba(77,166,255,0.3)' },
  accepted: { bg: 'rgba(93,202,165,0.08)', color: '#5dcaa5', border: '1px solid rgba(93,202,165,0.3)' },
  under_review: { bg: 'rgba(93,202,165,0.08)', color: '#5dcaa5', border: '1px solid rgba(93,202,165,0.3)' },
  active: { bg: 'rgba(165,142,40,0.08)', color: '#a58e28', border: '1px solid rgba(165,142,40,0.25)' },
  in_progress: { bg: 'rgba(165,142,40,0.08)', color: '#a58e28', border: '1px solid rgba(165,142,40,0.25)' },
  done: { bg: 'rgba(255,255,255,0.04)', color: '#999', border: '1px solid #2a2a2a' },
  completed: { bg: 'rgba(255,255,255,0.04)', color: '#999', border: '1px solid #2a2a2a' },
  closed: { bg: 'rgba(255,255,255,0.02)', color: '#555', border: '1px solid #1c1c1c' },
}

const SALARY_ROWS = [
  { role: 'Store Director · Paris', range: '€85K–110K', trend: '+4%' },
  { role: 'Head of Digital · Paris', range: '€90K–120K', trend: '+7%' },
  { role: 'Retail Director · Europe', range: '€95K–130K', trend: '+3%' },
  { role: 'Workshop Manager · France', range: '€55K–70K', trend: '+2%' },
]

const UPCOMING_EVENTS = [
  { mo: 'Apr', dy: '28', title: 'Watches & Wonders Geneva 2026', loc: 'Geneva, Switzerland' },
  { mo: 'May', dy: '12', title: 'LVMH Innovation Award', loc: 'Paris, France' },
  { mo: 'Jun', dy: '03', title: 'Pitti Uomo 110', loc: 'Florence, Italy' },
  { mo: 'Sep', dy: '18', title: 'Milano Fashion Week SS27', loc: 'Milan, Italy' },
]

const LATEST_INSIGHTS = [
  { kind: 'Analysis', color: '#a78bfa', title: 'The quiet revolution in luxury retail staffing', age: '2d ago' },
  { kind: 'Report', color: '#5dcaa5', title: 'Q1 2026: Luxury compensation trends', age: '5d ago' },
  { kind: 'Editorial', color: '#ef9f27', title: 'Why watchmakers are hiring outside the industry', age: '1w ago' },
  { kind: 'Analysis', color: '#a78bfa', title: 'Digital talent migration into luxury hospitality', age: '2w ago' },
]

// ─────────────────────────────── Shared styles
const input: React.CSSProperties = {
  width: '100%', background: '#222', border: '1px solid #2a2a2a', borderRadius: 4,
  padding: '10px 12px', fontSize: 13, color: '#fff', fontFamily: 'Inter, sans-serif', outline: 'none',
}
const selectStyle: React.CSSProperties = { ...input, appearance: 'none' as const }
const textarea: React.CSSProperties = { ...input, resize: 'vertical' as const, minHeight: 70 }
const label: React.CSSProperties = { display: 'block', fontSize: 11, color: '#999', marginBottom: 4 }
const rq = <span style={{ color: '#a58e28' }}>*</span>
const bfSec: React.CSSProperties = { background: '#1a1a1a', border: '1px solid #1c1c1c', borderRadius: 5, padding: 24, marginBottom: 16 }
const bfSecT: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 14 }
const bfGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }
const bfSubBtn: React.CSSProperties = {
  display: 'inline-block', padding: '10px 24px', fontSize: 12, fontWeight: 600, color: '#111',
  background: '#a58e28', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
}

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

  // Contribute form
  const [contribTab, setContribTab] = useState<'salary' | 'interview' | 'signal'>('salary')

  // Invite form
  const [invite, setInvite] = useState({ first_name: '', email: '', title: '', company: '' })
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const [inviteTab, setInviteTab] = useState<'email' | 'gmail' | 'linkedin'>('email')

  // Settings local state
  const [exportRequested, setExportRequested] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [editHolder, setEditHolder] = useState(false)
  const [editCompany, setEditCompany] = useState(false)
  const [holderForm, setHolderForm] = useState({ first_name: '', last_name: '' })
  const [companyForm, setCompanyForm] = useState({ country: '', city: '', phone: '' })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsError, setSettingsError] = useState('')

  const refreshMember = async () => {
    const memberRes = await fetch('/api/members/me')
    if (memberRes.ok) setMember(await memberRes.json())
  }

  const saveProfile = async (payload: Record<string, string>) => {
    setSettingsError('')
    setSettingsSaving(true)
    try {
      const res = await fetch('/api/members/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        setSettingsError(data.error || 'Could not save changes.')
        setSettingsSaving(false)
        return false
      }
      await refreshMember()
      setSettingsSaving(false)
      return true
    } catch {
      setSettingsError('Network error. Please try again.')
      setSettingsSaving(false)
      return false
    }
  }

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

        const briefRes = await fetch('/api/business-briefs')
        if (briefRes.ok) {
          const data = await briefRes.json()
          setMyBriefs(data.briefs || [])
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

  const handleSendInvite = async () => {
    setInviteMsg('')
    if (!invite.first_name.trim() || !invite.email.trim()) {
      setInviteMsg('First name and email are required.')
      return
    }
    setInviteSending(true)
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invite),
      })
      if (res.ok) {
        setInviteMsg('Invitation sent.')
        setInvite({ first_name: '', email: '', title: '', company: '' })
      } else {
        setInviteMsg('Could not send invitation.')
      }
    } catch {
      setInviteMsg('Network error.')
    }
    setInviteSending(false)
  }

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
    background: '#1a1a1a', border: '1px solid #1c1c1c', borderRadius: 5, padding: 16,
  }
  const panelHeaderStyle: React.CSSProperties = {
    fontSize: 8, fontWeight: 600, letterSpacing: '1.6px', textTransform: 'uppercase',
  }
  const rowDivider: React.CSSProperties = { borderBottom: '1px solid #1c1c1c' }

  const sidebarBtn = (id: string, label: string) => (
    <button
      key={id}
      onClick={() => setActiveNav(id)}
      style={{
        display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 4,
        border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif',
        background: activeNav === id ? 'rgba(255,255,255,0.06)' : 'transparent',
        color: activeNav === id ? '#fff' : '#999',
        fontWeight: activeNav === id ? 500 : 400,
        marginBottom: 1,
      }}
    >
      {label}
    </button>
  )

  // ─────────────── Brief form rendered inline (matches prototype)
  const briefScreen = (
    <>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 3 }}>Business brief</div>
      <p style={{ fontSize: 12, color: '#999', lineHeight: 1.6, marginBottom: 18 }}>
        Share your hiring or intelligence requirement. Each brief is handled discreetly and in accordance with our{' '}
        <a href="/terms/business" target="_blank" rel="noopener noreferrer" style={{ color: '#999', textDecoration: 'underline' }}>Terms of Business</a>.
      </p>

      {/* How it works */}
      <div style={{ padding: '16px 18px', background: 'rgba(165,142,40,0.08)', border: '1px solid rgba(165,142,40,0.25)', borderRadius: 5, marginBottom: 18 }}>
        <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '1.5px', color: '#a58e28', marginBottom: 10 }}>HOW IT WORKS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { t: '1. Share your brief', d: 'Tell us about the role and context.' },
            { t: '2. We reach out', d: 'If the brief is a fit, we discuss the mandate.' },
            { t: '3. We search', d: 'Your JOBLUX consultant runs a discreet search.' },
            { t: '4. Review candidates', d: 'We present shortlisted candidates for review.' },
          ].map(s => (
            <div key={s.t}>
              <div style={{ fontSize: 11, color: '#fff', fontWeight: 500, marginBottom: 2 }}>{s.t}</div>
              <div style={{ fontSize: 10, color: '#999', lineHeight: 1.4 }}>{s.d}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(165,142,40,0.25)' }}>
          <div style={{ fontSize: 9, color: '#555', marginBottom: 5 }}>Compatible with your existing ATS</div>
          <div style={{ display: 'flex', gap: 16, opacity: 0.45 }}>
            {['Workday', 'Greenhouse', 'Lever', 'SAP SuccessFactors', 'SmartRecruiters'].map(a => (
              <span key={a} style={{ fontSize: 10, color: '#5dcaa5', fontWeight: 500 }}>{a}</span>
            ))}
          </div>
        </div>
      </div>

      <BusinessBriefForm companyName={companyName} companyType={member?.org_type || ''} />
    </>
  )

  // ─────────────── Add data screen (3 tabs)
  const adddataScreen = (
    <>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 3 }}>Add data</div>
      <div style={{ fontSize: 11, color: '#777', marginBottom: 20 }}>Intelligence is built on contribution</div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1c1c1c', marginBottom: 20 }}>
        {[
          { id: 'salary', label: 'Salary data' },
          { id: 'interview', label: 'Interview experience' },
          { id: 'signal', label: 'Market signal' },
        ].map(t => (
          <div
            key={t.id}
            onClick={() => setContribTab(t.id as any)}
            style={{
              fontSize: 12, padding: '10px 18px', cursor: 'pointer',
              borderBottom: contribTab === t.id ? '2px solid #fff' : '2px solid transparent',
              marginBottom: -1,
              color: contribTab === t.id ? '#fff' : '#555',
            }}
          >
            {t.label}
          </div>
        ))}
      </div>

      {contribTab === 'salary' && (
        <div style={bfSec}>
          <div style={bfSecT}>Salary data</div>
          <div style={bfGrid}>
            <div><label style={label}>Company {rq}</label><input style={input} placeholder="e.g. Hublot" /></div>
            <div><label style={label}>Job title {rq}</label><input style={input} placeholder="e.g. Store Director" /></div>
            <div><label style={label}>City {rq}</label><input style={input} placeholder="e.g. Paris" /></div>
            <div><label style={label}>Country {rq}</label><input style={input} placeholder="e.g. France" /></div>
            <div><label style={label}>Annual base salary {rq}</label><input style={input} placeholder="e.g. 95000" /></div>
            <div>
              <label style={label}>Currency {rq}</label>
              <select style={selectStyle}>
                {['EUR', 'GBP', 'USD', 'CHF'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={label}>Period</label><input style={input} placeholder="e.g. 2023–2024" /></div>
            <div><label style={label}>Total compensation</label><input style={input} placeholder="Including bonus if applicable" /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={label}>Source URL {rq}</label><input style={input} placeholder="Link to source (job posting, press release, or public record)" /></div>
          </div>
          <div style={{ marginTop: 16 }}><button style={bfSubBtn}>Submit salary data</button></div>
        </div>
      )}

      {contribTab === 'interview' && (
        <div style={bfSec}>
          <div style={bfSecT}>Interview experience</div>
          <div style={bfGrid}>
            <div><label style={label}>Company {rq}</label><input style={input} placeholder="e.g. Chanel" /></div>
            <div><label style={label}>Role applied for {rq}</label><input style={input} placeholder="e.g. Marketing Manager" /></div>
            <div><label style={label}>Year {rq}</label><input style={input} placeholder="e.g. 2024" /></div>
            <div>
              <label style={label}>Outcome</label>
              <select style={selectStyle}>
                <option>Select...</option>
                <option>Offer received</option>
                <option>Rejected</option>
                <option>Withdrew</option>
                <option>Still in process</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}><label style={label}>Number of rounds</label><input style={input} placeholder="e.g. 3" /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={label}>Process description {rq}</label><textarea style={textarea} placeholder="Describe the interview process — stages, format, what was assessed..." /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={label}>Tips for candidates</label><textarea style={textarea} placeholder="What would you tell someone preparing for this process?" /></div>
          </div>
          <div style={{ marginTop: 16 }}><button style={bfSubBtn}>Submit interview data</button></div>
        </div>
      )}

      {contribTab === 'signal' && (
        <div style={bfSec}>
          <div style={bfSecT}>Market signal</div>
          <div style={bfGrid}>
            <div style={{ gridColumn: '1 / -1' }}><label style={label}>Signal headline {rq}</label><input style={input} placeholder="e.g. Kering appoints new CEO for Gucci" /></div>
            <div>
              <label style={label}>Category {rq}</label>
              <select style={selectStyle}>
                <option>Select...</option>
                <option>Leadership</option>
                <option>Growth</option>
                <option>Contraction</option>
                <option>Expansion</option>
                <option>Merger & Acquisition</option>
              </select>
            </div>
            <div><label style={label}>Brand / company</label><input style={input} placeholder="e.g. Gucci" /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={label}>Source URL {rq}</label><input style={input} placeholder="Link to original source" /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={label}>Context</label><textarea style={textarea} placeholder="Add any additional context or analysis..." /></div>
          </div>
          <div style={{ marginTop: 16 }}><button style={bfSubBtn}>Submit signal</button></div>
        </div>
      )}
    </>
  )

  // ─────────────── Invite screen
  const inviteScreen = (
    <>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 3 }}>Invite luxury professionals you know</div>
      <div style={{ fontSize: 11, color: '#777', marginBottom: 20 }}>Invite a colleague to request access</div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1c1c1c', marginBottom: 20 }}>
        {[
          { id: 'email', label: 'Email' },
          { id: 'gmail', label: 'Gmail' },
          { id: 'linkedin', label: 'LinkedIn' },
        ].map(t => (
          <div
            key={t.id}
            onClick={() => setInviteTab(t.id as any)}
            style={{
              fontSize: 12, padding: '10px 18px', cursor: 'pointer',
              borderBottom: inviteTab === t.id ? '2px solid #fff' : '2px solid transparent',
              marginBottom: -1,
              color: inviteTab === t.id ? '#fff' : '#555',
            }}
          >
            {t.label}
          </div>
        ))}
      </div>

      {inviteTab === 'email' && (
        <>
          <div style={bfSec}>
            <div style={bfSecT}>Send an invitation</div>
            <p style={{ fontSize: 12, color: '#999', lineHeight: 1.6, marginBottom: 16 }}>
              Your colleague will receive a personal link to request access. Their invitation is linked to your account.
            </p>
            <div style={bfGrid}>
              <div><label style={label}>First name {rq}</label><input style={input} placeholder="Their first name" value={invite.first_name} onChange={e => setInvite({ ...invite, first_name: e.target.value })} /></div>
              <div><label style={label}>Email address {rq}</label><input style={input} placeholder="colleague@company.com" value={invite.email} onChange={e => setInvite({ ...invite, email: e.target.value })} /></div>
              <div><label style={label}>Title / role</label><input style={input} placeholder="Their title at the company" value={invite.title} onChange={e => setInvite({ ...invite, title: e.target.value })} /></div>
              <div><label style={label}>Company</label><input style={input} placeholder="Their company" value={invite.company} onChange={e => setInvite({ ...invite, company: e.target.value })} /></div>
            </div>
            {inviteMsg && <div style={{ fontSize: 11, color: inviteMsg === 'Invitation sent.' ? '#5dcaa5' : '#e24b4a', marginTop: 12 }}>{inviteMsg}</div>}
            <div style={{ marginTop: 14 }}>
              <button onClick={handleSendInvite} disabled={inviteSending} style={{ ...bfSubBtn, background: inviteSending ? '#7a6a1e' : '#a58e28', cursor: inviteSending ? 'not-allowed' : 'pointer' }}>
                {inviteSending ? 'Sending...' : 'Send invitation'}
              </button>
            </div>
          </div>

          <div style={bfSec}>
            <div style={bfSecT}>Sent invitations</div>
            <div style={{ fontSize: 12, color: '#999', padding: '12px 0' }}>
              No invitations sent yet.
            </div>
          </div>
        </>
      )}

      {inviteTab === 'gmail' && (
        <div style={bfSec}>
          <button style={{ padding: '10px 20px', fontSize: 12, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, background: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Connect Gmail
          </button>
          <p style={{ fontSize: 11, color: '#999', lineHeight: 1.6, marginTop: 14 }}>
            We&apos;ll ask permission to read your contacts. We never store or share them.
          </p>
        </div>
      )}

      {inviteTab === 'linkedin' && (
        <div style={bfSec}>
          <button style={{ padding: '10px 20px', fontSize: 12, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, background: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Connect LinkedIn
          </button>
          <p style={{ fontSize: 11, color: '#999', lineHeight: 1.6, marginTop: 14 }}>
            We&apos;ll ask permission to read your contacts. We never store or share them.
          </p>
        </div>
      )}
    </>
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#0f0f0f', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', minHeight: '100vh' }}>

        {/* ──────────────── Sidebar ──────────────── */}
        <aside style={{ width: 240, background: '#131313', borderRight: '1px solid #1c1c1c', padding: '20px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Profile */}
          <div style={{ padding: '0 18px 16px', borderBottom: '1px solid #1c1c1c', marginBottom: 6 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#4da6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 10 }}>
              {initials}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{companyName || [firstName, lastName].filter(Boolean).join(' ') || 'Employer'}</div>
            {(firstName || lastName) && <div style={{ fontSize: 11, color: '#999', marginTop: 1 }}>{[firstName, lastName].filter(Boolean).join(' ')}</div>}
          </div>

          {/* Nav sections */}
          {navItems.map(section => (
            <div key={section.section} style={{ padding: '0 10px', marginTop: 2 }}>
              <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '2px', color: '#555', textTransform: 'uppercase', padding: '12px 8px 5px' }}>{section.section}</div>
              {section.items.map(item => sidebarBtn(item.id, item.label))}
            </div>
          ))}

          {/* Resources (no active state, external links) */}
          <div style={{ padding: '0 10px', marginTop: 2 }}>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '2px', color: '#555', textTransform: 'uppercase', padding: '12px 8px 5px' }}>RESOURCES</div>
            {resourceLinks.map(r => (
              <a
                key={r.label}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', padding: '7px 10px', borderRadius: 4, fontSize: 13, color: '#999', textDecoration: 'none', marginBottom: 1 }}
              >
                {r.label}
              </a>
            ))}
          </div>

          {/* Invite (inline switch, not external) */}
          <div style={{ padding: '0 10px', marginTop: 2 }}>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '2px', color: '#555', textTransform: 'uppercase', padding: '12px 8px 5px' }}>INVITE</div>
            {sidebarBtn('invite', 'Invite')}
          </div>

          {/* Account */}
          <div style={{ padding: '0 10px', marginTop: 2 }}>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '2px', color: '#555', textTransform: 'uppercase', padding: '12px 8px 5px' }}>ACCOUNT</div>
            {sidebarBtn('settings', 'Settings')}
          </div>

          {/* Bottom */}
          <div style={{ marginTop: 'auto', padding: '12px 10px', borderTop: '1px solid #1c1c1c', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <a href="/faq" target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 12, color: '#999', padding: '8px 10px', textDecoration: 'none', borderRadius: 4 }}>Help</a>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{ display: 'block', textAlign: 'left', width: '100%', fontSize: 12, color: '#555', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4, fontFamily: 'Inter, sans-serif' }}
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* ──────────────── Main ──────────────── */}
        <main style={{ flex: 1, padding: '28px 32px', minWidth: 0, overflow: 'hidden' }}>

          {/* Overview */}
          {activeNav === 'overview' && (
            <>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 400, color: '#fff', marginBottom: 3 }}>Welcome back, {firstName || 'there'}</div>
              <div style={{ fontSize: 11, color: '#777', marginBottom: 20 }}>{today}</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 20 }}>
                {statCards.map(c => (
                  <div key={c.label} style={{ background: '#1a1a1a', border: '1px solid #1c1c1c', borderRadius: 5, padding: '14px 12px' }}>
                    <div style={{ fontSize: 22, fontWeight: 600, color: c.color, marginBottom: 1 }}>{c.value}</div>
                    <div style={{ fontSize: 10, color: '#777' }}>{c.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {/* Market signals */}
                <div style={panelStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ ...panelHeaderStyle, color: '#4da6ff' }}>Market signals</span>
                    <Link href="/signals" style={{ fontSize: 10, color: '#555', textDecoration: 'none' }}>All signals →</Link>
                  </div>
                  {signals.length > 0 ? signals.slice(0, 4).map((s, i, arr) => (
                    <Link key={s.id} href={`/signals/${s.slug || s.id}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', ...(i < arr.length - 1 ? rowDivider : {}), textDecoration: 'none' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: SIGNAL_COLORS[s.category] || '#888', flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontSize: 11, color: '#ccc', flex: 1, lineHeight: 1.4 }}>{s.headline}</span>
                      <span style={{ fontSize: 9, color: '#555', whiteSpace: 'nowrap' }}>{timeAgo(s.published_at)}</span>
                    </Link>
                  )) : <div style={{ fontSize: 11, color: '#999', padding: '7px 0' }}>No signals yet.</div>}
                </div>

                {/* Salary benchmarks */}
                <div style={panelStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ ...panelHeaderStyle, color: '#5dcaa5' }}>Salary benchmarks</span>
                    <Link href="/careers?tab=salary" style={{ fontSize: 10, color: '#555', textDecoration: 'none' }}>Full data →</Link>
                  </div>
                  {SALARY_ROWS.map((r, i) => (
                    <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', ...(i < SALARY_ROWS.length - 1 ? rowDivider : {}) }}>
                      <span style={{ fontSize: 11, color: '#ccc' }}>{r.role}</span>
                      <span>
                        <span style={{ fontSize: 11, color: '#a58e28', fontWeight: 500 }}>{r.range}</span>
                        <span style={{ fontSize: 9, color: '#5dcaa5', marginLeft: 8 }}>{r.trend}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Upcoming events */}
                <div style={panelStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ ...panelHeaderStyle, color: '#ef9f27' }}>Upcoming events</span>
                    <Link href="/events" style={{ fontSize: 10, color: '#555', textDecoration: 'none' }}>All events →</Link>
                  </div>
                  {UPCOMING_EVENTS.map((e, i) => (
                    <div key={e.title} style={{ display: 'flex', gap: 10, padding: '7px 0', ...(i < UPCOMING_EVENTS.length - 1 ? rowDivider : {}) }}>
                      <div style={{ background: '#1f1f1f', borderRadius: 3, padding: '4px 7px', textAlign: 'center', minWidth: 38, flexShrink: 0 }}>
                        <div style={{ fontSize: 7, color: '#ef9f27', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{e.mo}</div>
                        <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{e.dy}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#ccc', lineHeight: 1.3 }}>{e.title}</div>
                        <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{e.loc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Latest insights */}
                <div style={panelStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ ...panelHeaderStyle, color: '#a78bfa' }}>Latest insights</span>
                    <Link href="/insights" style={{ fontSize: 10, color: '#555', textDecoration: 'none' }}>All insights →</Link>
                  </div>
                  {LATEST_INSIGHTS.map((x, i) => (
                    <div key={x.title} style={{ display: 'flex', gap: 8, padding: '7px 0', ...(i < LATEST_INSIGHTS.length - 1 ? rowDivider : {}) }}>
                      <span style={{ fontSize: 7, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', width: 55, paddingTop: 2, color: x.color, flexShrink: 0 }}>{x.kind}</span>
                      <span style={{ fontSize: 11, color: '#ccc', flex: 1, lineHeight: 1.3 }}>{x.title}</span>
                      <span style={{ fontSize: 9, color: '#555', whiteSpace: 'nowrap' }}>{x.age}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeNav === 'submit-brief' && briefScreen}

          {activeNav === 'request-status' && (
            <>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 3 }}>Request status</div>
              <div style={{ fontSize: 11, color: '#777', marginBottom: 20 }}>Track the progress of your briefs</div>

              {myBriefs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {myBriefs.map(b => {
                    const badge = STATUS_BADGE[b.status] || STATUS_BADGE.new
                    const date = b.created_at ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''
                    return (
                      <div key={b.id} style={{ background: '#1a1a1a', border: '1px solid #1c1c1c', borderRadius: 5, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{b.company_name} — {b.brief_type}</div>
                          <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>Submitted {date}</div>
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 3, background: badge.bg, color: badge.color, border: badge.border, flexShrink: 0 }}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ background: '#1a1a1a', border: '1px solid #1c1c1c', borderRadius: 5, padding: '28px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#999', marginBottom: 14 }}>No active requests yet. Submit a brief to begin.</p>
                  <button onClick={() => setActiveNav('submit-brief')} style={{ padding: '9px 20px', fontSize: 12, fontWeight: 500, color: '#a58e28', border: '1px solid rgba(165,142,40,0.3)', borderRadius: 4, background: 'transparent', cursor: 'pointer' }}>
                    Submit a brief →
                  </button>
                </div>
              )}
            </>
          )}

          {activeNav === 'contributions' && (
            <>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 3 }}>My contributions</div>
              <div style={{ fontSize: 11, color: '#777', marginBottom: 20 }}>Data you&apos;ve contributed to the intelligence ecosystem</div>

              {contributions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {contributions.map((c: any) => {
                    const approved = c.status === 'approved' || c.approved === true
                    return (
                      <div key={c.id} style={{ background: '#1a1a1a', border: '1px solid #1c1c1c', borderRadius: 5, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(165,142,40,0.08)', color: '#a58e28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginRight: 10 }}>•</div>
                          <div>
                            <div style={{ fontSize: 12, color: '#fff' }}>{c.type || c.contribution_type || 'Data'}{c.description ? ` · ${c.description}` : ''}</div>
                            <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{c.created_at ? `Submitted ${new Date(c.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}</div>
                          </div>
                        </div>
                        <span style={{
                          fontSize: 8, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3,
                          background: approved ? 'rgba(93,202,165,0.08)' : 'rgba(239,159,39,0.08)',
                          color: approved ? '#5dcaa5' : '#ef9f27',
                          border: approved ? '1px solid rgba(93,202,165,0.3)' : '1px solid rgba(239,159,39,0.3)',
                        }}>
                          {approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ background: '#1a1a1a', border: '1px solid #1c1c1c', borderRadius: 5, padding: '28px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#999', margin: 0 }}>No contributions yet. Add data to strengthen the intelligence ecosystem.</p>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <button onClick={() => setActiveNav('adddata')} style={{ display: 'inline-block', padding: '8px 18px', fontSize: 11, color: '#a58e28', border: '1px solid rgba(165,142,40,0.25)', borderRadius: 4, background: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Add data →
                </button>
              </div>
            </>
          )}

          {activeNav === 'adddata' && adddataScreen}

          {activeNav === 'invite' && inviteScreen}

          {activeNav === 'settings' && (() => {
            const acCard: React.CSSProperties = { background: '#1a1a1a', border: '1px solid #1c1c1c', borderRadius: 5, padding: 20, marginBottom: 14 }
            const acT: React.CSSProperties = { fontSize: 9, fontWeight: 600, letterSpacing: '1.5px', color: '#555', textTransform: 'uppercase' }
            const acTh: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }
            const acEdit: React.CSSProperties = { fontSize: 10, color: '#a58e28', textDecoration: 'none', fontWeight: 400 }
            const acRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #1c1c1c' }
            const acL: React.CSSProperties = { fontSize: 11, color: '#999' }
            const acV: React.CSSProperties = { fontSize: 11, color: '#fff' }
            const acAct: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1c1c1c' }
            const acBtn: React.CSSProperties = { padding: '7px 14px', fontSize: 10, fontWeight: 500, background: 'transparent', border: '1px solid #2a2a2a', color: '#999', borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }
            const acBtnDng: React.CSSProperties = { ...acBtn, color: '#e24b4a', borderColor: 'rgba(226,75,74,0.3)' }

            const fullName = [firstName, lastName].filter(Boolean).join(' ') || session?.user?.name || '—'
            const isApproved = member?.status === 'approved'
            const companyRows = [
              { label: 'Company', value: member?.company_name || '—' },
              { label: 'Organisation type', value: member?.org_type || '—' },
              { label: 'Sector', value: (member as any)?.sector || '—' },
              { label: 'Country', value: member?.country || '—' },
              { label: 'City', value: member?.city || '—' },
              { label: 'Phone', value: (member as any)?.phone || '—' },
            ]

            const editBtn: React.CSSProperties = { fontSize: 10, color: '#a58e28', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }
            const editInput: React.CSSProperties = { background: '#222', border: '1px solid #2a2a2a', borderRadius: 4, padding: '6px 10px', fontSize: 11, color: '#fff', fontFamily: 'Inter, sans-serif', outline: 'none', width: 200 }
            const saveBtn: React.CSSProperties = { padding: '6px 14px', fontSize: 10, fontWeight: 600, color: '#111', background: '#a58e28', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }
            const cancelBtn: React.CSSProperties = { padding: '6px 14px', fontSize: 10, fontWeight: 500, color: '#999', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 4, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }

            const openHolderEdit = () => {
              setHolderForm({ first_name: member?.first_name || '', last_name: member?.last_name || '' })
              setSettingsError('')
              setEditHolder(true)
            }
            const openCompanyEdit = () => {
              setCompanyForm({
                country: member?.country || '',
                city: member?.city || '',
                phone: (member as any)?.phone || '',
              })
              setSettingsError('')
              setEditCompany(true)
            }
            const handleSaveHolder = async () => {
              const ok = await saveProfile({ first_name: holderForm.first_name, last_name: holderForm.last_name })
              if (ok) setEditHolder(false)
            }
            const handleSaveCompany = async () => {
              const ok = await saveProfile({ country: companyForm.country, city: companyForm.city, phone: companyForm.phone })
              if (ok) setEditCompany(false)
            }

            return (
              <>
                {/* Card 1 — Account holder */}
                <div style={acCard}>
                  <div style={acTh}>
                    <span style={acT}>Account holder</span>
                    {!editHolder && <button style={editBtn} onClick={openHolderEdit}>Edit →</button>}
                  </div>
                  {!editHolder ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#4da6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, fontWeight: 500, color: '#fff' }}>{fullName}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>Company account</div>
                        <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{member?.email || session?.user?.email || '—'}</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={acRow}>
                        <span style={acL}>First name</span>
                        <input style={editInput} value={holderForm.first_name} onChange={e => setHolderForm({ ...holderForm, first_name: e.target.value })} />
                      </div>
                      <div style={{ ...acRow, borderBottom: 'none' }}>
                        <span style={acL}>Last name</span>
                        <input style={editInput} value={holderForm.last_name} onChange={e => setHolderForm({ ...holderForm, last_name: e.target.value })} />
                      </div>
                      {settingsError && <div style={{ fontSize: 11, color: '#e24b4a', marginTop: 10 }}>{settingsError}</div>}
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
                        <button style={cancelBtn} onClick={() => { setEditHolder(false); setSettingsError('') }} disabled={settingsSaving}>Cancel</button>
                        <button style={saveBtn} onClick={handleSaveHolder} disabled={settingsSaving}>{settingsSaving ? 'Saving...' : 'Save'}</button>
                      </div>
                    </>
                  )}
                </div>

                {/* Card 2 — Company information */}
                <div style={acCard}>
                  <div style={acTh}>
                    <span style={acT}>Company information</span>
                    {!editCompany && <button style={editBtn} onClick={openCompanyEdit}>Edit →</button>}
                  </div>
                  {!editCompany ? (
                    <>
                      {companyRows.map(r => (
                        <div key={r.label} style={acRow}>
                          <span style={acL}>{r.label}</span>
                          <span style={acV}>{r.value}</span>
                        </div>
                      ))}
                      <div style={{ ...acRow, borderBottom: 'none' }}>
                        <span style={acL}>Status</span>
                        <span style={{ ...acV, color: isApproved ? '#5dcaa5' : '#fff' }}>
                          {isApproved ? 'Approved' : (member?.status || '—')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={acRow}>
                        <span style={acL}>Company</span>
                        <span style={acV}>{member?.company_name || '—'}</span>
                      </div>
                      <div style={acRow}>
                        <span style={acL}>Organisation type</span>
                        <span style={acV}>{member?.org_type || '—'}</span>
                      </div>
                      <div style={acRow}>
                        <span style={acL}>Sector</span>
                        <span style={acV}>{(member as any)?.sector || '—'}</span>
                      </div>
                      <div style={acRow}>
                        <span style={acL}>Country</span>
                        <input style={editInput} value={companyForm.country} onChange={e => setCompanyForm({ ...companyForm, country: e.target.value })} />
                      </div>
                      <div style={acRow}>
                        <span style={acL}>City</span>
                        <input style={editInput} value={companyForm.city} onChange={e => setCompanyForm({ ...companyForm, city: e.target.value })} />
                      </div>
                      <div style={acRow}>
                        <span style={acL}>Phone</span>
                        <input style={editInput} value={companyForm.phone} onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })} />
                      </div>
                      <div style={{ ...acRow, borderBottom: 'none' }}>
                        <span style={acL}>Status</span>
                        <span style={{ ...acV, color: isApproved ? '#5dcaa5' : '#fff' }}>
                          {isApproved ? 'Approved' : (member?.status || '—')}
                        </span>
                      </div>
                      {settingsError && <div style={{ fontSize: 11, color: '#e24b4a', marginTop: 10 }}>{settingsError}</div>}
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
                        <button style={cancelBtn} onClick={() => { setEditCompany(false); setSettingsError('') }} disabled={settingsSaving}>Cancel</button>
                        <button style={saveBtn} onClick={handleSaveCompany} disabled={settingsSaving}>{settingsSaving ? 'Saving...' : 'Save'}</button>
                      </div>
                    </>
                  )}
                </div>

                {/* Card 3 — Account actions */}
                <div style={{ ...acCard, marginBottom: 0 }}>
                  <div style={{ ...acT, marginBottom: 14 }}>Account actions</div>

                  <div style={acAct}>
                    <div>
                      <div style={{ fontSize: 12, color: '#ccc' }}>Sign out</div>
                      <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>Sign out of your account on this device</div>
                    </div>
                    <button style={acBtn} onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
                  </div>

                  <div style={acAct}>
                    <div>
                      <div style={{ fontSize: 12, color: '#ccc' }}>Export my data</div>
                      <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>Download a copy of all your data · GDPR Article 20</div>
                    </div>
                    <button style={acBtn} onClick={() => setExportRequested(true)}>
                      {exportRequested ? 'Request sent ✓' : 'Request export'}
                    </button>
                  </div>

                  <div style={{ ...acAct, borderBottom: 'none' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#e24b4a' }}>Delete account</div>
                      <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>Permanently delete your account and all associated data</div>
                    </div>
                    {!deleteConfirm ? (
                      <button style={acBtnDng} onClick={() => setDeleteConfirm(true)}>Delete account</button>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={acBtn} onClick={() => setDeleteConfirm(false)}>Cancel</button>
                        <button style={acBtnDng}>Confirm delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )
          })()}

        </main>
      </div>
    </div>
  )
}
