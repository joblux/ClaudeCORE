export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import WikiLuxBrandClient from './WikiLuxBrandClient'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data: brand } = await supabase
    .from('wikilux_content')
    .select('brand_name, sector, content')
    .eq('slug', params.slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (!brand) return { title: 'Brand Not Found | JOBLUX' }

  const tagline = brand.content?.tagline
  const name = brand.brand_name
  const desc = tagline
    ? `${name}: ${tagline}. Careers, salaries, interview insights and intelligence on JOBLUX.`
    : `${name} careers, salaries, interview insights and intelligence. Explore opportunities at ${name} on JOBLUX.`

  return {
    title: `${name} | Careers, Salaries & Intelligence | JOBLUX`,
    description: desc,
    openGraph: {
      title: `${name} | JOBLUX WikiLux`,
      description: desc,
      url: `https://www.joblux.com/wikilux/${params.slug}`,
      images: [`/api/og?title=${encodeURIComponent(name)}&subtitle=${encodeURIComponent(brand.sector || 'Luxury')}&type=wikilux`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | JOBLUX WikiLux`,
      description: desc,
    },
    alternates: {
      canonical: `https://www.joblux.com/wikilux/${params.slug}`,
    },
  }
}

export async function generateStaticParams() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('wikilux_content')
    .select('slug')
    .eq('is_published', true)
    .is('deleted_at', null)
  return (data || []).map(b => ({ slug: b.slug }))
}

export default async function WikiLuxBrandPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient()

  // Fetch brand metadata + content in one query
  const { data: row } = await supabase
    .from('wikilux_content')
    .select('slug, brand_name, sector, country, founded, group_name, headquarters, known_for, description, content, updated_at, editorial_notes')
    .eq('slug', params.slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (!row) notFound()

  // Map DB row to shape expected by WikiLuxBrandClient (uses brand.group, not brand.group_name)
  const brand = {
    slug: row.slug,
    name: row.brand_name,
    sector: row.sector || '',
    country: row.country || '',
    founded: row.founded || 0,
    group: row.group_name || '',
    headquarters: row.headquarters || '',
    known_for: row.known_for || '',
    description: row.description || '',
    hiring_profile: '',
  }

  // Related brands: same sector, different slug, randomized
  const { data: relatedRows } = await supabase
    .from('wikilux_content')
    .select('slug, brand_name, sector, country, founded')
    .eq('sector', row.sector)
    .neq('slug', params.slug)
    .eq('is_published', true)
    .is('deleted_at', null)
    .limit(10)

  const related = (relatedRows || [])
    .map(r => ({
      slug: r.slug,
      name: r.brand_name,
      sector: r.sector || '',
      country: r.country || '',
      founded: r.founded || 0,
    }))
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)

  return (
    <WikiLuxBrandClient
      brand={brand}
      initialContent={row.content || null}
      initialImages={[]}
      initialInsights={[]}
      insightsTotal={0}
      contentUpdatedAt={row.updated_at || null}
      editorialNotes={row.editorial_notes || null}
      related={related}
    />
  )
}
