import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/admin/members/[id]/profile
 * Admin only. Returns the full profile of any member by their ID,
 * including all related records (work experiences, education, languages, documents).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    // Must be authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Must be admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 })
    }

    // Fetch member by ID
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Fetch all related records in parallel
    const [workExp, education, languages, documents] = await Promise.all([
      supabase
        .from('work_experiences')
        .select('*')
        .eq('member_id', id)
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false }),
      supabase
        .from('education_records')
        .select('*')
        .eq('member_id', id)
        .order('graduation_year', { ascending: false, nullsFirst: false }),
      supabase
        .from('member_languages')
        .select('*')
        .eq('member_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('member_documents')
        .select('*')
        .eq('member_id', id)
        .order('uploaded_at', { ascending: false }),
    ])

    return NextResponse.json({
      member,
      work_experiences: workExp.data ?? [],
      education_records: education.data ?? [],
      languages: languages.data ?? [],
      documents: documents.data ?? [],
    })
  } catch (err) {
    console.error('GET /api/admin/members/[id]/profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
