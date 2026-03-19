import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * PUT /api/members/work-experience/[id]
 * Update a specific work experience. Verifies ownership.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('work_experiences')
      .select('id, member_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Work experience not found' }, { status: 404 })
    }

    if (existing.member_id !== session.user.memberId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { job_title, company, start_date, end_date, is_current, description, location, department, brand } = body

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (job_title !== undefined) updateData.job_title = job_title?.trim() || null
    if (company !== undefined) updateData.company = company?.trim() || null
    if (start_date !== undefined) updateData.start_date = start_date
    if (is_current !== undefined) {
      updateData.is_current = is_current
      if (is_current) updateData.end_date = null
    }
    if (end_date !== undefined && !updateData.is_current) updateData.end_date = end_date || null
    if (description !== undefined) updateData.description = description?.trim() || null
    if (location !== undefined) updateData.location = location?.trim() || null
    if (department !== undefined) updateData.department = department?.trim() || null
    if (brand !== undefined) updateData.brand = brand?.trim() || null

    const { data, error } = await supabase
      .from('work_experiences')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update work experience error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ work_experience: data })
  } catch (err) {
    console.error('PUT /api/members/work-experience/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/members/work-experience/[id]
 * Delete a specific work experience. Verifies ownership.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('work_experiences')
      .select('id, member_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Work experience not found' }, { status: 404 })
    }

    if (existing.member_id !== session.user.memberId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('work_experiences')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete work experience error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/members/work-experience/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
