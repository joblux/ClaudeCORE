import { Suspense } from 'react'
import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import BlogluxClient from './BlogluxClient'
import type { Article } from './BlogluxClient'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Insights | Luxury Industry Analysis | JOBLUX',
  description: 'Expert analysis, career insights, and industry intelligence from across the luxury sector.',
  alternates: { canonical: 'https://www.joblux.com/insights' },
  openGraph: {
    title: 'Insights | JOBLUX',
    description: 'Expert analysis, career insights, and industry intelligence from across the luxury sector.',
    images: ['/api/og?title=BlogLux&subtitle=Luxury+Industry+Intelligence&type=article'],
  },
}

export default async function BlogluxPage() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('bloglux_articles')
    .select('id, title, slug, excerpt, category, author_name, published_at, read_time_minutes, tags, cover_image_url, status')
    .eq('status', 'published')
    .is('deleted_at', null)
    .neq('category', 'Insider Voice')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('bloglux_articles query error:', error.message)
  }

  const articles: Article[] = (data ?? []).map((a: any) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    category: a.category,
    author_name: a.author_name,
    published_at: a.published_at,
    read_time: a.read_time_minutes,
    tags: a.tags,
    hero_image_url: a.cover_image_url,
    hero_image_alt: a.title,
    is_featured: false,
    views_count: null,
  }))

  return (
    <Suspense>
      <BlogluxClient initialArticles={articles} />
    </Suspense>
  )
}
