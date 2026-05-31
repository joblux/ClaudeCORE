import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const REPORT_CATEGORIES = ['Research Report', 'Market Report']
// PostgREST not-in / in list literal for category values containing spaces
const REPORT_IN_LIST = '("Research Report","Market Report")'

type InventoryRow = {
  type: string
  label: string
  total: number
  live: number
  in_queue: number
  added_30d: number
  last_added: string | null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const today = new Date().toISOString().split('T')[0]

  // Count via head:true exact-count query
  const countWith = async (
    table: string,
    apply?: (q: ReturnType<ReturnType<typeof createClient>['from']>) => unknown
  ): Promise<number> => {
    let q = supabase.from(table).select('*', { count: 'exact', head: true })
    if (apply) q = apply(q) as typeof q
    const { count, error } = await q
    if (error) throw error
    return count ?? 0
  }

  // Most recent created_at over the same filter, or null
  const lastAddedWith = async (
    table: string,
    apply?: (q: ReturnType<ReturnType<typeof createClient>['from']>) => unknown
  ): Promise<string | null> => {
    let q = supabase
      .from(table)
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
    if (apply) q = apply(q) as typeof q
    const { data, error } = await q
    if (error) throw error
    return (data?.[0] as { created_at?: string } | undefined)?.created_at ?? null
  }

  const queueCount = (contentType: string) =>
    countWith('content_queue', (q) =>
      q.eq('status', 'draft').eq('content_type', contentType)
    )

  const row = async (
    type: string,
    label: string,
    compute: () => Promise<Omit<InventoryRow, 'type' | 'label'>>
  ): Promise<InventoryRow> => {
    try {
      const fields = await compute()
      return { type, label, ...fields }
    } catch {
      return { type, label, total: 0, live: 0, in_queue: 0, added_30d: 0, last_added: null }
    }
  }

  const inventory: InventoryRow[] = await Promise.all([
    // brands — wikilux_content
    row('brands', 'Brands (WikiLux)', async () => {
      const [total, live, added_30d, last_added] = await Promise.all([
        countWith('wikilux_content', (q) => q.is('deleted_at', null)),
        countWith('wikilux_content', (q) => q.eq('is_published', true).is('deleted_at', null)),
        countWith('wikilux_content', (q) => q.gte('created_at', cutoff).is('deleted_at', null)),
        lastAddedWith('wikilux_content', (q) => q.is('deleted_at', null)),
      ])
      return { total, live, in_queue: 0, added_30d, last_added }
    }),

    // signals
    row('signals', 'Signals', async () => {
      const [total, live, in_queue, added_30d, last_added] = await Promise.all([
        countWith('signals'),
        countWith('signals', (q) => q.eq('is_published', true)),
        queueCount('signal'),
        countWith('signals', (q) => q.gte('created_at', cutoff)),
        lastAddedWith('signals'),
      ])
      return { total, live, in_queue, added_30d, last_added }
    }),

    // events
    row('events', 'Events', async () => {
      const [total, live, in_queue, added_30d, last_added] = await Promise.all([
        countWith('events'),
        countWith('events', (q) => q.eq('is_published', true).gte('event_date', today)),
        queueCount('event'),
        countWith('events', (q) => q.gte('created_at', cutoff)),
        lastAddedWith('events'),
      ])
      return { total, live, in_queue, added_30d, last_added }
    }),

    // articles — bloglux_articles, EXCLUDES report categories
    row('articles', 'Articles', async () => {
      const [total, live, in_queue, added_30d, last_added] = await Promise.all([
        countWith('bloglux_articles', (q) =>
          q.is('deleted_at', null).not('category', 'in', REPORT_IN_LIST)
        ),
        countWith('bloglux_articles', (q) =>
          q
            .eq('status', 'published')
            .is('deleted_at', null)
            .not('category', 'in', '("Research Report","Market Report","Insider Voice")')
        ),
        queueCount('article'),
        countWith('bloglux_articles', (q) =>
          q.gte('created_at', cutoff).is('deleted_at', null).not('category', 'in', REPORT_IN_LIST)
        ),
        lastAddedWith('bloglux_articles', (q) =>
          q.is('deleted_at', null).not('category', 'in', REPORT_IN_LIST)
        ),
      ])
      return { total, live, in_queue, added_30d, last_added }
    }),

    // reports — bloglux_articles, ONLY report categories
    row('reports', 'Research Reports', async () => {
      const [total, live, in_queue, added_30d, last_added] = await Promise.all([
        countWith('bloglux_articles', (q) =>
          q.is('deleted_at', null).in('category', REPORT_CATEGORIES)
        ),
        countWith('bloglux_articles', (q) =>
          q.eq('status', 'published').is('deleted_at', null).in('category', REPORT_CATEGORIES)
        ),
        queueCount('report'),
        countWith('bloglux_articles', (q) =>
          q.gte('created_at', cutoff).is('deleted_at', null).in('category', REPORT_CATEGORIES)
        ),
        lastAddedWith('bloglux_articles', (q) =>
          q.is('deleted_at', null).in('category', REPORT_CATEGORIES)
        ),
      ])
      return { total, live, in_queue, added_30d, last_added }
    }),

    // salary — salary_benchmarks
    row('salary', 'Salary benchmarks', async () => {
      const [total, live, added_30d, last_added] = await Promise.all([
        countWith('salary_benchmarks'),
        countWith('salary_benchmarks', (q) => q.eq('is_published', true)),
        countWith('salary_benchmarks', (q) => q.gte('created_at', cutoff)),
        lastAddedWith('salary_benchmarks'),
      ])
      return { total, live, in_queue: 0, added_30d, last_added }
    }),

    // interviews
    row('interviews', 'Interview guides', async () => {
      const [total, live, added_30d, last_added] = await Promise.all([
        countWith('interviews'),
        countWith('interviews', (q) => q.eq('is_published', true)),
        countWith('interviews', (q) => q.gte('created_at', cutoff)),
        lastAddedWith('interviews'),
      ])
      return { total, live, in_queue: 0, added_30d, last_added }
    }),
  ])

  return NextResponse.json({ inventory })
}
