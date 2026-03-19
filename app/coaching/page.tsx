import Link from "next/link";

export default function CoachingPage() {
  return (
    <div>
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Coaching</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
            Your Luxury Career, Decoded
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-xl">
            Interview preparation, recruiter expectations, career strategies and insider knowledge from twenty years placing luxury professionals.
          </p>
        </div>
      </div>

      <div className="jl-container py-10">
        <div className="max-w-3xl">

          <div className="jl-section-label"><span>Interview Preparation</span></div>
          <div className="space-y-4 mb-10">
            {[
              { title: "What Luxury Recruiters Really Look For", desc: "Beyond the CV — the unspoken criteria that determine who gets the role. Discretion, cultural fit, brand sensitivity and the signals recruiters read in the first 30 seconds.", tag: "Essential" },
              { title: "The Hermès Interview: What to Expect", desc: "The most selective hiring process in luxury. How to prepare for the culture-first approach, the artisan mindset test, and why your relationship with objects matters.", tag: "Brand Guide" },
              { title: "LVMH Group Interview Process", desc: "From first screening to final round. How LVMH evaluates candidates across its 75 maisons, the group-level competency framework, and what the talent team prioritises.", tag: "Brand Guide" },
              { title: "Richemont: The Swiss Approach to Luxury Talent", desc: "Precision, discretion, longevity. How Richemont's hiring philosophy differs from French luxury groups and what they expect from senior candidates.", tag: "Brand Guide" },
            ].map((item) => (
              <div key={item.title} className="jl-card group">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">{item.title}</h3>
                  <span className="jl-badge text-[0.55rem] flex-shrink-0">{item.tag}</span>
                </div>
                <p className="font-sans text-xs text-[#888] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="jl-section-label"><span>Career Strategy</span></div>
          <div className="space-y-4 mb-10">
            {[
              { title: "Moving from Premium to Ultra-Luxury", desc: "The career leap most professionals get wrong. How to position yourself for Chanel, Hermès or Patek Philippe when your background is accessible luxury." },
              { title: "Luxury Career Paths by Function", desc: "Retail, buying, marketing, HR, finance — how each function works inside a maison, typical progression timelines, and where the ceiling is." },
              { title: "Relocating for Luxury: Paris vs Dubai vs Singapore", desc: "Compensation differences, lifestyle trade-offs, visa realities and which market is right for your career stage." },
              { title: "The Confidential Job Market", desc: "Why 80% of luxury positions above €100K are never publicly posted, how the hidden market works, and how to position yourself for confidential approaches." },
            ].map((item) => (
              <div key={item.title} className="jl-card group">
                <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors">{item.title}</h3>
                <p className="font-sans text-xs text-[#888] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="jl-section-label"><span>Recruiter Insights</span></div>
          <div className="space-y-4 mb-10">
            {[
              { title: "How to Write a Luxury CV", desc: "The formatting rules, the mandatory sections, and the three things that get your CV rejected in under 10 seconds. Plus: cover letter — yes or no?" },
              { title: "LinkedIn for Luxury Professionals", desc: "What to show, what to hide, and why most luxury professionals get their LinkedIn profile wrong. The discreet approach that actually works." },
              { title: "Salary Negotiation in Luxury", desc: "When to negotiate, how to benchmark, and the compensation elements most candidates forget to ask for. Variable, relocation, wardrobe allowance, and more." },
              { title: "Red Flags Recruiters See Instantly", desc: "Job-hopping patterns, misaligned maison tiers, title inflation, and the subtle signals that disqualify senior candidates before the first call." },
            ].map((item) => (
              <div key={item.title} className="jl-card group">
                <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors">{item.title}</h3>
                <p className="font-sans text-xs text-[#888] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-6 bg-[#1a1a1a] text-center">
            <div className="jl-overline-gold mb-2">Members Only</div>
            <p className="font-sans text-sm text-[#888] mb-4">
              Full career guides, interview prep kits and recruiter insights. Available to approved JOBLUX members.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/members" className="jl-btn jl-btn-gold">Sign In</Link>
              <Link href="/join" className="jl-btn jl-btn-ghost">Request Access</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
