import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper: generate slug from title + maison
function generateSlug(title: string, maison: string): string {
  const base = `${maison}-${title}`
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// GET /api/briefs — list briefs
// Admin: sees all briefs (draft, published, closed)
// Public: sees only published non-confidential
// Professional+: sees published including confidential
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'
  const memberStatus = (session?.user as any)?.status
  const memberRole = (session?.user as any)?.role

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  let query = supabase
    .from('job_briefs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (isAdmin) {
    // Admin sees everything, optionally filtered by status
    if (status) {
      query = query.eq('status', status)
    }
  } else if (memberStatus === 'approved' && ['candidate', 'employer', 'influencer'].includes(memberRole)) {
    // Approved Professional+ / Business / Insider — see published including confidential
    query = query.eq('status', 'published')
  } else {
    // Public or Rising — only published non-confidential
    query = query.eq('status', 'published').eq('is_confidential', false)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    briefs: data,
    total: count,
    page,
    limit,
  })
}

// POST /api/briefs — create new brief (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    const {
      title,
      maison,
      location,
      city,
      country,
      remote_policy,
      contract_type,
      seniority,
      department,
      reports_to,
      description,
      responsibilities,
      requirements,
      qualifications,
      salary_min,
      salary_max,
      salary_currency,
      salary_display,
      is_confidential,
      status,
      seo_title,
      seo_description,
      seo_keywords,
    } = body

    // Validate required fields
    if (!title || !maison || !location || !contract_type || !seniority || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, maison, location, contract_type, seniority, description' },
        { status: 400 }
      )
    }

    const slug = generateSlug(title, maison)
    const memberId = (session?.user as any)?.memberId

    const briefData: any = {
      title,
      slug,
      maison,
      location,
      city: city || null,
      country: country || null,
      remote_policy: remote_policy || null,
      contract_type,
      seniority,
      department: department || null,
      reports_to: reports_to || null,
      description,
      responsibilities: responsibilities || null,
      requirements: requirements || null,
      qualifications: qualifications || null,
      salary_min: salary_min ? parseInt(salary_min) : null,
      salary_max: salary_max ? parseInt(salary_max) : null,
      salary_currency: salary_currency || 'EUR',
      salary_display: salary_display || null,
      is_confidential: is_confidential || false,
      status: status || 'draft',
      seo_title: seo_title || null,
      seo_description: seo_description || null,
      seo_keywords: seo_keywords || null,
      posted_by: memberId || null,
    }

    // If publishing, set published_at
    if (status === 'published') {
      briefData.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('job_briefs')
      .insert(briefData)
      .select()
      .single()

    if (error) {
      // Handle duplicate slug
      if (error.code === '23505') {
        briefData.slug = `${slug}-${Date.now()}`
        const { data: retryData, error: retryError } = await supabase
          .from('job_briefs')
          .insert(briefData)
          .select()
          .single()

        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500 })
        }
        return NextResponse.json(retryData, { status: 201 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
