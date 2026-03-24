'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const TRAVEL_STYLES = [
  'Accessible Travel', 'Active Travel', 'Adventure Travel', 'All-Inclusive Travel',
  'Arts & Culture', 'Babymoons', 'Bachelor Party', 'Bachelorette Party', 'Beaches',
  'Birthdays', 'Black Travel', 'Boutique Travel', 'City Travel', 'Couples Travel',
  'Cruises', 'Destination Weddings', 'Digital Nomad Travel', 'Domestic Travel',
  'Family Travel', 'Food & Wine', 'Group Travel', 'Honeymoons', 'International Travel',
  'LGBTQ+ Travel', 'Local Travel', 'Luxury Travel', 'Nature Escapes',
  'Off the Beaten Path', 'Pet-Friendly Travel', 'Road Trip Travel', 'Safari',
  'Slow Travel', 'Solo Travel', 'Sustainable Travel', 'Tropical Vacations',
  'Weekend Getaways', 'Wellness Travel',
]

function PlanForm() {
  const searchParams = useSearchParams()
  const source = searchParams.get('source')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [destinations, setDestinations] = useState('')
  const [preferredDates, setPreferredDates] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/escape/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          preferred_language: preferredLanguage.trim() || null,
          travel_styles: selectedStyles,
          destinations: destinations.trim() || null,
          preferred_dates: preferredDates.trim() || null,
          special_needs: specialNeeds.trim() || null,
          budget_range: budgetRange.trim() || null,
          notes: notes.trim() || null,
          source_context: source || null,
          source_page: typeof window !== 'undefined' ? window.location.href : null,
        }),
      })
      if (res.ok) setSubmitted(true)
    } catch {}
    setSubmitting(false)
  }

  const inputClass =
    'w-full px-4 py-3 text-sm rounded border border-[#E0D9CA] bg-white focus:outline-none focus:border-[#2B4A3E]'

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F7F3E8' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#2B4A3E] flex items-center justify-center mx-auto mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '28px',
              color: '#2B4A3E',
            }}
          >
            Thank you
          </h1>
          <p className="mt-3" style={{ fontSize: '14px', color: '#555' }}>
            Your advisor will be in touch within 24 hours to begin crafting your journey.
          </p>
          <Link
            href="/escape"
            className="inline-block mt-8 bg-[#2B4A3E] text-white px-8 py-3 rounded text-sm font-medium"
          >
            Back to Escape
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F3E8' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          href="/escape"
          className="text-sm mb-8 inline-block"
          style={{ color: '#B8975C' }}
        >
          &larr; Escape
        </Link>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '28px',
            color: '#1A1A1A',
          }}
        >
          Talk to an advisor
        </h1>
        <p className="mt-2 mb-8" style={{ fontSize: '14px', color: '#777' }}>
          Tell us about the trip you have in mind. A local travel advisor will be in touch
          to book a meeting.
        </p>

        {source && (
          <div
            className="rounded px-4 py-3 mb-8"
            style={{ backgroundColor: '#FDF8EE', fontSize: '14px', color: '#B8975C' }}
          >
            Planning: {source}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block font-medium mb-1.5"
                style={{ fontSize: '13px', color: '#1A1A1A' }}
              >
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                className="block font-medium mb-1.5"
                style={{ fontSize: '13px', color: '#1A1A1A' }}
              >
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label
              className="block font-medium mb-1.5"
              style={{ fontSize: '13px', color: '#1A1A1A' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              className="block font-medium mb-1.5"
              style={{ fontSize: '13px', color: '#1A1A1A' }}
            >
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (000) 000-0000"
              className={inputClass}
            />
          </div>

          <div>
            <label
              className="block font-medium mb-1.5"
              style={{ fontSize: '13px', color: '#1A1A1A' }}
            >
              Preferred language
            </label>
            <input
              type="text"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              placeholder="e.g. English, French, Arabic, Japanese"
              className={inputClass}
            />
          </div>

          <div>
            <label
              className="block font-medium mb-1.5"
              style={{ fontSize: '13px', color: '#1A1A1A' }}
            >
              Travel style
            </label>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_STYLES.map((style) => {
                const isSelected = selectedStyles.includes(style)
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleStyle(style)}
                    className="px-3 py-1.5 rounded-full border transition-colors"
                    style={{
                      fontSize: '12.5px',
                      backgroundColor: isSelected ? '#2B4A3E' : '#FFFDF7',
                      borderColor: isSelected ? '#2B4A3E' : '#E0D9CA',
                      color: isSelected ? '#FFFFFF' : '#555555',
                    }}
                  >
                    {style}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label
              className="block font-medium mb-1.5"
              style={{ fontSize: '13px', color: '#1A1A1A' }}
            >
              Destinations
            </label>
            <input
              type="text"
              value={destinations}
              onChange={(e) => setDestinations(e.target.value)}
              placeholder="e.g. Morocco, Japan, or open to suggestions"
              className={inputClass}
            />
          </div>

          <div>
            <label
              className="block font-medium mb-1.5"
              style={{ fontSize: '13px', color: '#1A1A1A' }}
            >
              Preferred dates
            </label>
            <input
              type="text"
              value={preferredDates}
              onChange={(e) => setPreferredDates(e.target.value)}
              placeholder="e.g. mid-April, flexible on duration"
              className={inputClass}
            />
          </div>

          <div>
            <label
              className="block font-medium mb-1.5"
              style={{ fontSize: '13px', color: '#1A1A1A' }}
            >
              Special needs
            </label>
            <input
              type="text"
              value={specialNeeds}
              onChange={(e) => setSpecialNeeds(e.target.value)}
              placeholder="e.g. accessibility, dietary, traveling with children"
              className={inputClass}
            />
          </div>

          <div>
            <label
              className="block font-medium mb-1.5"
              style={{ fontSize: '13px', color: '#1A1A1A' }}
            >
              Budget range
            </label>
            <input
              type="text"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              placeholder="e.g. $5,000–10,000 total, or open to suggestions"
              className={inputClass}
            />
          </div>

          <div>
            <label
              className="block font-medium mb-1.5"
              style={{ fontSize: '13px', color: '#1A1A1A' }}
            >
              Anything else?
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Who's traveling, special occasions, hotels you love..."
              className={inputClass}
            />
          </div>

          <p className="mt-6" style={{ fontSize: '12px', color: '#888' }}>
            A local travel advisor will be in touch to book a meeting.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#2B4A3E] text-white py-3.5 rounded text-sm font-medium uppercase tracking-[2.5px] hover:opacity-90 transition mt-4 disabled:opacity-60"
          >
            {submitting ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-sm" style={{ color: '#888' }}>
            Loading...
          </p>
        </div>
      }
    >
      <PlanForm />
    </Suspense>
  )
}
