'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface TickerArticle {
  title: string
  slug: string
  category: string
}

export function Ticker() {
  const [articles, setArticles] = useState<TickerArticle[]>([])

  useEffect(() => {
    async function fetchTicker() {
      // Try featured articles first
      const { data: featured } = await supabase
        .from('bloglux_articles')
        .select('title, slug, category')
        .eq('status', 'published')
        .eq('featured_homepage', true)
        .order('published_at', { ascending: false })
        .limit(8)

      if (featured && featured.length > 0) {
        setArticles(featured)
        return
      }

      // Fallback: most recent published
      const { data: recent } = await supabase
        .from('bloglux_articles')
        .select('title, slug, category')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(8)

      setArticles(recent || [])
    }
    fetchTicker()
  }, [])

  if (articles.length === 0) return null

  // Duplicate for seamless loop
  const items = [...articles, ...articles]

  return (
    <div className="jl-ticker">
      <div className="jl-ticker-track">
        {items.map((item, i) => (
          <span key={i} className="contents">
            <Link href={`/bloglux/${item.slug}`} className="jl-ticker-item">
              <em>{item.category}</em>
              <span>{item.title}</span>
            </Link>
            <span className="jl-ticker-dot">&middot;</span>
          </span>
        ))}
      </div>
    </div>
  )
}
