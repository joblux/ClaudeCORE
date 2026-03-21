'use client'

import { useState, FormEvent } from 'react'

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
        a: 'JOBLUX is a private luxury talents society — a members-only platform connecting professionals who work in or aspire to work in the luxury industry. It combines career intelligence, curated opportunities, editorial content, and a vetted professional directory.',
      },
      {
        q: 'Who is JOBLUX for?',
        a: 'JOBLUX is for anyone who works in, has worked in, or wants to work in the luxury sector — from boutique advisors and store managers to regional directors, artisans, marketing leads, and corporate professionals across fashion, jewellery, watches, hospitality, beauty, and more.',
      },
      {
        q: 'Is JOBLUX a recruitment agency?',
        a: 'No. JOBLUX is not a recruitment agency. We are an intelligence platform and professional society. We surface curated opportunities and connect talent with maisons, but we do not act as intermediaries or charge placement fees.',
      },
      {
        q: 'How is JOBLUX different from LinkedIn or other job boards?',
        a: 'JOBLUX is built exclusively for the luxury industry. Every feature — from the directory to the editorial content to the salary data — is designed for this world. There is no noise, no irrelevant content, and no algorithm trying to sell you something. It is a focused, curated, members-first environment.',
      },
    ],
  },
  {
    label: 'Membership',
    items: [
      {
        q: 'How do I become a member?',
        a: 'You can apply to join JOBLUX through our registration page. All applications are reviewed to ensure the community remains relevant and high-quality. Membership is open to professionals with genuine ties to the luxury industry.',
      },
      {
        q: 'Is membership free?',
        a: 'Core membership is free. We may introduce premium tiers in the future with additional features, but the foundational experience — directory access, opportunities, editorial, and contributions — will always be available to approved members.',
      },
      {
        q: 'Can I join if I don\'t currently work in luxury?',
        a: 'Yes. If you have prior experience in the luxury sector or a genuine aspiration to enter it, you are welcome to apply. JOBLUX values potential and passion as much as current tenure.',
      },
      {
        q: 'Can I be removed from JOBLUX?',
        a: 'Members who violate our terms of use, misrepresent their identity, or behave in ways that undermine the community may have their membership revoked. We reserve the right to maintain the integrity of the society.',
      },
    ],
  },
  {
    label: 'Opportunities & Recruitment',
    items: [
      {
        q: 'How are opportunities sourced?',
        a: 'Opportunities are curated from verified luxury employers, direct maison partnerships, and trusted industry contacts. We do not scrape job boards or aggregate irrelevant listings.',
      },
      {
        q: 'Can I apply to roles directly through JOBLUX?',
        a: 'Yes. Where available, you can express interest or apply directly through the platform. Some roles may redirect you to the employer\'s own application process.',
      },
      {
        q: 'I\'m a recruiter or maison — can I post roles on JOBLUX?',
        a: 'Yes. We work with select luxury employers and recruitment partners. Please contact us at mo@joblux.com to discuss posting opportunities or partnership options.',
      },
      {
        q: 'Do you offer coaching or career support?',
        a: 'Yes. JOBLUX offers a coaching programme designed for luxury professionals at all levels. Whether you\'re preparing for an interview, navigating a career transition, or looking to move into a new maison, our coaching sessions provide tailored, industry-specific guidance.',
      },
    ],
  },
  {
    label: 'Contributions & Intelligence',
    items: [
      {
        q: 'What are contributions?',
        a: 'Contributions are anonymous insights shared by JOBLUX members — salary data, interview experiences, company reviews, and workplace intelligence. They help the community make more informed career decisions.',
      },
      {
        q: 'Are contributions anonymous?',
        a: 'Yes. All contributions are fully anonymous. We never reveal who submitted a contribution, and data is aggregated so that no individual can be identified.',
      },
      {
        q: 'Why should I contribute?',
        a: 'The luxury industry has long operated behind closed doors. Contributions help level the playing field — giving professionals the transparency they deserve when it comes to pay, culture, and hiring practices. The more members contribute, the more valuable the platform becomes for everyone.',
      },
    ],
  },
  {
    label: 'Privacy & Data',
    items: [
      {
        q: 'How is my data protected?',
        a: 'We take data protection seriously. All personal data is stored securely, and we comply with GDPR and applicable data protection regulations. We never sell your data to third parties. See our Privacy Policy for full details.',
      },
      {
        q: 'Who can see my profile?',
        a: 'Your profile is visible only to other approved JOBLUX members. You control what information is displayed, and you can adjust your visibility settings at any time from your dashboard.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. You can request account deletion at any time by contacting us at hello@joblux.com. We will remove your personal data in accordance with our Privacy Policy and applicable regulations.',
      },
    ],
  },
  {
    label: 'The Brief',
    items: [
      {
        q: 'What is The Brief?',
        a: 'The Brief is JOBLUX\'s editorial publication — a curated mix of industry analysis, career intelligence, interviews with luxury professionals, and thought pieces on the world of luxury. It is written for insiders, by insiders.',
      },
      {
        q: 'Can I write for The Brief?',
        a: 'Yes. We welcome pitches from luxury professionals who have something meaningful to share. If you have an idea for an article, interview, or opinion piece, reach out to us at hello@joblux.com with a brief outline.',
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

/* ── Page Component ── */

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Enquiry', message: '' })
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  function toggleItem(key: string) {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed')
      setFormStatus('success')
      setFormData({ name: '', email: '', subject: 'General Enquiry', message: '' })
    } catch {
      setFormStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">

      {/* ── Header ── */}
      <section className="jl-container pt-24 pb-16 max-w-3xl mx-auto px-6">
        <p className="jl-overline-gold mb-4">Support</p>
        <h1 className="jl-serif text-4xl md:text-5xl font-normal leading-tight mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-[#888] leading-relaxed max-w-2xl">
          Everything you need to know about JOBLUX — membership, opportunities,
          contributions, privacy, and how to get in touch.
        </p>
      </section>

      {/* ── FAQ Accordion ── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        {faqData.map((category, ci) => (
          <div key={ci} className="mb-10">
            <div className="jl-section-label">
              <span>{category.label}</span>
            </div>

            <div>
              {category.items.map((item, ii) => {
                const key = `${ci}-${ii}`
                const isOpen = openItems.has(key)
                return (
                  <div key={key} className="border-b border-[#e8e2d8]">
                    <button
                      type="button"
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-center justify-between py-4 text-left gap-4"
                    >
                      <span className="font-semibold text-[0.95rem] leading-snug">
                        {item.q}
                      </span>
                      <ChevronDown open={isOpen} />
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{ maxHeight: isOpen ? '500px' : '0px' }}
                    >
                      <p className="text-sm text-[#555] leading-relaxed pb-4">
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

      {/* ── Contact Section ── */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="jl-section-label">
          <span>Contact</span>
        </div>

        <h2 className="jl-serif text-3xl md:text-4xl font-normal mb-8">
          Get in Touch
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* ── Left: Info ── */}
          <div>
            <p className="text-[0.95rem] text-[#555] leading-relaxed mb-6">
              Whether you have a question about membership, want to explore a partnership,
              or need help with your account — we are here to help.
            </p>
            <div className="space-y-3 text-sm text-[#555]">
              <p>
                <span className="font-semibold text-[#1a1a1a]">General enquiries</span><br />
                <a href="mailto:hello@joblux.com" className="text-[#a58e28] underline underline-offset-2">
                  hello@joblux.com
                </a>
              </p>
              <p>
                <span className="font-semibold text-[#1a1a1a]">Recruitment &amp; partnerships</span><br />
                <a href="mailto:mo@joblux.com" className="text-[#a58e28] underline underline-offset-2">
                  mo@joblux.com
                </a>
              </p>
              <p className="pt-2 text-xs tracking-wide uppercase text-[#888] font-medium">
                Paris &nbsp;|&nbsp; London &nbsp;|&nbsp; Global
              </p>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="jl-input"
            />
            <input
              type="email"
              placeholder="Your email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="jl-input"
            />
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="jl-select"
            >
              <option>General Enquiry</option>
              <option>Recruitment</option>
              <option>Partnership</option>
              <option>Press</option>
              <option>Technical Issue</option>
              <option>Other</option>
            </select>
            <textarea
              placeholder="Your message"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="jl-input min-h-[120px] resize-y"
            />
            <button
              type="submit"
              disabled={formStatus === 'sending'}
              className="jl-btn jl-btn-gold w-full"
            >
              {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
            </button>

            {formStatus === 'success' && (
              <p className="text-sm text-green-700 mt-2">
                Message sent. We&apos;ll get back to you shortly.
              </p>
            )}
            {formStatus === 'error' && (
              <p className="text-sm text-red-600 mt-2">
                Something went wrong. Please try again or email us directly.
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  )
}
