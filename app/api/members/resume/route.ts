import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESUME_FIELDS = [
  'resume_slug',
  'resume_public',
  'resume_show_email',
  'resume_show_phone',
  'resume_headline',
] as const

const UPDATABLE_FIELDS = [
  'resume_public',
  'resume_show_email',
  'resume_show_phone',
  'resume_headline',
] as const

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('members')
      .select(RESUME_FIELDS.join(', '))
      .eq('id', memberId)
      .single()

    if (error) {
      console.error('Resume settings fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch resume settings' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Resume settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Generate a unique resume slug from first and last name.
 * Handles duplicates by appending -2, -3, etc.
 */
async function generateUniqueSlug(firstName: string, lastName: string): Promise<string> {
  const base = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  // Check if the base slug is available
  const { data: existing } = await supabase
    .from('members')
    .select('resume_slug')
    .eq('resume_slug', base)
    .maybeSingle()

  if (!existing) return base

  // Find the next available suffix
  let suffix = 2
  while (true) {
    const candidate = `${base}-${suffix}`
    const { data: check } = await supabase
      .from('members')
      .select('resume_slug')
      .eq('resume_slug', candidate)
      .maybeSingle()

    if (!check) return candidate
    suffix++

    // Safety limit
    if (suffix > 100) return `${base}-${Date.now()}`
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Filter to only allowed fields
    const updates: Record<string, unknown> = {}
    for (const field of UPDATABLE_FIELDS) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
    }

    // If setting resume_public to true, check if slug needs to be generated
    if (updates.resume_public === true) {
      const { data: member } = await supabase
        .from('members')
        .select('resume_slug, first_name, last_name')
        .eq('id', memberId)
        .single()

      if (member && !member.resume_slug) {
        const slug = await generateUniqueSlug(
          member.first_name || 'member',
          member.last_name || 'user'
        )
        updates.resume_slug = slug
      }
    }

    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', memberId)
      .select('resume_slug')
      .single()

    if (error) {
      console.error('Resume settings update error:', error)
      return NextResponse.json({ error: 'Failed to update resume settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume_slug: data.resume_slug })
  } catch (error) {
    console.error('Resume settings update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
