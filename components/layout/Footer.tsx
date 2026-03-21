import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[#e8e2d8] mt-8">

      <div className="jl-container py-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">

          {/* Left — Brand */}
          <div>
            <div className="text-lg font-semibold text-[#1a1a1a] tracking-[0.1em] mb-2" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>JOBLUX.</div>
            <p className="font-sans text-xs text-[#888] leading-relaxed mb-3">Luxury Talents Society</p>
            <p className="font-sans text-[0.65rem] text-[#bbb]">Paris &middot; London &middot; New York &middot; Dubai &middot; Singapore</p>
          </div>

          {/* Right — Three sub-columns */}
          <div className="flex gap-12 md:gap-16 flex-wrap">
            <div>
              <h4 className="jl-overline text-[#1a1a1a] mb-3">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/wikilux" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">WikiLux</Link></li>
                <li><Link href="/salaries" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Salaries</Link></li>
                <li><Link href="/coaching" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Career Intelligence</Link></li>
                <li><Link href="/bloglux" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Bloglux</Link></li>
                <li><Link href="/the-brief" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">The Brief</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="jl-overline text-[#1a1a1a] mb-3">Society</h4>
              <ul className="space-y-2">
                <li><Link href="/members" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Sign In</Link></li>
                <li><Link href="/join" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Request Access</Link></li>
                <li><Link href="/about" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">About</Link></li>
                <li><Link href="/faq" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Help</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="jl-overline text-[#1a1a1a] mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-[#e8e2d8]">
        <div className="jl-container py-2 text-center">
          <p className="font-sans text-[0.65rem] text-[#bbb] tracking-wide">
            &copy; {new Date().getFullYear()} JOBLUX
          </p>
        </div>
      </div>

    </footer>
  )
}
