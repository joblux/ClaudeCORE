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
    title: article.title,
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
        {article.body && (() => {
          // Strip the first image if it matches the cover photo (prevents duplicate)
          let cleanBody = article.body
            .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs

          if (article.featured_image) {
            // Remove first img tag whose src matches the cover image
            const coverSrc = article.featured_image.split('?')[0] // Compare without query params
            cleanBody = cleanBody.replace(/<img[^>]*src="[^"]*"[^>]*>/i, (match: string) => {
              const srcMatch = match.match(/src="([^"]*)"/)
              if (srcMatch && srcMatch[1].split('?')[0] === coverSrc) return ''
              return match
            })
          }

          return (
            <div
              dangerouslySetInnerHTML={{ __html: cleanBody }}
              className="escape-article-body"
              style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}
            />
          )
        })()}

        <style>{`
          .escape-article-body p { margin-bottom: 1.2em; }
          .escape-article-body p:empty { display: none; }
          .escape-article-body h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; margin-top: 2em; margin-bottom: 0.8em; color: #1A1A1A; font-weight: 400; }
          .escape-article-body h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin-top: 2em; margin-bottom: 0.8em; color: #1A1A1A; font-weight: 400; }
          .escape-article-body h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; margin-top: 1.5em; margin-bottom: 0.6em; color: #1A1A1A; font-weight: 400; }
          .escape-article-body ul, .escape-article-body ol { margin-bottom: 1em; padding-left: 1.5em; }
          .escape-article-body li { margin-bottom: 0.4em; }
          .escape-article-body blockquote { border-left: 3px solid #B8975C; padding-left: 16px; margin: 1.5em 0; font-style: italic; color: #555; }
          .escape-article-body img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5em 0; display: block; }
          .escape-article-body a { color: #B8975C; text-decoration: underline; }
          .escape-article-body strong { font-weight: 600; color: #1A1A1A; }
        `}</style>

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
