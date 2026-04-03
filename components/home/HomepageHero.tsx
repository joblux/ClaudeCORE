import Link from 'next/link'
import Image from 'next/image'

export function HomepageHero({ activeSearchCount }: { activeSearchCount: number }) {
  return (
    <section style={{ padding: '24px 0 0', borderBottom: '0.5px solid #2b2b2b' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.12fr) 360px', gap: 38, alignItems: 'start', paddingBottom: 20 }}>

          {/* Left column */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#a58e28', fontWeight: 700, marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a58e28', flexShrink: 0 }} />
              Luxury Talent Intelligence
            </div>

            <h1 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 'clamp(26px,3.2vw,38px)', lineHeight: 1.08, fontWeight: 400, maxWidth: 560, marginBottom: 12, color: '#fff' }}>
              Signals, salaries, and search <em style={{ color: '#a58e28', fontStyle: 'italic' }}>intelligence.</em>
            </h1>

            <p style={{ maxWidth: 520, fontSize: '13.6px', lineHeight: 1.72, color: '#989898', marginBottom: 18 }}>
              Real compensation data, confidential assignments, and market movement across 179 brands — built to help you make a more informed next move.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              <Link href="/careers" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '0 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: '#a58e28', color: '#171717', textDecoration: 'none' }}>
                Explore careers
              </Link>
              <Link href="/brands" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '0 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: '1px solid #383838', color: '#f0f0f0', textDecoration: 'none' }}>
                Browse brands
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#6f6f6f', fontSize: 12 }}>
              <span>No ads</span><span>&middot;</span><span>No noise</span><span>&middot;</span><span>No data reselling</span>
            </div>
          </div>

          {/* Right column — hero rail */}
          <aside style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.01))', border: '1px solid #2b2b2b', borderRadius: 16, padding: 16, boxShadow: '0 14px 34px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.3px', color: '#a58e28', fontWeight: 700, marginBottom: 8 }}>
              Search
            </div>

            <form action="/brands" method="get">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ebe7df', borderRadius: 10, padding: '13px 14px', marginBottom: 12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#8e8e8e', flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  name="q"
                  placeholder="Brands, salaries, roles..."
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', font: 'inherit', color: '#1e1e1e', fontSize: '13.5px' }}
                />
              </div>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* 179 Brands */}
              <div style={{ background: '#202020', border: '1px solid #2b2b2b', borderRadius: 12, padding: '13px 12px', minHeight: 74, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1, marginBottom: 6, color: '#fff' }}>179</div>
                <div style={{ fontSize: 10, letterSpacing: '1.1px', textTransform: 'uppercase', color: '#6f6f6f' }}>Brands</div>
              </div>

              {/* Active Searches */}
              <div style={{ background: '#202020', border: '1px solid #2b2b2b', borderRadius: 12, padding: '13px 12px', minHeight: 74, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1, marginBottom: 6, color: '#fff' }}>{activeSearchCount}</div>
                <div style={{ fontSize: 10, letterSpacing: '1.1px', textTransform: 'uppercase', color: '#6f6f6f' }}>Active searches</div>
              </div>

              {/* Salary Points */}
              <Link href="/careers" style={{ background: '#202020', border: '1px solid #2b2b2b', borderRadius: 12, padding: '13px 12px', minHeight: 74, display: 'flex', flexDirection: 'column', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.18s ease' }}>
                <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1, marginBottom: 6, color: '#fff' }}>2,400+</div>
                <div style={{ fontSize: 10, letterSpacing: '1.1px', textTransform: 'uppercase', color: '#6f6f6f' }}>Salary points</div>
              </Link>

              {/* Salary Calculator */}
              <Link href="/careers?tab=salaries&view=calculator" style={{ background: '#202020', border: '1px solid #2b2b2b', borderRadius: 12, padding: '13px 12px', minHeight: 74, display: 'flex', flexDirection: 'column', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.18s ease' }}>
                <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1, marginBottom: 6, color: '#fff' }}>Calculator</div>
                <div style={{ fontSize: 10, letterSpacing: '1.1px', textTransform: 'uppercase', color: '#6f6f6f' }}>Salary calculator</div>
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </section>
  )
}
