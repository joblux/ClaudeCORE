import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import StatusControl from './StatusControl'

export const dynamic = 'force-dynamic'

type BusinessBrief = {
  id: string
  company_name: string
  company_website: string | null
  sector: string | null
  company_type: string | null
  geography: string | null
  brief_type: string
  urgency: string
  confidentiality_level: string
  mandate_title: string | null
  brief_summary: string
  seniority_level: string | null
  function: string | null
  location: string | null
  compensation_range: string | null
  additional_context: string | null
  contact_name: string
  contact_email: string
  contact_role: string | null
  preferred_follow_up: string
  best_timing: string | null
  status: string
  created_by: string | null
  created_at: string
}

function fmtDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${date} at ${time}`
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e8e8e8',
  borderRadius: 8,
  padding: 24,
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#999',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 16,
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#999',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: 4,
}

const fieldValueStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#111',
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div style={fieldLabelStyle}>{label}</div>
      <div style={fieldValueStyle}>{value && value.toString().trim() ? value : '—'}</div>
    </div>
  )
}

export default async function AdminBusinessBriefDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/admin')
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: brief } = await supabaseAdmin
    .from('business_briefs')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!brief) {
    notFound()
  }

  const b = brief as BusinessBrief

  return (
    <div style={{ background: '#fafaf5', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>

        <Link
          href="/admin/business-briefs"
          style={{ color: '#444', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 20, fontWeight: 500 }}
        >
          ← Business Briefs
        </Link>

        <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>{b.company_name}</h1>
            <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
              {b.brief_type} · {b.urgency}
            </div>
          </div>
          <StatusControl briefId={b.id} initialStatus={b.status} />
        </div>

        <div style={{ ...cardStyle, marginTop: 16 }}>
          <div style={sectionLabelStyle}>Brief details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="Sector" value={b.sector} />
            <Field label="Company type" value={b.company_type} />
            <Field label="Geography" value={b.geography} />
            <Field label="Confidentiality" value={b.confidentiality_level} />
            <Field label="Seniority level" value={b.seniority_level} />
            <Field label="Function" value={b.function} />
            <Field label="Location" value={b.location} />
            <Field label="Compensation range" value={b.compensation_range} />
          </div>

          {b.mandate_title && (
            <div style={{ marginTop: 20 }}>
              <Field label="Mandate title" value={b.mandate_title} />
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <div style={fieldLabelStyle}>Brief summary</div>
            <div style={{ fontSize: 14, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {b.brief_summary}
            </div>
          </div>

          {b.additional_context && (
            <div style={{ marginTop: 20 }}>
              <div style={fieldLabelStyle}>Additional context</div>
              <div style={{ fontSize: 14, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {b.additional_context}
              </div>
            </div>
          )}
        </div>

        <div style={{ ...cardStyle, marginTop: 16 }}>
          <div style={sectionLabelStyle}>Contact</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="Contact name" value={b.contact_name} />
            <Field label="Contact email" value={b.contact_email} />
            <Field label="Contact role" value={b.contact_role} />
            <Field label="Preferred follow-up" value={b.preferred_follow_up} />
            <Field label="Best timing" value={b.best_timing} />
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#aaa', marginTop: 16 }}>
          Created {fmtDateTime(b.created_at)}{b.created_by ? ` · by ${b.created_by}` : ''}
        </div>

      </div>
    </div>
  )
}
