'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useMember } from '@/lib/auth-hooks'

/* ── FAQ Data ── */

interface FaqItem {
  q: string
  a: string
}

interface FaqCategory {
  label: string
  items: FaqItem[]
}

const faqData: FaqCategory[] = [
  {
    label: 'About JOBLUX',
    items: [
      {
        q: 'What is JOBLUX?',
        a: 'A private society for luxury industry professionals. Founded in Paris in 2006, bringing together careers, intelligence, and a shared passion for excellence in the premium-to-ultra-luxury segment.',
      },
      {
        q: 'Is JOBLUX free?',
        a: 'Yes. Free to use with no ads, no subscriptions, no paywalls. JOBLUX operates on a "free against contribution" model \u2014 share knowledge to unlock deeper intelligence.',
      },
      {
        q: 'Who can join JOBLUX?',
        a: 'Anyone connected to the luxury industry: professionals at all levels, students aspiring to work in luxury, brands, recruiters, industry enthusiasts. All applications are reviewed and curated.',
      },
      {
        q: 'How is JOBLUX different from LinkedIn?',
        a: 'Exclusively dedicated to the luxury industry. Every feature, piece of content, and person serves the premium-to-ultra-luxury segment. A curated society, not a general-purpose network.',
      },
    ],
  },
  {
    label: 'Joining JOBLUX',
    items: [
      {
        q: 'How do I join?',
        a: 'Click "Request Access" and sign in with Google or LinkedIn. Complete the registration form. Most applications are processed within 24\u201348 hours.',
      },
      {
        q: 'Why was my application not approved?',
        a: 'We review every application to ensure JOBLUX remains relevant to the luxury industry. You may reapply with updated information. Use the contact form below for details.',
      },
      {
        q: 'Can I invite colleagues?',
        a: 'Yes. Approved accounts can invite colleagues via the Invite page on their dashboard.',
      },
      {
        q: 'What are the different tiers?',
        a: 'Rising (students/interns), Pro (junior\u2013mid), Pro+ (managers\u2013directors), Executive (VP/C-Suite), Business (brands/employers), Insider (consultants/influencers). Each tier unlocks different features and intelligence.',
      },
    ],
  },
  {
    label: 'Executive Search & Opportunities',
    items: [
      {
        q: 'What are JOBLUX executive search services?',
        a: 'Bespoke, human-led executive search for manager-level and above positions at luxury maisons globally. We are selective \u2014 quality takes time and we take it.',
      },
      {
        q: 'How does recruitment work?',
        a: 'JOBLUX acts as gatekeeper between candidates and employers. All communication goes through us. Candidates and employers never communicate directly.',
      },
      {
        q: 'Can I apply for opportunities directly?',
        a: 'You can express interest in any listed opportunity. JOBLUX reviews your profile and facilitates the introduction if there\u2019s a match.',
      },
      {
        q: 'Do I pay for recruitment?',
        a: 'Never. Candidates are never charged. Fees are paid by the hiring employer.',
      },
      {
        q: 'Can my company post internships?',
        a: 'Yes. Business-tier accounts can post internship listings for free. All listings are reviewed before publication.',
      },
      {
        q: 'How do I engage JOBLUX for a search assignment?',
        a: 'Use the contact form below and select "I represent a brand or employer".',
      },
    ],
  },
  {
    label: 'Luxury Travel',
    items: [
      {
        q: 'Does JOBLUX offer travel services?',
        a: 'Yes. Curated luxury travel consulting through a network of local advisors worldwide. From hotel bookings to bespoke itineraries.',
      },
      {
        q: 'How do I book luxury travel?',
        a: 'Use the contact form below and select "Luxury travel services".',
      },
      {
        q: 'Who are the travel advisors?',
        a: 'Luxury industry professionals and local experts based in key destinations worldwide. Personal, insider recommendations \u2014 not generic packages.',
      },
    ],
  },
  {
    label: 'Contributions & Intelligence',
    items: [
      {
        q: 'What is the contribution system?',
        a: 'Earn access to deeper intelligence by contributing knowledge. Share salary data, interview experiences, or brand insights to earn points.',
      },
      {
        q: 'Is my contributed data anonymous?',
        a: 'Yes. All salary and interview contributions are anonymised. Your name is never attached to salary figures or interview details.',
      },
      {
        q: 'What is WikiLux?',
        a: 'The luxury industry\u2019s encyclopedia \u2014 500+ brand pages covering history, leadership, culture, careers, salary intelligence. Independently compiled by JOBLUX, enriched by web sources and contributions.',
      },
    ],
  },
  {
    label: 'Privacy & Data',
    items: [
      {
        q: 'How is my data protected?',
        a: 'Encrypted, secure infrastructure, never sold. See Privacy Policy.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Delete your account and all personal data at any time via profile settings or using the contact form below.',
      },
      {
        q: 'Does JOBLUX sell my data?',
        a: 'Absolutely not. JOBLUX never sells, rents, or shares individual data. Only anonymised, aggregated data is used for platform intelligence.',
      },
    ],
  },
  {
    label: 'The Brief',
    items: [
      {
        q: 'What is The Brief?',
        a: 'Biweekly newsletter covering luxury industry moves, salary insights, new opportunities, and WikiLux updates.',
      },
      {
        q: 'How do I unsubscribe?',
        a: 'Every edition includes an unsubscribe link. One click.',
      },
    ],
  },
]

