export default function ProfileNotFound() {
  return (
    <div
      style={{
        background: '#1a1a1a',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4rem 1.5rem 3rem',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 400,
            fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
            color: '#ffffff',
            margin: 0,
            textAlign: 'center',
          }}
        >
          This profile is unavailable.
        </h1>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '2rem',
          textAlign: 'center',
        }}
      >
        <img
          src="/logos/joblux-header.png"
          alt="JOBLUX"
          style={{ height: '22px', width: 'auto', marginBottom: '4px', opacity: 0.95 }}
        />
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#8e8e8e',
          }}
        >
          Luxury talent intelligence
        </div>

        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontSize: '13px',
            color: '#a58e28',
            marginTop: '2px',
          }}
        >
          Luxury, decoded.
        </div>

        <a
          href="https://www.joblux.com"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            color: '#8f8f8f',
            textDecoration: 'none',
            marginTop: '6px',
          }}
        >
          www.joblux.com
        </a>
      </div>
    </div>
  )
}
