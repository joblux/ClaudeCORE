'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        background: '#1a1a1a',
      }}
    >
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 400,
          color: '#ffffff',
          marginBottom: '0.75rem',
        }}
      >
        Something Went Wrong
      </h1>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.9375rem',
          color: '#999',
          marginBottom: '2rem',
          maxWidth: '400px',
          lineHeight: 1.6,
        }}
      >
        We encountered an unexpected issue. Please try again.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 1.5rem',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: '#ffffff',
            color: '#111',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        <a
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: 'transparent',
            color: '#a58e28',
            border: '1px solid #a58e28',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  )
}
