import Link from 'next/link'

const featuredArticles = [
  {
    category:  'Intelligence · Talent Moves',
    title:     'The Hybrid Luxury Executive: What Maisons Are Hiring in 2026',
    excerpt:   'JOBLUX analysis of 400 senior placements reveals a new leadership profile — operational rigour paired with creative brand fluency and digital acumen.',
    date:      'March 16, 2026',
    readTime:  '8 min read',
    href:      '/bloglux/hybrid-luxury-executive-2026',
    featured:  true,
  },
  {
    category:  'Career · LVMH',
    title:     'How to Build a Career Across the World\'s Largest Luxury Group',
    excerpt:   'From Louis Vuitton to Moët Hennessy — the internal mobility rules, culture codes and unwritten rules of the LVMH universe.',
    date:      'March 14, 2026',
    readTime:  '7 min read',
    href:      '/bloglux/lvmh-career-guide',
    featured:  false,
  },
  {
    category:  'Markets · Gulf',
    title:     'Why Dubai Has Become the Most Competitive Luxury Talent Market',
    excerpt:   'Hiring up 12% year on year, salaries rising, and every major maison expanding. What it means for your luxury career.',
    date:      'March 12, 2026',
    readTime:  '6 min read',
    href:      '/bloglux/dubai-luxury-talent-market',
    featured:  false,
  },
]

const featuredInterview = {
  category:    'Interview',
  name:        'Marie Dupont',
  role:        'HR Director · Hermès Paris',
  initials:    'MD',
  quote:       '"What we look for has not changed in twenty years — discretion, cultural alignment, and a genuine love of the object. Everything else can be taught."',
  href:        '/interviews/marie-dupont-hermes',
}

export function FeaturedContent() {
  const lead    = featuredArticles[0]
  const others  = featuredArticles.slice(1)

  return (
    <div className="space-y-8">

      {/* LEAD STORY */}
      <div>
        <div className="jl-section-label">
          <span>Latest Intelligence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-[#e8e2d8]">
          {/* Lead text */}
          <div>
            <div className="jl-overline-gold mb-3">{lead.category}</div>
            <h2 className="jl-serif text-2xl font-light text-[#1a1a1a] leading-snug mb-3 hover:text-[#a58e28] transition-colors">
              <Link href={lead.href}>{lead.title}</Link>
            </h2>
            <p className="font-sans text-sm text-[#666] leading-relaxed mb-3">
              {lead.excerpt}
            </p>
            <div className="jl-overline">
              {lead.date} &nbsp;·&nbsp; {lead.readTime}
            </div>
          </div>

          {/* Lead visual — brand mark placeholder */}
          <div className="bg-[#fafaf5] border border-[#e8e2d8] flex items-center justify-center min-h-[180px]">
            <div className="text-center">
              <div className="jl-serif text-3xl font-light tracking-[0.2em] text-[#a58e28] uppercase">
                Intelligence
              </div>
              <div className="jl-overline mt-2">JOBLUX · 2026 Report</div>
            </div>
          </div>
        </div>
      </div>

      {/* ARTICLE LIST */}
      <div>
        <div className="jl-section-label">
          <span>Bloglux</span>
        </div>

        <div className="space-y-0">
          {others.map((article, i) => (
            <div
              key={article.href}
              className="flex items-start gap-4 py-4 border-b border-[#f0ece4] last:border-0"
            >
              <div className="flex-1">
                <div className="jl-overline-gold mb-1.5">{article.category}</div>
                <h3 className="jl-serif text-base font-light text-[#1a1a1a] leading-snug mb-1.5 hover:text-[#a58e28] transition-colors">
                  <Link href={article.href}>{article.title}</Link>
                </h3>
                <div className="jl-overline">
                  {article.date} &nbsp;·&nbsp; {article.readTime}
                </div>
              </div>
              <div className="jl-serif text-3xl font-light text-[#e8e2d8] leading-none flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/bloglux"
          className="inline-block mt-4 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors"
        >
          More from Bloglux →
        </Link>
      </div>

      {/* FEATURED INTERVIEW */}
      <div>
        <div className="jl-section-label">
          <span>Interviews</span>
        </div>

        <Link href={featuredInterview.href} className="block group">
          <div className="flex items-start gap-4 p-5 border border-[#e8e2d8] hover:border-[#a58e28] transition-colors">
            {/* Avatar */}
            <div className="w-14 h-14 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
              <span className="jl-serif text-lg text-[#a58e28]">
                {featuredInterview.initials}
              </span>
            </div>
            {/* Content */}
            <div className="flex-1">
              <div className="jl-overline-gold mb-1">{featuredInterview.category}</div>
              <div className="font-sans text-sm font-medium text-[#1a1a1a] mb-0.5">
                {featuredInterview.name}
              </div>
              <div className="jl-overline mb-3">{featuredInterview.role}</div>
              <p className="jl-serif text-sm text-[#555] leading-relaxed italic">
                {featuredInterview.quote}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/interviews"
          className="inline-block mt-4 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors"
        >
          More interviews →
        </Link>
      </div>

    </div>
  )
}
