import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'

type BusinessBriefRow = {
  id: string
  company_name: string
  sector: string | null
  brief_type: string
  urgency: string
  confidentiality_level: string
  contact_name: string
  status: string
  created_at: string
  created_by: string | null
}

type MemberLookup = { id: string; full_name: string | null; email: string | null; role: string | null }

const statusBadge: Record<string, { bg: string; text: string }> = {
  new:          { bg: '#e3f2fd', text: '#1565c0' },
  under_review: { bg: '#fff8e1', text: '#f57f17' },
  accepted:     { bg: '#e0f2f1', text: '#00695c' },
  in_progress:  { bg: '#ede7f6', text: '#5e35b1' },
  completed:    { bg: '#e8f5e9', text: '#2e7d32' },
  closed:       { bg: '#f5f5f5', text: '#616161' },
  archived:     { bg: '#eeeeee', text: '#424242' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminBusinessBriefsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/admin')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: briefs } = await supabase
    .from('business_briefs')
    .select('id, company_name, sector, brief_type, urgency, confidentiality_level, contact_name, status, created_at, created_by')
    .order('created_at', { ascending: false })

  const rows: BusinessBriefRow[] = briefs || []

  // Two-query merge: no FK on business_briefs.created_by, embedded join unreliable.
  // Orphan = created_by NULL OR created_by points to a deleted/non-existent member.
  const memberIds = Array.from(new Set(rows.map(r => r.created_by).filter((v): v is string => !!v)))
  const memberMap = new Map<string, MemberLookup>()
  if (memberIds.length > 0) {
    const { data: members } = await supabase
      .from('members')
      .select('id, full_name, email, role')
      .in('id', memberIds)
    for (const m of (members || []) as MemberLookup[]) memberMap.set(m.id, m)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`.jl-brief-link:hover { text-decoration: underline; }`}</style>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Business Briefs</h1>
          <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            {rows.length} {rows.length === 1 ? 'brief' : 'briefs'} submitted
          </p>
        </div>

        {rows.length === 0 ? (
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 40 }}>No business briefs yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #111' }}>
                  {['Company', 'Sector', 'Submitter', 'Brief Type', 'Urgency', 'Confidentiality', 'Status', 'Created'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(b => {
                  const badge = statusBadge[b.status] || statusBadge.under_review
                  const submitter = b.created_by ? memberMap.get(b.created_by) : null

                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                      <td style={{ padding: '12px', color: '#111', fontWeight: 500 }}>
                        <Link href={`/admin/business-briefs/${b.id}`} className="jl-brief-link" style={{ color: '#111', textDecoration: 'none' }}>
                          {b.company_name}
                        </Link>
                      </td>
                      <td style={{ padding: '12px', color: '#111' }}>{b.sector || '—'}</td>
                      <td style={{ padding: '12px' }}>
                        {submitter ? (
                          <div style={{ lineHeight: 1.3 }}>
                            <div style={{ color: '#111', fontSize: 13 }}>{submitter.full_name || submitter.email || '—'}</div>
                            {submitter.role && (
                              <div style={{ color: '#888', fontSize: 11 }}>{submitter.role}</div>
                            )}
                          </div>
                        ) : (
                          <span style={{
                            display: 'inline-block', fontSize: 10, fontWeight: 600,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            padding: '3px 10px', borderRadius: 3,
                            background: '#fafafa', color: '#888', border: '1px solid #eee',
                          }}>
                            Orphan
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', color: '#111' }}>{b.brief_type}</td>
                      <td style={{ padding: '12px', color: '#111' }}>{b.urgency}</td>
                      <td style={{ padding: '12px', color: '#111' }}>{b.confidentiality_level}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-block', fontSize: 10, fontWeight: 600,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          padding: '3px 10px', borderRadius: 3,
                          background: badge.bg, color: badge.text,
                        }}>
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#888', fontSize: 12 }}>{formatDate(b.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
