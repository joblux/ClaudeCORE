'use client'

import { useState, useEffect, useCallback } from 'react'

interface Photo {
  id: string
  url: string
  caption: string | null
  credit: string | null
}

export default function HotelGallery({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const open = (index: number) => setLightbox(index)
  const close = () => setLightbox(null)
  const prev = useCallback(() => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null), [photos.length])
  const next = useCallback(() => setLightbox(i => i !== null ? (i + 1) % photos.length : null), [photos.length])

  // Keyboard navigation
  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightbox, prev, next])

  // Swipe support
  const [touchStart, setTouchStart] = useState(0)
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev()
    }
  }

  if (photos.length === 0) return null

  const currentPhoto = lightbox !== null ? photos[lightbox] : null

  return (
    <>
      {/* Gallery grid */}
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: 8 }}>
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => open(i)}
            className="relative overflow-hidden block w-full"
            style={{ borderRadius: 4, aspectRatio: '4/3' }}
          >
            <img
              src={photo.url}
              alt={photo.caption || ''}
              loading={i > 2 ? 'lazy' : undefined}
              className="w-full h-full transition-transform duration-300 hover:scale-[1.02]"
              style={{ objectFit: 'cover' }}
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && currentPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
          onClick={close}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors"
            style={{ width: 44, height: 44, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              style={{ width: 44, height: 44, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ‹
            </button>
          )}

          {/* Image + caption */}
          <div className="flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img
              src={currentPhoto.url}
              alt={currentPhoto.caption || ''}
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 4 }}
            />
            <div className="mt-3 text-center">
              {currentPhoto.caption && (
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{currentPhoto.caption}</p>
              )}
              {currentPhoto.credit && (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{currentPhoto.credit}</p>
              )}
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
                {lightbox + 1} / {photos.length}
              </p>
            </div>
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              style={{ width: 44, height: 44, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  )
}
