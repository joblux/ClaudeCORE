import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-[#2a2a2a]">
      <div className="px-7 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="/logos/joblux-header.png"
              alt="JOBLUX"
              className="h-[18px] w-auto block"
            />
          </Link>

          {/* Center: Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {['Brands', 'Insights', 'Signals', 'Events', 'Escape', 'Privacy'].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase()}`}
                className="text-[12px] text-[#666] hover:text-white transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: Copyright */}
          <p
            className="text-[12px] text-[#555] flex-shrink-0"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            &copy; 2026 JOBLUX
          </p>
        </div>
      </div>
    </footer>
  )
}
