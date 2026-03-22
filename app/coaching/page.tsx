import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Intelligence — JOBLUX",
  openGraph: {
    title: "Career Intelligence — JOBLUX",
    images: [
      {
        url: "https://www.luxuryrecruiter.com/api/og?title=Career+Intelligence&subtitle=Luxury+Industry+Careers&type=page",
        width: 1200,
        height: 630,
        alt: "Career Intelligence | JOBLUX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Intelligence — JOBLUX",
    images: ["https://www.luxuryrecruiter.com/api/og?title=Career+Intelligence&subtitle=Luxury+Industry+Careers&type=page"],
  },
};

const salaryData = [
  { role: "Store Director", market: "Paris Flagship", range: "\u20ac95\u2013130K", yoy: "+6%" },
  { role: "Buying Director", market: "RTW \u00b7 Paris", range: "\u20ac80\u2013110K", yoy: "+8%" },
  { role: "Regional Director", market: "Dubai \u00b7 UAE", range: "AED 350\u2013450K", yoy: "+11%" },
  { role: "HR Director", market: "Group Level", range: "\u20ac110\u2013150K", yoy: "+9%" },
  { role: "Country Manager", market: "London \u00b7 UK", range: "\u00a3110\u2013135K", yoy: "+7%" },
  { role: "Client Advisor", market: "Flagship Paris", range: "\u20ac32\u201345K", yoy: "+5%" },
  { role: "E-commerce Director", market: "Paris", range: "\u20ac90\u2013120K", yoy: "+14%" },
  { role: "Visual Merchandising Dir.", market: "Milan", range: "\u20ac70\u201395K", yoy: "+6%" },
];

export default function CareerIntelligencePage() {
  return (
    <div className="bg-[#f5f4f0] min-h-screen">
      <div className="border-b-2 border-[#1a1a1a] py-10 bg-white">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Career Intelligence</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
            Career Intelligence
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-xl">
            Compensation benchmarks, interview preparation, career strategies and recruiter insights from twenty years placing luxury professionals.
          </p>
        </div>
      </div>

      <div className="jl-container py-12 lg:py-16">
        <div className="max-w-3xl">

          {/* SECTION 1 — SALARY INTELLIGENCE */}
          <div className="jl-section-label"><span>Salary Intelligence</span></div>
          <h2 className="jl-serif text-xl font-light text-[#1a1a1a] mb-1">Q1 2026 Compensation Benchmarks</h2>
          <p className="font-sans text-[0.65rem] text-[#aaa] mb-6">Data from JOBLUX placements across Paris, London, New York, Dubai, Singapore</p>
          <div className="space-y-0 mb-10">
            {salaryData.map((s) => (
              <div key={s.role} className="flex items-center justify-between py-3 border-b border-[#f0ece4]">
                <div>
                  <div className="font-sans text-sm font-medium text-[#1a1a1a]">{s.role}</div>
                  <div className="font-sans text-[0.65rem] text-[#aaa] mt-0.5">{s.market}</div>
                </div>
                <div className="text-right">
                  <div className="font-sans text-sm font-semibold text-[#1a1a1a]">{s.range}</div>
                  <div className="font-sans text-[0.65rem] text-green-600 mt-0.5">{s.yoy} YoY</div>
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 2 — INTERVIEW PREPARATION */}
          <div className="jl-section-label"><span>Interview Preparation</span></div>
          <div className="space-y-4 mb-10">
            {[
              { title: "What Luxury Recruiters Really Look For", desc: "Beyond the CV \u2014 the unspoken criteria that determine who gets the role. Discretion, cultural fit, brand sensitivity and the signals recruiters read in the first 30 seconds.", tag: "Essential" },
              { title: "The Herm\u00e8s Interview: What to Expect", desc: "The most selective hiring process in luxury. How to prepare for the culture-first approach, the artisan mindset test, and why your relationship with objects matters.", tag: "Brand Guide" },
              { title: "LVMH Group Interview Process", desc: "From first screening to final round. How LVMH evaluates candidates across its 75 maisons, the group-level competency framework, and what the talent team prioritises.", tag: "Brand Guide" },
              { title: "Richemont: The Swiss Approach to Luxury Talent", desc: "Precision, discretion, longevity. How Richemont\u2019s hiring philosophy differs from French luxury groups and what they expect from senior candidates.", tag: "Brand Guide" },
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

          {/* SECTION 3 — CAREER STRATEGY */}
          <div className="jl-section-label"><span>Career Strategy</span></div>
          <div className="space-y-4 mb-10">
            {[
              { title: "Moving from Premium to Ultra-Luxury", desc: "The career leap most professionals get wrong. How to position yourself for Chanel, Herm\u00e8s or Patek Philippe when your background is accessible luxury." },
              { title: "Luxury Career Paths by Function", desc: "Retail, buying, marketing, HR, finance \u2014 how each function works inside a maison, typical progression timelines, and where the ceiling is." },
              { title: "Relocating for Luxury: Paris vs Dubai vs Singapore", desc: "Compensation differences, lifestyle trade-offs, visa realities and which market is right for your career stage." },
              { title: "The Confidential Job Market", desc: "Why 80% of luxury positions above \u20ac100K are never publicly posted, how the hidden market works, and how to position yourself for confidential approaches." },
            ].map((item) => (
              <div key={item.title} className="jl-card group">
                <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors">{item.title}</h3>
                <p className="font-sans text-xs text-[#888] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* SECTION 4 — RECRUITER INSIGHTS */}
          <div className="jl-section-label"><span>Recruiter Insights</span></div>
          <div className="space-y-4 mb-10">
            {[
              { title: "How to Write a Luxury CV", desc: "The formatting rules, the mandatory sections, and the three things that get your CV rejected in under 10 seconds. Plus: cover letter \u2014 yes or no?" },
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

          {/* MEMBERS GATE */}
          <div className="p-6 bg-[#222222] text-center">
            <div className="jl-overline-gold mb-2">Members Only</div>
            <p className="font-sans text-sm text-[#888] mb-4">
              Full career guides, interview prep kits, salary data and recruiter insights. Available to approved JOBLUX members.
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