/* ── Chevron SVG ── */

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-[#a58e28] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

/* ── Contact Form Types ── */

type ContactCategory =
  | 'professional'
  | 'brand'
  | 'travel'
  | 'technical'
  | 'press'
  | 'other'

interface CategoryCard {
  key: ContactCategory
  emoji: string
  title: string
  description: string
}

const categoryCards: CategoryCard[] = [
  { key: 'professional', emoji: '\uD83D\uDC64', title: "I'm a luxury professional", description: 'Opportunities, profile, contributions' },
  { key: 'brand', emoji: '\uD83C\uDFE2', title: 'I represent a brand or employer', description: 'Executive search, internships, partnerships' },
  { key: 'travel', emoji: '\u2708\uFE0F', title: 'Luxury travel services', description: 'Booking, consulting, local advisors' },
  { key: 'technical', emoji: '\uD83D\uDD27', title: "Something isn't working", description: 'Technical issue, bug, login problem' },
  { key: 'press', emoji: '\uD83D\uDCF0', title: 'Press enquiry', description: 'Media, interviews, editorial' },
  { key: 'other', emoji: '\uD83D\uDCAC', title: 'Something else', description: 'General question or feedback' },
]

const subcategoryMap: Record<ContactCategory, string[]> = {
  professional: ['About opportunities', 'My profile', 'Contributions & points', 'Salary or interview data', 'Joining JOBLUX', 'Other'],
  brand: ['Executive search services', 'Post an internship', 'Partnership or sponsorship', 'WikiLux brand page', 'Other'],
  travel: ['Booking enquiry', 'Travel consulting', 'Local advisor request', 'Other'],
  technical: ['Login issue', 'Profile or account', 'Content not loading', 'Other bug'],
  press: ['Interview request', 'Data or statistics', 'Editorial collaboration', 'Other'],
  other: ['General feedback', 'Feature suggestion', 'Complaint', 'Other'],
}

const challengeOptions = ['Technology', 'Luxury', 'Finance', 'Healthcare'] as const

/* ── Page Component ── */

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  /* Contact form state */
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [category, setCategory] = useState<ContactCategory | null>(null)
  const [subcategory, setSubcategory] = useState<string | null>(null)
  const [challengePassed, setChallengePassed] = useState(false)
  const [disabledAnswers, setDisabledAnswers] = useState<Set<string>>(new Set())
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [formLoadTimestamp, setFormLoadTimestamp] = useState<number>(0)
  const [sending, setSending] = useState(false)

  const member = useMember()

  /* Pre-fill from auth */
  useEffect(() => {
    if (member.isAuthenticated) {
      if (member.firstName && !name) setName(member.firstName)
      if (member.email && !email) setEmail(member.email)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.isAuthenticated, member.firstName, member.email])

  /* Set timestamp on step 1 load */
  useEffect(() => {
    setFormLoadTimestamp(Date.now())
  }, [])

  function toggleItem(index: number) {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function handleCategoryClick(cat: ContactCategory) {
    setCategory(cat)
    setTimeout(() => setStep(2), 200)
  }

  function handleSubcategoryClick(sub: string) {
    setSubcategory(sub)
    setStep(3)
  }

  function handleChallengeAnswer(answer: string) {
    if (answer === 'Luxury') {
      setChallengePassed(true)
    } else {
      setDisabledAnswers((prev) => new Set(prev).add(answer))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (honeypot) return
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          category,
          subcategory,
          message,
          website_url: honeypot,
          form_load_timestamp: formLoadTimestamp,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setStep(4)
    } catch {
      /* allow retry */
    } finally {
      setSending(false)
    }
  }

  /* Step indicator */
  const totalSteps = 3
  function StepDots() {
    const currentVisual = step >= 4 ? 3 : step
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full ${
              s < currentVisual
                ? 'bg-[#a58e28]'
                : s === currentVisual
                ? 'bg-[#a58e28]'
                : 'border border-[#e8e2d8]'
            }`}
          />
        ))}
      </div>
    )
  }

  /* Build global FAQ index */
  let globalIndex = 0
  const faqSections = faqData.map((category) => {
    const items = category.items.map((item) => {
      const idx = globalIndex
      globalIndex++
      return { ...item, idx }
    })
    return { ...category, items }
  })

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.flatMap((cat) =>
      cat.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      }))
    ),
  }

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-[#1a1a1a]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* ── Header ── */}
      <section className="jl-container pt-24 pb-16 max-w-3xl mx-auto px-6">
        <p className="jl-overline-gold mb-4">Support</p>
        <h1 className="jl-serif text-4xl md:text-5xl font-normal leading-tight mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-[#888] leading-relaxed max-w-2xl">
          Everything you need to know about JOBLUX &mdash; access, opportunities,
          contributions, privacy, and how to get in touch.
        </p>
      </section>

      {/* ── FAQ Accordion ── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        {faqSections.map((cat, ci) => (
          <div key={ci} className="mb-10">
            <div className="jl-section-label">
              <span>{cat.label}</span>
            </div>

            <div>
              {cat.items.map((item) => {
                const isOpen = openItems.has(item.idx)
                return (
                  <div key={item.idx} className="border-b border-[#e8e2d8] py-4">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.idx)}
                      className="w-full flex items-center justify-between text-left gap-4"
                    >
                      <span className="font-semibold text-[#1a1a1a]">
                        {item.q}
                      </span>
                      <ChevronDown open={isOpen} />
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: isOpen ? '500px' : '0px' }}
                    >
                      <p className="text-sm text-[#555] leading-relaxed pt-3">
                        {item.a}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── Smart Multi-Step Contact Form ── */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="jl-section-label">
          <span>Contact</span>
        </div>

        <h2 className="jl-serif text-3xl md:text-4xl font-normal mb-2">
          Get in Touch
        </h2>
        <p className="text-sm text-[#888] mb-8">
          We typically respond within 24&ndash;48 hours.
        </p>

        <StepDots />

        {/* ── Step 1: Category Selection ── */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryCards.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => handleCategoryClick(card.key)}
                className="border border-[#e8e2d8] rounded-sm p-4 text-left hover:border-[#a58e28] transition-colors"
              >
                <span className="text-xl mb-2 block">{card.emoji}</span>
                <span className="font-semibold text-sm block">{card.title}</span>
                <span className="text-xs text-[#888] block mt-1">{card.description}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: Subcategory Pills ── */}
        {step === 2 && category && (
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              {subcategoryMap[category].map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => handleSubcategoryClick(sub)}
                  className="border border-[#e8e2d8] px-3 py-2 text-xs rounded-sm hover:border-[#a58e28] transition-colors"
                >
                  {sub}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setCategory(null)
              }}
              className="text-xs text-[#888] underline underline-offset-2"
            >
              &larr; Back
            </button>
          </div>
        )}

        {/* ── Step 3: Challenge + Form ── */}
        {step === 3 && category && subcategory && (
          <div>
            {/* Breadcrumb */}
            <p className="text-[0.65rem] text-[#a58e28] mb-6">
              {categoryCards.find((c) => c.key === category)?.title} &rsaquo; {subcategory}
            </p>

            {/* Challenge */}
            {!challengePassed && (
              <div>
                <p className="text-sm text-[#1a1a1a] font-semibold mb-3">
                  Quick check &mdash; what industry does JOBLUX serve?
                </p>
                <div className="flex flex-wrap gap-2">
                  {challengeOptions.map((option) => {
                    const isDisabled = disabledAnswers.has(option)
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleChallengeAnswer(option)}
                        className={`border border-[#e8e2d8] px-4 py-2 text-sm rounded-sm transition-colors ${
                          isDisabled
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:border-[#a58e28]'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Form (visible after challenge passed) */}
            {challengePassed && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="jl-input"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="jl-input"
                />
                <textarea
                  placeholder="Your message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="jl-input min-h-[120px]"
                />

                {/* Honeypot */}
                <input
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <button
                  type="submit"
                  disabled={sending}
                  className="jl-btn jl-btn-gold w-full"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
                <p className="text-xs text-[#888] text-center">
                  We typically respond within 24&ndash;48 hours.
                </p>
              </form>
            )}

            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                setStep(2)
                setSubcategory(null)
                setChallengePassed(false)
                setDisabledAnswers(new Set())
              }}
              className="text-xs text-[#888] underline underline-offset-2 mt-6"
            >
              &larr; Back
            </button>
          </div>
        )}

        {/* ── Step 4: Success ── */}
        {step === 4 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full border-2 border-[#a58e28] flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#a58e28]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="jl-serif text-2xl mb-2">Message sent</h3>
            <p className="text-sm text-[#888]">
              Thank you for reaching out. We&apos;ll get back to you within 24&ndash;48 hours.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
