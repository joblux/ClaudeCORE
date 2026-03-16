import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Request Access — JOBLUX',
  description: 'Request access to JOBLUX — the private platform for luxury industry professionals at Manager level and above.',
}

export default function MembersPage() {
  return (
    <div>
      {/* HERO */}
      <div className="bg-[#1a1a1a] py-14">
        <div className="jl-container-xs text-center">
          <div className="jl-overline-gold mb-4">Members</div>
          <h1 className="jl-serif text-4xl font-light text-white mb-4">
            A Private Platform for Luxury's Senior Professionals
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-md mx-auto leading-relaxed">
            By invitation or application only. Manager to Executive level. €100K+. 5+ years in luxury.
          </p>
        </div>
      </div>

      <div className="jl-container py-12">
        <div className="jl-container-sm mx-auto">

          {/* THREE TYPES */}
          <div className="jl-section-label"><span>Who Can Join</span></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                type:  'Candidate',
                desc:  'Luxury professional at Manager level or above. €100K+ current or target salary. 5+ years in luxury. Seeking your next role discreetly.',
                items: ['Private professional profile','Access to confidential mandates','Personalised job alerts','Full salary intelligence','Interview prep per maison'],
                href:  '/members/request-access?type=candidate',
                cta:   'Apply as Candidate',
              },
              {
                type:  'Employer',
                desc:  'Luxury maison, brand or group seeking Manager to Executive level talent. Submit confidential hiring briefs handled personally by JOBLUX.',
                items: ['Submit confidential briefs','Receive curated shortlists','Salary benchmarking data','Market intelligence reports','Discreet — no public posting'],
                href:  '/members/request-access?type=employer',
                cta:   'Apply as Employer',
              },
              {
                type:  'Influencer',
                desc:  'Writer, speaker or expert in the luxury industry. Contribute to Bloglux, build your public profile and reach JOBLUX\'s professional audience.',
                items: ['Publish on Bloglux','Public author profile','Reach luxury professionals','Build your authority','Editorial review process'],
                href:  '/members/request-access?type=influencer',
                cta:   'Apply as Influencer',
              },
            ].map((t) => (
              <div key={t.type} className="jl-card flex flex-col">
                <div className="jl-overline-gold mb-2">{t.type}</div>
                <p className="font-sans text-xs text-[#888] leading-relaxed mb-4">{t.desc}</p>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {t.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 font-sans text-xs text-[#555]">
                      <span className="text-[#c8960c] flex-shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={t.href} className="jl-btn jl-btn-primary w-full justify-center text-[0.6rem]">
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* SIGN IN */}
          <div className="border-t border-[#e8e2d8] pt-10 text-center">
            <p className="font-sans text-sm text-[#888] mb-4">
              Already a member?
            </p>
            <Link href="/members/signin" className="jl-btn jl-btn-outline">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
