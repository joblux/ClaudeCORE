'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const placeholderArticles = [
  {
    id: '1',
    category: 'LEADERSHIP',
    title: "Kering's creative director cycle — what it means for talent inside the group",
    excerpt: 'Three CD changes in 18 months. The downstream effects on teams, briefs, and hiring priorities across Gucci, Bottega, and Saint Laurent.',
    date: 'March 20, 2026',
    read_time: '6 min',
    slug: 'kering-creative-director-cycle',
  },
  {
    id: '2',
    category: 'MARKET INTELLIGENCE',
    title: "Hard luxury's moment: why watches and jewelry are the growth story of 2026",
    excerpt: 'Cartier, Van Cleef, and Tiffany are all expanding headcount while fashion and leather goods hold steady. A breakdown of who\'s hiring and why.',
    date: 'March 18, 2026',
    read_time: '5 min',
    slug: 'hard-luxury-growth-2026',
  },
  {
    id: '3',
    category: 'CAREER INTELLIGENCE',
    title: "Dubai is becoming luxury's second headquarters — what that means for careers",
    excerpt: 'Regional HQs, flagship openings, and a growing pool of international talent. The Gulf is no longer just a retail market — it\'s a career destination.',
    date: 'March 15, 2026',
    read_time: '7 min',
    slug: 'dubai-luxury-careers',
  },
  {
    id: '4',
    category: 'SALARY',
    title: 'What Hermès really pays — from artisan to director',
    excerpt: 'Based on 847 verified contributions, we map out the full compensation ladder at one of luxury\'s most secretive employers.',
    date: 'March 12, 2026',
    read_time: '9 min',
    slug: 'hermes-salary-guide',
  },
  {
    id: '5',
    category: 'CAREERS',
    title: 'How to get hired at Chanel without applying online',
    excerpt: 'Chanel fills over 70% of senior roles through internal referrals and executive search. Here\'s how to get on their radar.',
    date: 'March 10, 2026',
    read_time: '5 min',
    slug: 'hired-at-chanel',
  },
  {
    id: '6',
    category: 'MARKET',
    title: 'LVMH vs Kering: which group offers better career progression?',
    excerpt: 'We analysed 500+ career paths across both groups. The answer depends entirely on which function you\'re in.',
    date: 'March 8, 2026',
    read_time: '8 min',
    slug: 'lvmh-vs-kering-careers',
  },
]

const reports = [
  { icon: '📊', label: 'SALARY REPORT', title: 'Luxury Compensation Report 2026 — Europe Edition', meta: '1,840 data points · Published March 2026' },
  { icon: '🏢', label: 'HIRING REPORT', title: "State of Luxury Hiring Q1 2026 — Who's Growing, Who's Cutting", meta: '52 brands analysed · Published February 2026' },
  { icon: '🌍', label: 'MARKET REPORT', title: 'Asia Pacific Luxury Expansion Index — Retail & Talent Outlook', meta: '12 markets · Published January 2026' },
  { icon: '👔', label: 'CAREER REPORT', title: 'The Luxury Career Ladder — How Professionals Progress Across Maisons', meta: '500+ career paths · Published December 2025' },
]

const voices = [
  { initials: 'SM', name: 'S. Marchetti', role: 'Former SVP, Kering Group', quote: "The biggest shift I've seen in 20 years is that brands now want operators, not just creatives. The era of the visionary CD with no commercial instinct is over." },
  { initials: 'AL', name: 'A. Laurent', role: 'Retail Director, Independent Maison', quote: "Hermès doesn't post jobs. They cultivate talent for years before offering anything. If you want to work there, start by becoming known in their world." },
  { initials: 'JP', name: 'J. Park', role: 'Chief People Officer, LVMH Asia', quote: "Digital fluency is table stakes now. What separates candidates at director level is whether they can operate at the intersection of data and taste." },
]

const mostRead = [
  { cat: 'SALARY', title: 'What Hermès really pays — from artisan to director', date: 'March 22, 2026', slug: 'hermes-salary-guide' },
  { cat: 'CAREERS', title: 'How to get hired at Chanel without applying online', date: 'March 19, 2026', slug: 'hired-at-chanel' },
  { cat: 'MARKET', title: 'LVMH vs Kering: which group offers better career progression?', date: 'March 14, 2026', slug: 'lvmh-vs-kering-careers' },
  { cat: 'LEADERSHIP', title: 'The Richemont school of management — and why alumni are in demand', date: 'March 10, 2026', slug: 'richemont-management' },
]

const topics = ['Salary data', 'Leadership moves', 'LVMH', 'Kering', 'Richemont', 'Asia Pacific', 'Middle East', 'Retail', 'Digital', 'Watches', 'Beauty', 'Career advice']

