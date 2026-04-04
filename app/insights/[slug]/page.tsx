import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { marked } from 'marked'
import { getCategoryLabel } from '@/lib/bloglux-options'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props { params: { slug: string } }

async function getArticle(slug: string) {
  // Try bloglux_articles first (actual table name)
  const { data } = await supabaseAdmin
    .from('bloglux_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (data) {
    // Map columns to expected shape
    return {
      ...data,
      published: true,
      read_time: data.read_time_minutes,
      hero_image_url: data.cover_image_url,
      hero_image_alt: data.title,
      content: data.body,
    }
  }
  // Fallback: try legacy 'articles' table
  const { data: legacy } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return legacy
}

async function getRelatedArticles(article: any) {
  // Try bloglux_articles first
  const { data } = await supabaseAdmin
    .from('bloglux_articles')
    .select('id, title, slug, excerpt, category, author_name, published_at, read_time_minutes, cover_image_url')
    .eq('status', 'published')
    .neq('slug', article.slug)
    .eq('category', article.category)
    .order('published_at', { ascending: false })
    .limit(3)
  if (data && data.length > 0) {
    return data.map((a: any) => ({ ...a, read_time: a.read_time_minutes, hero_image_url: a.cover_image_url }))
  }
  // Fallback
  const { data: legacy } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, excerpt, category, author_name, published_at, read_time, hero_image_url')
    .eq('published', true)
    .neq('slug', article.slug)
    .eq('category', article.category)
    .order('published_at', { ascending: false })
    .limit(3)
  return legacy || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug)
  if (!article) return { title: 'Article Not Found | Insights' }

  const ogImage = article.og_image_url || article.hero_image_url ||
    `/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(getCategoryLabel(article.category))}&type=article`

  return {
    title: `${article.title} | Insights | JOBLUX`,
    description: article.meta_description || article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.meta_description || article.excerpt || '',
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author_name],
      section: getCategoryLabel(article.category),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.meta_description || article.excerpt || '',
      images: [ogImage],
    },
  }
}

export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('bloglux_articles')
    .select('slug')
    .eq('status', 'published')
  return (data || []).map(a => ({ slug: a.slug }))
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function renderBody(content: string, heroImageUrl?: string): string {
  if (!content) return ''

  // If the body looks like HTML (has tags), use it directly but strip duplicate hero image
  const isHtml = /<[a-z][\s\S]*>/i.test(content)
  let html = isHtml ? content : marked.parse(content, { async: false }) as string

  // Strip empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '')

  // Remove duplicate hero image from body
  if (heroImageUrl) {
    const heroBase = heroImageUrl.split('?')[0]
    html = html.replace(/<img[^>]*src="[^"]*"[^>]*>/i, (match: string) => {
      const m = match.match(/src="([^"]*)"/)
      if (m && m[1].split('?')[0] === heroBase) return ''
      return match
    })
  }

  return html
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug)
  if (!article) notFound()

  const related = await getRelatedArticles(article)
  const bodyHtml = renderBody(article.content, article.hero_image_url || article.cover_image_url)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    image: article.hero_image_url || undefined,
    author: { '@type': 'Person', name: article.author_name },
    publisher: {
      '@type': 'Organization',
      name: 'JOBLUX',
      logo: { '@type': 'ImageObject', url: 'https://www.joblux.com/images/joblux-logo.png' },
    },
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    description: article.meta_description || article.excerpt || '',
    articleSection: getCategoryLabel(article.category),
  }

  return (
    <div className="bg-[#1a1a1a] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="relative bg-[#141414] overflow-hidden">
        {article.hero_image_url && (
          <div className="absolute inset-0">
            <Image
              src={article.hero_image_url}
              alt={article.hero_image_alt || article.title}
              fill
              className="object-cover opacity-25"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/70 to-[#141414]/40" />
          </div>
        )}
        <div className="max-w-[1200px] mx-auto px-7 relative z-10 py-14 md:py-20">
          <Link href="/insights" className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] hover:underline transition-colors mb-6 inline-block">&larr; Insights</Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] bg-[rgba(165,142,40,0.1)] border border-[rgba(165,142,40,0.2)] px-2 py-0.5 rounded">{getCategoryLabel(article.category)}</span>
              {article.read_time && <span className="text-[11px] text-[#777]">{article.read_time} min read</span>}
              {article.views_count > 0 && <span className="text-[11px] text-[#777]">{article.views_count} views</span>}
            </div>
            <h1 className="text-4xl font-normal text-white mb-5 leading-tight" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-sm text-[#999] leading-relaxed mb-6 max-w-2xl">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-3">
              {article.author_avatar_url && (
                <Image src={article.author_avatar_url} alt={article.author_name} width={32} height={32} className="rounded-full" />
              )}
              <div>
                <div className="text-xs text-white font-medium">{article.author_name}</div>
                <div className="text-[11px] text-[#777]">
                  {article.author_title || ''} &middot; {formatDate(article.published_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
        {article.hero_image_caption && (
          <div className="absolute bottom-2 right-4 z-10">
            <span className="text-[11px] text-[#777]">{article.hero_image_caption}</span>
          </div>
        )}
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-7 py-10">
        <div className="max-w-[720px] mx-auto">
          <div className="jl-prose-dark" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[#2a2a2a]">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <span key={tag} className="text-[11px] text-[#a58e28] border border-[#2a2a2a] px-2.5 py-1 tracking-wider uppercase">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio Box */}
          <div className="mt-10 pt-6 border-t border-[#2a2a2a]">
            <div className="flex items-start gap-4 p-5 bg-[#222] border border-[#2a2a2a] rounded">
              {article.author_avatar_url ? (
                <Image src={article.author_avatar_url} alt={article.author_name} width={48} height={48} className="rounded-full flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0 rounded">
                  <span className="text-base text-[#a58e28]" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>{article.author_name?.[0]}</span>
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-white">{article.author_name}</div>
                {article.author_title && <div className="text-[11px] text-[#777] mb-2">{article.author_title}</div>}
                <p className="text-xs text-[#999] leading-relaxed">Founder of JOBLUX | Luxury Industry Careers Intelligence. Connecting exceptional talent with the world&rsquo;s most prestigious maisons.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RELATED ARTICLES ──────────────────────────────── */}
      {related.length > 0 && (
        <div className="border-t border-[#2a2a2a]">
          <div className="max-w-[1200px] mx-auto px-7 py-10">
            <p className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28] mb-6">More from Insights</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((a: any) => (
                <Link key={a.id} href={`/insights/${a.slug}`} className="bg-[#222] border border-[#2a2a2a] rounded overflow-hidden group hover:border-[#333] transition-colors">
                  {a.hero_image_url && (
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <Image src={a.hero_image_url} alt={a.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-semibold tracking-[2px] uppercase text-[#a58e28]">{getCategoryLabel(a.category)}</span>
                      {a.read_time && <span className="text-[11px] text-[#777]">{a.read_time} min</span>}
                    </div>
                    <h3 className="text-sm font-normal text-[#ccc] group-hover:text-[#a58e28] transition-colors leading-snug" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>{a.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
