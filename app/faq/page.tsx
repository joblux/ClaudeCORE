'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useMember } from '@/lib/auth-hooks'

const faqData = [
  {
    label: 'About JOBLUX',
    items: [
      { q: 'What is JOBLUX?', a: 'A confidential careers intelligence gateway for the luxury industry. We bring together salary benchmarks, interview insights, brand intelligence, and private executive search across the premium-to-ultra-luxury segment. Free to use, no ads, no data reselling.' },
      { q: 'Who is JOBLUX for?', a: 'Anyone connected to the luxury industry — professionals at all levels, from emerging talent to C-suite executives, across fashion, hospitality, watches & jewelry, beauty, wine & spirits, and travel. All applications are reviewed to maintain relevance and quality.' },
      { q: 'Is JOBLUX free?', a: 'Yes. Free with no subscriptions and no paywalls. JOBLUX operates on a contribution model — share knowledge (salary data, interview experiences, market insights) to unlock deeper intelligence.' },
      { q: 'How is JOBLUX different from other professional networks?', a: 'JOBLUX is exclusively dedicated to the luxury industry. Every feature, every piece of content, and every person on the platform serves the premium-to-ultra-luxury segment. It is a curated intelligence gateway, not a general-purpose social network.' },
    ],
  },
  {
    label: 'Getting started',
    items: [
      { q: 'How do I request access?', a: 'Go to the Connect page and sign in with Google or use a magic link. Complete the registration form with your details and upload your CV. Most applications are reviewed within 24–48 hours.' },
      { q: 'What happens after I apply?', a: "Your application goes to a pending state while the JOBLUX team reviews it. You'll receive a confirmation email immediately. Once approved, you'll receive a welcome email and gain full access to your dashboard." },
      { q: 'What are the access tiers?', a: 'There are five tiers: Emerging Professional (early career), Established Professional (mid-level), Senior & Executive (VP, Director, C-suite), Company (brands and maisons), and Trusted Contributor (consultants, advisors, key voices). Your tier determines the types of opportunities you see, not the content you can access.' },
      { q: 'Can I invite colleagues?', a: 'Yes. Approved professionals can invite colleagues through their Account page via email, contact import, or a personal referral link. Successful referrals earn contribution points.' },
    ],
  },
  {
    label: 'Careers intelligence',
    items: [
      { q: 'What are search assignments?', a: 'Confidential executive search mandates managed by JOBLUX. Every listed role is verified, active, and at manager level or above. Brand names are disclosed after initial screening to protect all parties.' },
      { q: 'How do I apply for a role?', a: 'Click on any assignment and hit Apply. Your Profilux profile will be shared with the JOBLUX team. The hiring maison will not see your details until you approve the introduction.' },
      { q: 'Why are some roles marked confidential?', a: 'Many luxury maisons prefer discretion when recruiting senior talent. JOBLUX acts as the intermediary — the brand name is revealed only after an initial conversation and mutual interest.' },
      { q: 'Do candidates pay any fees?', a: 'Never. Candidates are never charged. All recruitment fees are paid by the hiring employer.' },
      { q: 'How are roles sourced?', a: 'Through direct relationships with luxury maisons, HR teams, and C-suite executives. JOBLUX does not scrape job boards. Every assignment comes from a direct client relationship.' },
    ],
  },
  {
    label: 'Salary & interview data',
    items: [
      { q: 'How does salary intelligence work?', a: 'JOBLUX collects anonymous salary data contributed by luxury professionals. This data is aggregated into benchmarks by role, brand, city, and seniority level. No individual salary is ever exposed.' },
      { q: 'Is my salary contribution anonymous?', a: 'Yes. All salary contributions are fully anonymized. Your name is never attached to salary figures. Only aggregated data appears on the platform.' },
      { q: 'How do I contribute salary data?', a: 'Go to the Contribute page and fill in the salary form — job title, brand, city, base salary, bonus, and benefits. It takes under 2 minutes. Your contribution earns points that unlock deeper salary benchmarks.' },
      { q: 'What are interview experience guides?', a: 'Real interview accounts shared anonymously by professionals who have interviewed at luxury maisons. They cover process, questions asked, timeline, difficulty, and tips — organized by brand and role.' },
    ],
  },
  {
    label: 'Signals & WikiLux',
    items: [
      { q: 'What are signals?', a: "Daily intelligence updates on the luxury industry — leadership changes, brand expansions, restructurings, M&A activity, and growth indicators. Each signal includes career implications so you understand what it means for your next move." },
      { q: 'What is WikiLux?', a: 'The luxury industry encyclopedia — brand pages covering history, leadership, culture, careers, salary intelligence, and hiring patterns. Independently compiled by JOBLUX and continuously updated.' },
      { q: 'How is WikiLux content created?', a: 'WikiLux content is compiled from public sources, industry data, and professional contributions. All content goes through editorial review before publication. Professionals can suggest corrections or additions.' },
    ],
  },
  {
    label: 'Contributions & points',
    items: [
      { q: 'How does the contribution system work?', a: 'Share knowledge — salary data, interview experiences, or market insights — and earn points. Points unlock deeper intelligence across the platform, including detailed salary benchmarks and full interview guides.' },
      { q: 'What counts as a contribution?', a: 'Salary submissions, interview experience write-ups, market signal tips, WikiLux corrections, and colleague referrals. Each type earns a different number of points.' },
      { q: 'What does contributing unlock?', a: 'Full salary benchmark data (unblurred), complete interview guides, priority visibility in search assignments, and Trusted Contributor status after sustained participation.' },
    ],
  },
  {
    label: 'The Brief',
    items: [
      { q: 'What is The Brief?', a: "JOBLUX's biweekly newsletter covering luxury industry moves, salary insights, new assignments, and WikiLux updates. Delivered free to 250,000+ luxury professionals worldwide." },
      { q: 'How do I unsubscribe?', a: 'Every edition includes a one-click unsubscribe link at the bottom.' },
    ],
  },
  {
    label: 'Privacy & data',
    items: [
      { q: 'How is my data protected?', a: 'JOBLUX uses encrypted infrastructure and never sells, rents, or shares individual data with third parties. Only anonymized, aggregated data is used for platform intelligence. See the full Privacy Policy for details.' },
      { q: 'Can I delete my account?', a: 'Yes. You can delete your account and all personal data at any time through your Account page. This action is permanent and compliant with GDPR Article 17 (right to erasure).' },
      { q: 'Can I export my data?', a: 'Yes. GDPR Article 20 grants you the right to data portability. Use the Export My Data option in your Account page to download everything JOBLUX stores about you.' },
      { q: 'Does JOBLUX sell my data?', a: 'Absolutely not. JOBLUX never sells, rents, or shares individual data. No ads, no third-party trackers, no data brokers.' },
    ],
  },
  {
    label: 'Profilux',
    items: [
      { q: 'What is Profilux?', a: 'Your professional profile on JOBLUX — a structured overview of your career, skills, sectors, and availability. It replaces a traditional CV for luxury industry roles and is what the JOBLUX team shares (with your approval) when matching you to assignments.' },
      { q: 'How do I complete my Profilux?', a: 'After approval, go to your Dashboard and click Profilux. Complete each section step by step — personal details, work experience, education, languages, sectors, and availability. Your completion percentage is shown in the top bar.' },
      { q: 'What is the Portfolio section?', a: 'Creative professionals (designers, art directors, visual merchandisers) get an additional Portfolio block to upload images, lookbooks, press features, and list software tools and creative disciplines.' },
    ],
  },
  {
    label: 'For employers',
    items: [
      { q: 'How do I engage JOBLUX for an executive search?', a: "Use the contact form below and select 'I represent a brand or employer.' A member of the team will respond within 24 hours to schedule a confidential consultation." },
      { q: 'What is the search process?', a: "It starts with a conversation — not a form. We discuss the role, the team, the culture, and the unspoken requirements. From there, we identify and discreetly approach candidates from our network. The strongest candidates are found, not applied." },
      { q: 'What are the fees?', a: 'JOBLUX operates on a retained or success-based fee structure depending on the mandate. Fees are always paid by the employer, never the candidate. Details are discussed during the initial consultation.' },
    ],
  },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-[#999] transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [contactOpen, setContactOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [formLoadTimestamp, setFormLoadTimestamp] = useState(0)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const member = useMember()

  useEffect(() => {
    setFormLoadTimestamp(Date.now())
  }, [])

  useEffect(() => {
    if (member.isAuthenticated) {
      if (member.firstName && !name) setName(member.firstName + (member.lastName ? ' ' + member.lastName : ''))
      if (member.email && !email) setEmail(member.email)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.isAuthenticated, member.firstName, member.lastName, member.email])

  function toggleItem(index: number) {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!category || !name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          category,
          subcategory: null,
          message: message.trim(),
          website_url: honeypot,
          form_load_timestamp: formLoadTimestamp,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  // Build global FAQ index
  let globalIndex = 0
  const faqSections = faqData.map(cat => {
    const items = cat.items.map(item => {
      const idx = globalIndex
      globalIndex++
      return { ...item, idx }
    })
    return { ...cat, items }
  })

  // Search filter
  const query = searchQuery.toLowerCase()
  const filteredSections = query
    ? faqSections
        .map(cat => ({
          ...cat,
          items: cat.items.filter(
            item => item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
          ),
        }))
        .filter(cat => cat.items.length > 0)
    : faqSections

  // JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.flatMap(cat =>
      cat.items.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      }))
    ),
  }

  return (
    <main className="min-h-screen bg-[#333]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="max-w-[720px] mx-auto px-7 pt-10 pb-16">

        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-4xl font-normal text-white mb-2"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Help & FAQ
          </h1>
          <p className="text-[14px] text-[#999] leading-relaxed">
            Everything you need to know about JOBLUX.
          </p>
        </div>

        {/* Search */}
        <div className="bg-[#3d3d3d] border border-[#4a4a4a] rounded-lg px-4 py-3 flex items-center gap-3 mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[14px] text-[#ccc] placeholder-[#666] flex-1"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#777] text-sm hover:text-[#ccc]">
              &times;
            </button>
          )}
        </div>

        {/* FAQ Accordion */}
        {filteredSections.map((cat, ci) => (
          <div key={ci} className="mb-7">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] tracking-[1.5px] text-[#bbb] uppercase font-medium whitespace-nowrap">
                {cat.label}
              </span>
              <div className="flex-1 h-px bg-[#444]" />
            </div>

            {cat.items.map(item => {
              const isOpen = openItems.has(item.idx)
              return (
                <div key={item.idx} className="border-b border-[#444]">
                  <button
                    type="button"
                    onClick={() => toggleItem(item.idx)}
                    className="w-full flex items-center justify-between text-left gap-3 py-[14px]"
                  >
                    <span className={`text-[14px] font-medium ${isOpen ? 'text-white' : 'text-[#ccc]'}`}>
                      {item.q}
                    </span>
                    <ChevronIcon open={isOpen} />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isOpen ? '500px' : '0px' }}
                  >
                    <p className="text-[13px] text-[#aaa] leading-[1.75] pb-4 pr-7">
                      {item.a}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {filteredSections.length === 0 && (
          <p className="text-[14px] text-[#999] text-center py-10">
            No results found. Try a different search term or use the contact form below.
          </p>
        )}

        {/* Still need help? */}
        {!contactOpen && !sent && (
          <div className="text-center py-8">
            <button
              onClick={() => {
                setContactOpen(true)
                setFormLoadTimestamp(Date.now())
              }}
              className="inline-block bg-[#3d3d3d] border border-[#555] rounded-lg px-7 py-3.5 text-[14px] text-[#ccc] hover:border-[#999] hover:text-white transition-all"
            >
              Still need help?
            </button>
          </div>
        )}

        {/* Contact Form */}
        {contactOpen && !sent && (
          <div className="mt-4 pt-6 border-t border-[#444]">
            <h2
              className="text-[20px] font-normal text-white mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Get in touch
            </h2>
            <p className="text-[12px] text-[#999] mb-2">We respond within 24–48 hours.</p>
            <p className="text-[12px] text-[#777] mb-5 leading-relaxed">
              JOBLUX LLC<br />
              954 Lexington Ave.<br />
              New York, NY 10021<br />
              United States
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
                className="w-full bg-[#3d3d3d] border border-[#4a4a4a] rounded-md px-3.5 py-3 text-[13px] text-[#ccc] outline-none appearance-none focus:border-[#999]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23999' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingRight: '36px',
                }}
              >
                <option value="">What is this about?</option>
                <option value="professional">I&apos;m a luxury professional</option>
                <option value="brand">I represent a brand or employer</option>
                <option value="technical">Something isn&apos;t working</option>
                <option value="press">Press enquiry</option>
                <option value="other">Something else</option>
              </select>

              <input
                type="text"
                placeholder="Your name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                readOnly={member.isAuthenticated && !!member.firstName}
                className="w-full bg-[#3d3d3d] border border-[#4a4a4a] rounded-md px-3.5 py-3 text-[13px] text-[#ccc] placeholder-[#666] outline-none focus:border-[#999]"
              />

              <input
                type="email"
                placeholder="Your email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                readOnly={member.isAuthenticated && !!member.email}
                className="w-full bg-[#3d3d3d] border border-[#4a4a4a] rounded-md px-3.5 py-3 text-[13px] text-[#ccc] placeholder-[#666] outline-none focus:border-[#999]"
              />

              <textarea
                placeholder="Your message..."
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-[#3d3d3d] border border-[#4a4a4a] rounded-md px-3.5 py-3 text-[13px] text-[#ccc] placeholder-[#666] outline-none focus:border-[#999] min-h-[110px] resize-y"
              />

              {/* Honeypot | hidden from humans */}
              <input
                type="text"
                name="website_url"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {error && (
                <p className="text-[12px] text-[#E24B4A]">{error}</p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-white text-[#333] text-[13px] font-medium rounded-md hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send message'}
              </button>
            </form>

            <div className="text-center mt-3">
              <button
                onClick={() => {
                  setContactOpen(false)
                  setCategory('')
                  setMessage('')
                  setError('')
                }}
                className="text-[11px] text-[#777] underline hover:text-[#999]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {sent && (
          <div className="text-center py-10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth={1.5} className="mx-auto mb-3">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9" />
            </svg>
            <p
              className="text-[18px] text-white mb-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Message sent
            </p>
            <p className="text-[13px] text-[#999]">
              Thank you. We&apos;ll get back to you shortly.
            </p>
          </div>
        )}

      </div>
    </main>
  )
}
