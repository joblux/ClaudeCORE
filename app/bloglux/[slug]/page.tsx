import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
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
  if (!article) return { title: 'Article Not Found — BlogLux' }

  const ogImage = article.og_image_url || article.hero_image_url ||
    `/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(getCategoryLabel(article.category))}&type=article`

  return {
    title: `${article.title} | BlogLux — JOBLUX`,
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

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug)
  if (!article) notFound()

  const related = await getRelatedArticles(article)

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
    <div className="bg-[#f5f4f0] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="relative bg-[#222222] overflow-hidden">
        {article.hero_image_url && (
          <div className="absolute inset-0">
            <Image
              src={article.hero_image_url}
              alt={article.hero_image_alt || article.title}
              fill
              className="object-cover opacity-30"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#222222]/70 to-[#222222]/40" />
          </div>
        )}
        <div className="jl-container relative z-10 py-14 md:py-20">
          <Link href="/bloglux" className="jl-overline text-[#888] hover:text-[#a58e28] transition-colors mb-6 inline-block">&larr; BlogLux</Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="jl-badge-gold text-[0.55rem]">{getCategoryLabel(article.category)}</span>
              {article.read_time && <span className="font-sans text-[0.6rem] text-[#888]">{article.read_time} min read</span>}
              {article.views_count > 0 && <span className="font-sans text-[0.6rem] text-[#666]">{article.views_count} views</span>}
            </div>
            <h1 className="jl-serif text-3xl md:text-[3rem] font-light text-white mb-5 leading-tight">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="font-sans text-sm text-[#aaa] leading-relaxed mb-6 max-w-2xl">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-3">
              {article.author_avatar_url && (
                <Image src={article.author_avatar_url} alt={article.author_name} width={32} height={32} className="rounded-full" />
              )}
              <div>
                <div className="font-sans text-xs text-white font-medium">{article.author_name}</div>
                <div className="font-sans text-[0.6rem] text-[#888]">
                  {article.author_title || ''} &middot; {formatDate(article.published_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
        {article.hero_image_caption && (
          <div className="absolute bottom-2 right-4 z-10">
            <span className="text-[0.55rem] text-[#666]">{article.hero_image_caption}</span>
          </div>
        )}
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="jl-container py-10">
        <div className="max-w-[720px] mx-auto">
          <div className="jl-prose" dangerouslySetInnerHTML={{ __html: article.content }} />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[#e8e2d8]">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <span key={tag} className="font-sans text-[0.6rem] text-[#a58e28] border border-[#e8e2d8] px-2.5 py-1 tracking-wider uppercase">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio Box */}
          <div className="mt-10 pt-6 border-t border-[#e8e2d8]">
            <div className="flex items-start gap-4 p-5 bg-[#fafaf5] border border-[#e8e2d8]">
              {article.author_avatar_url ? (
                <Image src={article.author_avatar_url} alt={article.author_name} width={48} height={48} className="rounded-full flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                  <span className="jl-serif text-base text-[#a58e28]">{article.author_name?.[0]}</span>
                </div>
              )}
              <div>
                <div className="font-sans text-sm font-semibold text-[#1a1a1a]">{article.author_name}</div>
                {article.author_title && <div className="font-sans text-[0.65rem] text-[#888] mb-2">{article.author_title}</div>}
                <p className="font-sans text-xs text-[#888] leading-relaxed">Founder of JOBLUX | Luxury Industry Careers Intelligence. Connecting exceptional talent with the world&rsquo;s most prestigious maisons.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RELATED ARTICLES ──────────────────────────────── */}
      {related.length > 0 && (
        <div className="border-t border-[#e8e2d8]">
          <div className="jl-container py-10">
            <div className="jl-section-label"><span>More from BlogLux</span></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((a: any) => (
                <Link key={a.id} href={`/bloglux/${a.slug}`} className="jl-card group">
                  {a.hero_image_url && (
                    <div className="aspect-[16/9] relative -mx-[1rem] -mt-[1rem] mb-3 overflow-hidden">
                      <Image src={a.hero_image_url} alt={a.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="jl-overline-gold">{getCategoryLabel(a.category)}</span>
                    {a.read_time && <span className="font-sans text-[0.6rem] text-[#bbb]">{a.read_time} min</span>}
                  </div>
                  <h3 className="jl-serif text-base font-light text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors leading-snug">{a.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
