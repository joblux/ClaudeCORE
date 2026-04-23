import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ---------------------------------------------------------------------------
// Helper: generate a URL-friendly slug from a title
// ---------------------------------------------------------------------------
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---------------------------------------------------------------------------
// Helper: coerce a value to an array of strings, or null
// ---------------------------------------------------------------------------
function toArray(val: unknown): string[] | null {
  if (Array.isArray(val)) return val
  if (typeof val === 'string' && val.trim()) {
    return val.split(',').map((s: string) => s.trim())
  }
  return null
}

// ---------------------------------------------------------------------------
// Helper: coerce a value to a boolean, or null
// ---------------------------------------------------------------------------
function toBool(val: unknown): boolean | null {
  if (val === true || val === 'true') return true
  if (val === false || val === 'false') return false
  return null
}

// ---------------------------------------------------------------------------
// GET /api/assignments | list search assignments
//   Query params: status, search, page (default 1), limit (default 20)
//   Admin  -> all assignments, optionally filtered by status, ordered by created_at DESC
//   Public -> active assignments with open closing date, ordered by activated_at DESC
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isAdmin = (session?.user as any)?.role === 'admin'

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    // Build query
    let query = supabase.from('search_assignments').select('*', { count: 'exact' })

    if (isAdmin) {
      // Admin can filter by status; default ordering is created_at DESC
      if (status) {
        query = query.eq('status', status)
      }
      query = query.order('created_at', { ascending: false })
    } else {
      // Non-admin: only active assignments whose closing date is null or in the future
      query = query.eq('status', 'published')
      query = query.or('closing_date.is.null,closing_date.gt.now()')
      query = query.order('activated_at', { ascending: false })
    }

    // Search by title or maison (case-insensitive)
    if (search) {
      query = query.or(`title.ilike.%${search}%,maison.ilike.%${search}%`)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: assignments, count, error } = await query

    if (error) {
      console.error('Error fetching assignments:', error)
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
    }

    return NextResponse.json({
      assignments: assignments || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (err) {
    console.error('Unexpected error in GET /api/assignments:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/assignments | create a new search assignment (admin only)
//   Accepts ALL fields from the search assignment form.
//   Auto-generates slug, seo_title, seo_description when not provided.
//   Handles numeric, array, boolean, and text coercion.
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    // ---- Authentication & authorisation ----
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // ---- Slug (auto-generate from title if not provided) ----
    let slug = body.slug?.trim()
      ? generateSlug(body.slug)
      : generateSlug(body.title || 'untitled')

    // ---- Auto-generated SEO fields ----
    const seo_title =
      body.seo_title?.trim() ||
      `${body.title || ''}${body.maison ? ' at ' + body.maison : ''}${body.city ? ' | ' + body.city : ''}`

    const seo_description =
      body.seo_description?.trim() ||
      (body.description ? body.description.substring(0, 160) : null)

    // ---- Numeric fields (parse to int or null) ----
    const salary_min =
      body.salary_min != null && body.salary_min !== ''
        ? parseInt(String(body.salary_min), 10)
        : null
    const salary_max =
      body.salary_max != null && body.salary_max !== ''
        ? parseInt(String(body.salary_max), 10)
        : null

    // ---- salary_display (text in DB | store string or null) ----
    const salary_display =
      body.salary_display != null && body.salary_display !== ''
        ? String(body.salary_display)
        : null

    // ---- Array fields ----
    const benefits = toArray(body.benefits)
    const product_category = toArray(body.product_category)
    const languages_required = toArray(body.languages_required)

    // ---- Boolean fields ----
    const is_confidential = toBool(body.is_confidential)
    const relocation_offered = toBool(body.relocation_offered)
    const visa_sponsorship = toBool(body.visa_sponsorship)
    const clienteling_experience = toBool(body.clienteling_experience)

    // ---- activated_at: set to now when status is "published" ----
    const activated_at =
      body.status === 'published' ? new Date().toISOString() : body.activated_at || null

    // ---- location: derive from city + country when not explicitly provided ----
    // DB requires location NOT NULL; the form only collects city + country separately.
    const location =
      body.location && String(body.location).trim()
        ? String(body.location).trim()
        : [body.city, body.country]
            .map((v) => String(v || '').trim())
            .filter(Boolean)
            .join(', ')

    // ---- Build the insert payload ----
    // Spread the original body first so every form field is captured,
    // then overwrite the fields we explicitly processed above.
    const assignmentData: Record<string, unknown> = {
      ...body,
      slug,
      seo_title,
      seo_description,
      salary_min,
      salary_max,
      salary_display,
      benefits,
      product_category,
      languages_required,
      is_confidential,
      relocation_offered,
      visa_sponsorship,
      clienteling_experience,
      activated_at,
      location,
    }

    // ---- Insert into DB ----
    const { data: assignment, error } = await supabase
      .from('search_assignments')
      .insert(assignmentData)
      .select()
      .single()

    // Handle duplicate slug by appending a timestamp
    if (error && error.code === '23505' && error.message?.includes('slug')) {
      assignmentData.slug = `${slug}-${Date.now()}`
      const retry = await supabase
        .from('search_assignments')
        .insert(assignmentData)
        .select()
        .single()

      if (retry.error) {
        console.error('Error creating assignment (retry):', retry.error)
        return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
      }

      return NextResponse.json(retry.data, { status: 201 })
    }

    if (error) {
      console.error('Error creating assignment:', error)
      return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
    }

    return NextResponse.json(assignment, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/assignments:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
