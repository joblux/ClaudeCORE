import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JOBLUX | Coming Soon',
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(12px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              @keyframes shimmer {
                0%   { opacity: 0.4; }
                50%  { opacity: 1; }
                100% { opacity: 0.4; }
              }
              @keyframes glow {
                0%   { box-shadow: 0 0 4px rgba(165,142,40,0.2); }
                50%  { box-shadow: 0 0 12px rgba(165,142,40,0.5); }
                100% { box-shadow: 0 0 4px rgba(165,142,40,0.2); }
              }
              .fade-in        { animation: fadeIn 1.4s ease-out both; }
              .fade-in-delay  { animation: fadeIn 1.4s ease-out 0.3s both; }
              .fade-in-delay2 { animation: fadeIn 1.4s ease-out 0.6s both; }
              .fade-in-delay3 { animation: fadeIn 1.4s ease-out 0.9s both; }
              .gold-shimmer   { animation: shimmer 3s ease-in-out infinite; }
              .gold-glow      { animation: glow 3s ease-in-out infinite; }
              .social-link    { color: #a58e28; transition: opacity 0.2s; }
              .social-link:hover { opacity: 0.7; }
            `,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          color: '#ffffff',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background gradient */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(165,142,40,0.06) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
          }}
        >
          {/* Logo */}
          <div className="fade-in">
            <h1
              style={{
                fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 400,
                letterSpacing: '0.35em',
                color: '#a58e28',
                margin: 0,
                textTransform: 'uppercase',
              }}
            >
              JOBLUX
            </h1>
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(0.75rem, 2vw, 0.9375rem)',
                fontWeight: 400,
                color: '#fafaf5',
                letterSpacing: '0.15em',
                marginTop: '0.5rem',
                opacity: 0.8,
              }}
            >
              Luxury Industry Careers Intelligence
            </p>
          </div>

          {/* Gold divider */}
          <div
            className="fade-in-delay gold-glow"
            style={{
              width: '200px',
              height: '1px',
              background: '#a58e28',
              margin: '2.5rem auto',
            }}
          />

          {/* Main message */}
          <div className="fade-in-delay">
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                fontWeight: 400,
                lineHeight: 1.3,
                color: '#ffffff',
                margin: 0,
              }}
            >
              We&rsquo;re Crafting Something Exceptional
            </h2>
          </div>

          {/* Subtext */}
          <div className="fade-in-delay2">
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(0.8125rem, 2vw, 0.9375rem)',
                color: '#999999',
                lineHeight: 1.6,
                marginTop: '1.25rem',
              }}
            >
              Our society is being refined. We&rsquo;ll be back shortly.
            </p>
          </div>

          {/* Gold divider 2 */}
          <div
            className="fade-in-delay2 gold-shimmer"
            style={{
              width: '80px',
              height: '1px',
              background: '#a58e28',
              margin: '2.5rem auto',
            }}
          />

          {/* Social links */}
          <div
            className="fade-in-delay3"
            style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}
          >
            <a
              href="https://www.linkedin.com/company/joblux"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="social-link"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/joblux"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="social-link"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div
          className="fade-in-delay3"
          style={{
            position: 'fixed',
            bottom: '2rem',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            color: '#555555',
            letterSpacing: '0.05em',
          }}
        >
          &copy; 2026 JOBLUX
        </div>
      </body>
    </html>
  )
}
