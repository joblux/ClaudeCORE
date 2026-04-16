"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          backgroundColor: '#1a1a1a',
          color: '#fff',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '1rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>
              Our team has been notified. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#ffffff',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 2rem',
                fontSize: '0.875rem',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
