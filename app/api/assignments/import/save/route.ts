import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Generate a URL-friendly slug from a title string.
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

/**
 * Parse a value as a number, returning null if invalid.
 */
function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return isNaN(num) ? null : num
}

/**
 * Parse a value as an array. Handles comma-separated strings and existing arrays.
 */
function parseArray(value: any): string[] | null {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((s: string) => s.trim()).filter(Boolean)
  }
  return null
}

/**
 * POST /api/assignments/import/save
 *
 * Accepts { assignments: object[], source: string }.
 * Saves parsed assignment data to the search_assignments table.
 * Auto-generates slug, SEO fields, and handles conflicts.
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authorization check
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assignments, source } = body

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ error: 'No assignments provided' }, { status: 400 })
    }

    if (!source || typeof source !== 'string') {
      return NextResponse.json({ error: 'Source is required (e.g., import_csv, import_url)' }, { status: 400 })
    }

    const created: any[] = []
    const errors: { index: number; error: string }[] = []

    for (let i = 0; i < assignments.length; i++) {
      try {
        const assignment = assignments[i]

        // Title is required
        if (!assignment.title) {
          errors.push({ index: i, error: 'Missing title' })
          continue
        }

        // Generate slug from title if not provided
        let slug = assignment.slug || generateSlug(assignment.title)

        // Auto-generate SEO title if not provided
        const seoTitle = assignment.seo_title ||
          `${assignment.title}${assignment.maison ? ' at ' + assignment.maison : ''}${assignment.city ? ' | ' + assignment.city : ''}`

        // Auto-generate SEO description if not provided (first 160 chars of description)
        const seoDescription = assignment.seo_description ||
          (assignment.description ? assignment.description.slice(0, 160) : null)

        // Build the record to insert
        const record: Record<string, any> = {
          title: assignment.title,
          slug,
          maison: assignment.maison || null,
          city: assignment.city || null,
          country: assignment.country || null,
          description: assignment.description || null,
          responsibilities: assignment.responsibilities || null,
          requirements: assignment.requirements || null,
          nice_to_haves: assignment.nice_to_haves || null,
          department: assignment.department || null,
          seniority: assignment.seniority || null,
          contract_type: assignment.contract_type || null,
          remote_policy: assignment.remote_policy || null,
          salary_min: parseNumber(assignment.salary_min),
          salary_max: parseNumber(assignment.salary_max),
          salary_currency: assignment.salary_currency || null,
          salary_period: assignment.salary_period || null,
          benefits: parseArray(assignment.benefits),
          languages_required: parseArray(assignment.languages_required),
          product_category: assignment.product_category || null,
          reports_to: assignment.reports_to || null,
          team_size: assignment.team_size || null,
          start_date: assignment.start_date || null,
          relocation_offered: assignment.relocation_offered || null,
          visa_sponsorship: assignment.visa_sponsorship || null,
          seo_title: seoTitle,
          seo_description: seoDescription,
          source,
          status: 'draft',
        }

        // Attempt to insert
        let { data, error } = await supabase
          .from('search_assignments')
          .insert(record)
          .select()
          .single()

        // Handle slug conflict by appending timestamp
        if (error && error.code === '23505' && error.message?.includes('slug')) {
          slug = `${slug}-${Date.now()}`
          record.slug = slug

          const retryResult = await supabase
            .from('search_assignments')
            .insert(record)
            .select()
            .single()

          data = retryResult.data
          error = retryResult.error
        }

        if (error) {
          errors.push({ index: i, error: error.message })
          continue
        }

        created.push(data)
      } catch (err: any) {
        errors.push({ index: i, error: err.message || 'Unknown error' })
      }
    }

    return NextResponse.json({ created, errors })
  } catch (error: any) {
    console.error('Save import error:', error)
    return NextResponse.json(
      { error: 'Failed to save assignments', details: error.message },
      { status: 500 }
    )
  }
}
