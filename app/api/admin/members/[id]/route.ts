import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveProfiLux } from '@/lib/profilux/resolveProfiLux'
import { projectFor } from '@/lib/profilux/projectFor'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Handle params safely (works in both Next.js 14 and 15)
  const resolvedParams = await Promise.resolve(params)
  const memberId = resolvedParams.id

  if (!memberId) {
    return NextResponse.json({ error: 'Missing member ID' }, { status: 400 })
  }

  try {
    const view = await resolveProfiLux(memberId, supabaseAdmin)
    if (!view) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const projection = projectFor(view, 'admin')
    if (projection.surface !== 'admin') {
      return NextResponse.json({ error: 'Projection mismatch' }, { status: 500 })
    }

    const [docRes, reviewRes, notesRes] = await Promise.all([
      supabaseAdmin
        .from('member_documents')
        .select('*')
        .eq('member_id', memberId)
        .order('uploaded_at', { ascending: false }),
      supabaseAdmin
        .from('member_ai_reviews')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle(),
      supabaseAdmin
        .from('members')
        .select('notes')
        .eq('id', memberId)
        .maybeSingle(),
    ])

    const work = projection.view.experiences.map((e, i) => ({
      id: `${memberId}-exp-${i}`,
      company: e.company,
      job_title: e.job_title,
      city: e.city,
      country: e.country,
      start_date: e.start_date,
      end_date: e.end_date,
      is_current: e.end_date == null,
      description: e.description,
    }))

    const edu = projection.view.education.map((e, i) => ({
      id: `${memberId}-edu-${i}`,
      institution: e.institution,
      degree: e.degree,
      degree_level: e.degree,
      field_of_study: e.field_of_study,
      start_year: e.start_year,
      graduation_year: e.graduation_year,
      city: e.city,
      country: e.country,
    }))

    const langs = projection.view.languages.map((l, i) => ({
      id: `${memberId}-lang-${i}`,
      language: l.language,
      proficiency: l.proficiency,
    }))

    const fullName = [projection.view.first_name, projection.view.last_name]
      .filter(Boolean)
      .join(' ')

    return NextResponse.json({
      member: {
        ...projection.view,
        full_name: fullName,
        notes: (notesRes.data as { notes: string | null } | null)?.notes ?? null,
        work_experiences: work,
        education_records: edu,
        languages: langs,
        documents: docRes.data ?? [],
      },
      aiReview: reviewRes.data ?? null,
    })
  } catch (err) {
    console.error('GET /api/admin/members/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resolvedParams = await Promise.resolve(params)
  const memberId = resolvedParams.id

  try {
    const body = await req.json()
    const { action } = body

    if (action === 'update_status') {
      const { status: newStatus } = body
      if (!newStatus) {
        return NextResponse.json({ error: 'Missing status' }, { status: 400 })
      }
      const update: Record<string, any> = { status: newStatus }
      if (newStatus === 'approved') update.approved_at = new Date().toISOString()

      const { error } = await supabaseAdmin
        .from('members')
        .update(update)
        .eq('id', memberId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (action === 'save_notes') {
      const { notes } = body
      const { error } = await supabaseAdmin
        .from('members')
        .update({ notes } as any)
        .eq('id', memberId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
