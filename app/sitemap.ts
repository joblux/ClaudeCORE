import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://joblux.com'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/brands/all`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/insights`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/insights?tab=research-reports`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/insights?tab=insider-voices`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/careers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/careers?tab=salary-intelligence`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/careers?tab=interview-experiences`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/signals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/interviews`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/the-brief`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/escape`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/connect`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/join`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Fetch published brands from DB (source of truth)
  const { data: brands } = await supabase
    .from('wikilux_content')
    .select('slug')
    .eq('is_published', true)
    .is('deleted_at', null)

  const brandSlugs = (brands || []).map(b => b.slug)

  // Brand pages | all languages
  const brandLangs = ['fr', 'ar', 'it', 'es', 'de', 'zh', 'ja', 'ru']
  const brandPages: MetadataRoute.Sitemap = brandSlugs.flatMap((slug) => [
    { url: `${baseUrl}/brands/${slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    ...brandLangs.map((lang) => ({
      url: `${baseUrl}/brands/${slug}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ])

  // Brand tab pages (published brands × 4 tabs)
  const brandTabSlugs = ['culture', 'career-paths', 'salaries', 'signals']
  const brandTabPages: MetadataRoute.Sitemap = brandSlugs.flatMap((slug) => [
    { url: `${baseUrl}/brands/${slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    ...brandTabSlugs.map((tab) => ({
      url: `${baseUrl}/brands/${slug}?tab=${tab}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ])

  // Dynamic: BlogLux articles
  const { data: articles } = await supabase
    .from('bloglux_articles')
    .select('slug, updated_at')
    .eq('status', 'published')
    .is('deleted_at', null)
  const articlePages: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${baseUrl}/insights/${article.slug}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Dynamic: Careers (search assignments)
  const { data: assignments } = await supabase
    .from('search_assignments')
    .select('slug, updated_at')
    .eq('status', 'published')
  const careerPages: MetadataRoute.Sitemap = (assignments || []).map((a) => ({
    url: `${baseUrl}/careers/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Dynamic: Signals
  const { data: signals } = await supabase
    .from('signals')
    .select('slug, published_at')
    .eq('is_published', true)
    .not('slug', 'is', null)
  const signalPages: MetadataRoute.Sitemap = (signals || []).map((s) => ({
    url: `${baseUrl}/signals/${s.slug}`,
    lastModified: s.published_at ? new Date(s.published_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Dynamic: Events
  const { data: events } = await supabase
    .from('events')
    .select('slug, updated_at')
    .eq('is_published', true)
    .not('slug', 'is', null)
  const eventPages: MetadataRoute.Sitemap = (events || []).map((e) => ({
    url: `${baseUrl}/events/${e.slug}`,
    lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...brandPages, ...brandTabPages, ...articlePages, ...careerPages, ...signalPages, ...eventPages]
}
