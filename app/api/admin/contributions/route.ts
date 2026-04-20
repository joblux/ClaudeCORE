import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/ses'
import { contributionApprovedEmail, contributionRejectedEmail } from '@/lib/email-templates'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)
}

// ── GET: fetch contributions by type ────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'voices'
  const status = searchParams.get('status') || 'all'

  // ── Pending counts for tab badges ─────────────────────────────────────────
  if (type === 'counts') {
    const [voicesLegacy, voicesCanonical, salary, interviews, brand] = await Promise.all([
      supabase.from('bloglux_articles').select('id', { count: 'exact', head: true }).eq('category', 'Insider Voice').in('status', ['draft', 'submitted', 'review']).is('deleted_at', null),
      supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('contribution_type', 'insider_voice').eq('status', 'pending').is('deleted_at', null),
      supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('contribution_type', 'salary_data').eq('status', 'pending').is('deleted_at', null),
      supabase.from('contributions').select('id', { count: 'exact', head: true }).eq('contribution_type', 'interview_experience').eq('status', 'pending').is('deleted_at', null),
      supabase.from('brand_contributions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    return NextResponse.json({
      counts: {
        voices: (voicesLegacy.count || 0) + (voicesCanonical.count || 0),
        salary: salary.count || 0,
        interviews: interviews.count || 0,
        brand: brand.count || 0,
      }
    })
  }

  // ── Insider Voices ────────────────────────────────────────────────────────
  if (type === 'voices') {
    // Legacy: bloglux_articles with category='Insider Voice'
    let legacyQuery = supabase
      .from('bloglux_articles')
      .select('id, slug, title, excerpt, body, author_name, author_role, cover_image_url, external_link, status, created_at, content_origin')
      .eq('category', 'Insider Voice')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (status !== 'all') legacyQuery = legacyQuery.eq('status', status)

    const { data: legacyRows, error: legacyError } = await legacyQuery
    if (legacyError) return NextResponse.json({ error: legacyError.message }, { status: 500 })

    // Canonical: contributions + insider_voices (no member join — UI reads neither)
    const { data: canonicalRows, error: canonicalError } = await supabase
      .from('contributions')
      .select('id, status, created_at, insider_voices(title, excerpt, body, author_name, author_role, cover_image_url, external_link)')
      .eq('contribution_type', 'insider_voice')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (canonicalError) return NextResponse.json({ error: canonicalError.message }, { status: 500 })

    const legacy = (legacyRows || []).map((r: any) => ({ ...r, source: 'legacy' as const }))

    const canonical = (canonicalRows || [])
      .map((c: any) => {
        const iv = Array.isArray(c.insider_voices) ? c.insider_voices[0] : c.insider_voices
        const normalizedStatus = c.status === 'pending' ? 'submitted' : c.status
        return {
          id: c.id,
          slug: null,
          title: iv?.title || '(Untitled)',
          excerpt: iv?.excerpt || null,
          body: iv?.body || null,
          author_name: iv?.author_name || null,
          author_role: iv?.author_role || null,
          cover_image_url: iv?.cover_image_url || null,
          external_link: iv?.external_link || null,
          status: normalizedStatus,
          created_at: c.created_at,
          content_origin: 'contributed',
          source: 'contribution' as const,
        }
      })
      .filter((r: any) => status === 'all' || r.status === status)

    const items = [...legacy, ...canonical].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ items })
  }

  // ── Salary ────────────────────────────────────────────────────────────────
  if (type === 'salary') {
    let query = supabase
      .from('contributions')
      .select('id, member_id, brand_name, brand_slug, status, created_at, points_awarded')
      .eq('contribution_type', 'salary_data')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (status !== 'all') query = query.eq('status', status)

    const { data: contribs, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Join salary_contributions details
    const enriched = await Promise.all((contribs || []).map(async c => {
      const { data: sal } = await supabase
        .from('salary_contributions')
        .select('*')
        .eq('contribution_id', c.id)
        .maybeSingle()
      return { ...c, salary: sal }
    }))

    return NextResponse.json({ items: enriched })
  }

  // ── Interviews ────────────────────────────────────────────────────────────
  if (type === 'interviews') {
    let query = supabase
      .from('contributions')
      .select('id, member_id, brand_name, brand_slug, status, created_at, points_awarded')
      .eq('contribution_type', 'interview_experience')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (status !== 'all') query = query.eq('status', status)

    const { data: contribs, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Join interview_experiences details
    const enriched = await Promise.all((contribs || []).map(async c => {
      const { data: iv } = await supabase
        .from('interview_experiences')
        .select('*')
        .eq('contribution_id', c.id)
        .is('deleted_at', null)
        .maybeSingle()
      return { ...c, interview: iv }
    }))

    return NextResponse.json({ items: enriched })
  }

  // ── Brand corrections ─────────────────────────────────────────────────────
  if (type === 'brand') {
    let query = supabase
      .from('brand_contributions')
      .select('*')
      .order('created_at', { ascending: false })

    if (status !== 'all') query = query.eq('status', status)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data || [] })
  }

  return NextResponse.json({ items: [] })
}

