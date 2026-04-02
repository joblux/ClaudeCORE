export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Public-safe fields | never expose internal/private columns
const PUBLIC_FIELDS = [
  'id',
  'title',
  'slug',
  'maison',
  'is_confidential',
  'city',
  'country',
  'region',
  'remote_policy',
  'department',
  'seniority',
  'contract_type',
  'description',
  'responsibilities',
  'requirements',
  'nice_to_haves',
  'about_maison',
  'salary_min',
  'salary_max',
  'salary_currency',
  'salary_period',
  'salary_display',
  'product_category',
  'client_segment',
  'languages_required',
  'clienteling_experience',
  'travel_percentage',
  'luxury_sector_experience',
  'benefits',
  'relocation_offered',
  'visa_sponsorship',
  'start_date',
  'team_size',
  'seo_title',
  'seo_description',
  'location',
  'reference_number',
  'activated_at',
  'closing_date',
].join(', ')

// ---------------------------------------------------------------------------
// GET /api/opportunities | list active search assignments (public, no auth)
//   Query params: search, department, seniority, city, contract_type,
//                 remote_policy, page (default 1), limit (default 20)
//   Returns only public-safe fields for active assignments with open closing dates.
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const department = searchParams.get('department')
    const seniority = searchParams.get('seniority')
    const city = searchParams.get('city')
    const contractType = searchParams.get('contract_type')
    const remotePolicy = searchParams.get('remote_policy')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    // Only active assignments with open or no closing date
    let query = supabase
      .from('search_assignments')
      .select(PUBLIC_FIELDS, { count: 'exact' })
      .eq('status', 'published')
      .or('closing_date.is.null,closing_date.gt.now()')

    // Search by title or maison (case-insensitive)
    if (search) {
      query = query.or(`title.ilike.%${search}%,maison.ilike.%${search}%`)
    }

    // Filter by exact match on optional params
    if (department) {
      query = query.eq('department', department)
    }
    if (seniority) {
      query = query.eq('seniority', seniority)
    }
    if (city) {
      query = query.eq('city', city)
    }
    if (contractType) {
      query = query.eq('contract_type', contractType)
    }
    if (remotePolicy) {
      query = query.eq('remote_policy', remotePolicy)
    }

    // Order by most recently activated
    query = query.order('activated_at', { ascending: false })

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: opportunities, count, error } = await query

    if (error) {
      console.error('Error fetching opportunities:', error)
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
    }

    return NextResponse.json({
      opportunities: opportunities || [],
      total: count || 0,
      page,
      limit,
    })
  } catch (err) {
    console.error('Unexpected error in GET /api/opportunities:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
