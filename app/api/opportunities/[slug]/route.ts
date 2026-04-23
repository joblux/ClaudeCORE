import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Public-safe fields | never expose internal/private columns
const PUBLIC_FIELDS = [
  'id',
  'title',
  'slug',
  'maison',
  'is_confidential',
  'confidentiality_level',
  'show_brand',
  'show_salary',
  'show_location',
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
  'reference_number',
  'activated_at',
  'closing_date',
].join(', ')

// ---------------------------------------------------------------------------
// Helper: determine whether a string looks like a UUID
// ---------------------------------------------------------------------------
function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

// ---------------------------------------------------------------------------
// GET /api/opportunities/[slug] | fetch a single active opportunity by slug or UUID
//   No auth required. Returns only public-safe fields.
// ---------------------------------------------------------------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    let opportunity: any = null

    // Try by UUID first, then fall back to slug
    if (isUUID(slug)) {
      const { data, error } = await supabase
        .from('search_assignments')
        .select(PUBLIC_FIELDS)
        .eq('id', slug)
        .eq('status', 'published')
        .single()

      if (!error && data) {
        opportunity = data
      }
    }

    // If not found by UUID (or slug was not a UUID), try by slug
    if (!opportunity) {
      const { data, error } = await supabase
        .from('search_assignments')
        .select(PUBLIC_FIELDS)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (!error && data) {
        opportunity = data
      }
    }

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    return NextResponse.json(opportunity)
  } catch (err) {
    console.error('Unexpected error in GET /api/opportunities/[slug]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
