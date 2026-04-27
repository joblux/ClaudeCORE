import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer style={{ borderTop: '0.5px solid #2b2b2b', paddingTop: 54 }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 1fr 1fr', gap: 40, marginBottom: 42 }}>

          <div>
            <div style={{ marginBottom: 12 }}>
              <Image src="/logos/joblux-header.png" alt="JOBLUX" width={88} height={22} style={{ height: 22, width: 'auto' }} />
            </div>
            <div style={{ marginTop: 18, fontSize: '12.5px', lineHeight: 1.8, color: '#999' }}>
              No ads.<br />No noise.<br />No data reselling.
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fff', marginBottom: 18 }}>Intelligence</h4>
            <Link href="/brands" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Brands</Link>
            <Link href="/signals" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Signals</Link>
            <Link href="/insights" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Industry news &amp; analysis</Link>
            <Link href="/the-brief" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Biweekly newsletter</Link>
            <Link href="/careers?tab=interview-experiences" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Interview experiences</Link>
            <Link href="/careers" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Careers intelligence</Link>
          </div>

          <div>
            <h4 style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fff', marginBottom: 18 }}>Services</h4>
            <Link href="/services/recruitment" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Talent Search</Link>
            <Link href="/contribute" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Contribute data</Link>
            <Link href="/connect" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Request access</Link>
            <div style={{ marginTop: 40 }}>
              <Link href="/escape" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontStyle: 'italic', fontSize: 18, color: '#a58e28', display: 'inline-block', marginBottom: 6, textDecoration: 'none' }}>
                Escape
              </Link>
              <div>
                <span style={{ display: 'inline-block', border: '1px solid #333', borderRadius: 2, padding: '4px 10px', fontSize: '12px', color: '#fff' }}>
                  Curated travels.
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fff', marginBottom: 18 }}>Company</h4>
            <Link href="/about" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>About</Link>
            <Link href="/faq" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Help &amp; FAQ</Link>
            <Link href="/privacy" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Terms</Link>
            <Link href="/faq" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Contact</Link>
          </div>

        </div>

        <div style={{ borderTop: '0.5px solid #2b2b2b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '18px 0' }}>
          <div style={{ fontSize: 11, color: '#595959' }}>&copy; 2026 JOBLUX LLC.</div>
          <div style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontStyle: 'italic', color: '#8f8f8f', fontSize: '12.5px' }}>Luxury, decoded.</div>
        </div>
      </div>
    </footer>
  )
}
