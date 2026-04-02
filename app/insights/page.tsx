'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const placeholderArticles = [
  { id: '1', category: 'LEADERSHIP', title: "Kering's creative director cycle — what it means for talent inside the group", excerpt: 'Three CD changes in 18 months. The downstream effects on teams, briefs, and hiring priorities across Gucci, Bottega, and Saint Laurent.', date: 'March 20, 2026', read_time: '6 min', slug: 'kering-creative-director-cycle' },
  { id: '2', category: 'MARKET INTELLIGENCE', title: "Hard luxury's moment: why watches and jewelry are the growth story of 2026", excerpt: "Cartier, Van Cleef, and Tiffany are all expanding headcount while fashion and leather goods hold steady.", date: 'March 18, 2026', read_time: '5 min', slug: 'hard-luxury-growth-2026' },
  { id: '3', category: 'CAREER INTELLIGENCE', title: "Dubai is becoming luxury's second headquarters — what that means for careers", excerpt: "Regional HQs, flagship openings, and a growing pool of international talent.", date: 'March 15, 2026', read_time: '7 min', slug: 'dubai-luxury-careers' },
  { id: '4', category: 'SALARY', title: 'What Hermès really pays — from artisan to director', excerpt: "Based on 847 verified contributions, we map out the full compensation ladder.", date: 'March 12, 2026', read_time: '9 min', slug: 'hermes-salary-guide' },
  { id: '5', category: 'CAREERS', title: 'How to get hired at Chanel without applying online', excerpt: "Chanel fills over 70% of senior roles through internal referrals and executive search.", date: 'March 10, 2026', read_time: '5 min', slug: 'hired-at-chanel' },
  { id: '6', category: 'MARKET', title: 'LVMH vs Kering: which group offers better career progression?', excerpt: "We analysed 500+ career paths across both groups.", date: 'March 8, 2026', read_time: '8 min', slug: 'lvmh-vs-kering-careers' },
]

const placeholderReports = [
  { icon: '📊', label: 'SALARY REPORT', title: 'Luxury Compensation Report 2026 — Europe Edition', meta: '1,840 data points · Published March 2026', slug: '' },
  { icon: '🏢', label: 'HIRING REPORT', title: "State of Luxury Hiring Q1 2026 — Who's Growing, Who's Cutting", meta: '52 brands analysed · Published February 2026', slug: '' },
  { icon: '🌍', label: 'MARKET REPORT', title: 'Asia Pacific Luxury Expansion Index — Retail & Talent Outlook', meta: '12 markets · Published January 2026', slug: '' },
  { icon: '👔', label: 'CAREER REPORT', title: 'The Luxury Career Ladder — How Professionals Progress Across Maisons', meta: '500+ career paths · Published December 2025', slug: '' },
]

// Placeholder voices shown when DB has no approved Insider Voices yet
const placeholderVoices = [
  { initials: 'SM', name: 'S. Marchetti', role: 'Former SVP, Kering Group', quote: "The biggest shift I've seen in 20 years is that brands now want operators, not just creatives. The era of the visionary CD with no commercial instinct is over.", slug: '' },
  { initials: 'AL', name: 'A. Laurent', role: 'Retail Director, Independent Maison', quote: "Hermès doesn't post jobs. They cultivate talent for years before offering anything. If you want to work there, start by becoming known in their world.", slug: '' },
  { initials: 'JP', name: 'J. Park', role: 'Chief People Officer, LVMH Asia', quote: "Digital fluency is table stakes now. What separates candidates at director level is whether they can operate at the intersection of data and taste.", slug: '' },
]

const topics = ['Salary data', 'Leadership moves', 'LVMH', 'Kering', 'Richemont', 'Asia Pacific', 'Middle East', 'Retail', 'Digital', 'Watches', 'Beauty', 'Career advice']
const tabs = ['Editorial', 'Research reports', 'Insider voices', 'Luxury map']

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