const tabs = ['Editorial', 'Research reports', 'Insider voices', 'Luxury map']

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState('Editorial')
  const [articles, setArticles] = useState(placeholderArticles)
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function fetchArticles() {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, category, published_at, slug, read_time')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6)
      if (data && data.length > 0) setArticles(data)
    }
    fetchArticles()
  }, [])

  const featured = articles[0]
  const rest = articles.slice(1, 4)

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-8 pt-10 pb-16">

        <h1 className="text-4xl font-normal text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Insights
        </h1>
        <p className="text-sm text-[#555] mb-6">Analysis, research, and intelligence from inside the luxury industry.</p>

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

        {/* EDITORIAL TAB */}
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
                    <h2 className="text-2xl font-normal text-white mb-3 leading-snug cursor-pointer hover:text-[#ccc]" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                      The end of the logo era: why quiet luxury is reshaping hiring across Europe's maisons
                    </h2>
                    <p className="text-sm text-[#666] leading-relaxed mb-4">
                      As brands like Bottega Veneta and Loro Piana outperform logo-heavy competitors, a new archetype of luxury professional is emerging — one fluent in craft, restraint, and long-term brand building.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#444] mb-4">
                      <span className="text-[#888]">JOBLUX Editorial</span>
                      <span>·</span>
                      <span>March 24, 2026</span>
                      <span>·</span>
                      <span>8 min read</span>
                    </div>
                    <a href="#" className="text-xs text-[#a58e28] hover:underline">Read article →</a>
                  </div>
                </div>
              )}

              {/* Section label */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">LATEST INTELLIGENCE</span>
                <div className="flex-1 h-px bg-[#2a2a2a]" />
              </div>

              {/* Article grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {rest.map(article => (
                  <Link key={article.id} href={`/bloglux/${article.slug}`} className="group cursor-pointer">
                    <div className="bg-[#222] border border-[#2a2a2a] rounded-lg h-44 mb-3" />
                    <div className="text-[10px] font-semibold tracking-[1.5px] text-[#a58e28] mb-1">{article.category}</div>
                    <h3 className="text-sm font-normal text-[#e0e0e0] leading-snug mb-2 group-hover:text-[#ccc] transition-colors" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                      {article.title}
                    </h3>
                    <p className="text-xs text-[#555] leading-relaxed mb-2">{article.excerpt}</p>
                    <div className="flex gap-2 text-[11px] text-[#444]">
                      <span>{article.date}</span>
                      <span>·</span>
                      <span>{article.read_time}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Research reports */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">JOBLUX RESEARCH</span>
                <div className="flex-1 h-px bg-[#2a2a2a]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {reports.map(r => (
                  <div key={r.title} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 flex gap-4 cursor-pointer hover:border-[#3a3a3a] transition-colors">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(165,142,40,0.1)', border: '1px solid rgba(165,142,40,0.2)' }}>
                      {r.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold tracking-[1.5px] text-[#a58e28] mb-1">{r.label}</div>
                      <div className="text-sm font-medium text-[#e0e0e0] mb-1 leading-snug">{r.title}</div>
                      <div className="text-[11px] text-[#444]">{r.meta}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Insider voices */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-semibold tracking-[2px] text-[#a58e28]">INSIDER VOICES</span>
                <div className="flex-1 h-px bg-[#2a2a2a]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {voices.map(v => (
                  <div key={v.name} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
                    <p className="text-sm text-[#777] italic leading-relaxed mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                      "{v.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-medium text-[#666] flex-shrink-0">
                        {v.initials}
                      </div>
                      <div>
                        <div className="text-xs text-[#888]">{v.name}</div>
                        <div className="text-[11px] text-[#444]">{v.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Most read */}
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">MOST READ</div>
                <div className="space-y-4">
                  {mostRead.map(a => (
                    <Link key={a.slug} href={`/bloglux/${a.slug}`} className="flex gap-3 pb-4 border-b border-[#222] last:border-b-0 cursor-pointer group">
                      <div className="w-14 h-14 bg-[#222] border border-[#2a2a2a] rounded-md flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-[#a58e28] tracking-wider mb-1">{a.cat}</div>
                        <div className="text-xs text-[#ccc] leading-snug group-hover:text-white transition-colors">{a.title}</div>
                        <div className="text-[11px] text-[#444] mt-1">{a.date}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Topics */}
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-4">TOPICS</div>
                <div className="flex flex-wrap gap-2">
                  {topics.map(t => (
                    <span key={t} className="text-[11px] text-[#555] border border-[#2a2a2a] rounded-full px-3 py-1 cursor-pointer hover:border-[#444] hover:text-[#888] transition-colors">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* The Brief */}
              <div>
                <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">THE BRIEF</div>
                <p className="text-xs text-[#555] leading-relaxed mb-3">
                  Biweekly intelligence for luxury professionals. Signals, salary moves, and assignments — direct to your inbox.
                </p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#222] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#888] outline-none mb-2 focus:border-[#444]"
                />
                <button className="w-full bg-[#a58e28] text-[#1a1a1a] text-xs font-semibold py-2.5 rounded-lg hover:bg-[#c4a832] transition-colors">
                  Subscribe to The Brief
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESEARCH REPORTS TAB */}
        {activeTab === 'Research reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map(r => (
              <div key={r.title} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 flex gap-4 cursor-pointer hover:border-[#3a3a3a] transition-colors">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(165,142,40,0.1)', border: '1px solid rgba(165,142,40,0.2)' }}>
                  {r.icon}
                </div>
                <div>
                  <div className="text-[10px] font-semibold tracking-[1.5px] text-[#a58e28] mb-1">{r.label}</div>
                  <div className="text-sm font-medium text-[#e0e0e0] mb-1 leading-snug">{r.title}</div>
                  <div className="text-[11px] text-[#444]">{r.meta}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INSIDER VOICES TAB */}
        {activeTab === 'Insider voices' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {voices.map(v => (
              <div key={v.name} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
                <p className="text-sm text-[#777] italic leading-relaxed mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                  "{v.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-medium text-[#666] flex-shrink-0">
                    {v.initials}
                  </div>
                  <div>
                    <div className="text-xs text-[#888]">{v.name}</div>
                    <div className="text-[11px] text-[#444]">{v.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LUXURY MAP TAB */}
        {activeTab === 'Luxury map' && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-3">LUXURY MAP</p>
            <p className="text-sm text-[#444]">Interactive global luxury industry map — coming soon</p>
          </div>
        )}

      </div>
    </div>
  )
}
