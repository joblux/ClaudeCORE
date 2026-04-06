import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

type BusinessBrief = {
  id: string
  company_name: string
  brief_type: string
  urgency: string
  confidentiality_level: string
  contact_email: string
  status: string
  created_at: string
}

const statusBadge: Record<string, { bg: string; text: string }> = {
  new:          { bg: '#e3f2fd', text: '#1565c0' },
  under_review: { bg: '#fff8e1', text: '#f57f17' },
  closed:       { bg: '#f5f5f5', text: '#757575' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014'
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
    .select('id, company_name, brief_type, urgency, confidentiality_level, contact_email, status, created_at')
    .order('created_at', { ascending: false })

  const rows: BusinessBrief[] = briefs || []

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 24px' }}>

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
                  {['Company', 'Brief Type', 'Urgency', 'Confidentiality', 'Contact Email', 'Status', 'Created'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(b => {
                  const badge = statusBadge[b.status] || statusBadge.new
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                      <td style={{ padding: '12px', color: '#111', fontWeight: 500 }}>{b.company_name}</td>
                      <td style={{ padding: '12px', color: '#111' }}>{b.brief_type}</td>
                      <td style={{ padding: '12px', color: '#111' }}>{b.urgency}</td>
                      <td style={{ padding: '12px', color: '#111' }}>{b.confidentiality_level}</td>
                      <td style={{ padding: '12px', color: '#111', fontSize: 12 }}>{b.contact_email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-block', fontSize: 10, fontWeight: 600,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          padding: '3px 10px', borderRadius: 3,
                          background: badge.bg, color: badge.text,
                        }}>
                          {b.status.replace('_', ' ')}
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
