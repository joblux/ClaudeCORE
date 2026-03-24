import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'April Knows Better — Travel Intelligence | JOBLUX Escape',
  description: 'Where to travel in April 2026. Cherry blossoms in Japan, spring in Morocco, green season safaris in Kenya. Curated by your private travel advisor.',
  openGraph: {
    title: 'April Knows Better — JOBLUX Escape',
    description: 'Where to travel in April 2026. Curated travel intelligence from your private advisor.',
    type: 'website',
  },
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function EscapePage() {
  // Fetch current edition
  const { data: edition } = await supabase
    .from('escape_editions')
    .select('*')
    .eq('is_current', true)
    .single()

  // Fetch published articles for this edition
  const { data: articles } = edition
    ? await supabase
        .from('escape_articles')
        .select('*')
        .eq('edition_id', edition.id)
        .eq('published', true)
        .order('published_at', { ascending: false })
    : { data: [] }

  const allArticles = articles || []

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'JOBLUX Escape',
            description: 'Curated travel intelligence',
            url: 'https://joblux.com/escape',
          }),
        }}
      />

      {/* ── HERO ── */}
      {edition && (
        <div
          className="relative w-full"
          style={{
            height: 340,
            backgroundImage: edition.hero_image ? `url(${edition.hero_image})` : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.6) 100%)' }}
          />
          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-6 h-full">
            <div className="absolute bottom-0 pb-8">
              <p
                className="uppercase mb-3"
                style={{ fontSize: 11, letterSpacing: 3, color: '#B8975C' }}
              >
                Escape · {edition.month} {edition.year}
              </p>
              <h1
                className="text-white mb-3"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 42,
                  lineHeight: 1.15,
                }}
              >
                {edition.title}
              </h1>
              {edition.intro && (
                <p className="text-white" style={{ fontSize: 15, opacity: 0.85, maxWidth: 520 }}>
                  {edition.intro}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ARTICLES GRID ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {allArticles.length > 0 ? (
          <>
            {/* Row 1: Featured layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
              {/* Large featured card */}
              <Link href={`/escape/blog/${allArticles[0].slug}`} className="md:col-span-3 block">
                <div
                  className="relative rounded-lg overflow-hidden"
                  style={{
                    minHeight: 420,
                    backgroundImage: allArticles[0].featured_image
                      ? `url(${allArticles[0].featured_image})`
                      : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {allArticles[0].tag && (
                      <p className="uppercase mb-2" style={{ fontSize: 10, letterSpacing: '0.15em', color: '#B8975C' }}>
                        {allArticles[0].tag}
                      </p>
                    )}
                    <h2
                      className="text-white mb-2"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, lineHeight: 1.25 }}
                    >
                      {allArticles[0].title}
                    </h2>
                    {allArticles[0].excerpt && (
                      <p className="text-white/80 line-clamp-2" style={{ fontSize: 14 }}>
                        {allArticles[0].excerpt}
                      </p>
                    )}
                    {allArticles[0].read_time && (
                      <p className="text-white/50 mt-2" style={{ fontSize: 11 }}>
                        {allArticles[0].read_time}
                      </p>
                    )}
                  </div>
                </div>
              </Link>

              {/* Right column: two stacked cards */}
              {(allArticles[1] || allArticles[2]) && (
                <div className="md:col-span-2 flex flex-col gap-4">
                  {allArticles.slice(1, 3).map((article: any) => (
                    <Link
                      key={article.id}
                      href={`/escape/blog/${article.slug}`}
                      className="flex rounded-lg overflow-hidden border"
                      style={{ backgroundColor: '#FFFDF7', borderColor: '#E0D9CA' }}
                    >
                      {/* Image */}
                      <div
                        className="flex-shrink-0"
                        style={{
                          width: 160,
                          height: 110,
                          backgroundImage: article.featured_image
                            ? `url(${article.featured_image})`
                            : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '0.5rem 0 0 0.5rem',
                        }}
                      />
                      {/* Text */}
                      <div className="p-3 flex flex-col justify-center min-w-0">
                        {article.tag && (
                          <p className="uppercase mb-1" style={{ fontSize: 10, letterSpacing: '0.12em', color: '#B8975C' }}>
                            {article.tag}
                          </p>
                        )}
                        <h3
                          className="line-clamp-2 mb-1"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, color: '#1A1A1A', lineHeight: 1.3 }}
                        >
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="line-clamp-2" style={{ fontSize: 13, color: '#777' }}>
                            {article.excerpt}
                          </p>
                        )}
                        {article.read_time && (
                          <p className="mt-1" style={{ fontSize: 11, color: '#bbb' }}>
                            {article.read_time}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Remaining articles: list format */}
            {allArticles.length > 3 && (
              <div>
                {allArticles.slice(3).map((article: any) => (
                  <Link
                    key={article.id}
                    href={`/escape/blog/${article.slug}`}
                    className="flex gap-5 py-5 border-b"
                    style={{ borderColor: '#E0D9CA' }}
                  >
                    {/* Image */}
                    <div
                      className="flex-shrink-0 rounded-lg"
                      style={{
                        width: 200,
                        height: 140,
                        backgroundImage: article.featured_image
                          ? `url(${article.featured_image})`
                          : 'linear-gradient(135deg, #2B4A3E 0%, #4a7a6a 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    {/* Text */}
                    <div className="flex flex-col justify-center min-w-0">
                      {article.tag && (
                        <p className="uppercase mb-1" style={{ fontSize: 10, letterSpacing: '0.12em', color: '#B8975C' }}>
                          {article.tag}
                        </p>
                      )}
                      <h3
                        style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: '#1A1A1A', lineHeight: 1.3 }}
                      >
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="line-clamp-2 mt-1" style={{ fontSize: 14, color: '#777' }}>
                          {article.excerpt}
                        </p>
                      )}
                      {article.read_time && (
                        <p className="mt-1" style={{ fontSize: 11, color: '#bbb' }}>
                          {article.read_time}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p style={{ fontSize: 14, color: '#999' }}>Stories coming soon.</p>
          </div>
        )}
      </div>
    </>
  )
}
