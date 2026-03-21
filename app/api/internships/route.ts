import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateSlug(companyName: string, title: string): string {
  return `${companyName}-${title}-internship`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let suffix = 1

  while (true) {
    const { data } = await supabaseAdmin
      .from('internship_listings')
      .select('id')
      .eq('slug', slug)
      .limit(1)

    if (!data || data.length === 0) return slug
    suffix++
    slug = `${baseSlug}-${suffix}`
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId
    const role = (session?.user as any)?.role
    const isAdmin = role === 'admin'

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (isAdmin) {
      // Admin: return all, optional status filter, join submitter info
      let query = supabaseAdmin
        .from('internship_listings')
        .select('*, submitter:members!submitted_by(full_name, email, current_employer)')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Map current_employer to maison
      const listings = (data || []).map((item: any) => ({
        ...item,
        submitter: item.submitter
          ? {
              full_name: item.submitter.full_name,
              email: item.submitter.email,
              maison: item.submitter.current_employer,
            }
          : undefined,
      }))

      return NextResponse.json(listings)
    }

    if (memberId && role === 'business') {
      // Authenticated business member: return only their own
      const { data, error } = await supabaseAdmin
        .from('internship_listings')
        .select('*')
        .eq('submitted_by', memberId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    // Public/other: return only approved and not expired
    const { data, error } = await supabaseAdmin
      .from('internship_listings')
      .select('*')
      .eq('status', 'approved')
      .or('expires_at.gt.now(),expires_at.is.null')
      .order('approved_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('GET /api/internships error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId
    const role = (session?.user as any)?.role
    const userStatus = (session?.user as any)?.status
    const isBusiness = role === 'business' && userStatus === 'approved'

    if (!memberId || !isBusiness) {
      return NextResponse.json(
        { error: 'Only approved business members can submit internships' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { title, company_name, city, country, duration, description } = body

    if (!title || !company_name || !city || !country || !duration || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company_name, city, country, duration, description' },
        { status: 400 }
      )
    }

    const baseSlug = generateSlug(company_name, title)
    const slug = await ensureUniqueSlug(baseSlug)

    const { data, error } = await supabaseAdmin
      .from('internship_listings')
      .insert({
        ...body,
        slug,
        status: 'pending_review',
        submitted_by: memberId,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert internship error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('POST /api/internships error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
