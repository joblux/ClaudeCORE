import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import EscapeShareBar from '@/components/escape/EscapeShareBar'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const revalidate = 0

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: article } = await supabase
    .from('escape_articles')
    .select('title, excerpt')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!article) return {}

  return {
    title: `${article.title} | JOBLUX Escape`,
    description: article.excerpt,
  }
}

export default async function EscapeBlogArticlePage({ params }: { params: { slug: string } }) {
  const { data: article } = await supabase
    .from('escape_articles')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!article) notFound()

  const formattedDate = new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    author: {
      '@type': 'Organization',
      name: 'JOBLUX Escape',
    },
    datePublished: article.published_at || article.created_at,
    image: article.featured_image,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        {/* Back link */}
        <Link
          href="/escape"
          style={{ fontSize: 14, color: '#B8975C', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}
        >
          &larr; Blog
        </Link>

        {/* Tag */}
        {article.tag && (
          <p style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '2px', color: '#B8975C', marginBottom: 8 }}>
            {article.tag}
          </p>
        )}

        {/* Title */}
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, color: '#1A1A1A', marginBottom: 12 }}>
          {article.title}
        </h1>

        {/* Meta */}
        <p style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>
          {article.read_time} &middot; {formattedDate}
        </p>

        {/* Share bar */}
        <EscapeShareBar title={article.title} />

        {/* Featured image */}
        {article.featured_image && (
          <img
            src={article.featured_image}
            alt={article.title}
            style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 6, margin: '24px 0' }}
          />
        )}

        {/* Body */}
        {article.body && (
          <div
            dangerouslySetInnerHTML={{ __html: article.body }}
            style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}
          />
        )}

        {/* Bottom CTA */}
        <div style={{ marginTop: 64, padding: 40, borderRadius: 8, backgroundColor: '#FDF8EE', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20 }}>
            Interested in this destination?
          </p>
          <Link
            href="/escape/plan"
            style={{
              display: 'inline-block',
              marginTop: 16,
              padding: '12px 28px',
              backgroundColor: '#2B4A3E',
              color: '#fff',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            Plan Your Trip
          </Link>
        </div>
      </div>
    </>
  )
}
