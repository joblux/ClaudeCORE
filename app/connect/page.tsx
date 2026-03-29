import Link from 'next/link'

export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2">

        <Link href="/join" className="group flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#1e1e1e] bg-[#0f0f0f] hover:bg-[#121208] transition-colors duration-300">
          <div className="max-w-[600px] ml-auto w-full px-8 md:px-16 pt-20 pb-6">
            <p className="text-[0.6rem] tracking-[2.5px] uppercase font-medium text-[#a58e28] mb-8">Employers & Luxury Brands</p>
            <h2 className="text-3xl md:text-4xl font-light text-white leading-snug mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              I represent a brand,<br />group, or organisation
            </h2>
            <p className="text-sm text-[#666] leading-relaxed mb-8 max-w-sm">
              Discreet executive search and talent intelligence — built exclusively for the luxury sector.
            </p>
            <ul className="space-y-3 max-w-sm">
              {['Submit a confidential talent brief','Access sector salary benchmarks','Connect with our search team','Post assignments discreetly'].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#555]">
                  <span className="mt-[7px] w-[4px] h-[4px] rounded-full bg-[#2e2e2e] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="max-w-[600px] ml-auto w-full px-8 md:px-16 pb-20 pt-10">
            <span className="inline-block text-[0.75rem] font-medium tracking-wide text-[#a58e28] border border-[rgba(165,142,40,0.35)] rounded px-5 py-3 group-hover:bg-[rgba(165,142,40,0.06)] transition-colors">
              Request access →
            </span>
          </div>
        </Link>

        <Link href="/join" className="group flex flex-col justify-between bg-[#0a0f0c] hover:bg-[#0c130f] transition-colors duration-300">
          <div className="max-w-[600px] mr-auto w-full px-8 md:px-16 pt-20 pb-6">
            <p className="text-[0.6rem] tracking-[2.5px] uppercase font-medium text-[#1D9E75] mb-8">Professionals, Experts & Contributors</p>
            <h2 className="text-3xl md:text-4xl font-light text-white leading-snug mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              I work in or advise<br />the luxury industry
            </h2>
            <p className="text-sm text-[#666] leading-relaxed mb-8 max-w-sm">
              Build your Profilux, contribute intelligence, and be seen by the industry&apos;s top decision-makers.
            </p>
            <ul className="space-y-3 max-w-sm">
              {['Create your Profilux profile','Contribute salary & interview data','Access the career intelligence feed','Be considered for opportunities'].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#555]">
                  <span className="mt-[7px] w-[4px] h-[4px] rounded-full bg-[#1a2e26] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="max-w-[600px] mr-auto w-full px-8 md:px-16 pb-20 pt-10">
            <span className="inline-block text-[0.75rem] font-medium tracking-wide text-[#1D9E75] border border-[rgba(29,158,117,0.35)] rounded px-5 py-3 group-hover:bg-[rgba(29,158,117,0.06)] transition-colors">
              Begin with the right profile →
            </span>
          </div>
        </Link>

      </div>

      <div className="border-t border-[#1e1e1e] py-5 text-center">
        <p className="text-xs text-[#3a3a3a]">
          Already have access?{" "}
          <Link href="/join" className="text-[#666] underline hover:text-[#aaa] transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