// Voice card — used in both Editorial tab preview and dedicated Insider voices tab
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
      <Link href={`/bloglux/${v.slug}`} className="block">
        {card}
      </Link>
    )
  }
  return card
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState('Editorial')
  const [articles, setArticles] = useState(placeholderArticles)
  const [reports, setReports] = useState(placeholderReports)
  const [voices, setVoices] = useState(placeholderVoices)
  const [mostRead, setMostRead] = useState<any[]>([])
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function fetchAll() {
      // Editorial articles
      const { data: articleData } = await supabase
        .from('bloglux_articles')
        .select('id, slug, title, excerpt, category, published_at, read_time_minutes')
        .eq('status', 'published')
        .not('category', 'in', '("Research Report","Insider Voice")')
        .order('published_at', { ascending: false })
        .limit(6)

      if (articleData && articleData.length > 0) {
        setArticles(articleData.map((a: any) => ({
          id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt || '',
          category: (a.category || '').toUpperCase(),
          date: formatDate(a.published_at),
          read_time: a.read_time_minutes ? `${a.read_time_minutes} min` : '',
        })))
      }

      // Research reports
      const { data: reportData } = await supabase
        .from('bloglux_articles')
        .select('id, slug, title, excerpt, category, published_at')
        .eq('status', 'published')
        .eq('category', 'Research Report')
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

      // Insider voices — fetch author_name properly
      const { data: voiceData } = await supabase
        .from('bloglux_articles')
        .select('id, slug, title, excerpt, author_name, author_role, published_at')
        .eq('status', 'published')
        .eq('category', 'Insider Voice')
        .order('published_at', { ascending: false })
        .limit(9)

      if (voiceData && voiceData.length > 0) {
        setVoices(voiceData.map((v: any) => ({
          initials: getInitials(v.author_name),
          name: v.author_name || 'Insider Voice',
          role: v.author_role || 'Luxury Industry Professional',
          quote: v.excerpt || v.title,
          slug: v.slug,
        })))
      }

      // Most read sidebar
      const { data: recentData } = await supabase
        .from('bloglux_articles')
        .select('id, slug, title, category, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(4)

      if (recentData && recentData.length > 0) {
        setMostRead(recentData.map((a: any) => ({
          cat: (a.category || '').toUpperCase(),
          title: a.title,
          date: formatDate(a.published_at),
          slug: a.slug,
        })))
      }
    }

    fetchAll()
  }, [])

  const featured = articles[0]
  const rest = articles.slice(1, 4)

  const displayMostRead = mostRead.length > 0 ? mostRead : [
    { cat: 'SALARY', title: 'What Hermès really pays — from artisan to director', date: 'March 22, 2026', slug: 'hermes-salary-guide' },
    { cat: 'CAREERS', title: 'How to get hired at Chanel without applying online', date: 'March 19, 2026', slug: 'hired-at-chanel' },
    { cat: 'MARKET', title: 'LVMH vs Kering: which group offers better career progression?', date: 'March 14, 2026', slug: 'lvmh-vs-kering-careers' },
    { cat: 'LEADERSHIP', title: 'The Richemont school of management — and why alumni are in demand', date: 'March 10, 2026', slug: 'richemont-management' },
  ]

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-8 pt-10 pb-16">

        <h1 className="text-4xl font-normal text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Insights
        </h1>
        <p className="text-sm text-[#999] mb-6">Analysis, research, and intelligence from inside the luxury industry.</p>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a2a] mb-8">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 mr-8 text-sm relative transition-colors whitespace-nowrap"
              style={{ color: activeTab === tab ? '#fff' : '#555' }}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#a58e28]" />}
            </button>
          ))}
        </div>

        {/* ── EDITORIAL TAB ── */}
        {activeTab === 'Editorial' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
            <div>
              {/* Featured */}
              {featured && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 items-center">
                  <div className="bg-[#222] border border-[#2a2a2a] rounded-xl h-72" />
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
                    <Link href={`/bloglux/${featured.slug}`} className="text-xs text-[#a58e28] hover:underline">Read article →</Link>
                  </div>
                </div>
              )}

              {/* Latest intelligence */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">LATEST INTELLIGENCE</span>
                <div className="flex-1 h-px bg-[#2a2a2a]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {rest.map(article => (
                  <Link key={article.id} href={`/bloglux/${article.slug}`} className="group cursor-pointer">
                    <div className="bg-[#222] border border-[#2a2a2a] rounded-lg h-44 mb-3" />
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
                  <Link key={r.title} href={r.slug ? `/bloglux/${r.slug}` : '#'} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 flex gap-4 hover:border-[#3a3a3a] transition-colors block">
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
            <div className="space-y-8">
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">MOST READ</div>
                <div className="space-y-4">
                  {displayMostRead.map((a, i) => (
                    <Link key={i} href={`/bloglux/${a.slug}`} className="flex gap-3 pb-4 border-b border-[#222] last:border-b-0 cursor-pointer group">
                      <div className="w-14 h-14 bg-[#222] border border-[#2a2a2a] rounded-md flex-shrink-0" />
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

              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">THE BRIEF</div>
                <p className="text-xs text-[#999] leading-relaxed mb-3">
                  Biweekly intelligence for luxury professionals. Signals, salary moves, and assignments — direct to your inbox.
                </p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#222] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#ccc] outline-none mb-2 focus:border-[#444]"
                />
                <button className="w-full bg-[#a58e28] text-[#1a1a1a] text-xs font-semibold py-2.5 rounded-lg hover:bg-[#c4a832] transition-colors">
                  Subscribe to The Brief
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RESEARCH REPORTS TAB ── */}
        {activeTab === 'Research reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r, i) => (
              <Link key={i} href={r.slug ? `/bloglux/${r.slug}` : '#'} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 flex gap-4 hover:border-[#3a3a3a] transition-colors block">
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
            <p className="text-sm text-[#999]">Interactive global luxury industry map — coming soon</p>
          </div>
        )}

      </div>
    </div>
  )
}
