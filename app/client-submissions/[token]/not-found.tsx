export default function ClientSubmissionNotFound() {
  const outerStyle = { background: '#faf7f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'space-between', padding: '6rem 1.5rem 4rem', fontFamily: "'Inter', sans-serif" }
  const headlineWrap = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }
  const headline = { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)', color: '#1a1a1a', margin: 0, textAlign: 'center' as const, lineHeight: 1.2 }
  const signoff = { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '10px', textAlign: 'center' as const }
  const logo = { height: '36px', width: 'auto', marginBottom: '6px', marginLeft: '30px' }
  const eyebrow = { fontFamily: "'Inter', sans-serif", fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#888' }
  const domainLink = { fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#888', textDecoration: 'none', marginTop: '10px' }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="referrer" content="no-referrer" />
      <div style={outerStyle}>
        <div style={headlineWrap}>
          <h1 style={headline}>This submission could not be found.</h1>
        </div>
        <div style={signoff}>
          <img src="/logos/joblux-gold.svg" alt="JOBLUX" style={logo} />
          <div style={eyebrow}>Luxury talent intelligence</div>
          <a href="https://www.joblux.com" style={domainLink}>www.joblux.com</a>
        </div>
      </div>
    </>
  )
}
