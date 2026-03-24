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
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedAtRef = useRef<number>(0)
  const total = articles.length

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
  }, [])

  const startTimer = useCallback((remainingMs?: number) => {
    clearTimers()
    const duration = remainingMs ?? 5000
    startTimeRef.current = Date.now()
    const baseProgress = remainingMs ? ((5000 - duration) / 5000) * 100 : 0

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      setProgress(Math.min(baseProgress + (elapsed / 5000) * 100, 100))
    }, 30)

    timerRef.current = setTimeout(() => {
      setActive(prev => (prev + 1) % total)
    }, duration)
  }, [total, clearTimers])

  useEffect(() => {
    if (!paused) {
      startTimer()
    }
    return clearTimers
  }, [active, startTimer, clearTimers, paused])

  const handleMouseEnter = useCallback(() => {
    setPaused(true)
    pausedAtRef.current = Date.now()
    clearTimers()
  }, [clearTimers])

  const handleMouseLeave = useCallback(() => {
    setPaused(false)
    const elapsed = pausedAtRef.current - startTimeRef.current
    const remaining = Math.max(5000 - elapsed, 500)
    startTimer(remaining)
  }, [startTimer])

  const goTo = (index: number) => {
    setActive(index)
    setPaused(false)
  }

  if (articles.length === 0) return null

  return (
    <>
      <style>{`
        .escape-hero-carousel { aspect-ratio: 16 / 9; }
        @media (min-width: 768px) {
          .escape-hero-carousel { aspect-ratio: 2.2 / 1; }
        }
      `}</style>
      <div
        className="escape-hero-carousel relative w-full overflow-hidden"
        style={{ borderRadius: 10 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }}
          />
          {/* Text content */}
          <div className="absolute bottom-0 left-0 right-0" style={{ padding: '28px 32px', maxWidth: 560 }}>
            {article.tag && (
              <p
                className="uppercase mb-2"
                style={{ fontSize: 10.5, letterSpacing: 2.5, color: '#B8975C' }}
              >
                {article.tag}
              </p>
            )}
            <h2
              className="text-white mb-2 text-[28px] md:text-[34px]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                lineHeight: 1.15,
              }}
            >
              {article.title}
            </h2>
            {article.excerpt && (
              <p
                className="text-white line-clamp-2 hidden sm:block text-[13px] md:text-[14px]"
                style={{ opacity: 0.82 }}
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
    </>
  )
}
