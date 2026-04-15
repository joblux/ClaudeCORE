'use client'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function AccountClient({ member }: { member: any }) {
  const { data: session } = useSession()
  const [exportRequested, setExportRequested] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const initials = member?.first_name && member?.last_name
    ? `${member.first_name[0]}${member.last_name[0]}`.toUpperCase()
    : session?.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??'

  const fullName = member?.first_name && member?.last_name
    ? `${member.first_name} ${member.last_name}`
    : session?.user?.name || '—'

  const card: React.CSSProperties = {
    background: '#1a1a1a',
    border: '1px solid #1c1c1c',
    borderRadius: 5,
    padding: 20,
    marginBottom: 14,
  }

  const acT: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: '1.5px',
    color: '#555',
    textTransform: 'uppercase',
  }

  const acTh: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  }

  const acEdit: React.CSSProperties = {
    fontSize: 10,
    color: '#a58e28',
    textDecoration: 'none',
    fontWeight: 400,
  }

  const acRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '9px 0',
    borderBottom: '1px solid #1c1c1c',
  }

  const acL: React.CSSProperties = { fontSize: 11, color: '#999' }
  const acV: React.CSSProperties = { fontSize: 11, color: '#fff' }

  const acAct: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #1c1c1c',
  }

  const acBtn: React.CSSProperties = {
    padding: '7px 14px',
    fontSize: 10,
    fontWeight: 500,
    background: 'transparent',
    border: '1px solid #2a2a2a',
    color: '#999',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  }

  const acBtnDng: React.CSSProperties = {
    ...acBtn,
    color: '#e24b4a',
    borderColor: 'rgba(226,75,74,0.3)',
  }

  const companyRows: { label: string; value: string }[] = [
    { label: 'Company', value: member?.company_name || '—' },
    { label: 'Organisation type', value: member?.org_type || '—' },
    { label: 'Sector', value: member?.sector || '—' },
    { label: 'Country', value: member?.country || '—' },
    { label: 'City', value: member?.city || '—' },
    { label: 'Phone', value: member?.phone || '—' },
  ]

  const isApproved = member?.status === 'approved'

  return (
    <div style={{ background: '#0f0f0f', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 40px 80px' }}>

        {/* Page title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: 22, color: '#fff', margin: '0 0 3px' }}>Settings</h1>
          <p style={{ fontSize: 11, color: '#777', margin: 0 }}>This is the space to manage your account details.</p>
        </div>

        {/* Card 1 — Account holder */}
        <div style={card}>
          <div style={acTh}>
            <span style={acT}>Account holder</span>
            <a href="#" style={acEdit}>Edit →</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#4da6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, fontWeight: 500, color: '#fff' }}>{fullName}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{member?.role === 'business' ? 'Company account' : (member?.job_title || member?.role || '—')}</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{member?.email || session?.user?.email || '—'}</div>
            </div>
          </div>
        </div>

        {/* Card 2 — Company information */}
        <div style={card}>
          <div style={acTh}>
            <span style={acT}>Company information</span>
            <a href="#" style={acEdit}>Edit →</a>
          </div>
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
        </div>

        {/* Card 3 — Account actions */}
        <div style={{ ...card, marginBottom: 0 }}>
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

      </div>
    </div>
  )
}
