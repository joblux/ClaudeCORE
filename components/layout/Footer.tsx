import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[#e8e2d8] mt-8 bg-white">

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 xl:px-16 py-10 lg:py-16">
        {/* Mobile: existing layout / Desktop: 4-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Col 1 — Brand */}
          <div>
            <span className="text-sm font-medium tracking-[2px] text-[#1a1a1a]" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>JOBLUX.</span>
            <p className="font-sans text-sm text-[#555] mt-1 mb-3">Luxury Talents Society</p>
            <p className="font-sans text-[0.6rem] font-normal text-[#aaa]">Paris &middot; London &middot; New York &middot; Dubai &middot; Singapore</p>
          </div>

          {/* Col 2 — Platform */}
          <div>
            <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/opportunities" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">Careers</Link></li>
              <li><Link href="/wikilux" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">WikiLux</Link></li>
              <li><Link href="/bloglux" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">BlogLux</Link></li>
              <li><Link href="/salaries" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">Career Intelligence</Link></li>
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">About</Link></li>
              <li><Link href="/faq" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">Terms</Link></li>
            </ul>
          </div>

          {/* Col 4 — Connect */}
          <div>
            <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#999] mb-3">Connect</h4>
            <ul className="space-y-2">
              <li><Link href="/the-brief" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">The Brief</Link></li>
              <li><Link href="/travel" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">Luxury Escape</Link></li>
              <li><Link href="/members" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">Sign In</Link></li>
              <li><Link href="/join" className="font-sans text-sm text-[#555] hover:text-[#1a1a1a] transition-colors">Request Access</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-[#e8e2d8]">
        <div className="jl-container py-2 text-center">
          <p className="font-sans text-[0.6rem] font-normal text-[#aaa] tracking-wide">
            &copy; {new Date().getFullYear()} JOBLUX
          </p>
        </div>
      </div>

    </footer>
  )
}
