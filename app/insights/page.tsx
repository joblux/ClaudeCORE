'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const topics = ['Salary data', 'Leadership moves', 'LVMH', 'Kering', 'Richemont', 'Asia Pacific', 'Middle East', 'Retail', 'Digital', 'Watches', 'Beauty', 'Career advice']
const tabs = ['Editorial', 'Research reports', 'Insider voices', 'Luxury map']
const TAB_SLUG_MAP: Record<string, string> = { 'editorial': 'Editorial', 'research-reports': 'Research reports', 'insider-voices': 'Insider voices', 'luxury-map': 'Luxury map' }
const TAB_TO_SLUG: Record<string, string> = { 'Editorial': 'editorial', 'Research reports': 'research-reports', 'Insider voices': 'insider-voices', 'Luxury map': 'luxury-map' }

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getCategoryIcon(title: string) {
  const t = (title || '').toLowerCase()
  if (t.includes('salary') || t.includes('compensation')) return '📊'
  if (t.includes('hiring') || t.includes('talent') || t.includes('state of')) return '🏢'
  if (t.includes('market') || t.includes('expansion') || t.includes('index')) return '🌍'
  if (t.includes('career') || t.includes('ladder') || t.includes('progression')) return '👔'
  return '📄'
}

function getInitials(name: string) {
  if (!name) return 'IV'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Voice card | used in both Editorial tab preview and dedicated Insider voices tab
function VoiceCard({ v }: { v: any }) {
  const card = (
    <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-colors h-full">
      <p className="text-sm text-[#bbb] italic leading-relaxed mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
        &ldquo;{v.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 mt-auto">
        <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-semibold text-[#a58e28] flex-shrink-0">
          {v.initials}
        </div>
        <div>
          <div className="text-xs font-medium text-[#ccc]">{v.name}</div>
          <div className="text-[11px] text-[#777]">{v.role}</div>
        </div>
        {v.slug && (
          <div className="ml-auto text-[11px] text-[#a58e28]">Read →</div>
        )}
      </div>
    </div>
  )

  if (v.slug) {
    return (
      <Link href={`/insights/${v.slug}`} className="block">
        {card}
      </Link>
    )
  }
  return card
}

function InsightsPageInner() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') || ''
  const activeTab = TAB_SLUG_MAP[tabParam] || 'Editorial'
  const [articles, setArticles] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [voices, setVoices] = useState<any[]>([])
  const [mostRead, setMostRead] = useState<any[]>([])
  const [pinnedFeatured, setPinnedFeatured] = useState<any>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function fetchAll() {
      // Pinned featured article
      const { data: featuredArticle } = await supabase
        .from('bloglux_articles')
        .select('id, slug, title, excerpt, category, published_at, read_time_minutes, cover_image_url')
        .eq('status', 'published')
        .eq('featured_homepage', true)
        .is('deleted_at', null)
        .maybeSingle()

      if (featuredArticle) {
        setPinnedFeatured({
          id: featuredArticle.id, slug: featuredArticle.slug, title: featuredArticle.title,
          excerpt: featuredArticle.excerpt || '',
          category: (featuredArticle.category || '').toUpperCase(),
          date: formatDate(featuredArticle.published_at),
          read_time: featuredArticle.read_time_minutes ? `${featuredArticle.read_time_minutes} min` : '',
          cover_image_url: featuredArticle.cover_image_url || '',
        })
      }

      // Editorial articles
      const { data: articleData } = await supabase
        .from('bloglux_articles')
        .select('id, slug, title, excerpt, category, published_at, read_time_minutes, cover_image_url')
        .eq('status', 'published')
        .not('category', 'in', '("Research Report","Insider Voice")')
        .is('deleted_at', null)
        .order('published_at', { ascending: false })
        .limit(6)

      if (articleData && articleData.length > 0) {
        setArticles(articleData.map((a: any) => ({
          id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt || '',
          category: (a.category || '').toUpperCase(),
          date: formatDate(a.published_at),
          read_time: a.read_time_minutes ? `${a.read_time_minutes} min` : '',
          cover_image_url: a.cover_image_url || '',
        })))
      }

      // Research reports
      const { data: reportData } = await supabase
        .from('bloglux_articles')
        .select('id, slug, title, excerpt, category, published_at')
        .eq('status', 'published')
        .eq('category', 'Research Report')
        .is('deleted_at', null)
        .order('published_at', { ascending: false })
        .limit(8)

      if (reportData && reportData.length > 0) {
        setReports(reportData.map((r: any) => ({
          icon: getCategoryIcon(r.title),
          label: 'RESEARCH REPORT',
          title: r.title,
          meta: formatDate(r.published_at),
          slug: r.slug,
        })))
      }

      // Insider voice cards
      const { data: voiceCards } = await supabase
        .from('insider_voice_cards')
        .select('id, quote_text, display_name, display_title, display_company, initials, link_slug, is_featured')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6)

      if (voiceCards && voiceCards.length > 0) {
        setVoices(voiceCards.map((v: any) => ({
          initials: v.initials,
          name: v.display_name,
          role: [v.display_title, v.display_company].filter(Boolean).join(', '),
          quote: v.quote_text,
          slug: v.link_slug || '',
        })))
      }

      // Most read sidebar
      const { data: recentData } = await supabase
        .from('bloglux_articles')
        .select('id, slug, title, category, published_at, cover_image_url')
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('published_at', { ascending: false })
        .limit(4)

      if (recentData && recentData.length > 0) {
        setMostRead(recentData.map((a: any) => ({
          cat: (a.category || '').toUpperCase(),
          title: a.title,
          date: formatDate(a.published_at),
          slug: a.slug,
          cover_image_url: a.cover_image_url || '',
        })))
      }
    }

    fetchAll()
  }, [])

  const featured = pinnedFeatured || articles[0]
  const rest = pinnedFeatured
    ? articles.filter(a => a.id !== pinnedFeatured.id).slice(0, 3)
    : articles.slice(1, 4)

  const displayMostRead = mostRead

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-8 pt-10 pb-16">

        <h1 className="text-4xl font-normal text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Insights
        </h1>
        <p className="text-sm text-[#999] mb-1.5">Intelligence on luxury talent, leadership, and the market around them.</p>
        <p className="text-[11px] text-[#777] mb-6">Research, perspectives, and insider intelligence — updated regularly.</p>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a2a] mb-8">
          {tabs.map(tab => {
            const tabSlug = TAB_TO_SLUG[tab]
            const href = tabSlug === 'editorial' ? '/insights' : `/insights?tab=${tabSlug}`
            return (
              <Link
                key={tab}
                href={href}
                scroll={false}
                className="pb-3 mr-8 text-sm relative transition-colors whitespace-nowrap"
                style={{ color: activeTab === tab ? '#fff' : '#555' }}
              >
                {tab}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#a58e28]" />}
              </Link>
            )
          })}
        </div>

        {/* ── EDITORIAL TAB ── */}
        {activeTab === 'Editorial' && (
          <div className={`grid grid-cols-1 ${displayMostRead.length >= 8 ? 'lg:grid-cols-[1fr_280px]' : ''} gap-10`}>
            <div>
              {/* Featured */}
              {featured && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-center">
                  <div className="bg-[#222] border border-[#2a2a2a] rounded-xl h-72 overflow-hidden relative">
                    {featured.cover_image_url ? (
                      <img src={featured.cover_image_url} alt={featured.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px w-5 bg-[#a58e28]" />
                      <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">FEATURED</span>
                    </div>
                    <h2 className="text-2xl font-normal text-white mb-3 leading-snug" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                      {featured.title}
                    </h2>
                    <p className="text-sm text-[#999] leading-relaxed mb-4">{featured.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-[#999] mb-4">
                      <span className="text-[#888]">JOBLUX Editorial</span>
                      {featured.date && <><span>·</span><span>{featured.date}</span></>}
                      {featured.read_time && <><span>·</span><span>{featured.read_time} read</span></>}
                    </div>
                    <Link href={`/insights/${featured.slug}`} className="text-xs text-[#a58e28] hover:underline">Read article →</Link>
                  </div>
                </div>
              )}

              {/* Latest intelligence */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[9px] font-medium tracking-[1.5px] text-[#777]">LATEST INTELLIGENCE</span>
                <div className="flex-1 h-px bg-[#222]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {rest.map(article => (
                  <Link key={article.id} href={`/insights/${article.slug}`} className="group cursor-pointer">
                    <div className="bg-[#222] border border-[#2a2a2a] rounded-lg h-44 mb-3 overflow-hidden relative">
                      {article.cover_image_url && (
                        <img src={article.cover_image_url} alt={article.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="text-[10px] font-semibold tracking-[1.5px] text-[#a58e28] mb-1">{article.category}</div>
                    <h3 className="text-sm font-normal text-[#e0e0e0] leading-snug mb-2 group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                      {article.title}
                    </h3>
                    <p className="text-xs text-[#999] leading-relaxed mb-2">{article.excerpt}</p>
                    <div className="flex gap-2 text-[11px] text-[#999]">
                      {article.date && <span>{article.date}</span>}
                      {article.date && article.read_time && <span>·</span>}
                      {article.read_time && <span>{article.read_time}</span>}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Research reports preview */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">JOBLUX RESEARCH</span>
                <div className="flex-1 h-px bg-[#2a2a2a]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {reports.slice(0, 4).map(r => (
                  <Link key={r.title} href={r.slug ? `/insights/${r.slug}` : '#'} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 flex gap-4 hover:border-[#3a3a3a] transition-colors block">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(165,142,40,0.1)', border: '1px solid rgba(165,142,40,0.2)' }}>
                      {r.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold tracking-[1.5px] text-[#a58e28] mb-1">{r.label}</div>
                      <div className="text-sm font-medium text-[#e0e0e0] mb-1 leading-snug">{r.title}</div>
                      <div className="text-[11px] text-[#999]">{r.meta}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Insider voices preview */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">INSIDER VOICES</span>
                <div className="flex-1 h-px bg-[#2a2a2a]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {voices.slice(0, 3).map((v, i) => <VoiceCard key={i} v={v} />)}
              </div>
            </div>

            {/* Sidebar */}
            {displayMostRead.length >= 8 && (
            <div className="space-y-8">
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">MOST READ</div>
                <div className="space-y-4">
                  {displayMostRead.map((a, i) => (
                    <Link key={i} href={`/insights/${a.slug}`} className="flex gap-3 pb-4 border-b border-[#222] last:border-b-0 cursor-pointer group">
                      <div className="w-14 h-14 bg-[#222] border border-[#2a2a2a] rounded-md flex-shrink-0 overflow-hidden relative">
                        {a.cover_image_url && (
                          <img src={a.cover_image_url} alt={a.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] text-[#a58e28] tracking-wider mb-1">{a.cat}</div>
                        <div className="text-xs text-[#ccc] leading-snug group-hover:text-white transition-colors">{a.title}</div>
                        <div className="text-[11px] text-[#999] mt-1">{a.date}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">TOPICS</div>
                <div className="flex flex-wrap gap-2">
                  {topics.map(t => (
                    <span key={t} className="text-[11px] text-[#999] border border-[#2a2a2a] rounded-full px-3 py-1 cursor-pointer hover:border-[#444] hover:text-[#ccc] transition-colors">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ border: '0.5px solid #333', borderRadius: '8px', padding: '16px' }}>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">THE BRIEF</div>
                <p className="text-xs text-[#999] leading-relaxed mb-3">
                  Biweekly intelligence for luxury professionals. Signals, salary moves, and assignments direct to your inbox.
                </p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#222] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ccc] outline-none mb-2 focus:border-[#444]"
                />
                <button className="w-full bg-[#555] text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-[#666] transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
            )}
          </div>
        )}

        {/* ── RESEARCH REPORTS TAB ── */}
        {activeTab === 'Research reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r, i) => (
              <Link key={i} href={r.slug ? `/insights/${r.slug}` : '#'} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 flex gap-4 hover:border-[#3a3a3a] transition-colors block">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(165,142,40,0.1)', border: '1px solid rgba(165,142,40,0.2)' }}>
                  {r.icon}
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-[1.5px] text-[#a58e28] mb-1">{r.label}</div>
                  <div className="text-sm font-medium text-[#e0e0e0] mb-1 leading-snug">{r.title}</div>
                  <div className="text-[11px] text-[#999]">{r.meta}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── INSIDER VOICES TAB ── */}
        {activeTab === 'Insider voices' && (
          <div>
            <p className="text-sm text-[#999] mb-6">Executive perspectives from senior professionals across the luxury industry.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {voices.map((v, i) => <VoiceCard key={i} v={v} />)}
            </div>
          </div>
        )}

        {/* ── LUXURY MAP TAB ── */}
        {activeTab === 'Luxury map' && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">LUXURY MAP</p>
            <p className="text-sm text-[#999]">Interactive global luxury industry map | coming soon</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default function InsightsPage() {
  return (
    <Suspense>
      <InsightsPageInner />
    </Suspense>
  )
}
