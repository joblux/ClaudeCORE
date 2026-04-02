export function HomepageHero() {
  return (
    <section className="pt-16 pb-14 px-7">
      <div className="max-w-[1200px] mx-auto text-center">
        <h1 className="text-4xl font-normal text-white mb-5 leading-tight" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Luxury career{' '}
          <span className="italic text-[#a58e28]">intelligence</span>
        </h1>

        <p className="text-[13px] text-[#777] max-w-[440px] mx-auto leading-[1.75] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
          Real salary data. Confidential opportunities. Market signals across 150+ luxury brands. The intelligence you need to make your next move.
        </p>

        {/* Search bar */}
        <div className="max-w-[460px] mx-auto mb-10">
          <div className="bg-white rounded-[4px] flex items-center px-[18px] py-[13px]">
            <svg className="w-4 h-4 text-[#999] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search brands, salaries, roles, cities..."
              className="flex-1 text-[13px] text-[#1a1a1a] placeholder-[#999] outline-none bg-transparent"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-[52px] gap-y-4">
          {[
            { number: '150+', label: 'BRANDS' },
            { number: '9', label: 'LANGUAGES' },
            { number: '50+', label: 'CONFIDENTIAL ROLES' },
            { number: '24/7', label: 'MARKET SIGNALS' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-[24px] font-medium text-[#a58e28] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {stat.number}
              </div>
              <div
                className="text-[9px] text-[#555] uppercase tracking-[1.5px]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
