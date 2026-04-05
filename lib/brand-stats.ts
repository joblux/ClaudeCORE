import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface BrandStats {
  total: number
  published: number
  empty: number
  languages: number
}

/**
 * Single source of truth for brand stats.
 * Queries wikilux_content directly — no static arrays, no caching.
 */
export async function getBrandStats(): Promise<BrandStats> {
  const [totalRes, publishedRes, emptyRes] = await Promise.all([
    supabase
      .from('wikilux_content')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('wikilux_content')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('is_published', true),
    supabase
      .from('wikilux_content')
      .select('id', { count: 'exact', head: true })
      .or('status.neq.approved,is_published.neq.true'),
  ])

  return {
    total: totalRes.count ?? 0,
    published: publishedRes.count ?? 0,
    empty: (totalRes.count ?? 0) - (publishedRes.count ?? 0),
    languages: 9, // hardcoded until wikilux_translations table exists
  }
}
