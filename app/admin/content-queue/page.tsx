import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import ContentQueueActions from './ContentQueueActions'

type QueueItem = {
  id: string
  content_type: string
  title: string | null
  source_type: string | null
  source_name: string | null
  status: string
  created_at: string
}

const statusBadge: Record<string, { bg: string; text: string }> = {
  draft:        { bg: '#f5f5f5', text: '#757575' },
  under_review: { bg: '#e3f2fd', text: '#1565c0' },
  approved:     { bg: '#e8f5e9', text: '#2e7d32' },
  rejected:     { bg: '#fce4ec', text: '#c62828' },
  published:    { bg: '#111', text: '#fff' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminContentQueuePage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/admin')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: items } = await supabase
    .from('content_queue')
    .select('id, content_type, title, source_type, source_name, status, created_at')
    .order('created_at', { ascending: false })

  const rows: QueueItem[] = items || []

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Content Queue</h1>
          <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            {rows.length} {rows.length === 1 ? 'item' : 'items'} in queue
          </p>
        </div>

        {rows.length === 0 ? (
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 40 }}>Queue is empty.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #111' }}>
                  {['Type', 'Title', 'Source', 'Source Name', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(item => {
                  const badge = statusBadge[item.status] || statusBadge.draft
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3, background: '#e8e8e8', color: '#555' }}>
                          {item.content_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#111', fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title || '\u2014'}
                      </td>
                      <td style={{ padding: '12px', color: '#888', fontSize: 12 }}>{item.source_type || '\u2014'}</td>
                      <td style={{ padding: '12px', color: '#888', fontSize: 12 }}>{item.source_name || '\u2014'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-block', fontSize: 10, fontWeight: 600,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          padding: '3px 10px', borderRadius: 3,
                          background: badge.bg, color: badge.text,
                        }}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#888', fontSize: 12 }}>{formatDate(item.created_at)}</td>
                      <td style={{ padding: '12px' }}>
                        <ContentQueueActions id={item.id} status={item.status} />
                      </td>
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
