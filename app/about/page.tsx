import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Story | JOBLUX | Luxury Talents Society',
  description:
    'From a Paris boutique and a London flat — twenty years building the luxury industry\'s intelligence layer. The story of JOBLUX.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white">

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <p className="text-[11px] tracking-[0.14em] uppercase text-[#a58e28] mb-4 font-medium">
          Our story
        </p>
        <h1 className="font-playfair text-4xl md:text-5xl font-normal leading-tight mb-8">
          From a Paris boutique<br className="hidden md:block" /> and a London flat.
        </h1>
        <p className="text-lg leading-relaxed text-white/60 border-l-2 border-[#a58e28] pl-6 max-w-2xl">
          JOBLUX was not built by investors or algorithms. It was built by two people
          who understood luxury from the inside — one as a retailer in Paris, one as a
          builder in London — and spent twenty years refusing to make it anything other
          than what the industry actually needed.
        </p>
      </section>

      {/* ── Founders ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="border border-white/10 rounded-xl p-7 bg-white/[0.03]">
            <div className="w-10 h-10 rounded-full bg-[#a58e28]/20 border border-[#a58e28]/40 flex items-center justify-center text-[#a58e28] text-sm font-medium mb-5">
              MM
            </div>
            <p className="text-base font-medium text-white mb-1">Mohammed M&apos;zaour</p>
            <p className="text-xs text-[#a58e28] tracking-wide mb-4">Co-founder &middot; Paris</p>
            <p className="text-sm leading-relaxed text-white/55">
              Luxury retail professional with deep insider knowledge of how the great
              maisons hire, develop talent, and protect their brand. The industry
              intelligence behind the concept — still shaping the platform today.
            </p>
          </div>
          <div className="border border-white/10 rounded-xl p-7 bg-white/[0.03]">
            <div className="w-10 h-10 rounded-full bg-[#a58e28]/20 border border-[#a58e28]/40 flex items-center justify-center text-[#a58e28] text-sm font-medium mb-5">
              AM
            </div>
            <p className="text-base font-medium text-white mb-1">Alex Mason</p>
            <p className="text-xs text-[#a58e28] tracking-wide mb-4">Co-founder &middot; London</p>
            <p className="text-sm leading-relaxed text-white/55">
              Web developer and the technical architect behind the platform — building
              every iteration of JOBLUX from the ground up, and continuing to shape
              it today.
            </p>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-white/10" />
      </div>

      {/* ── Timeline ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-[11px] tracking-[0.14em] uppercase text-[#a58e28] mb-14 font-medium">
          Twenty years &middot; Four chapters
        </p>

        {/* Chapter I */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-24">
          {/* Illustration */}
          <div className="rounded-xl border border-white/10 overflow-hidden bg-[#111111]">
            <svg viewBox="0 0 320 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
              {/* Sky */}
              <rect width="320" height="200" fill="#111111"/>
              {/* Eiffel Tower */}
              <polygon points="160,38 147,112 173,112" fill="none" stroke="#a58e28" strokeWidth="1" opacity="0.7"/>
              <line x1="151" y1="63" x2="169" y2="63" stroke="#a58e28" strokeWidth="0.8" opacity="0.6"/>
              <line x1="148" y1="85" x2="172" y2="85" stroke="#a58e28" strokeWidth="0.8" opacity="0.6"/>
              <rect x="147" y="112" width="26" height="6" rx="1" fill="none" stroke="#a58e28" strokeWidth="0.8" opacity="0.5"/>
              <rect x="151" y="118" width="18" height="22" rx="1" fill="none" stroke="#a58e28" strokeWidth="0.8" opacity="0.5"/>
              {/* Buildings left */}
              <rect x="18" y="118" width="38" height="62" rx="2" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15"/>
              <rect x="26" y="128" width="7" height="9" rx="1" fill="#a58e28" opacity="0.2"/>
              <rect x="37" y="128" width="7" height="9" rx="1" fill="#a58e28" opacity="0.2"/>
              <rect x="26" y="142" width="7" height="9" rx="1" fill="#a58e28" opacity="0.2"/>
              <rect x="37" y="142" width="7" height="9" rx="1" fill="#a58e28" opacity="0.2"/>
              <rect x="60" y="100" width="52" height="80" rx="2" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15"/>
              <rect x="69" y="110" width="9" height="11" rx="1" fill="#a58e28" opacity="0.18"/>
              <rect x="82" y="110" width="9" height="11" rx="1" fill="#a58e28" opacity="0.18"/>
              <rect x="95" y="110" width="9" height="11" rx="1" fill="#a58e28" opacity="0.18"/>
              {/* Buildings right */}
              <rect x="210" y="106" width="52" height="74" rx="2" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15"/>
              <rect x="219" y="116" width="9" height="11" rx="1" fill="#a58e28" opacity="0.18"/>
              <rect x="232" y="116" width="9" height="11" rx="1" fill="#a58e28" opacity="0.18"/>
              <rect x="245" y="116" width="9" height="11" rx="1" fill="#a58e28" opacity="0.18"/>
              <rect x="267" y="122" width="36" height="58" rx="2" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15"/>
              {/* Boutique storefront */}
              <rect x="118" y="138" width="84" height="42" rx="2" fill="none" stroke="#a58e28" strokeWidth="1" opacity="0.8"/>
              <rect x="128" y="147" width="24" height="26" rx="1" fill="#a58e28" opacity="0.1"/>
              <rect x="168" y="147" width="24" height="26" rx="1" fill="#a58e28" opacity="0.1"/>
              <line x1="156" y1="147" x2="156" y2="173" stroke="#a58e28" strokeWidth="0.6" opacity="0.4"/>
              {/* Sign */}
              <rect x="124" y="133" width="72" height="11" rx="1" fill="#a58e28" opacity="0.18"/>
              <text x="160" y="141" textAnchor="middle" fontSize="5.5" fill="#a58e28" fontFamily="sans-serif" fontWeight="500" opacity="0.9">JOBLUX</text>
              {/* Ground */}
              <line x1="10" y1="180" x2="310" y2="180" stroke="white" strokeWidth="0.4" opacity="0.1"/>
              <text x="160" y="194" textAnchor="middle" fontSize="9" fill="#a58e28" fontFamily="sans-serif" opacity="0.5">Paris</text>
            </svg>
          </div>
          {/* Text */}
          <div>
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#a58e28] font-medium mb-2">Chapter I</p>
            <h2 className="font-playfair text-2xl font-normal mb-5 leading-snug">2006 — The agency</h2>
            <p className="text-sm leading-relaxed text-white/55 mb-5">
              Paris and London. A luxury retail professional and a web developer decide
              that luxury hiring deserves its own platform — not a tab on a generalist
              job board. JOBLUX launches as a boutique recruitment agency dedicated
              exclusively to the luxury retail world, placing professionals across
              fashion, jewellery, hospitality, design and beauty. The approach is
              direct and human: insider knowledge, no noise.
            </p>
            <span className="text-[10px] tracking-wide text-[#a58e28] border border-[#a58e28]/30 rounded px-2 py-1">
              Paris &middot; London &middot; Boutique agency
            </span>
          </div>
        </div>

        {/* Chapter II */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-24">
          {/* Text first on mobile, second on desktop */}
          <div className="order-2 md:order-1">
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#a58e28] font-medium mb-2">Chapter II</p>
            <h2 className="font-playfair text-2xl font-normal mb-5 leading-snug">2007–2012 — The job board</h2>
            <p className="text-sm leading-relaxed text-white/55 mb-5">
              JOBLUX expands with a dedicated UK platform, becoming one of the first
              niche luxury job boards operating across Britain and France simultaneously.
              The world&apos;s most established maisons advertise their openings here.
              The platform combines a public-facing board with discreet executive search —
              reach for some, discretion for others.
            </p>
            <span className="text-[10px] tracking-wide text-[#a58e28] border border-[#a58e28]/30 rounded px-2 py-1">
              UK &middot; France &middot; Niche job board &middot; Brand partnerships
            </span>
          </div>
          {/* Illustration */}
          <div className="order-1 md:order-2 rounded-xl border border-white/10 overflow-hidden bg-[#111111]">
            <svg viewBox="0 0 320 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
              <rect width="320" height="200" fill="#111111"/>
              {/* Monitor */}
              <rect x="80" y="35" width="160" height="108" rx="6" fill="none" stroke="white" strokeWidth="0.8" opacity="0.2"/>
              <rect x="86" y="41" width="148" height="96" rx="3" fill="white" opacity="0.03"/>
              {/* Header bar */}
              <rect x="86" y="41" width="148" height="10" rx="3" fill="#a58e28" opacity="0.4"/>
              <text x="160" y="48.5" textAnchor="middle" fontSize="5" fill="#111" fontFamily="sans-serif" fontWeight="600">JOBLUX &middot; LUXURY JOB BOARD</text>
              {/* Listing rows */}
              <rect x="94" y="58" width="85" height="5" rx="1" fill="white" opacity="0.2"/>
              <rect x="183" y="58" width="32" height="5" rx="1" fill="#a58e28" opacity="0.5"/>
              <line x1="94" y1="68" x2="222" y2="68" stroke="white" strokeWidth="0.3" opacity="0.15"/>
              <rect x="94" y="73" width="95" height="5" rx="1" fill="white" opacity="0.2"/>
              <rect x="193" y="73" width="28" height="5" rx="1" fill="#a58e28" opacity="0.5"/>
              <line x1="94" y1="83" x2="222" y2="83" stroke="white" strokeWidth="0.3" opacity="0.15"/>
              <rect x="94" y="88" width="74" height="5" rx="1" fill="white" opacity="0.2"/>
              <rect x="172" y="88" width="40" height="5" rx="1" fill="#a58e28" opacity="0.5"/>
              <line x1="94" y1="98" x2="222" y2="98" stroke="white" strokeWidth="0.3" opacity="0.15"/>
              <rect x="94" y="103" width="88" height="5" rx="1" fill="white" opacity="0.2"/>
              <rect x="186" y="103" width="30" height="5" rx="1" fill="#a58e28" opacity="0.5"/>
              <line x1="94" y1="113" x2="222" y2="113" stroke="white" strokeWidth="0.3" opacity="0.15"/>
              <rect x="94" y="118" width="78" height="5" rx="1" fill="white" opacity="0.2"/>
              <rect x="176" y="118" width="36" height="5" rx="1" fill="#a58e28" opacity="0.5"/>
              {/* Monitor stand */}
              <rect x="150" y="143" width="20" height="8" rx="1" fill="none" stroke="white" strokeWidth="0.6" opacity="0.15"/>
              <rect x="134" y="151" width="52" height="4" rx="2" fill="none" stroke="white" strokeWidth="0.6" opacity="0.15"/>
              {/* Flags */}
              <rect x="94" y="165" width="15" height="10" rx="1" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2"/>
              <line x1="94" y1="170" x2="109" y2="170" stroke="#003087" strokeWidth="3" opacity="0.4"/>
              <rect x="114" y="165" width="15" height="10" rx="1" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2"/>
              <line x1="114" y1="170" x2="129" y2="170" stroke="#002395" strokeWidth="3" opacity="0.4"/>
              <text x="136" y="173" fontSize="7" fill="white" fontFamily="sans-serif" opacity="0.3">UK &middot; France</text>
              <text x="160" y="194" textAnchor="middle" fontSize="9" fill="#a58e28" fontFamily="sans-serif" opacity="0.5">2007 – 2012</text>
            </svg>
          </div>
        </div>

        {/* Chapter III */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-24">
          {/* Illustration */}
          <div className="rounded-xl border border-white/10 overflow-hidden bg-[#111111]">
            <svg viewBox="0 0 320 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
              <rect width="320" height="200" fill="#111111"/>
              {/* Central node */}
              <circle cx="160" cy="92" r="20" fill="#a58e28" opacity="0.12" stroke="#a58e28" strokeWidth="1"/>
              <text x="160" y="89" textAnchor="middle" fontSize="6.5" fill="#a58e28" fontFamily="sans-serif" fontWeight="600">JOBLUX</text>
              <text x="160" y="99" textAnchor="middle" fontSize="5.5" fill="#a58e28" fontFamily="sans-serif" opacity="0.7">community</text>
              {/* Satellite nodes */}
              <circle cx="88" cy="50" r="12" fill="white" opacity="0.04" stroke="white" strokeWidth="0.5"/>
              <circle cx="232" cy="50" r="12" fill="white" opacity="0.04" stroke="white" strokeWidth="0.5"/>
              <circle cx="55" cy="118" r="12" fill="white" opacity="0.04" stroke="white" strokeWidth="0.5"/>
              <circle cx="265" cy="118" r="12" fill="white" opacity="0.04" stroke="white" strokeWidth="0.5"/>
              <circle cx="108" cy="158" r="12" fill="white" opacity="0.04" stroke="white" strokeWidth="0.5"/>
              <circle cx="212" cy="158" r="12" fill="white" opacity="0.04" stroke="white" strokeWidth="0.5"/>
              <circle cx="160" cy="36" r="10" fill="#a58e28" opacity="0.1" stroke="#a58e28" strokeWidth="0.6"/>
              {/* Connections */}
              <line x1="160" y1="72" x2="88" y2="62" stroke="#a58e28" strokeWidth="0.7" opacity="0.3"/>
              <line x1="160" y1="72" x2="232" y2="62" stroke="#a58e28" strokeWidth="0.7" opacity="0.3"/>
              <line x1="141" y1="98" x2="67" y2="118" stroke="#a58e28" strokeWidth="0.7" opacity="0.3"/>
              <line x1="179" y1="98" x2="253" y2="118" stroke="#a58e28" strokeWidth="0.7" opacity="0.3"/>
              <line x1="145" y1="110" x2="118" y2="146" stroke="#a58e28" strokeWidth="0.7" opacity="0.3"/>
              <line x1="175" y1="110" x2="202" y2="146" stroke="#a58e28" strokeWidth="0.7" opacity="0.3"/>
              <line x1="160" y1="72" x2="160" y2="46" stroke="#a58e28" strokeWidth="0.7" opacity="0.4"/>
              {/* Node labels */}
              <text x="88" y="53" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="sans-serif" opacity="0.4">Fashion</text>
              <text x="232" y="53" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="sans-serif" opacity="0.4">Jewellery</text>
              <text x="55" y="121" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="sans-serif" opacity="0.4">Beauty</text>
              <text x="265" y="121" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="sans-serif" opacity="0.4">Hotels</text>
              <text x="108" y="161" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="sans-serif" opacity="0.4">Design</text>
              <text x="212" y="161" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="sans-serif" opacity="0.4">Gastronomy</text>
              <text x="160" y="39" textAnchor="middle" fontSize="5.5" fill="#a58e28" fontFamily="sans-serif" opacity="0.7">Forums</text>
              <text x="160" y="194" textAnchor="middle" fontSize="9" fill="#a58e28" fontFamily="sans-serif" opacity="0.5">2013 – 2022</text>
            </svg>
          </div>
          {/* Text */}
          <div>
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#a58e28] font-medium mb-2">Chapter III</p>
            <h2 className="font-playfair text-2xl font-normal mb-5 leading-snug">2013–2022 — The community</h2>
            <p className="text-sm leading-relaxed text-white/55 mb-5">
              As professional networks reshape how industries connect, JOBLUX evolves
              again — groups, forums, member profiles and LinkedIn-style social features
              are woven into the job board. A genuine community forms. Thousands of
              luxury professionals share intelligence, discuss trends, and find
              opportunities without the noise of generalist platforms. At its peak,
              the only place of its kind.
            </p>
            <span className="text-[10px] tracking-wide text-[#a58e28] border border-[#a58e28]/30 rounded px-2 py-1">
              Social network &middot; Groups &middot; Forums &middot; Community
            </span>
          </div>
        </div>

        {/* Chapter IV */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-8">
          {/* Text */}
          <div className="order-2 md:order-1">
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#a58e28] font-medium mb-2">Chapter IV</p>
            <h2 className="font-playfair text-2xl font-normal mb-5 leading-snug">2023 — present<br/>The intelligence platform</h2>
            <p className="text-sm leading-relaxed text-white/55 mb-5">
              The rebuild is not a pivot — it is a clarification. JOBLUX strips away
              everything borrowed from other models and commits fully to what it has
              always done best: intelligence, discretion, depth. No subscriptions.
              No advertising. No sponsored content. A new principle takes hold —
              free against contribution.
            </p>
            <span className="text-[10px] tracking-wide text-[#a58e28] border border-[#a58e28]/30 rounded px-2 py-1">
              AI era &middot; WikiLux &middot; Bloglux &middot; Executive search
            </span>
          </div>
          {/* Illustration */}
          <div className="order-1 md:order-2 rounded-xl border border-white/10 overflow-hidden bg-[#111111]">
            <svg viewBox="0 0 320 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
              <rect width="320" height="200" fill="#111111"/>
              {/* Central diamond */}
              <polygon points="160,45 204,90 160,135 116,90" fill="#a58e28" opacity="0.1" stroke="#a58e28" strokeWidth="1"/>
              <text x="160" y="85" textAnchor="middle" fontSize="7" fill="#a58e28" fontFamily="sans-serif" fontWeight="600">WikiLux</text>
              <text x="160" y="97" textAnchor="middle" fontSize="5.5" fill="#a58e28" fontFamily="sans-serif" opacity="0.7">500+ brands</text>
              {/* Modules */}
              <rect x="36" y="58" width="56" height="28" rx="4" fill="none" stroke="white" strokeWidth="0.6" opacity="0.2"/>
              <text x="64" y="70" textAnchor="middle" fontSize="6.5" fill="white" fontFamily="sans-serif" opacity="0.5" fontWeight="500">Bloglux</text>
              <text x="64" y="80" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="sans-serif" opacity="0.3">Editorial</text>
              <rect x="228" y="58" width="56" height="28" rx="4" fill="none" stroke="white" strokeWidth="0.6" opacity="0.2"/>
              <text x="256" y="70" textAnchor="middle" fontSize="6.5" fill="white" fontFamily="sans-serif" opacity="0.5" fontWeight="500">Salary data</text>
              <text x="256" y="80" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="sans-serif" opacity="0.3">Intelligence</text>
              <rect x="36" y="112" width="56" height="28" rx="4" fill="none" stroke="#a58e28" strokeWidth="0.7" opacity="0.4"/>
              <text x="64" y="124" textAnchor="middle" fontSize="6.5" fill="#a58e28" fontFamily="sans-serif" opacity="0.7" fontWeight="500">Search</text>
              <text x="64" y="134" textAnchor="middle" fontSize="5.5" fill="#a58e28" fontFamily="sans-serif" opacity="0.5">Executive</text>
              <rect x="228" y="112" width="56" height="28" rx="4" fill="none" stroke="white" strokeWidth="0.6" opacity="0.2"/>
              <text x="256" y="124" textAnchor="middle" fontSize="6.5" fill="white" fontFamily="sans-serif" opacity="0.5" fontWeight="500">Interviews</text>
              <text x="256" y="134" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="sans-serif" opacity="0.3">Industry voices</text>
              {/* Connectors */}
              <line x1="116" y1="90" x2="92" y2="82" stroke="#a58e28" strokeWidth="0.6" opacity="0.35"/>
              <line x1="204" y1="90" x2="228" y2="80" stroke="#a58e28" strokeWidth="0.6" opacity="0.35"/>
              <line x1="116" y1="90" x2="92" y2="122" stroke="#a58e28" strokeWidth="0.6" opacity="0.35"/>
              <line x1="204" y1="90" x2="228" y2="122" stroke="#a58e28" strokeWidth="0.6" opacity="0.35"/>
              {/* Free pill */}
              <rect x="118" y="152" width="84" height="15" rx="3" fill="#a58e28" opacity="0.12" stroke="#a58e28" strokeWidth="0.6"/>
              <text x="160" y="162.5" textAnchor="middle" fontSize="6" fill="#a58e28" fontFamily="sans-serif" fontWeight="500">Free &middot; No ads &middot; Contribution</text>
              <text x="160" y="194" textAnchor="middle" fontSize="9" fill="#a58e28" fontFamily="sans-serif" opacity="0.5">2023 — present</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-white/10" />
      </div>

      {/* ── Principles ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-playfair text-3xl font-normal mb-5">Free against contribution</h2>
        <p className="text-sm leading-relaxed text-white/55 mb-3 max-w-2xl">
          JOBLUX today operates on a model the luxury industry has rarely seen applied
          to professional intelligence: everything we publish is freely accessible to
          those who belong here. No paywalls, no access tiers driving content,
          no advertisers shaping what you read.
        </p>
        <p className="text-sm leading-relaxed text-white/55 mb-12 max-w-2xl">
          What we ask in return is contribution — of knowledge, expertise, editorial
          perspective, and data. The platform grows because its members are better than
          what they consume elsewhere.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              title: 'WikiLux',
              desc: '500+ luxury brands across 12 categories in 9 languages. The most rigorous open brand directory in the industry.',
            },
            {
              title: 'Bloglux',
              desc: 'Original editorial from inside the luxury world — not press releases, not sponsored content. Real industry perspective.',
            },
            {
              title: 'Salary intelligence',
              desc: 'The transparency the luxury sector has long avoided. Compensation data globally, from manager to C-suite.',
            },
            {
              title: 'Executive search',
              desc: 'Manager to C-suite, worldwide. Discreet, precise, conducted by people who have spent careers inside the industry.',
            },
          ].map((p) => (
            <div
              key={p.title}
              className="border border-white/10 border-t-[#a58e28] border-t-2 rounded-xl p-6 bg-white/[0.02]"
            >
              <p className="text-sm font-medium text-white mb-2">{p.title}</p>
              <p className="text-sm leading-relaxed text-white/50">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing quote ── */}
      <section className="max-w-4xl mx-auto px-6 pb-28">
        <div className="border-l-2 border-[#a58e28] pl-6 py-2">
          <p className="font-playfair text-xl font-normal leading-relaxed text-white/80 italic">
            &ldquo;Twenty years in, JOBLUX is not a job board, not a social network,
            not an agency. It is what the luxury industry has always needed and rarely
            had — a place built entirely in its image.&rdquo;
          </p>
        </div>
      </section>

    </main>
  )
}
