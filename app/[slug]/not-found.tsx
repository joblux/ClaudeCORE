export default function ProfileNotFound() {
  const outerStyle = { background: '#1a1a1a', minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'space-between', padding: '6rem 1.5rem 4rem', fontFamily: "'Inter', sans-serif" }
  const headlineWrap = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }
  const headline = { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)', color: '#ffffff', margin: 0, textAlign: 'center' as const, lineHeight: 1.2 }
  const signoff = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '10px', textAlign: 'center' as const }
  const logo = { height: '36px', width: 'auto', marginBottom: '6px', opacity: 0.95 }
  const eyebrow = { fontFamily: "'Inter', sans-serif", fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#8e8e8e' }
  const italic = { fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' as const, fontSize: '15px', color: '#a58e28', marginTop: '4px' }
  const domainLink = { fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#8f8f8f', textDecoration: 'none', marginTop: '10px' }

  return (
    <div style={outerStyle}>
      <div style={headlineWrap}>
        <h1 style={headline}>This profile is unavailable.</h1>
      </div>

      <div style={signoff}>
        <img src="/logos/joblux-header.png" alt="JOBLUX" style={logo} />
        <div style={eyebrow}>Luxury talent intelligence</div>
        <div style={italic}>Luxury, decoded.</div>
        <a href="https://www.joblux.com" style={domainLink}>www.joblux.com</a>
      </div>
    </div>
  )
}
