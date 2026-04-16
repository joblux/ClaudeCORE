import Link from 'next/link'

export default function NotFound() {
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
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.6875rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#a58e28',
          marginBottom: '1rem',
        }}
      >
        404
      </p>
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
          fontWeight: 400,
          color: '#ffffff',
          marginBottom: '0.75rem',
        }}
      >
        Page Not Found
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
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          padding: '0.75rem 1.5rem',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.6875rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          background: '#ffffff',
          color: '#111',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        Return to JOBLUX
      </Link>
    </div>
  )
}