// ── POST: approve or reject ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action, type, id, note, source } = await req.json()
  const adminId = (session.user as any)?.memberId
  const now = new Date().toISOString()

  // ── Insider Voices ────────────────────────────────────────────────────────
  if (type === 'voices') {
    // Backward-compat: missing source means legacy (current UI behavior)
    const voiceSource = source || 'legacy'

    // ── LEGACY (bloglux_articles) — existing logic, unchanged ─────────────
    if (voiceSource === 'legacy') {
      if (action === 'delete') {
        const { error } = await supabase
          .from('bloglux_articles')
          .update({ deleted_at: now, deleted_by: adminId || null })
          .eq('id', id)
          .is('deleted_at', null)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ ok: true, deleted: true })
      }
      if (action === 'approve') {
        const { error } = await supabase
          .from('bloglux_articles')
          .update({ status: 'published', published_at: now, reviewed_by: adminId, reviewed_at: now })
          .eq('id', id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      } else if (action === 'revision') {
        const { error } = await supabase
          .from('bloglux_articles')
          .update({ status: 'revision_requested', revision_note: note || null, reviewed_by: adminId, reviewed_at: now })
          .eq('id', id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      } else {
        const { error } = await supabase
          .from('bloglux_articles')
          .update({ status: 'rejected', reviewed_by: adminId, reviewed_at: now, admin_notes: note || null })
          .eq('id', id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    // ── CANONICAL (contributions + insider_voices) ────────────────────────
    if (voiceSource === 'contribution') {
      // Belt-and-braces: block revision server-side (UI also hides the button)
      if (action === 'revision') {
        return NextResponse.json({ error: 'Revision not supported for canonical-path insider voices' }, { status: 400 })
      }

      if (action === 'delete') {
        // Soft-delete parent only; insider_voices detail stays (CASCADE only fires on hard delete)
        const { error } = await supabase
          .from('contributions')
          .update({ deleted_at: now, deleted_by: adminId || null })
          .eq('id', id)
          .eq('contribution_type', 'insider_voice')
          .is('deleted_at', null)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ ok: true, deleted: true })
      }

      if (action === 'reject') {
        const { data: rejected, error } = await supabase
          .from('contributions')
          .update({ status: 'rejected', reviewed_by: adminId, reviewed_at: now, rejection_reason: note || null })
          .eq('id', id)
          .eq('contribution_type', 'insider_voice')
          .select('member_id')
          .maybeSingle()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        if (rejected?.member_id) {
          const { data: memberData } = await supabase
            .from('members')
            .select('email, first_name')
            .eq('id', rejected.member_id)
            .maybeSingle()

          if (memberData?.email) {
            const { html, text } = contributionRejectedEmail({
              firstName: memberData.first_name,
              contributionType: 'insider_voice',
              reason: note || undefined,
            })
            sendEmail({
              to: memberData.email,
              subject: 'Update on your contribution',
              body: text,
              bodyHtml: html,
            }).catch(() => {})
          }
        }

        return NextResponse.json({ ok: true })
      }

      if (action === 'approve') {
        // 1. Flip contributions.status to 'approved'
        const { data: updated, error: updateError } = await supabase
          .from('contributions')
          .update({ status: 'approved', reviewed_by: adminId, reviewed_at: now })
          .eq('id', id)
          .eq('contribution_type', 'insider_voice')
          .select('member_id, created_at')
          .maybeSingle()

        if (updateError || !updated) {
          return NextResponse.json({ error: updateError?.message || 'Contribution not found' }, { status: 500 })
        }

        // 2. Fetch the insider_voices detail row
        const { data: iv, error: ivError } = await supabase
          .from('insider_voices')
          .select('title, excerpt, body, author_name, author_role, cover_image_url, external_link')
          .eq('contribution_id', id)
          .maybeSingle()

        if (ivError || !iv) {
          await supabase.from('contributions').update({ status: 'pending', reviewed_by: null, reviewed_at: null }).eq('id', id)
          return NextResponse.json({ error: ivError?.message || 'Insider voice detail not found' }, { status: 500 })
        }

        // 3. Materialize bloglux_articles row (slug pattern mirrors legacy submit-voice)
        //    B2c will handle contributor-side slug resolution (my-voices lookup).
        const slug = `${slugify(iv.title)}-${Date.now().toString(36)}`
        const wordCount = (iv.body || '').split(/\s+/).filter(Boolean).length
        const readTime = Math.max(1, Math.ceil(wordCount / 200))

        const { error: insertError } = await supabase
          .from('bloglux_articles')
          .insert({
            slug,
            title: iv.title,
            excerpt: iv.excerpt,
            body: iv.body,
            category: 'Insider Voice',
            author_id: updated.member_id,
            author_name: iv.author_name || null,
            author_role: iv.author_role || null,
            cover_image_url: iv.cover_image_url || null,
            external_link: iv.external_link || null,
            status: 'published',
            content_origin: 'contributed',
            submitted_at: updated.created_at,
            published_at: now,
            reviewed_by: adminId,
            reviewed_at: now,
            read_time_minutes: readTime,
            meta_title: iv.title,
            meta_description: iv.excerpt,
            created_at: now,
            updated_at: now,
          })

        if (insertError) {
          await supabase.from('contributions').update({ status: 'pending', reviewed_by: null, reviewed_at: null }).eq('id', id)
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        // 4. Send approval email to contributor
        const { data: memberData } = await supabase
          .from('members')
          .select('email, first_name')
          .eq('id', updated.member_id)
          .maybeSingle()

        if (memberData?.email) {
          const { html, text } = contributionApprovedEmail({
            firstName: memberData.first_name,
            contributionType: 'insider_voice',
          })
          sendEmail({
            to: memberData.email,
            subject: 'Your contribution is now live',
            body: text,
            bodyHtml: html,
          }).catch(() => {})
        }

        return NextResponse.json({ ok: true })
      }

      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unknown source' }, { status: 400 })
  }

  // ── Salary ────────────────────────────────────────────────────────────────
  if (type === 'salary') {
    if (action === 'delete') {
      // Soft-delete parent contribution only (salary_benchmarks/salary_contributions are promoted copies)
      const { error } = await supabase
        .from('contributions')
        .update({ deleted_at: now, deleted_by: adminId || null })
        .eq('id', id)
        .is('deleted_at', null)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, deleted: true })
    }
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const { error } = await supabase
      .from('contributions')
      .update({ status: newStatus, reviewed_by: adminId, reviewed_at: now, rejection_reason: action === 'reject' ? (note || null) : null })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If approved, promote to salary_benchmarks (best-effort — do not roll back approval on failure)
    if (action === 'approve') {
      const { data: contrib } = await supabase.from('contributions').select('*').eq('id', id).maybeSingle()
      const { data: sal } = await supabase.from('salary_contributions').select('*').eq('contribution_id', id).maybeSingle()
      if (contrib && sal) {
        const { error: benchErr } = await supabase.from('salary_benchmarks').insert({
          contribution_id: id,
          brand_name: contrib.brand_name,
          brand_slug: contrib.brand_slug,
          job_title: sal.job_title,
          department: sal.department,
          seniority: sal.seniority,
          city: sal.city,
          country: sal.country,
          currency: sal.salary_currency || 'EUR',
          salary_min: sal.base_salary,
          salary_max: sal.base_salary,
          salary_median: sal.base_salary,
          bonus_min: sal.bonus_amount || null,
          bonus_max: sal.bonus_amount || null,
          total_comp_min: sal.total_comp || null,
          total_comp_max: sal.total_comp || null,
          year_of_data: sal.year_of_data || null,
          source: 'Member Contribution',
          content_origin: 'contributed',
          is_published: true,
          created_at: now,
        })
        if (benchErr) console.error('salary_benchmarks promotion failed:', benchErr.message)
      }
    }

    // If rejecting a previously-approved contribution, remove the promoted benchmark row
    if (action === 'reject') {
      const { error: delErr } = await supabase
        .from('salary_benchmarks')
        .delete()
        .eq('contribution_id', id)
      if (delErr) console.error('salary_benchmarks rollback failed:', delErr.message)
    }

    return NextResponse.json({ ok: true })
  }

  // ── Interviews ────────────────────────────────────────────────────────────
  if (type === 'interviews') {
    if (action === 'delete') {
      // Soft-delete both parent contribution and child interview_experiences together
      const { error: e1 } = await supabase
        .from('interview_experiences')
        .update({ deleted_at: now, deleted_by: adminId || null })
        .eq('contribution_id', id)
        .is('deleted_at', null)
      if (e1) console.error('soft-delete interview_experiences failed:', e1.message)
      const { error: e2 } = await supabase
        .from('contributions')
        .update({ deleted_at: now, deleted_by: adminId || null })
        .eq('id', id)
        .is('deleted_at', null)
      if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })
      return NextResponse.json({ ok: true, deleted: true })
    }
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const { error } = await supabase
      .from('contributions')
      .update({ status: newStatus, reviewed_by: adminId, reviewed_at: now, rejection_reason: action === 'reject' ? (note || null) : null })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // ── Brand corrections ─────────────────────────────────────────────────────
  if (type === 'brand') {
    if (action === 'delete') {
      const { error } = await supabase.from('brand_contributions').delete().eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, deleted: true })
    }
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const { error } = await supabase
      .from('brand_contributions')
      .update({ status: newStatus, reviewed_by: adminId, reviewed_at: now, admin_notes: note || null })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}
