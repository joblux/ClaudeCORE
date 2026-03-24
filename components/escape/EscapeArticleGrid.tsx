'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string
  tag?: string
  featured_image?: string
  read_time?: string
}

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
          }, index * 120)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  return (
    <Link
      ref={ref}
      href={`/escape/blog/${article.slug}`}
      className="block"
      style={{
        backgroundColor: '#FFFDF7',
        border: '1px solid #E0D9CA',
        borderRadius: 10,
        overflow: 'hidden',
        opacity: 0,
        transform: 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.35s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Image */}
      <div
        className="relative"
        style={{
          height: 140,
          backgroundImage: article.featured_image
            ? `url(${article.featured_image})`
            : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {article.tag && (
          <span
            className="absolute uppercase"
            style={{
              top: 10,
              left: 10,
              fontSize: 9,
              letterSpacing: 1.2,
              color: '#fff',
              backgroundColor: 'rgba(184,151,92,0.88)',
              borderRadius: 4,
              padding: '3px 10px',
              fontWeight: 600,
            }}
          >
            {article.tag}
          </span>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <h3
          className="line-clamp-2"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 16,
            color: '#1A1A1A',
            lineHeight: 1.3,
            marginBottom: 6,
          }}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="line-clamp-2" style={{ fontSize: 12.5, color: '#888', marginBottom: 6 }}>
            {article.excerpt}
          </p>
        )}
        {article.read_time && (
          <p style={{ fontSize: 10.5, color: '#bbb' }}>{article.read_time}</p>
        )}
      </div>
    </Link>
  )
}

function MoreItem({ article, index }: { article: Article; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
          }, index * 120)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  return (
    <Link
      ref={ref}
      href={`/escape/blog/${article.slug}`}
      className="flex gap-4 py-4 border-b hover:opacity-80 transition-opacity"
      style={{
        borderColor: '#E0D9CA',
        opacity: 0,
        transform: 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div
        className="flex-shrink-0"
        style={{
          width: 120,
          height: 80,
          borderRadius: 8,
          backgroundImage: article.featured_image
            ? `url(${article.featured_image})`
            : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="flex flex-col justify-center min-w-0">
        <h3
          className="line-clamp-2"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 15,
            color: '#1A1A1A',
            lineHeight: 1.3,
          }}
        >
          {article.title}
        </h3>
        {article.read_time && (
          <p className="mt-1" style={{ fontSize: 10.5, color: '#bbb' }}>{article.read_time}</p>
        )}
      </div>
    </Link>
  )
}

export default function EscapeArticleGrid({ articles }: { articles: Article[] }) {
  const gridArticles = articles.slice(0, 4)
  const moreArticles = articles.slice(4)

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <p style={{ fontSize: 14, color: '#999' }}>Stories coming soon.</p>
      </div>
    )
  }

  return (
    <>
      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 18 }}>
        {gridArticles.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
      </div>

      {/* More this month */}
      {moreArticles.length > 0 && (
        <div className="mt-12">
          <p
            className="uppercase mb-4"
            style={{ fontSize: 10.5, letterSpacing: 2.2, color: '#B8975C' }}
          >
            More this month
          </p>
          <div>
            {moreArticles.map((article, i) => (
              <MoreItem key={article.id} article={article} index={i} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
