import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import ContentQueueTable from './ContentQueueTable'

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
    .select('id, content_type, title, source_type, source_name, source_url, status, created_at, processed_content, duplicate_state, duplicate_match')
    .order('created_at', { ascending: false })

  const rows = items || []

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
          <ContentQueueTable rows={rows} />
        )}
      </div>
    </div>
  )
}
