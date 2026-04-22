import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: brief, error: briefError } = await supabaseAdmin
    .from('business_briefs')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (briefError || !brief) {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }

  const normalizedConfidentiality = (brief.confidentiality_level ?? '').toLowerCase()
  const isConfidential = normalizedConfidentiality !== 'standard'

  const title = brief.mandate_title?.trim()
    || `${brief.brief_type} — ${brief.company_name}`

  const maison = isConfidential ? 'Confidential Maison' : brief.company_name

  const slug = generateSlug(title)

  const assignmentData = {
    title,
    slug,
    maison,
    is_confidential: isConfidential,
    description: brief.brief_summary ?? '',
    location: '',
    contract_type: 'permanent',
    seniority: 'mid-level',
    source: 'Brief',
    source_brief_id: brief.id,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('search_assignments')
    .insert(assignmentData)
    .select('id')
    .maybeSingle()

  if (insertError?.code === '23505') {
    assignmentData.slug = `${slug}-${Date.now()}`
    const { data: retry, error: retryError } = await supabaseAdmin
      .from('search_assignments')
      .insert(assignmentData)
      .select('id')
      .maybeSingle()

    if (retryError || !retry) {
      return NextResponse.json({ error: retryError?.message || 'Insert failed' }, { status: 500 })
    }
    return NextResponse.json({ assignment_id: retry.id })
  }

  if (insertError || !inserted) {
    return NextResponse.json({ error: insertError?.message || 'Insert failed' }, { status: 500 })
  }

  return NextResponse.json({ assignment_id: inserted.id })
}
