import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveProfiLux } from '@/lib/profilux/resolveProfiLux'
import { projectFor } from '@/lib/profilux/projectFor'
import type { AdminMemberDetail } from '@/lib/profilux'

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

    // F-2 Option γ — non-ProfiLux member metadata via second targeted SELECT.
    // Mirrors /api/members/me R6-A pattern. Stays OFF ProfiLuxResolved.
    const [docRes, reviewRes, notesRes, metaRes] = await Promise.all([
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
      supabaseAdmin
        .from('members')
        .select('company_name, org_type')
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

    const meta = metaRes.data as { company_name: string | null; org_type: string | null } | null

    const member: AdminMemberDetail = {
      ...projection.view,
      full_name: fullName,
      notes: (notesRes.data as { notes: string | null } | null)?.notes ?? null,
      company_name: meta?.company_name ?? null,
      org_type: meta?.org_type ?? null,
      work_experiences: work,
      education_records: edu,
      languages: langs,
      documents: (docRes.data ?? []) as AdminMemberDetail['documents'],
    }

    let clientSubmissions: any[] = []
    if (view.role === 'business') {
      try {
        const { data: csRows, error: csErr } = await supabaseAdmin
          .from('client_submissions')
          .select(
            'id, token, application_id, client_business_name, client_recipient_name, client_recipient_role, created_at, expires_at, revoked_at'
          )
          .eq('business_member_id', memberId)
          .order('created_at', { ascending: false })

        if (csErr) {
          console.error('[admin/members GET] client_submissions read error:', csErr)
        } else {
          const rows = csRows ?? []
          const appIds = Array.from(
            new Set(rows.map((r: any) => r.application_id).filter(Boolean))
          )

          let appMap = new Map<string, { id: string; member_id: string | null; search_assignment_id: string | null }>()
          let candMap = new Map<string, { first_name: string | null; last_name: string | null }>()
          let asgnMap = new Map<string, { title: string | null }>()

          if (appIds.length > 0) {
            const { data: appRows, error: appErr } = await supabaseAdmin
              .from('applications')
              .select('id, member_id, search_assignment_id')
              .in('id', appIds)
            if (appErr) {
              console.error('[admin/members GET] applications fetch error:', appErr)
            } else {
              for (const a of appRows ?? []) {
                appMap.set(a.id, a as any)
              }
            }

            const candIds = Array.from(
              new Set(
                Array.from(appMap.values())
                  .map(a => a.member_id)
                  .filter((v): v is string => !!v)
              )
            )
            if (candIds.length > 0) {
              const { data: candRows, error: candErr } = await supabaseAdmin
                .from('members')
                .select('id, first_name, last_name')
                .in('id', candIds)
              if (candErr) {
                console.error('[admin/members GET] candidates fetch error:', candErr)
              } else {
                for (const c of candRows ?? []) {
                  candMap.set(c.id, { first_name: c.first_name, last_name: c.last_name })
                }
              }
            }

            const asgnIds = Array.from(
              new Set(
                Array.from(appMap.values())
                  .map(a => a.search_assignment_id)
                  .filter((v): v is string => !!v)
              )
            )
            if (asgnIds.length > 0) {
              const { data: asgnRows, error: asgnErr } = await supabaseAdmin
                .from('search_assignments')
                .select('id, title')
                .in('id', asgnIds)
              if (asgnErr) {
                console.error('[admin/members GET] assignments fetch error:', asgnErr)
              } else {
                for (const s of asgnRows ?? []) {
                  asgnMap.set(s.id, { title: s.title })
                }
              }
            }
          }

          const nowMs = Date.now()
          clientSubmissions = rows.map((r: any) => {
            const status =
              r.revoked_at
                ? 'revoked'
                : r.expires_at && new Date(r.expires_at).getTime() < nowMs
                  ? 'expired'
                  : 'active'
            const app = r.application_id ? appMap.get(r.application_id) : null
            const cand = app?.member_id ? candMap.get(app.member_id) : null
            const asgn = app?.search_assignment_id ? asgnMap.get(app.search_assignment_id) : null
            const candidateName = cand
              ? [cand.first_name, cand.last_name].filter(Boolean).join(' ') || null
              : null
            return {
              id: r.id,
              token: r.token,
              client_business_name: r.client_business_name,
              recipient_name: r.client_recipient_name,
              recipient_role: r.client_recipient_role,
              created_at: r.created_at,
              expires_at: r.expires_at,
              revoked_at: r.revoked_at,
              status,
              candidate_name: candidateName,
              application_id: r.application_id ?? null,
              assignment_title: asgn?.title ?? null,
            }
          })
        }
      } catch (e) {
        console.error('[admin/members GET] client_submissions block threw:', e)
        clientSubmissions = []
      }
    }

    return NextResponse.json({
      member,
      aiReview: reviewRes.data ?? null,
      ...(view.role === 'business' ? { client_submissions: clientSubmissions } : {}),
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
