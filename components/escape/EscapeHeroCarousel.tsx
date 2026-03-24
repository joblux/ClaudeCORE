'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

export default function EscapeHeroCarousel({ articles }: { articles: Article[] }) {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const total = articles.length

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (progressRef.current) clearInterval(progressRef.current)

    setProgress(0)
    const startTime = Date.now()

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      setProgress(Math.min((elapsed / 5000) * 100, 100))
    }, 30)

    timerRef.current = setTimeout(() => {
      setActive(prev => (prev + 1) % total)
    }, 5000)
  }, [total])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [active, startTimer])

  const goTo = (index: number) => {
    setActive(index)
  }

  if (articles.length === 0) return null

  return (
    <div
      className="relative w-full overflow-hidden h-[220px] md:h-[320px]"
      style={{ borderRadius: 10 }}
    >
      {/* Slides */}
      {articles.map((article, i) => (
        <Link
          key={article.id}
          href={`/escape/blog/${article.slug}`}
          className="absolute inset-0 block"
          style={{
            opacity: i === active ? 1 : 0,
            transition: 'opacity 1s ease',
            pointerEvents: i === active ? 'auto' : 'none',
          }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: article.featured_image
                ? `url(${article.featured_image})`
                : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 60%)' }}
          />
          {/* Text content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
            {article.tag && (
              <p
                className="uppercase mb-2"
                style={{ fontSize: 10.5, letterSpacing: 2.5, color: '#B8975C' }}
              >
                {article.tag}
              </p>
            )}
            <h2
              className="text-white mb-2"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 34,
                lineHeight: 1.15,
              }}
            >
              {article.title}
            </h2>
            {article.excerpt && (
              <p
                className="text-white line-clamp-2 hidden sm:block"
                style={{ fontSize: 14, opacity: 0.82, maxWidth: 560 }}
              >
                {article.excerpt}
              </p>
            )}
          </div>
        </Link>
      ))}

      {/* Navigation dots */}
      {total > 1 && (
        <div className="absolute bottom-4 right-5 flex items-center gap-2 z-10">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); goTo(i) }}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === active ? 22 : 7,
                height: 7,
                borderRadius: 9999,
                backgroundColor: i === active ? '#B8975C' : 'rgba(255,255,255,0.35)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10" style={{ height: 2.5 }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#B8975C',
            transition: 'width 30ms linear',
          }}
        />
      </div>
    </div>
  )
}
