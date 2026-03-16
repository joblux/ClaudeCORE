import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'About JOBLUX — Luxury Talents Intelligence',
  description: 'JOBLUX is the private intelligence platform for luxury industry professionals. Est. Paris 2006. Executive search, market intelligence, WikiLux encyclopedia.',
}

export default function AboutPage() {
  return (
    <div>
      {/* HERO */}
      <div className="border-b-2 border-[#1a1a1a] py-14">
        <div className="jl-container-xs">
          <div className="jl-overline-gold mb-4">About</div>
          <h1 className="jl-serif text-4xl md:text-5xl font-light text-[#1a1a1a] mb-6 leading-tight">
            Twenty Years Inside<br />the Luxury Industry
          </h1>
          <p className="font-sans text-base text-[#555] leading-relaxed">
            JOBLUX was established in Paris in 2006 as the first dedicated intelligence platform for luxury industry professionals. What began as the leading luxury job board has evolved into something more ambitious — a private platform where the world's finest maisons and their most senior professionals connect, discreetly.
          </p>
        </div>
      </div>

      <div className="jl-container py-12">
        <div className="jl-container-xs mx-auto">

          {/* STORY */}
          <div className="jl-prose mb-12">
            <h2>What We Do</h2>
            <p>
              JOBLUX operates at the intersection of three disciplines: executive search, market intelligence and luxury culture. We place managers, directors and executives across the world's most prestigious maisons — from Paris flagships to regional leadership roles in Dubai, Singapore and beyond.
            </p>
            <p>
              Our intelligence platform — WikiLux, Bloglux, our salary guides and The Brief — is read by luxury professionals across 50+ countries. It is the only platform that treats luxury as both a business and a culture, with the depth and discretion the industry demands.
            </p>

            <h2>Our Approach</h2>
            <p>
              We do not post jobs publicly and wait for applications. We identify, approach and present the right talent for each mandate — discretely, precisely, and with a deep understanding of what each maison values beyond the job description.
            </p>
            <p>
              Every candidate in our database has been personally reviewed and approved. Every mandate we accept is handled with full confidentiality. This is not a job board. It is a private network.
            </p>

            <h2>Our Markets</h2>
            <p>
              We operate across the world's five most important luxury markets: Paris, London, New York, Dubai and Singapore. Each market has its own dynamics, its own culture and its own talent landscape. We understand all five.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-t border-b border-[#e8e2d8] mb-12">
            {[
              { n: '2006',   l: 'Est. Paris'          },
              { n: '20+',    l: 'Years in luxury'     },
              { n: '100K+',  l: 'Professionals'       },
              { n: '5',      l: 'Global markets'      },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="jl-serif text-3xl font-light text-[#c8960c]">{s.n}</div>
                <div className="jl-overline mt-2">{s.l}</div>
              </div>
            ))}
          </div>

          {/* THREE SERVICES */}
          <div className="jl-section-label"><span>What JOBLUX Offers</span></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                n:    '01',
                title:'Executive Search',
                desc: 'Manager to Executive level placements across the luxury industry. €100K+. Confidential mandates, curated shortlists, discreet process.',
                href: '/jobs',
                cta:  'View positions',
              },
              {
                n:    '02',
                title:'Intelligence',
                desc: 'WikiLux encyclopedia, salary guides, market reports, industry interviews and The Brief newsletter. The luxury industry\'s intelligence layer.',
                href: '/wikilux',
                cta:  'Explore WikiLux',
              },
              {
                n:    '03',
                title:'Travel Advisory',
                desc: 'Private luxury travel itineraries curated for discerning professionals. Destination guides, hotel intelligence, insider access.',
                href: '/travel',
                cta:  'Explore Travel',
              },
            ].map((s) => (
              <div key={s.n} className="jl-card">
                <div className="jl-serif text-3xl font-light text-[#e8e2d8] mb-4">{s.n}</div>
                <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] mb-2">{s.title}</h3>
                <p className="font-sans text-xs text-[#888] leading-relaxed mb-4">{s.desc}</p>
                <Link href={s.href} className="jl-overline-gold hover:underline">{s.cta} →</Link>
              </div>
            ))}
          </div>

          {/* CONTACT */}
          <div className="jl-section-label"><span>Contact</span></div>
          <div className="bg-[#fafaf5] border border-[#e8e2d8] p-6">
            <p className="font-sans text-sm text-[#666] leading-relaxed mb-4">
              For executive search mandates, press enquiries or general questions — we respond within 24 hours.
            </p>
            <div className="space-y-2">
              <div className="font-sans text-xs text-[#888]">
                <span className="font-semibold text-[#1a1a1a]">Executive Search:</span>{' '}
                <a href="mailto:search@joblux.com" className="text-[#c8960c] hover:underline">search@joblux.com</a>
              </div>
              <div className="font-sans text-xs text-[#888]">
                <span className="font-semibold text-[#1a1a1a]">Press:</span>{' '}
                <a href="mailto:press@joblux.com" className="text-[#c8960c] hover:underline">press@joblux.com</a>
              </div>
              <div className="font-sans text-xs text-[#888]">
                <span className="font-semibold text-[#1a1a1a]">General:</span>{' '}
                <a href="mailto:hello@joblux.com" className="text-[#c8960c] hover:underline">hello@joblux.com</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
