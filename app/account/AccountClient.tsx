'use client'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AccountClient({ member }: { member: any }) {
  const { data: session } = useSession()
  const [inviteTab, setInviteTab] = useState<'email' | 'gmail' | 'linkedin'>('email')
  const [emailStep, setEmailStep] = useState(1)
  const [gmailStep, setGmailStep] = useState(1)
  const [linkedinStep, setLinkedinStep] = useState(1)
  const [emailInput, setEmailInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [exportRequested, setExportRequested] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const initials = member?.first_name && member?.last_name
    ? `${member.first_name[0]}${member.last_name[0]}`.toUpperCase()
    : session?.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??'

  const tierLabel: Record<string, string> = {
    emerging_professional: 'Emerging Professional',
    established_professional: 'Established Professional',
    senior_executive: 'Senior & Executive',
    luxury_employer: 'Luxury Employer',
    trusted_contributor: 'Trusted Contributor',
    admin: 'Admin',
    professional: 'Professional',
    senior: 'Senior & Executive',
    executive: 'Senior & Executive',
    business: 'Luxury Employer',
    insider_contributor: 'Trusted Contributor',
    insider_key_speaker: 'Trusted Contributor',
    member: 'Emerging Professional',
  }

  const card: React.CSSProperties = {
    background: '#141414',
    border: '0.5px solid #2a2a2a',
    borderRadius: '8px',
    padding: '32px',
    marginBottom: '16px',
  }

  const label: React.CSSProperties = {
    fontSize: '10px',
    color: '#fff',
    opacity: 0.35,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '6px',
  }

  const value: React.CSSProperties = {
    fontSize: '13px',
    color: '#fff',
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: '10px',
    color: '#fff',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '24px',
    opacity: 0.5,
  }

  const btnOutline: React.CSSProperties = {
    background: 'transparent',
    border: '0.5px solid #333',
    color: '#fff',
    fontSize: '12px',
    padding: '8px 18px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  }

  const btnWhite: React.CSSProperties = {
    background: '#fff',
    border: 'none',
    color: '#000',
    fontSize: '12px',
    fontWeight: 600,
    padding: '10px 22px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    fontSize: '12px',
    padding: '8px 20px',
    borderRadius: '4px',
    border: active ? '0.5px solid #1D9E75' : '0.5px solid #2a2a2a',
    background: active ? 'rgba(29,158,117,0.1)' : 'transparent',
    color: active ? '#1D9E75' : '#888',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  })

  const checkRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '13px 16px',
    borderBottom: '0.5px solid #1e1e1e',
    cursor: 'pointer',
  }

  const field: React.CSSProperties = {
    background: '#0f0f0f',
    border: '0.5px solid #2a2a2a',
    borderRadius: '5px',
    padding: '11px 14px',
    fontSize: '13px',
    color: '#fff',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const statCard = (val: string | number, lbl: string, green?: boolean): React.ReactElement => (
    <div style={{ background: '#0f0f0f', border: '0.5px solid #1e1e1e', borderRadius: '6px', padding: '16px' }}>
      <div style={{ fontSize: '22px', color: green ? '#1D9E75' : '#fff', fontWeight: 300, marginBottom: '4px' }}>{val}</div>
      <div style={{ fontSize: '10px', color: '#fff', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{lbl}</div>
    </div>
  )

  const sentItem = (name: string, sub: string): React.ReactElement => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '13px', color: '#fff' }}>{name}</div>
        <div style={{ fontSize: '11px', color: '#fff', opacity: 0.4 }}>{sub}</div>
      </div>
      <span style={{ fontSize: '10px', color: '#1D9E75', border: '0.5px solid #1D9E75', padding: '2px 8px', borderRadius: '3px' }}>SENT</span>
    </div>
  )

  const confirmationScreen = (title: string, subtitle: string, names: { name: string; sub: string }[], onAgain: () => void) => (
    <div style={{ background: '#141414', border: '0.5px solid #1D9E75', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 20px' }}>✓</div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '22px', color: '#fff', margin: '0 0 10px' }}>{title}</h2>
      <p style={{ fontSize: '13px', color: '#fff', opacity: 0.5, margin: '0 0 28px', lineHeight: 1.7 }}>{subtitle}</p>
      <div style={{ background: '#0f0f0f', border: '0.5px solid #2a2a2a', borderRadius: '6px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
        <div style={{ fontSize: '10px', color: '#fff', opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Sent to</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {names.map((n, i) => <div key={i}>{sentItem(n.name, n.sub)}</div>)}
        </div>
      </div>
      <button style={btnOutline} onClick={onAgain}>Invite more →</button>
    </div>
  )

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
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '26px', color: '#fff', margin: '0 0 6px' }}>Account</h1>
          <p style={{ fontSize: '13px', color: '#fff', opacity: 0.4, margin: 0 }}>Manage your account and invite colleagues</p>
        </div>

        {/* ── SECTION 1: YOUR ACCOUNT ── */}
        <div style={card}>
          <div style={sectionTitle}>Your account</div>

          {/* Avatar + identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '28px', borderBottom: '0.5px solid #1e1e1e' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#1e1e1e', border: '0.5px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#fff', fontWeight: 400, marginBottom: '4px' }}>
                {member?.first_name && member?.last_name ? `${member.first_name} ${member.last_name}` : session?.user?.name || '—'}
              </div>
              <div style={{ fontSize: '12px', color: '#fff', opacity: 0.5, marginBottom: '8px' }}>{member?.email || session?.user?.email}</div>
              <span style={{ fontSize: '10px', color: '#fff', border: '0.5px solid #333', padding: '3px 10px', borderRadius: '3px', letterSpacing: '0.08em', opacity: 0.7 }}>
                {tierLabel[member?.role] || member?.role || '—'}
              </span>
            </div>
          </div>

          {/* Read-only fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div><div style={label}>City</div><div style={value}>{member?.city || '—'}</div></div>
            <div><div style={label}>Country</div><div style={value}>{member?.country || '—'}</div></div>
            <div><div style={label}>Phone</div><div style={value}>{member?.phone || '—'}</div></div>
            <div><div style={label}>Job title</div><div style={value}>{member?.job_title || '—'}</div></div>
            <div><div style={label}>Employer</div><div style={value}>{member?.current_employer || '—'}</div></div>
            <div>
              <div style={label}>Status</div>
              <div style={{ fontSize: '12px', color: '#1D9E75', border: '0.5px solid #1D9E75', padding: '2px 8px', borderRadius: '3px', display: 'inline-block' }}>
                {member?.status === 'approved' ? 'Approved' : member?.status || '—'}
              </div>
            </div>
          </div>

          {/* Footer nudge */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '0.5px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '11px', color: '#fff', opacity: 0.3 }}>To update your professional details, edit your Profilux.</div>
            <Link href="/dashboard/candidate/profilux" style={{ fontSize: '12px', color: '#fff', opacity: 0.6, textDecoration: 'none', border: '0.5px solid #333', padding: '6px 14px', borderRadius: '4px' }}>
              Edit Profilux →
            </Link>
          </div>
        </div>

        {/* ── SECTION 2: INVITE COLLEAGUES ── */}
        <div style={card}>
          <div style={sectionTitle}>Invite colleagues</div>
          <p style={{ fontSize: '13px', color: '#fff', opacity: 0.4, margin: '0 0 24px', lineHeight: 1.7 }}>
            JOBLUX grows through trusted introductions. Invite luxury professionals from your network.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '28px' }}>
            {statCard(0, 'Sent')}
            {statCard(0, 'Clicked')}
            {statCard(0, 'Joined', true)}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button style={tabBtn(inviteTab === 'email')} onClick={() => { setInviteTab('email'); setEmailStep(1) }}>Email</button>
            <button style={tabBtn(inviteTab === 'gmail')} onClick={() => { setInviteTab('gmail'); setGmailStep(1) }}>Gmail</button>
            <button style={tabBtn(inviteTab === 'linkedin')} onClick={() => { setInviteTab('linkedin'); setLinkedinStep(1) }}>LinkedIn</button>
          </div>

          {/* ── EMAIL FLOW ── */}
          {inviteTab === 'email' && (
            <>
              {emailStep === 1 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.06em', marginBottom: '20px' }}>Step 1 of 3 | Enter email addresses</div>
                  <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '28px' }}>
                    <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '20px', color: '#fff', margin: '0 0 8px' }}>Invite by email</h2>
                    <p style={{ fontSize: '13px', color: '#fff', opacity: 0.4, margin: '0 0 20px', lineHeight: 1.7 }}>
                      One per line, comma-separated, or Name &lt;email&gt; format.
                    </p>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '10px', color: '#fff', opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Email addresses</div>
                      <textarea
                        style={{ ...field, minHeight: '100px', resize: 'vertical' }}
                        placeholder={'sophie.laurent@chanel.com\njean.dupont@lvmh.com\nName <alex@kering.com>'}
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid #1e1e1e', paddingTop: '20px' }}>
                      <span style={{ fontSize: '11px', color: '#fff', opacity: 0.25 }}>Your invite link will be included automatically</span>
                      <button style={btnWhite} onClick={() => setEmailStep(2)}>Review contacts →</button>
                    </div>
                  </div>
                </div>
              )}

              {emailStep === 2 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.06em', marginBottom: '20px' }}>Step 2 of 3 | Review & confirm</div>
                  <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '28px' }}>
                    <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '20px', color: '#fff', margin: '0 0 6px' }}>Review contacts</h2>
                    <p style={{ fontSize: '13px', color: '#fff', opacity: 0.4, margin: '0 0 20px' }}>3 contacts found. Deselect anyone you don't want to invite.</p>
                    <div style={{ background: '#0f0f0f', border: '0.5px solid #2a2a2a', borderRadius: '6px', marginBottom: '16px' }}>
                      {[
                        { name: 'Sophie Laurent', sub: 'sophie.laurent@chanel.com' },
                        { name: 'Jean Dupont', sub: 'jean.dupont@lvmh.com' },
                        { name: 'alex@kering.com', sub: '' },
                      ].map((c, i) => (
                        <div key={i} style={{ ...checkRow, borderBottom: i < 2 ? '0.5px solid #1e1e1e' : 'none' }}>
                          <input type="checkbox" defaultChecked style={{ accentColor: '#1D9E75', width: '16px', height: '16px', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '13px', color: '#fff', marginBottom: c.sub ? '2px' : 0 }}>{c.name}</div>
                            {c.sub && <div style={{ fontSize: '11px', color: '#fff', opacity: 0.4 }}>{c.sub}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: '#0a0a0a', border: '0.5px solid #1e1e1e', borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
                      <div style={{ fontSize: '10px', color: '#fff', opacity: 0.35, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Email preview</div>
                      <div style={{ fontSize: '12px', color: '#fff', opacity: 0.6, lineHeight: 1.8 }}>
                        Subject: <span style={{ opacity: 1 }}>
                          {member?.first_name ? `${member.first_name} ${member.last_name}` : 'A colleague'} invited you to JOBLUX
                        </span><br />
                        From: <span style={{ opacity: 1 }}>noreply@joblux.com</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid #1e1e1e', paddingTop: '20px' }}>
                      <button style={btnOutline} onClick={() => setEmailStep(1)}>← Back</button>
                      <button style={btnWhite} onClick={() => setEmailStep(3)}>Send 3 invitations →</button>
                    </div>
                  </div>
                </div>
              )}

              {emailStep === 3 && confirmationScreen(
                '3 invitations sent',
                'Your colleagues will receive a JOBLUX branded invitation email.',
                [
                  { name: 'Sophie Laurent', sub: 'sophie.laurent@chanel.com' },
                  { name: 'Jean Dupont', sub: 'jean.dupont@lvmh.com' },
                  { name: 'alex@kering.com', sub: '' },
                ],
                () => setEmailStep(1)
              )}
            </>
          )}

          {/* ── GMAIL FLOW ── */}
          {inviteTab === 'gmail' && (
            <>
              {gmailStep === 1 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.06em', marginBottom: '20px' }}>Step 1 of 3 | Connect Google account</div>
                  <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '36px', textAlign: 'center' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', display: 'block' }}>
                      <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '20px', color: '#fff', margin: '0 0 10px' }}>Import from Gmail</h2>
                    <p style={{ fontSize: '13px', color: '#fff', opacity: 0.4, margin: '0 0 24px', lineHeight: 1.7 }}>Connect your Google account to import contact names and emails. We read nothing else | no emails, no calendar.</p>
                    <div style={{ background: '#0f0f0f', border: '0.5px solid #1e1e1e', borderRadius: '6px', padding: '14px', marginBottom: '24px', textAlign: 'left' }}>
                      <div style={{ fontSize: '10px', color: '#fff', opacity: 0.35, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>We only access</div>
                      <div style={{ fontSize: '12px', color: '#ccc', lineHeight: 2 }}>✓ Contact names<br />✓ Email addresses<br />✗ Emails, calendar, or any other data</div>
                    </div>
                    <button style={{ ...btnWhite, display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => setGmailStep(2)}>
                      <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Connect Google account
                    </button>
                  </div>
                </div>
              )}

              {gmailStep === 2 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.06em', marginBottom: '20px' }}>Step 2 of 3 | Select contacts to invite</div>
                  <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '28px' }}>
                    <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '20px', color: '#fff', margin: '0 0 6px' }}>248 contacts found</h2>
                    <p style={{ fontSize: '13px', color: '#fff', opacity: 0.4, margin: '0 0 16px' }}>Select who you'd like to invite to JOBLUX.</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#fff', opacity: 0.4 }}>3 selected</span>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <button style={{ fontSize: '11px', color: '#1D9E75', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Select all</button>
                        <button style={{ fontSize: '11px', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Deselect all</button>
                      </div>
                    </div>
                    <div style={{ background: '#0f0f0f', border: '0.5px solid #2a2a2a', borderRadius: '6px', marginBottom: '20px', maxHeight: '220px', overflowY: 'auto' }}>
                      {[
                        { name: 'Sophie Laurent', sub: 's.laurent@chanel.com · Chanel', checked: true },
                        { name: 'Jean-Marc Dupont', sub: 'jm.dupont@lvmh.com · LVMH', checked: true },
                        { name: 'Alexandra Kim', sub: 'a.kim@kering.com · Kering', checked: false },
                        { name: 'Pierre Moreau', sub: 'p.moreau@hermes.com · Hermès', checked: true },
                        { name: 'Camille Bertrand', sub: 'c.bertrand@cartier.com · Cartier', checked: false },
                      ].map((c, i, arr) => (
                        <div key={i} style={{ ...checkRow, borderBottom: i < arr.length - 1 ? '0.5px solid #1e1e1e' : 'none' }}>
                          <input type="checkbox" defaultChecked={c.checked} style={{ accentColor: '#1D9E75', width: '16px', height: '16px', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', color: '#fff' }}>{c.name}</div>
                            <div style={{ fontSize: '11px', color: '#fff', opacity: 0.4 }}>{c.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid #1e1e1e', paddingTop: '20px' }}>
                      <button style={btnOutline} onClick={() => setGmailStep(1)}>← Back</button>
                      <button style={btnWhite} onClick={() => setGmailStep(3)}>Send 3 invitations →</button>
                    </div>
                  </div>
                </div>
              )}

              {gmailStep === 3 && confirmationScreen(
                '3 invitations sent',
                'Your selected contacts will receive a JOBLUX branded invitation email.',
                [
                  { name: 'Sophie Laurent', sub: 's.laurent@chanel.com' },
                  { name: 'Jean-Marc Dupont', sub: 'jm.dupont@lvmh.com' },
                  { name: 'Pierre Moreau', sub: 'p.moreau@hermes.com' },
                ],
                () => setGmailStep(1)
              )}
            </>
          )}

          {/* ── LINKEDIN FLOW ── */}
          {inviteTab === 'linkedin' && (
            <>
              {linkedinStep === 1 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.06em', marginBottom: '20px' }}>Step 1 of 3 | Connect LinkedIn account</div>
                  <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '36px', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', background: '#0077B5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff', fontWeight: 700, margin: '0 auto 16px' }}>in</div>
                    <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '20px', color: '#fff', margin: '0 0 10px' }}>Import from LinkedIn</h2>
                    <p style={{ fontSize: '13px', color: '#fff', opacity: 0.4, margin: '0 0 24px', lineHeight: 1.7 }}>Connect your LinkedIn account to import your 1st-degree connections. We read names and emails only.</p>
                    <div style={{ background: '#0f0f0f', border: '0.5px solid #1e1e1e', borderRadius: '6px', padding: '14px', marginBottom: '24px', textAlign: 'left' }}>
                      <div style={{ fontSize: '10px', color: '#fff', opacity: 0.35, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>We only access</div>
                      <div style={{ fontSize: '12px', color: '#ccc', lineHeight: 2 }}>✓ Connection names<br />✓ Email addresses (if visible)<br />✓ Company & job title (to help you identify contacts)<br />✗ Messages, activity, or any other data</div>
                    </div>
                    <button style={{ ...btnWhite, background: '#0077B5', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => setLinkedinStep(2)}>
                      <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#0077B5', fontWeight: 700 }}>in</div>
                      Connect LinkedIn account
                    </button>
                  </div>
                </div>
              )}

              {linkedinStep === 2 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#888', letterSpacing: '0.06em', marginBottom: '20px' }}>Step 2 of 3 | Select connections to invite</div>
                  <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '28px' }}>
                    <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '20px', color: '#fff', margin: '0 0 6px' }}>1,247 connections found</h2>
                    <p style={{ fontSize: '13px', color: '#fff', opacity: 0.4, margin: '0 0 16px' }}>Select who you'd like to invite. Luxury industry connections shown first.</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#fff', opacity: 0.4 }}>4 selected</span>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <button style={{ fontSize: '11px', color: '#1D9E75', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Select all</button>
                        <button style={{ fontSize: '11px', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Deselect all</button>
                      </div>
                    </div>
                    <div style={{ background: '#0f0f0f', border: '0.5px solid #2a2a2a', borderRadius: '6px', marginBottom: '20px', maxHeight: '220px', overflowY: 'auto' }}>
                      {[
                        { name: 'Sophie Laurent', sub: 'Head of Retail · Chanel', checked: true },
                        { name: 'Jean-Marc Dupont', sub: 'VP Marketing · LVMH', checked: true },
                        { name: 'Alexandra Kim', sub: 'Brand Director · Kering', checked: false },
                        { name: 'Pierre Moreau', sub: 'Regional Director · Hermès', checked: true },
                        { name: 'Camille Bertrand', sub: 'Retail Manager · Cartier', checked: true },
                      ].map((c, i, arr) => (
                        <div key={i} style={{ ...checkRow, borderBottom: i < arr.length - 1 ? '0.5px solid #1e1e1e' : 'none' }}>
                          <input type="checkbox" defaultChecked={c.checked} style={{ accentColor: '#1D9E75', width: '16px', height: '16px', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', color: '#fff' }}>{c.name}</div>
                            <div style={{ fontSize: '11px', color: '#fff', opacity: 0.4 }}>{c.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid #1e1e1e', paddingTop: '20px' }}>
                      <button style={btnOutline} onClick={() => setLinkedinStep(1)}>← Back</button>
                      <button style={btnWhite} onClick={() => setLinkedinStep(3)}>Send 4 invitations →</button>
                    </div>
                  </div>
                </div>
              )}

              {linkedinStep === 3 && confirmationScreen(
                '4 invitations sent',
                'Your selected connections will receive a JOBLUX branded invitation email.',
                [
                  { name: 'Sophie Laurent', sub: 'Head of Retail · Chanel' },
                  { name: 'Jean-Marc Dupont', sub: 'VP Marketing · LVMH' },
                  { name: 'Pierre Moreau', sub: 'Regional Director · Hermès' },
                  { name: 'Camille Bertrand', sub: 'Retail Manager · Cartier' },
                ],
                () => setLinkedinStep(1)
              )}
            </>
          )}
        </div>

        {/* ── SECTION 3: ACCOUNT ACTIONS ── */}
        <div style={{ ...card, marginBottom: 0 }}>
          <div style={sectionTitle}>Account actions</div>

          {/* Sign out */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', marginBottom: '18px', borderBottom: '0.5px solid #1e1e1e' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#fff', marginBottom: '3px' }}>Sign out</div>
              <div style={{ fontSize: '11px', color: '#fff', opacity: 0.35 }}>Sign out of your JOBLUX account on this device</div>
            </div>
            <button style={btnOutline} onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
          </div>

          {/* Export data | GDPR */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', marginBottom: '18px', borderBottom: '0.5px solid #1e1e1e' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#fff', marginBottom: '3px' }}>Export my data</div>
              <div style={{ fontSize: '11px', color: '#fff', opacity: 0.35 }}>Download a copy of all data JOBLUX holds about you | GDPR Article 20</div>
            </div>
            <button style={btnOutline} onClick={() => setExportRequested(true)}>
              {exportRequested ? 'Request sent ✓' : 'Request export'}
            </button>
          </div>

          {/* Delete account */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#f87171', marginBottom: '3px' }}>Delete account</div>
              <div style={{ fontSize: '11px', color: '#fff', opacity: 0.35 }}>Permanently delete your account and all associated data</div>
            </div>
            {!deleteConfirm ? (
              <button style={{ ...btnOutline, border: '0.5px solid #f87171', color: '#f87171' }} onClick={() => setDeleteConfirm(true)}>Delete account</button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={btnOutline} onClick={() => setDeleteConfirm(false)}>Cancel</button>
                <button style={{ ...btnOutline, border: '0.5px solid #f87171', color: '#f87171' }}>Confirm delete</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
