import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * PUT /api/members/education/[id]
 * Update a specific education record. Verifies ownership.
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
      .from('education_records')
      .select('id, member_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Education record not found' }, { status: 404 })
    }

    if (existing.member_id !== session.user.memberId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { institution, degree_level, field_of_study, graduation_year, description } = body

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (institution !== undefined) updateData.institution = institution?.trim() || null
    if (degree_level !== undefined) updateData.degree_level = degree_level?.trim() || null
    if (field_of_study !== undefined) updateData.field_of_study = field_of_study?.trim() || null
    if (graduation_year !== undefined) updateData.graduation_year = graduation_year || null
    if (description !== undefined) updateData.description = description?.trim() || null

    const { data, error } = await supabase
      .from('education_records')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update education record error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ education_record: data })
  } catch (err) {
    console.error('PUT /api/members/education/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/members/education/[id]
 * Delete a specific education record. Verifies ownership.
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
      .from('education_records')
      .select('id, member_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Education record not found' }, { status: 404 })
    }

    if (existing.member_id !== session.user.memberId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('education_records')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete education record error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/members/education/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
