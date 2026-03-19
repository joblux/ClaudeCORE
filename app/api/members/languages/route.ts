import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/members/languages
 * List all languages for the authenticated member.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('member_languages')
      .select('*')
      .eq('member_id', session.user.memberId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fetch languages error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ languages: data })
  } catch (err) {
    console.error('GET /api/members/languages error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/members/languages
 * Add a language for the authenticated member.
 * Prevents duplicates (same language for the same member).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { language, proficiency } = body

    if (!language?.trim()) {
      return NextResponse.json({ error: 'language is required' }, { status: 400 })
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('member_languages')
      .select('id')
      .eq('member_id', session.user.memberId)
      .ilike('language', language.trim())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'This language already exists on your profile' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('member_languages')
      .insert({
        member_id: session.user.memberId,
        language: language.trim(),
        proficiency: proficiency?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Create language error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ language: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/members/languages error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/members/languages?id=xxx
 * Remove a language. Verifies ownership.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('member_languages')
      .select('id, member_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 })
    }

    if (existing.member_id !== session.user.memberId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('member_languages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete language error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/members/languages error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
