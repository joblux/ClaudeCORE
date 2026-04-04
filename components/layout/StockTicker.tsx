'use client'

const TICKERS = [
  { name: 'LVMH', ticker: 'MC.PA', price: 642.30, change: +1.24 },
  { name: 'Kering', ticker: 'KER.PA', price: 218.45, change: -0.87 },
  { name: 'Richemont', ticker: 'CFR.SW', price: 143.60, change: +0.53 },
  { name: 'Hermes', ticker: 'RMS.PA', price: 2341.00, change: +0.91 },
  { name: 'Burberry', ticker: 'BRBY.L', price: 842.60, change: -1.32 },
  { name: 'Tapestry', ticker: 'TPR', price: 71.85, change: +0.46 },
]

export function StockTicker() {
  return (
    <div style={{ background: '#141414', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ height: 32, display: 'flex', alignItems: 'center', gap: 28, overflow: 'hidden' }}>
          {TICKERS.map((t) => (
            <div key={t.ticker} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: '#aaa', letterSpacing: '0.02em' }}>{t.ticker}</span>
              <span style={{ fontSize: 12, color: '#e6edf3', fontWeight: 500 }}>{t.price.toFixed(2)}</span>
              <span style={{ fontSize: 11, color: t.change >= 0 ? '#3fb950' : '#f85149', fontWeight: 500 }}>
                {t.change >= 0 ? '+' : ''}{t.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
