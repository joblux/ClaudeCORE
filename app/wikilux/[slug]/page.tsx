import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { BRANDS } from '@/lib/wikilux-brands'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import WikiLuxBrandClient from './WikiLuxBrandClient'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const brand = BRANDS.find(b => b.slug === params.slug)
  if (!brand) return { title: 'Brand Not Found | JOBLUX' }

  // Try to get content for better description
  const supabase = createServerSupabaseClient()
  const { data: cached } = await supabase
    .from('wikilux_content')
    .select('content')
    .eq('slug', params.slug)
    .maybeSingle()

  const tagline = cached?.content?.tagline
  const desc = tagline
    ? `${brand.name}: ${tagline}. Careers, salaries, interview insights and intelligence on JOBLUX.`
    : `${brand.name} careers, salaries, interview insights and intelligence. Explore opportunities at ${brand.name} on JOBLUX.`

  return {
    title: `${brand.name} — Careers, Salaries & Intelligence | JOBLUX`,
    description: desc,
    openGraph: {
      title: `${brand.name} | JOBLUX WikiLux`,
      description: desc,
      url: `https://www.joblux.com/wikilux/${params.slug}`,
      images: [`/api/og?title=${encodeURIComponent(brand.name)}&subtitle=${encodeURIComponent(brand.sector || 'Luxury')}&type=wikilux`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brand.name} | JOBLUX WikiLux`,
      description: desc,
    },
    alternates: {
      canonical: `https://www.joblux.com/wikilux/${params.slug}`,
    },
  }
}

export async function generateStaticParams() {
  return BRANDS.map(b => ({ slug: b.slug }))
}

export default async function WikiLuxBrandPage({ params }: { params: { slug: string } }) {
  const brand = BRANDS.find(b => b.slug === params.slug)
  if (!brand) notFound()

  const supabase = createServerSupabaseClient()

  // Fetch wiki content
  const { data: cached } = await supabase
    .from('wikilux_content')
    .select('content, updated_at, editorial_notes')
    .eq('slug', params.slug)
    .maybeSingle()

  // Fetch insights
  const { data: insightsData, count: insightsCount } = await supabase
    .from('wikilux_insights')
    .select('*', { count: 'exact' })
    .eq('brand_slug', params.slug)
    .order('created_at', { ascending: false })
    .limit(20)

  // Note: Images still fetched client-side (they come from Unsplash API via /api/wikilux/images)

  return (
    <WikiLuxBrandClient
      brand={brand}
      initialContent={cached?.content || null}
      initialImages={[]}
      initialInsights={insightsData || []}
      insightsTotal={insightsCount || 0}
      contentUpdatedAt={cached?.updated_at || null}
      editorialNotes={cached?.editorial_notes || null}
    />
  )
}
