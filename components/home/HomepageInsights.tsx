import Link from 'next/link'

interface Article {
  slug: string
  title: string
  category: string | null
  read_time_minutes: number | null
  published_at: string | null
  cover_image_url: string | null
}

function formatDate(d: string | null): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function HomepageInsights({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null

  return (
    <section style={{ padding: '44px 0', borderTop: '0.5px solid #2b2b2b' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, color: '#fff' }}>
              Latest Insights
            </div>
            <p style={{ marginTop: 6, color: '#bbb', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
              Editorial analysis, research, and career intelligence.
            </p>
          </div>
          <Link href="/insights" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            All insights &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.map(article => (
            <Link key={article.slug} href={`/insights/${article.slug}`} className="group cursor-pointer">
              <div className="bg-[#222] border border-[#2a2a2a] rounded-lg h-44 mb-3 overflow-hidden relative">
                {article.cover_image_url && (
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              {article.category && (
                <div className="text-[10px] font-semibold tracking-[1.5px] text-[#a58e28] mb-1 uppercase">
                  {article.category}
                </div>
              )}
              <h3
                className="text-sm font-normal text-[#e0e0e0] leading-snug mb-2 group-hover:text-white transition-colors"
                style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                {article.title}
              </h3>
              <div className="flex gap-2 text-[11px] text-[#999]">
                {article.published_at && <span>{formatDate(article.published_at)}</span>}
                {article.published_at && article.read_time_minutes && <span>&middot;</span>}
                {article.read_time_minutes && <span>{article.read_time_minutes} min read</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
