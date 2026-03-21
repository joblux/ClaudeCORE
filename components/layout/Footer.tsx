import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-[#e8e2d8] mt-8 bg-white">

      <div className="jl-container py-8 lg:py-14">
        {/* Mobile: existing layout / Desktop: 4-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Col 1 — Brand */}
          <div>
            {/* Mobile: text logo / Desktop: white SVG on dark would be odd, use gold */}
            <div className="lg:hidden text-lg font-semibold text-[#1a1a1a] tracking-[0.1em] mb-2" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>JOBLUX.</div>
            <Image
              src="/logos/joblux-gold.svg"
              alt="JOBLUX"
              width={120}
              height={28}
              className="hidden lg:block mb-3"
            />
            <p className="font-sans text-xs text-[#888] leading-relaxed mb-3">Luxury Talents Society</p>
            <p className="font-sans text-[0.65rem] text-[#bbb]">Paris &middot; London &middot; New York &middot; Dubai &middot; Singapore</p>
          </div>

          {/* Col 2 — Platform */}
          <div>
            <h4 className="jl-overline text-[#1a1a1a] mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/opportunities" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Careers</Link></li>
              <li><Link href="/wikilux" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">WikiLux</Link></li>
              <li><Link href="/bloglux" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">BlogLux</Link></li>
              <li><Link href="/salaries" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Career Intelligence</Link></li>
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <h4 className="jl-overline text-[#1a1a1a] mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">About</Link></li>
              <li><Link href="/faq" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Terms</Link></li>
            </ul>
          </div>

          {/* Col 4 — Connect */}
          <div>
            <h4 className="jl-overline text-[#1a1a1a] mb-3">Connect</h4>
            <ul className="space-y-2">
              <li><Link href="/the-brief" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">The Brief</Link></li>
              <li><Link href="/travel" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Luxury Escape</Link></li>
              <li><Link href="/members" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Sign In</Link></li>
              <li><Link href="/join" className="font-sans text-xs text-[#888] hover:text-[#1a1a1a] transition-colors">Request Access</Link></li>
            </ul>
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
