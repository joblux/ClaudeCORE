import Link from "next/link";

export default function SalariesPage() {
  return (
    <div>
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Salary Intelligence</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
            Luxury Industry Compensation
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-xl">
            Real salary data from JOBLUX placements across Paris, London, New York, Dubai and Singapore.
          </p>
        </div>
      </div>

      <div className="jl-container py-10">
        <div className="jl-section-label"><span>Q1 2026 Benchmarks</span></div>
        <div className="space-y-0 max-w-2xl mb-10">
          {[
            { role: "Store Director", market: "Paris Flagship", range: "€95–130K", yoy: "+6%" },
            { role: "Buying Director", market: "RTW · Paris", range: "€80–110K", yoy: "+8%" },
            { role: "Regional Director", market: "Dubai · UAE", range: "AED 350–450K", yoy: "+11%" },
            { role: "HR Director", market: "Group Level", range: "€110–150K", yoy: "+9%" },
            { role: "Country Manager", market: "London · UK", range: "£110–135K", yoy: "+7%" },
            { role: "Client Advisor", market: "Flagship Paris", range: "€32–45K", yoy: "+5%" },
            { role: "E-commerce Director", market: "Paris", range: "€90–120K", yoy: "+14%" },
            { role: "Visual Merchandising Dir.", market: "Milan", range: "€70–95K", yoy: "+6%" },
          ].map((s) => (
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

        <div className="p-6 bg-[#fafaf5] border border-[#e8e2d8] text-center max-w-2xl">
          <div className="jl-overline-gold mb-2">Full Salary Guide</div>
          <p className="font-sans text-sm text-[#666] mb-4">
            Detailed compensation data by role, market, seniority and maison tier. Members only.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/members" className="jl-btn jl-btn-primary">Sign In</Link>
            <Link href="/join" className="jl-btn jl-btn-outline">Request Access</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
