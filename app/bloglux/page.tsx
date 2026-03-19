'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const categories = ['All', 'Fashion', 'Watches', 'Hospitality', 'Career', 'Markets', 'Industry']

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string
  author_name: string
  published_at: string | null
  read_time: number | null
  tags: string[]
}

export default function BlogluxPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    supabase
      .from('articles')
      .select('id, title, slug, excerpt, category, author_name, published_at, read_time, tags')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setArticles(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = activeCategory === 'All'
    ? articles
    : articles.filter((a) => a.category.toLowerCase() === activeCategory.toLowerCase())

  const formatDate = (d: string | null) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div>
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

        {/* Category pills */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-sans text-[0.65rem] font-medium tracking-wider uppercase px-3 py-1.5 border transition-colors ${
                activeCategory === cat
                  ? 'border-[#a58e28] text-[#a58e28]'
                  : 'border-[#e8e2d8] text-[#888] hover:border-[#aaa] hover:text-[#555]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="font-sans text-sm text-[#888]">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="jl-serif text-xl font-light text-[#1a1a1a] mb-2">Articles coming soon</p>
            <p className="font-sans text-sm text-[#888]">
              Luxury industry intelligence, powered by the JOBLUX editorial team.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <Link
                key={article.id}
                href={`/bloglux/${article.slug}`}
                className="jl-card group flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="jl-overline-gold">{article.category}</span>
                  {article.read_time && (
                    <span className="font-sans text-[0.6rem] text-[#bbb]">{article.read_time} min read</span>
                  )}
                </div>
                <h2 className="jl-serif text-lg font-light text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors leading-snug">
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="font-sans text-xs text-[#888] leading-relaxed mb-4 flex-1">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f0ece4]">
                  <span className="font-sans text-[0.6rem] text-[#aaa]">{article.author_name}</span>
                  <span className="font-sans text-[0.6rem] text-[#aaa]">{formatDate(article.published_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
