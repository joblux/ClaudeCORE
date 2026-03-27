import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-[#141414] border-t border-[#2a2a2a]">
      <div className="max-w-[1200px] mx-auto px-7 py-14 grid grid-cols-[240px_1fr_1fr_1fr] gap-12 items-start">

        {/* Brand */}
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="mb-3"><Image src="/logos/joblux-header.png" alt="JOBLUX" width={78} height={21} className="h-[18px] w-auto brightness-0 invert" /></div>
            <p className="text-[13px] text-[#aaa] leading-relaxed mb-6">Luxury Talent Intelligence</p>
            <div className="flex flex-col gap-1.5 mb-2">
              <p className="text-[13px] text-[#777]">No ads.</p>
              <p className="text-[13px] text-[#777]">No noise.</p>
              <p className="text-[13px] text-[#777]">No data reselling.</p>
              <p className="text-[13px] text-[#777]">Global.</p>
            </div>
          </div>
          <p className="text-[13px] text-[#555] leading-relaxed pt-3">Powered by luxury<br/>industry professionals.</p>
        </div>

        {/* Intelligence */}
        <div>
          <p className="text-[10px] text-[#777] tracking-[0.14em] uppercase mb-5">Intelligence</p>
          <div className="flex flex-col gap-3">
            <Link href="/brands" className="text-[13px] text-[#aaa] hover:text-white transition-colors">WikiLux</Link>
            <Link href="/insights" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Industry news & analysis</Link>
            <Link href="/the-brief" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Biweekly newsletter</Link>
            <Link href="/salaries" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Salary benchmarks</Link>
            <Link href="/interviews" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Interview experiences</Link>
            <Link href="/careers" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Careers intelligence</Link>
          </div>
        </div>

        {/* Services + Escape */}
        <div>
          <p className="text-[10px] text-[#777] tracking-[0.14em] uppercase mb-5">Services</p>
          <div className="flex flex-col gap-3 mb-9">
            <Link href="/services" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Executive search</Link>
            <Link href="/contribute" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Contribute data</Link>
            <Link href="/join" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Request access</Link>
          </div>
          <div className="border-t border-[#222] pt-6">
            <Link href="/escape" className="text-[16px] text-[#a58e28] italic font-serif block mb-2">Escape</Link>
            <p className="text-[12px] text-[#666]">Curated travels.</p>
          </div>
        </div>

        {/* Company */}
        <div>
          <p className="text-[10px] text-[#777] tracking-[0.14em] uppercase mb-5">Company</p>
          <div className="flex flex-col gap-3">
            <Link href="/about" className="text-[13px] text-[#aaa] hover:text-white transition-colors">About</Link>
            <Link href="/faq" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Help & FAQ</Link>
            <Link href="/privacy" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="text-[13px] text-[#aaa] hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1e1e1e] px-7 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <p className="text-[12px] text-[#888]">© 2026 JOBLUX LLC.</p>
          <p className="text-[12px] text-[#666] italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Luxury, decoded.</p>
        </div>
      </div>
    </footer>
  )
}
