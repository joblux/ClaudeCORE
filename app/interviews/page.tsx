import Link from "next/link";

export default function InterviewsPage() {
  return (
    <div>
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Industry Interviews</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
            Conversations with Luxury Leaders
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-xl">
            Exclusive interviews with HR Directors, CEOs and senior executives across the world's finest maisons.
          </p>
        </div>
      </div>

      <div className="jl-container py-10">
        <div className="jl-section-label"><span>Featured</span></div>
        <div className="space-y-4 max-w-2xl mb-10">
          {[
            { name: "Marie Dupont", role: "HR Director · Hermès Paris", topic: "What we look for beyond the CV", date: "March 2026" },
            { name: "James Chen", role: "VP Talent · Richemont Asia", topic: "Building luxury teams in Singapore and Hong Kong", date: "February 2026" },
            { name: "Sofia Bianchi", role: "CEO · Italian Jewellery Maison", topic: "From family business to global luxury brand", date: "February 2026" },
            { name: "David Laurent", role: "Regional Director · LVMH Gulf", topic: "Why Dubai is the most competitive luxury market", date: "January 2026" },
          ].map((interview) => (
            <div key={interview.name} className="jl-card flex items-start gap-4 group">
              <div className="w-12 h-12 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#a58e28] transition-colors">
                <span className="jl-serif text-lg text-[#a58e28] group-hover:text-[#1a1a1a]">{interview.name[0]}</span>
              </div>
              <div>
                <div className="font-sans text-sm font-medium text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">{interview.name}</div>
                <div className="jl-overline mt-0.5">{interview.role}</div>
                <div className="font-sans text-xs text-[#666] mt-2 leading-relaxed italic">{interview.topic}</div>
                <div className="jl-overline mt-2">{interview.date}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-[#fafaf5] border border-[#e8e2d8] text-center max-w-2xl">
          <div className="jl-overline-gold mb-2">More Interviews</div>
          <p className="font-sans text-sm text-[#666] mb-4">
            Full archive of 50+ interviews with luxury industry leaders. Members only.
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
