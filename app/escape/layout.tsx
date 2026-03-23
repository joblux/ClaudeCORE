import Link from 'next/link'

export default function EscapeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDF8EE]">
      {/* Escape Nav */}
      <header className="bg-white border-b border-[#D4C9B4]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold text-[#1a1a1a] tracking-wide" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>
              JOBLUX
            </Link>
            <span className="text-[#D4C9B4]">·</span>
            <Link href="/escape" className="text-sm font-semibold text-[#2B4A3E] tracking-wider uppercase">
              Escape
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline text-xs text-[#8B7A5E]">In partnership with Fora Travel</span>
            <Link
              href="/escape/consultation"
              className="text-xs font-semibold text-[#2B4A3E] border border-[#2B4A3E] px-4 py-1.5 rounded hover:bg-[#2B4A3E] hover:text-white transition-colors"
            >
              Plan Your Escape
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Escape Footer */}
      <footer className="border-t border-[#D4C9B4] bg-[#FFFDF7]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs text-[#8B7A5E]">JOBLUX LLC · Luxury Talent Intelligence</p>
              <p className="text-xs text-[#D4C9B4] mt-1">Travel advisory services provided by independent advisors affiliated with Fora Travel, Inc.</p>
            </div>
            <div className="flex gap-6">
              <Link href="/help" className="text-xs text-[#8B7A5E] hover:text-[#2B4A3E] transition-colors">Help Centre</Link>
              <Link href="/terms" className="text-xs text-[#8B7A5E] hover:text-[#2B4A3E] transition-colors">Terms</Link>
              <Link href="/" className="text-xs text-[#8B7A5E] hover:text-[#2B4A3E] transition-colors">JOBLUX</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
