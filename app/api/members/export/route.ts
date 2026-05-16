import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// GET /api/members/export — RGPD machine-readable export (B.3.4)
//
// Single self-service JSON archive of all personal-data tables tied to the
// signed-in member. Distinct from §19A rendered ProfiLux PDF — this surface
// is data portability, not presentation.
//
// Scope (14 tables): see MATRIX §19B.
// Redactions:
//   members.notes                              — operational/admin field, excluded
//   share_links.password_hash / password_salt  — removed; has_password boolean added
//   nextauth_accounts.{access,refresh,id}_token, session_state — nulled
//   brand_contributions.admin_notes            — removed
// Soft-deleted accounts return 410 (data is gone for export purposes).
// Auth via session.user.email; the member row itself drives id resolution.
// =============================================================================

const TABLE_NAMES = {
  members: 'members',
  work_experiences: 'work_experiences',
  education_records: 'education_records',
  member_languages: 'member_languages',
  member_sectors: 'member_sectors',
  member_documents: 'member_documents',
  cv_parse_history: 'cv_parse_history',
  share_links: 'share_links',
  share_views: 'share_views',
  nextauth_accounts: 'nextauth_accounts',
  applications: 'applications',
  contributions: 'contributions',
  contact_messages: 'contact_messages',
  brand_contributions: 'brand_contributions',
} as const

function redactShareLink(row: Record<string, any>) {
  const { password_hash, password_salt, ...rest } = row
  return { ...rest, has_password: !!password_hash }
}

function redactNextauthAccount(row: Record<string, any>) {
  return {
    ...row,
    access_token: null,
    refresh_token: null,
    id_token: null,
    session_state: null,
  }
}

function redactBrandContribution(row: Record<string, any>) {
  const { admin_notes, ...rest } = row
  return rest
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: memberRow } = await supabaseAdmin
      .from(TABLE_NAMES.members)
      .select('*')
      .eq('email', session.user.email)
      .is('deleted_at', null)
      .maybeSingle()

    if (!memberRow) {
      return NextResponse.json(
        { error: 'Account not available for export' },
        { status: 410 }
      )
    }

    // Exclude operational/admin field from the member payload itself.
    const { notes: _notes, ...memberPublic } = memberRow as Record<string, any>
    void _notes
    const memberId: string = memberRow.id
    const memberEmail: string = memberRow.email

    // Sibling rows by member_id.
    const [
      workExperiences,
      educationRecords,
      memberLanguages,
      memberSectors,
      memberDocuments,
      cvParseHistory,
      shareLinks,
      nextauthAccounts,
      applications,
      contributions,
      contactMessages,
      brandContributions,
    ] = await Promise.all([
      supabaseAdmin.from(TABLE_NAMES.work_experiences).select('*').eq('member_id', memberId),
      supabaseAdmin.from(TABLE_NAMES.education_records).select('*').eq('member_id', memberId),
      supabaseAdmin.from(TABLE_NAMES.member_languages).select('*').eq('member_id', memberId),
      supabaseAdmin.from(TABLE_NAMES.member_sectors).select('*').eq('member_id', memberId),
      supabaseAdmin.from(TABLE_NAMES.member_documents).select('*').eq('member_id', memberId),
      supabaseAdmin.from(TABLE_NAMES.cv_parse_history).select('*').eq('member_id', memberId),
      supabaseAdmin.from(TABLE_NAMES.share_links).select('*').eq('member_id', memberId),
      supabaseAdmin.from(TABLE_NAMES.nextauth_accounts).select('*').eq('member_id', memberId),
      supabaseAdmin.from(TABLE_NAMES.applications).select('*').eq('member_id', memberId),
      supabaseAdmin.from(TABLE_NAMES.contributions).select('*').eq('member_id', memberId),
      supabaseAdmin.from(TABLE_NAMES.contact_messages).select('*').eq('member_id', memberId),
      supabaseAdmin.from(TABLE_NAMES.brand_contributions).select('*').eq('user_id', memberId),
    ])

    // share_views is keyed by share_link_id, not member_id.
    const shareLinkIds = (shareLinks.data ?? []).map((l: any) => l.id).filter(Boolean)
    let shareViewsRows: any[] = []
    if (shareLinkIds.length > 0) {
      const { data } = await supabaseAdmin
        .from(TABLE_NAMES.share_views)
        .select('*')
        .in('share_link_id', shareLinkIds)
      shareViewsRows = data ?? []
    }

    const exportedAt = new Date().toISOString()
    const today = exportedAt.slice(0, 10)

    const payload = {
      export_metadata: {
        member_id: memberId,
        exported_at: exportedAt,
        format_version: '1.0',
        scope_note:
          'Machine-readable export of personal data tied to this account. See MATRIX §19B for table scope, redactions, and the §19A rendered-ProfiLux export distinction.',
      },
      members: memberPublic,
      work_experiences: workExperiences.data ?? [],
      education_records: educationRecords.data ?? [],
      member_languages: memberLanguages.data ?? [],
      member_sectors: memberSectors.data ?? [],
      member_documents: memberDocuments.data ?? [],
      cv_parse_history: cvParseHistory.data ?? [],
      share_links: (shareLinks.data ?? []).map(redactShareLink),
      share_views: shareViewsRows,
      nextauth_accounts: (nextauthAccounts.data ?? []).map(redactNextauthAccount),
      applications: applications.data ?? [],
      contributions: contributions.data ?? [],
      contact_messages: contactMessages.data ?? [],
      brand_contributions: (brandContributions.data ?? []).map(redactBrandContribution),
    }

    // Operational audit: console-only per §19B (no audit table in v1).
    console.log('[members/export]', {
      member_id: memberId,
      email: memberEmail,
      exported_at: exportedAt,
    })

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="joblux-data-export-${memberId}-${today}.json"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[members/export] failed:', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
