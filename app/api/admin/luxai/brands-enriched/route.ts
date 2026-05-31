import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // One brands query + one salary query, joined in JS — no per-brand N+1.
    const [brandsRes, salaryRes] = await Promise.all([
      supabase
        .from('wikilux_content')
        .select('slug, brand_name, sector, status, is_published, last_regenerated_at, regeneration_count')
        .is('deleted_at', null)
        .order('brand_name', { ascending: true }),
      supabase
        .from('salary_benchmarks')
        .select('brand_slug'),
    ])

    if (brandsRes.error) throw brandsRes.error
    if (salaryRes.error) throw salaryRes.error

    // Tally salary_benchmarks rows per brand slug.
    const salaryCounts = new Map<string, number>()
    for (const row of salaryRes.data || []) {
      const slug = (row as { brand_slug?: string | null }).brand_slug
      if (!slug) continue
      salaryCounts.set(slug, (salaryCounts.get(slug) || 0) + 1)
    }

    // page_completeness intentionally excluded; blocked pending canonical WikiLux subpart definition.
    const brands = (brandsRes.data || []).map((b: any) => {
      const salary_count = salaryCounts.get(b.slug) || 0
      return {
        slug: b.slug,
        brand_name: b.brand_name,
        sector: b.sector,
        status: b.status,
        is_published: b.is_published,
        salary_count,
        has_salary: salary_count > 0,
        interview_count: 0,
        last_regenerated_at: b.last_regenerated_at ?? null,
        regeneration_count: b.regeneration_count ?? 0,
      }
    })

    return NextResponse.json({ brands })
  } catch (error: any) {
    console.error('Brands-enriched API error:', error)
    return NextResponse.json({ brands: [], error: error.message }, { status: 500 })
  }
}
