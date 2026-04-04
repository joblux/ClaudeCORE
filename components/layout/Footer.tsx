import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer style={{ borderTop: '0.5px solid #2b2b2b', paddingTop: 54 }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 1fr 1fr', gap: 40, marginBottom: 42 }}>

          {/* Col 1 — Brand */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <Image src="/logos/joblux-header.png" alt="JOBLUX" width={88} height={22} style={{ height: 22, width: 'auto' }} />
            </div>
            <div style={{ fontSize: 13, color: '#989898', marginTop: 12 }}>Luxury Talent Intelligence</div>
            <div style={{ marginTop: 18, fontSize: '12.5px', lineHeight: 1.8, color: '#6f6f6f' }}>
              No ads.<br />No noise.<br />No data reselling.<br />Global.
            </div>
            <div style={{ marginTop: 18, fontSize: 11, lineHeight: 1.55, color: '#595959' }}>
              Powered by industry professionals.
            </div>
          </div>

          {/* Col 2 — Intelligence */}
          <div>
            <h4 style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#5f5f5f', marginBottom: 18 }}>Intelligence</h4>
            <Link href="/brands" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Brands</Link>
            <Link href="/signals" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Signals</Link>
            <Link href="/insights" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Industry news &amp; analysis</Link>
            <Link href="/the-brief" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Biweekly newsletter</Link>
            <Link href="/interviews" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Interview experiences</Link>
            <Link href="/careers" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Careers intelligence</Link>
          </div>

          {/* Col 3 — Services + Escape */}
          <div>
            <h4 style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#5f5f5f', marginBottom: 18 }}>Services</h4>
            <Link href="/services/recruitment" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Talent Search</Link>
            <Link href="/contribute" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Contribute data</Link>
            <Link href="/connect" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Request access</Link>

            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '0.5px solid #2b2b2b' }}>
              <Link href="/escape" style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontStyle: 'italic', fontSize: 18, color: '#a58e28', display: 'inline-block', marginBottom: 8, textDecoration: 'none' }}>
                Escape
              </Link>
              <div style={{ fontSize: '12.5px', color: '#737373', lineHeight: 1.6, maxWidth: 190 }}>
                Curated travels.
              </div>
            </div>
          </div>

          {/* Col 4 — Company */}
          <div>
            <h4 style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#5f5f5f', marginBottom: 18 }}>Company</h4>
            <Link href="/about" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>About</Link>
            <Link href="/faq" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Help &amp; FAQ</Link>
            <Link href="/privacy" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Terms</Link>
            <Link href="/contact" style={{ display: 'block', fontSize: 13, color: '#8e8e8e', marginBottom: 12, textDecoration: 'none' }}>Contact</Link>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '0.5px solid #2b2b2b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '18px 0' }}>
          <div style={{ fontSize: 11, color: '#595959' }}>&copy; 2026 JOBLUX LLC.</div>
          <div style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontStyle: 'italic', color: '#8f8f8f', fontSize: '12.5px' }}>Luxury, decoded.</div>
        </div>
      </div>
    </footer>
  )
}
