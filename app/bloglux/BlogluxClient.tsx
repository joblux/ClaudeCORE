'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BLOGLUX_CATEGORIES, getCategoryLabel } from '@/lib/bloglux-options'

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string
  author_name: string
  published_at: string | null
  read_time: number | null
  tags: string[]
  hero_image_url: string | null
  hero_image_alt: string | null
  is_featured: boolean
  views_count: number | null
}

const formatDate = (d: string | null) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const truncate = (text: string, max: number) => {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '...'
}

export default function BlogluxClient({ initialArticles }: { initialArticles: Article[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeCategory = searchParams.get('category') || 'All'

  const handleCategoryChange = (cat: string) => {
    if (cat === 'All') {
      router.push('/bloglux')
    } else {
      router.push(`/bloglux?category=${encodeURIComponent(cat)}`)
    }
  }

  const filtered = activeCategory === 'All'
    ? initialArticles
    : initialArticles.filter((a) => a.category === activeCategory)

  // Determine the featured/hero article
  const featuredArticle = filtered.find((a) => a.is_featured) || filtered[0] || null
  const remainingArticles = filtered.filter((a) => a.id !== featuredArticle?.id)

  return (
    <div>
      {/* Page header */}
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Bloglux</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
            Bloglux
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-xl">
            Luxury industry intelligence, career insights and market analysis.
          </p>
        </div>
      </div>

      <div className="jl-container py-10">
        {/* Category filter pills */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`font-sans text-[0.65rem] font-medium tracking-wider uppercase px-3 py-1.5 border transition-colors ${
              activeCategory === 'All'
                ? 'border-[#a58e28] text-[#a58e28]'
                : 'border-[#e8e2d8] text-[#888] hover:border-[#aaa] hover:text-[#555]'
            }`}
          >
            All
          </button>
          {BLOGLUX_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`font-sans text-[0.65rem] font-medium tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                activeCategory === cat.value
                  ? 'border-[#a58e28] text-[#a58e28]'
                  : 'border-[#e8e2d8] text-[#888] hover:border-[#aaa] hover:text-[#555]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="jl-serif text-xl font-light text-[#1a1a1a] mb-2">Articles coming soon</p>
            <p className="font-sans text-sm text-[#888]">
              Luxury industry intelligence, powered by the JOBLUX editorial team.
            </p>
          </div>
        ) : (
          <>
            {/* Featured hero section */}
            {featuredArticle && (
              <Link
                href={`/bloglux/${featuredArticle.slug}`}
                className="block mb-10 group"
              >
                <div className="relative w-full aspect-[16/7] overflow-hidden">
                  {featuredArticle.hero_image_url ? (
                    <>
                      <Image
                        src={featuredArticle.hero_image_url}
                        alt={featuredArticle.hero_image_alt || featuredArticle.title}
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/45" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-[#1a1a1a]" />
                  )}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                    <span className="jl-badge bg-[#a58e28] text-white text-[0.6rem] uppercase tracking-widest px-3 py-1 w-fit mb-3">
                      {getCategoryLabel(featuredArticle.category)}
                    </span>
                    <h2
                      className="jl-serif text-2xl md:text-4xl lg:text-5xl font-light text-white mb-3 leading-tight max-w-3xl group-hover:text-[#d4c06a] transition-colors"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {featuredArticle.title}
                    </h2>
                    {featuredArticle.excerpt && (
                      <p className="font-sans text-sm text-white/80 max-w-2xl mb-4 leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-white/60 font-sans text-[0.65rem] tracking-wide">
                      <span>{featuredArticle.author_name}</span>
                      {featuredArticle.read_time && (
                        <span>{featuredArticle.read_time} min read</span>
                      )}
                      <span>{formatDate(featuredArticle.published_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Article grid */}
            {remainingArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {remainingArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/bloglux/${article.slug}`}
                    className="jl-card group flex flex-col overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-[16/9] overflow-hidden mb-4">
                      {article.hero_image_url ? (
                        <Image
                          src={article.hero_image_url}
                          alt={article.hero_image_alt || article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#f5f0e8]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 px-1">
                      <span className="jl-badge text-[0.6rem] uppercase tracking-widest text-[#a58e28] border border-[#a58e28] px-2 py-0.5 w-fit mb-3">
                        {getCategoryLabel(article.category)}
                      </span>
                      <h3 className="jl-serif text-lg font-light text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors leading-snug">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="font-sans text-xs text-[#888] leading-relaxed mb-4 flex-1">
                          {truncate(article.excerpt, 120)}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f0ece4]">
                        <span className="font-sans text-[0.6rem] text-[#aaa]">{article.author_name}</span>
                        <div className="flex items-center gap-3">
                          {article.read_time && (
                            <span className="font-sans text-[0.6rem] text-[#bbb]">{article.read_time} min read</span>
                          )}
                          <span className="font-sans text-[0.6rem] text-[#aaa]">{formatDate(article.published_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
