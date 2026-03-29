import Link from 'next/link'

export default function ConnectPage() {
  return (
    <div className="bg-[#0f0f0f] flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2">

        <Link href="/join" className="group flex flex-col border-b md:border-b-0 md:border-r border-[#1e1e1e] bg-[#0f0f0f] hover:bg-[#121208] transition-colors duration-300">
          <div className="max-w-[600px] ml-auto w-full px-8 md:px-16 pt-16 pb-8">
            <p className="text-[0.6rem] tracking-[2.5px] uppercase font-medium text-[#a58e28] mb-8">Employers & Luxury Brands</p>
            <h2 className="text-3xl md:text-4xl font-light text-white leading-snug mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              I represent a brand,<br />group, or organisation
            </h2>
            <p className="text-sm text-[#777] leading-relaxed mb-8 max-w-sm">
              Your confidential intelligence gateway to luxury talent — whether you're hiring, benchmarking, or simply staying ahead.
            </p>
            <ul className="space-y-3 max-w-sm">
              {[
                { text: 'Access salary benchmarks across markets', link: null },
                { text: 'Track talent movement across 500+ houses', link: null },
                { text: 'Contribute market intelligence discreetly', link: null },
                { text: 'Read exclusive industry news', link: null },
                { text: 'Work directly with our search team', link: null },
                { text: 'Request a manager and up level search', link: '/services/recruitment' },
                { text: 'And more...', link: null, muted: true },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm">
                  <span className="mt-[7px] w-[4px] h-[4px] rounded-full bg-[#2a2a2a] flex-shrink-0" />
                  {item.link ? (
                    <Link href={item.link} className="text-[#888] underline underline-offset-4 decoration-[#444] hover:text-[#ccc] transition-colors">{item.text}</Link>
                  ) : (
                    <span className={item.muted ? 'text-[#333] italic' : 'text-[#555]'}>{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="max-w-[600px] ml-auto w-full px-8 md:px-16 pb-12">
            <span className="inline-block text-[0.75rem] font-medium tracking-wide text-[#a58e28] border border-[rgba(165,142,40,0.35)] rounded px-5 py-3 group-hover:bg-[rgba(165,142,40,0.06)] transition-colors">
              Request access →
            </span>
          </div>
        </Link>

        <Link href="/select-profile" className="group flex flex-col bg-[#0a0f0c] hover:bg-[#0c130f] transition-colors duration-300">
          <div className="max-w-[600px] mr-auto w-full px-8 md:px-16 pt-16 pb-8">
            <p className="text-[0.6rem] tracking-[2.5px] uppercase font-medium text-[#1D9E75] mb-8">Professionals, Experts & Contributors</p>
            <h2 className="text-3xl md:text-4xl font-light text-white leading-snug mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              I work in or advise<br />the luxury industry
            </h2>
            <p className="text-sm text-[#777] leading-relaxed mb-8 max-w-sm">
              Where luxury careers are shaped in private. Be seen by the right people — without being on the market.
            </p>
            <ul className="space-y-3 max-w-sm">
              {[
                { text: 'Build your confidential Profilux profile', link: null },
                { text: 'Access salary intelligence across brands', link: null },
                { text: 'Contribute interview & career experiences', link: null },
                { text: 'Follow signals across 500+ luxury houses', link: null },
                { text: 'Read exclusive industry news', link: null },
                { text: 'Be considered for exclusive assignments', link: null },
                { text: 'And more...', link: null, muted: true },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm">
                  <span className="mt-[7px] w-[4px] h-[4px] rounded-full bg-[#1a2e26] flex-shrink-0" />
                  {item.link ? (
                    <Link href={item.link} className="text-[#888] underline underline-offset-4 decoration-[#444] hover:text-[#ccc] transition-colors">{item.text}</Link>
                  ) : (
                    <span className={item.muted ? 'text-[#333] italic' : 'text-[#555]'}>{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="max-w-[600px] mr-auto w-full px-8 md:px-16 pb-12">
            <span className="inline-block text-[0.75rem] font-medium tracking-wide text-[#1D9E75] border border-[rgba(29,158,117,0.35)] rounded px-5 py-3 group-hover:bg-[rgba(29,158,117,0.06)] transition-colors">
              Request access →
            </span>
          </div>
        </Link>

      </div>

      <div className="border-t border-[#1e1e1e] py-4 text-center">
        <p className="text-[11px] text-[#3a3a3a] mb-2 tracking-wide">
          No noise&nbsp;&nbsp;·&nbsp;&nbsp;No ads&nbsp;&nbsp;·&nbsp;&nbsp;No data reselling
        </p>
        <p className="text-xs text-[#2e2e2e]">
          Already have access?{" "}
          <Link href="/join" className="text-[#666] underline hover:text-[#aaa] transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

    </div>
  )
}
