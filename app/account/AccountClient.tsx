'use client'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AccountClient({ member }: { member: any }) {
  const { data: session } = useSession()
  const [exportRequested, setExportRequested] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const initials = member?.first_name && member?.last_name
    ? `${member.first_name[0]}${member.last_name[0]}`.toUpperCase()
    : session?.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??'

  const tierLabel: Record<string, string> = {
    rising: 'Emerging Professional',
    pro: 'Established Professional',
    executive: 'Senior & Executive',
    insider: 'Trusted Contributor',
    business: 'Company',
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
          <p style={{ fontSize: '13px', color: '#fff', opacity: 0.4, margin: 0 }}>Manage your account settings</p>
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

        {/* ── SECTION 2: ACCOUNT ACTIONS ── */}
        <div style={{ ...card, marginBottom: 0 }}>
          <div style={sectionTitle}>Account actions</div>

          {/* Sign out */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', marginBottom: '18px', borderBottom: '0.5px solid #1e1e1e' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#fff', marginBottom: '3px' }}>Sign out</div>
              <div style={{ fontSize: '11px', color: '#fff', opacity: 0.35 }}>Sign out of your account on this device</div>
            </div>
            <button style={btnOutline} onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
          </div>

          {/* Export data | GDPR */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', marginBottom: '18px', borderBottom: '0.5px solid #1e1e1e' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#fff', marginBottom: '3px' }}>Export my data</div>
              <div style={{ fontSize: '11px', color: '#fff', opacity: 0.35 }}>Download a copy of all your data | GDPR Article 20</div>
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
