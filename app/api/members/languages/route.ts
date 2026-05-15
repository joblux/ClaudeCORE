import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// /api/members/languages — member_languages CRUD for the session user
// Gates by session.user.email + resolveMemberId (mirrors profilux/experiences).
// proficiency is NOT NULL in the DB schema — both POST and PUT require it.
// =============================================================================

async function resolveMemberId(email: string): Promise<string | null> {
  const { data } = await supabase
    .from('members')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  return data?.id ?? null
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const memberId = await resolveMemberId(session.user.email)
    if (!memberId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('member_languages')
      .select('*')
      .eq('member_id', memberId)
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const memberId = await resolveMemberId(session.user.email)
    if (!memberId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await req.json()
    const language = typeof body?.language === 'string' ? body.language.trim() : ''
    const proficiency = typeof body?.proficiency === 'string' ? body.proficiency.trim() : ''

    if (!language) {
      return NextResponse.json(
        { error: 'language is required', code: 'MISSING_REQUIRED' },
        { status: 400 },
      )
    }
    if (!proficiency) {
      return NextResponse.json(
        { error: 'proficiency is required', code: 'MISSING_REQUIRED' },
        { status: 400 },
      )
    }

    const { data: existing } = await supabase
      .from('member_languages')
      .select('id')
      .eq('member_id', memberId)
      .ilike('language', language)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'This language already exists on your profile', code: 'DUPLICATE_LANGUAGE' },
        { status: 409 },
      )
    }

    const { data, error } = await supabase
      .from('member_languages')
      .insert({
        member_id: memberId,
        language,
        proficiency,
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

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const memberId = await resolveMemberId(session.user.email)
    if (!memberId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await req.json()
    const id = typeof body?.id === 'string' ? body.id : null
    const language = typeof body?.language === 'string' ? body.language.trim() : ''
    const proficiency = typeof body?.proficiency === 'string' ? body.proficiency.trim() : ''

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }
    if (!language) {
      return NextResponse.json(
        { error: 'language is required', code: 'MISSING_REQUIRED' },
        { status: 400 },
      )
    }
    if (!proficiency) {
      return NextResponse.json(
        { error: 'proficiency is required', code: 'MISSING_REQUIRED' },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from('member_languages')
      .update({ language, proficiency })
      .eq('id', id)
      .eq('member_id', memberId)
      .select()
      .single()

    if (error) {
      console.error('Update language error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ language: data })
  } catch (err) {
    console.error('PUT /api/members/languages error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const memberId = await resolveMemberId(session.user.email)
    if (!memberId) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('member_languages')
      .select('id, member_id')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    if (!existing) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 })
    }
    if (existing.member_id !== memberId) {
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
