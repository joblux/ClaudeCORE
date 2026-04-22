import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import BriefsTable, { BriefsTableRow } from './BriefsTable'

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

  const tableRows: BriefsTableRow[] = rows.map(r => ({
    id: r.id,
    company_name: r.company_name,
    sector: r.sector,
    brief_type: r.brief_type,
    urgency: r.urgency,
    confidentiality_level: r.confidentiality_level,
    status: r.status,
    created_at: r.created_at,
    submitter: r.created_by ? (memberMap.get(r.created_by) ?? null) : null,
  }))

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Business Briefs</h1>
          <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            {tableRows.length} {tableRows.length === 1 ? 'brief' : 'briefs'} submitted
          </p>
        </div>

        <BriefsTable rows={tableRows} />

      </div>
    </div>
  )
}
