import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function findInternship(idOrSlug: string) {
  if (UUID_REGEX.test(idOrSlug)) {
    const { data, error } = await supabaseAdmin
      .from('internship_listings')
      .select('*')
      .eq('id', idOrSlug)
      .single()
    if (!error && data) return data
  }

  // Try slug
  const { data, error } = await supabaseAdmin
    .from('internship_listings')
    .select('*')
    .eq('slug', idOrSlug)
    .single()

  if (error) return null
  return data
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId
    const role = (session?.user as any)?.role
    const isAdmin = role === 'admin'

    const listing = await findInternship(params.id)

    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Public can only see approved listings
    const isSubmitter = memberId && listing.submitted_by === memberId
    if (!isAdmin && !isSubmitter && listing.status !== 'approved') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(listing)
  } catch (err) {
    console.error('GET /api/internships/[id] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId
    const role = (session?.user as any)?.role
    const isAdmin = role === 'admin'

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listing = await findInternship(params.id)

    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isSubmitter = listing.submitted_by === memberId

    // Submitter can edit only if pending_review; admin can edit any
    if (!isAdmin && !(isSubmitter && listing.status === 'pending_review')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    const { data, error } = await supabaseAdmin
      .from('internship_listings')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('PUT /api/internships/[id] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId
    const role = (session?.user as any)?.role
    const isAdmin = role === 'admin'

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listing = await findInternship(params.id)

    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isSubmitter = listing.submitted_by === memberId

    // Submitter can delete only if pending_review; admin can delete any
    if (!isAdmin && !(isSubmitter && listing.status === 'pending_review')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('internship_listings')
      .delete()
      .eq('id', listing.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/internships/[id] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
