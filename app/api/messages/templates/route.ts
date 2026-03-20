import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/messages/templates
 * List message templates with optional filtering by participant_type and category.
 * Ordered by category, then name.
 * Admin only.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const participantType = searchParams.get('participant_type')
  const category = searchParams.get('category')

  try {
    let query = supabase
      .from('message_templates')
      .select('*')

    if (participantType) {
      query = query.eq('participant_type', participantType)
    }
    if (category) {
      query = query.eq('category', category)
    }

    query = query
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    const { data: templates, error } = await query

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ templates: templates || [] })
  } catch (err) {
    console.error('Unexpected error listing templates:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/messages/templates
 * Create a new message template.
 * Admin only.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, category, subject, body: templateBody, participant_type } = body

    // Validate required fields
    if (!name || !category || !templateBody || !participant_type) {
      return NextResponse.json(
        { error: 'name, category, body, and participant_type are required' },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabase
      .from('message_templates')
      .insert({
        name,
        category,
        subject: subject || null,
        body: templateBody,
        participant_type,
        created_by: session.user.memberId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error creating template:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
