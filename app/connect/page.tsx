import Link from 'next/link'

export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">

      <div className="flex-1 flex flex-col md:flex-row">

        {/* EMPLOYERS */}
        <Link href="/services/recruitment" className="group flex-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#1e1e1e] bg-[#0f0f0f] hover:bg-[#121208] transition-colors duration-300">
          <div className="max-w-[500px] mx-auto w-full px-10 md:px-14 pt-16 pb-6">
            <p className="text-[0.6rem] tracking-[2.5px] uppercase font-medium text-[#a58e28] mb-6">Employers & Luxury Brands</p>
            <h2 className="text-2xl md:text-3xl font-light text-white leading-snug mb-5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              I represent a brand,<br />group, or organisation
            </h2>
            <p className="text-sm text-[#666] leading-relaxed mb-8">
              Discreet executive search and talent intelligence — built exclusively for the luxury sector.
            </p>
            <ul className="space-y-3">
              {[
                'Submit a confidential talent brief',
                'Access sector salary benchmarks',
                'Connect with our search team',
                'Post assignments discreetly',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#555]">
                  <span className="mt-[6px] w-[4px] h-[4px] rounded-full bg-[#2e2e2e] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="max-w-[500px] mx-auto w-full px-10 md:px-14 pb-16 pt-10">
            <span className="inline-block text-[0.75rem] font-medium tracking-wide text-[#a58e28] border border-[rgba(165,142,40,0.35)] rounded px-5 py-3 group-hover:bg-[rgba(165,142,40,0.06)] transition-colors">
              Request access →
            </span>
          </div>
        </Link>

        {/* PROFESSIONALS */}
        <Link href="/join" className="group flex-1 flex flex-col justify-between bg-[#0a0f0c] hover:bg-[#0c130f] transition-colors duration-300">
          <div className="max-w-[500px] mx-auto w-full px-10 md:px-14 pt-16 pb-6">
            <p className="text-[0.6rem] tracking-[2.5px] uppercase font-medium text-[#1D9E75] mb-6">Professionals, Experts & Contributors</p>
            <h2 className="text-2xl md:text-3xl font-light text-white leading-snug mb-5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              I work in or advise<br />the luxury industry
            </h2>
            <p className="text-sm text-[#666] leading-relaxed mb-8">
              Build your Profilux, contribute intelligence, and be seen by the industry&apos;s top decision-makers.
            </p>
            <ul className="space-y-3">
              {[
                'Create your Profilux profile',
                'Contribute salary & interview data',
                'Access the career intelligence feed',
                'Be considered for opportunities',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#555]">
                  <span className="mt-[6px] w-[4px] h-[4px] rounded-full bg-[#1a2e26] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="max-w-[500px] mx-auto w-full px-10 md:px-14 pb-16 pt-10">
            <span className="inline-block text-[0.75rem] font-medium tracking-wide text-[#1D9E75] border border-[rgba(29,158,117,0.35)] rounded px-5 py-3 group-hover:bg-[rgba(29,158,117,0.06)] transition-colors">
              Begin with the right profile →
            </span>
          </div>
        </Link>

      </div>

      {/* SIGN IN ROW */}
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
