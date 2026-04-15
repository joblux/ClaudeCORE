'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Invitation = {
  id: string
  contact_name: string | null
  contact_email: string
  contact_title: string | null
  contact_company: string | null
  status: string
  sent_at: string | null
}

type Stats = {
  sent: number
  opened: number
  joined: number
}

function normStatus(status: string): string {
  if (status === 'sent') return 'Sent'
  if (status === 'opened' || status === 'clicked') return 'Opened'
  if (status === 'joined' || status === 'registered') return 'Joined'
  return status
}

function statusColor(status: string): string {
  const s = normStatus(status)
  if (s === 'Joined') return '#1D9E75'
  if (s === 'Opened') return '#a58e28'
  return '#888'
}

export default function InviteClient() {
  const [tab, setTab] = useState<'email' | 'gmail' | 'linkedin'>('email')
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [stats, setStats] = useState<Stats>({ sent: 0, opened: 0, joined: 0 })
  const [loadingList, setLoadingList] = useState(true)

  // Email form state
  const [form, setForm] = useState({ name: '', email: '', title: '', company: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [formError, setFormError] = useState('')

  function applyStats(list: Invitation[]) {
    setStats({
      sent: list.filter(i => i.status === 'sent').length,
      opened: list.filter(i => i.status === 'opened' || i.status === 'clicked').length,
      joined: list.filter(i => i.status === 'joined' || i.status === 'registered').length,
    })
  }

  useEffect(() => {
    fetch('/api/invitations')
      .then(r => r.json())
      .then(data => {
        const list: Invitation[] = data.invitations || []
        setInvitations(list)
        applyStats(list)
      })
      .catch(() => {})
      .finally(() => setLoadingList(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email) return
    setSubmitting(true)
    setFormError('')
    setSuccess('')

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: [{
            name: form.name || null,
            email: form.email,
            title: form.title || null,
            company: form.company || null,
          }],
          source: 'email',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || 'Something went wrong.')
      } else {
        const result = data.results?.[0]
        if (result?.status === 'already_invited') {
          setFormError('This person has already been invited.')
        } else if (result?.status === 'already_member') {
          setFormError('This person is already a member.')
        } else if (result?.status === 'sent') {
          setSuccess('Invitation sent.')
          setForm({ name: '', email: '', title: '', company: '' })
          // Refresh list
          fetch('/api/invitations')
            .then(r => r.json())
            .then(refreshData => {
              const list: Invitation[] = refreshData.invitations || []
              setInvitations(list)
              applyStats(list)
            })
            .catch(() => {})
        } else {
          setFormError('Could not send invitation.')
        }
      }
    } catch {
      setFormError('Network error.')
    } finally {
      setSubmitting(false)
    }
  }

  const card: React.CSSProperties = {
    background: '#141414',
    border: '0.5px solid #2a2a2a',
    borderRadius: '8px',
    padding: '28px 32px',
    marginBottom: '16px',
  }

  const inputStyle: React.CSSProperties = {
    background: '#0f0f0f',
    border: '0.5px solid #2a2a2a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
    padding: '10px 14px',
    outline: 'none',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    color: '#fff',
    opacity: 0.4,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '6px',
    display: 'block',
  }

  const placeholderTab: React.CSSProperties = {
    background: 'transparent',
    border: '0.5px solid #333',
    color: '#fff',
    fontSize: '12px',
    padding: '10px 24px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    display: 'block',
    margin: '0 auto 14px',
  }

  return (
    <div style={{ background: '#0f0f0f', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

      {/* HEADER */}
      <div style={{ background: '#0a0a0a', borderBottom: '0.5px solid #1e1e1e', padding: '0 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/logos/joblux-header.png" alt="JOBLUX" style={{ height: '22px' }} />
          <Link href="/dashboard" style={{ fontSize: '12px', color: '#fff', opacity: 0.5, textDecoration: 'none' }}>← Dashboard</Link>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 40px 80px' }}>

        {/* Page title */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 400, fontSize: '26px', color: '#fff', margin: '0 0 6px' }}>
            Invite a Colleague
          </h1>
          <p style={{ fontSize: '13px', color: '#fff', opacity: 0.4, margin: 0 }}>
            Introduce discreet professionals to the platform.
          </p>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {([
            { label: 'Sent', value: stats.sent, color: '#fff' },
            { label: 'Opened', value: stats.opened, color: '#a58e28' },
            { label: 'Joined', value: stats.joined, color: '#1D9E75' },
          ] as const).map(s => (
            <div key={s.label} style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '20px 24px' }}>
              <div style={{ fontSize: '10px', color: '#fff', opacity: 0.35, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 300, color: s.color, fontFamily: 'var(--font-playfair), Georgia, serif' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs + form card */}
        <div style={card}>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '0.5px solid #2a2a2a', marginBottom: '28px', marginLeft: '-32px', marginRight: '-32px', paddingLeft: '32px' }}>
            {(['email', 'gmail', 'linkedin'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === t ? '1.5px solid #a58e28' : '1.5px solid transparent',
                  color: tab === t ? '#fff' : '#666',
                  fontSize: '12px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '0 20px 14px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: '-0.5px',
                }}
              >
                {t === 'email' ? 'Email' : t === 'gmail' ? 'Gmail' : 'LinkedIn'}
              </button>
            ))}
          </div>

          {/* TAB 1: Email */}
          {tab === 'email' && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>First name</label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Alexandra"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email address</label>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="alex@maison.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Title / Role</label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Head of Retail"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Company</label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Maison Margiela"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  />
                </div>
              </div>

              {success && (
                <div style={{ fontSize: '12px', color: '#1D9E75', marginBottom: '14px' }}>{success}</div>
              )}
              {formError && (
                <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '14px' }}>{formError}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#a58e28',
                  border: 'none',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '10px 24px',
                  borderRadius: '4px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {submitting ? 'Sending...' : 'Send invitation'}
              </button>
            </form>
          )}

          {/* TAB 2: Gmail */}
          {tab === 'gmail' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <button style={placeholderTab}>Connect Gmail</button>
              <p style={{ fontSize: '11px', color: '#666', maxWidth: '320px', margin: '0 auto', lineHeight: 1.6 }}>
                We&apos;ll ask permission to read your contacts. We never store or share them.
              </p>
            </div>
          )}

          {/* TAB 3: LinkedIn */}
          {tab === 'linkedin' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <button style={placeholderTab}>Connect LinkedIn</button>
              <p style={{ fontSize: '11px', color: '#666', maxWidth: '320px', margin: '0 auto', lineHeight: 1.6 }}>
                We&apos;ll ask permission to read your contacts. We never store or share them.
              </p>
            </div>
          )}

        </div>

        {/* Sent invitations list */}
        <div style={{ ...card, marginBottom: 0 }}>
          <div style={{ fontSize: '10px', color: '#fff', opacity: 0.5, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Sent invitations
          </div>

          {loadingList ? (
            <div style={{ fontSize: '13px', color: '#666' }}>Loading...</div>
          ) : invitations.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#666' }}>No invitations sent yet.</div>
          ) : (
            <div>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr', gap: '12px', paddingBottom: '10px', borderBottom: '0.5px solid #1e1e1e', marginBottom: '4px' }}>
                {['Name', 'Email', 'Company', 'Status'].map(h => (
                  <div key={h} style={{ fontSize: '10px', color: '#fff', opacity: 0.3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>
              {invitations.map(inv => {
                const ns = normStatus(inv.status)
                const sc = statusColor(inv.status)
                return (
                  <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr', gap: '12px', padding: '12px 0', borderBottom: '0.5px solid #1a1a1a', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#ccc' }}>{inv.contact_name || '—'}</div>
                    <div style={{ fontSize: '12px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.contact_email}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{inv.contact_company || '—'}</div>
                    <div>
                      <span style={{ fontSize: '10px', color: sc, border: `0.5px solid ${sc}`, padding: '2px 8px', borderRadius: '3px' }}>
                        {ns}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
