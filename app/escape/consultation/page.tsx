'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { Metadata } from 'next'
import ChipSelect from '@/components/escape/ChipSelect'

const TRIP_TYPES = ['Hotels & resorts', 'All-inclusive', 'Bespoke / tailor-made', 'Cruise', 'Family / group travel', 'Honeymoon', 'Discovery / adventure', 'Wellness / spa retreat', 'City break', 'Multi-destination', 'Skiing / winter sports', 'Gastronomy / wine tour', 'Cultural immersion', "I'm not sure yet"]
const EXPERIENCE_PREFS = ['Cultural discovery', 'Beach & coast', 'City exploration', 'Gastronomy', 'Nature & mountains', 'Wellness & spa', 'Adventure', 'Skiing', 'All-inclusive', 'Multi-city', 'Family-friendly', 'Romantic']
const OCCASIONS = ['Holiday', 'Anniversary', 'Honeymoon', 'Birthday', 'Bucket list', 'Family gathering', 'Business + leisure', 'Just because']
const FLEXIBILITY = ['Flexible', 'Somewhat flexible', 'Fixed dates']
const BUDGETS = ['$250 – $400', '$400 – $600', '$600 – $1,000', '$1,000+', 'Let the advisor suggest']
const PLAN_SCOPE = ['Hotels', 'Activities & tours', 'Flights', 'Restaurant reservations', 'Transfers & transport', 'Special events', 'Everything — surprise me']
const CONTACT_METHODS = ['Email', 'Phone', 'WhatsApp']
const STATEROOM_TYPES = ['Balcony', 'Interior', 'Ocean view', 'Suite', 'No preference']

interface Traveler {
  name: string
  age: string
  dietary: string
  allergies: string
}

function ConsultationForm() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()

  const [tripTypes, setTripTypes] = useState<string[]>([])
  const [destination, setDestination] = useState('')
  const [experiencePrefs, setExperiencePrefs] = useState<string[]>([])
  const [occasion, setOccasion] = useState<string[]>([])
  const [preferredDates, setPreferredDates] = useState('')
  const [duration, setDuration] = useState('')
  const [dateFlexibility, setDateFlexibility] = useState<string[]>([])
  const [budgetRange, setBudgetRange] = useState<string[]>([])
  const [planScope, setPlanScope] = useState<string[]>([])
  const [pastTrips, setPastTrips] = useState('')
  const [favoriteHotels, setFavoriteHotels] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [travelers, setTravelers] = useState<Traveler[]>([{ name: '', age: '', dietary: '', allergies: '' }])
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [contactMethod, setContactMethod] = useState<string[]>(['Email'])

  // Cruise details
  const [cruisePort, setCruisePort] = useState('')
  const [stateroom, setStateroom] = useState<string[]>([])
  const [numStaterooms, setNumStaterooms] = useState('')
  const [cruiseLine, setCruiseLine] = useState('')
  const [cruiseExperience, setCruiseExperience] = useState('')
  const [loyaltyNumbers, setLoyaltyNumbers] = useState('')
  const [cruiseDuration, setCruiseDuration] = useState('')
  const [cruiseDestinations, setCruiseDestinations] = useState('')
  const [cruiseAmenities, setCruiseAmenities] = useState('')
  const [prePostHotel, setPrePostHotel] = useState<string[]>([])
  const [adaCabin, setAdaCabin] = useState<string[]>([])
  const [adaDetails, setAdaDetails] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const isCruise = tripTypes.includes('Cruise')

  // Pre-fill from URL and session
  useEffect(() => {
    const dest = searchParams.get('destination')
    if (dest) setDestination(dest)
  }, [searchParams])

  useEffect(() => {
    if (session?.user) {
      const fn = (session.user as any).firstName || ''
      const ln = (session.user as any).lastName || ''
      if (fn || ln) setContactName(`${fn} ${ln}`.trim())
      if (session.user.email) setContactEmail(session.user.email)
    }
  }, [session])

  const addTraveler = () => {
    if (travelers.length < 9) {
      setTravelers([...travelers, { name: '', age: '', dietary: '', allergies: '' }])
    }
  }

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    setTravelers(travelers.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }

  const removeTraveler = (index: number) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!contactName.trim() || !contactEmail.trim()) {
      setError('Please provide your name and email.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/escape/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          phone: phone.trim() || null,
          contact_preference: contactMethod[0]?.toLowerCase() || 'email',
          trip_types: tripTypes,
          destination_text: destination.trim(),
          experience_prefs: experiencePrefs,
          occasion: occasion[0] || null,
          preferred_dates: preferredDates.trim(),
          duration: duration.trim(),
          date_flexibility: dateFlexibility[0] || null,
          budget_range: budgetRange[0] || null,
          plan_scope: planScope,
          past_trips_text: pastTrips.trim(),
          favorite_hotels: favoriteHotels.trim(),
          additional_notes: additionalNotes.trim(),
          travelers: travelers.filter((t) => t.name.trim()),
          is_cruise: isCruise,
          cruise_details: isCruise ? {
            departure_port: cruisePort,
            stateroom_type: stateroom[0] || null,
            num_staterooms: numStaterooms,
            cruise_line: cruiseLine,
            experience: cruiseExperience,
            loyalty_numbers: loyaltyNumbers,
            duration: cruiseDuration,
            destinations: cruiseDestinations,
            amenities: cruiseAmenities,
            pre_post_hotel: prePostHotel[0] || null,
            ada_cabin: adaCabin[0] === 'Yes',
            ada_details: adaDetails,
          } : null,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          <span className="text-[#2B4A3E]">Thank you</span>
        </div>
        <h2 className="text-2xl font-light text-[#2B4A3E] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Your request has been received.
        </h2>
        <p className="text-sm text-[#5C5040] leading-relaxed mb-3">
          A travel advisor will review your details and reach out within 48 hours for a complimentary video consultation.
        </p>
        <p className="text-sm text-[#8B7A5E] mb-8">No commitment, no booking fees charged to you.</p>

        {!session?.user && (
          <div className="mb-8 p-4 bg-[#FFFDF7] border border-[#D4C9B4] rounded-lg inline-block">
            <p className="text-sm text-[#5C5040] mb-2">Want to access JOBLUX career intelligence too?</p>
            <Link href="/members" className="text-sm text-[#2B4A3E] font-semibold hover:text-[#B8975C] transition-colors">
              Request access →
            </Link>
          </div>
        )}

        <div>
          <Link
            href="/escape"
            className="inline-block bg-[#2B4A3E] text-white text-sm font-medium px-8 py-3 rounded hover:bg-[#1d3a2e] transition-colors"
          >
            Back to Escape
          </Link>
        </div>
      </div>
    )
  }

  const inputClass = 'w-full px-4 py-3 text-sm border border-[#D4C9B4] rounded bg-white text-[#2B4A3E] placeholder:text-[#D4C9B4] focus:outline-none focus:border-[#2B4A3E] transition-colors'
  const sectionClass = 'py-8 border-b border-[#D4C9B4]/50'
  const labelClass = 'block text-sm font-semibold text-[#2B4A3E] mb-2'

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B7A5E] mb-3">
          Escape · In partnership with Fora Travel
        </p>
        <h1 className="text-3xl md:text-4xl font-light text-[#2B4A3E] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Start planning your escape.
        </h1>
        <p className="text-sm text-[#5C5040] leading-relaxed max-w-xl mx-auto">
          A seasoned travel advisor will review your request and reach out within 48 hours for a complimentary video consultation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#FFFDF7] border border-[#D4C9B4] rounded-lg p-6 md:p-8">

        {/* S1: Trip types */}
        <div className={sectionClass}>
          <ChipSelect label="What kind of trip?" options={TRIP_TYPES} selected={tripTypes} onChange={setTripTypes} />
        </div>

        {/* S2: Destination */}
        <div className={sectionClass}>
          <label className={labelClass}>Where would you like to go?</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="A destination, a region, or just an idea — don't worry if you're not sure yet."
            className={inputClass}
          />
        </div>

        {/* S3: Experience prefs */}
        <div className={sectionClass}>
          <ChipSelect label="Experience preferences" options={EXPERIENCE_PREFS} selected={experiencePrefs} onChange={setExperiencePrefs} />
        </div>

        {/* S4: Occasion */}
        <div className={sectionClass}>
          <ChipSelect label="What's the occasion?" options={OCCASIONS} selected={occasion} onChange={setOccasion} multi={false} />
        </div>

        {/* S5: Dates */}
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-[#2B4A3E] mb-3">Dates & duration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-[#8B7A5E] mb-1">Preferred dates</label>
              <input type="text" value={preferredDates} onChange={(e) => setPreferredDates(e.target.value)} placeholder="e.g. Late June 2026" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-[#8B7A5E] mb-1">How many days?</label>
              <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 7–10 days" className={inputClass} />
            </div>
          </div>
          <ChipSelect label="Date flexibility" options={FLEXIBILITY} selected={dateFlexibility} onChange={setDateFlexibility} multi={false} />
        </div>

        {/* S6: Budget */}
        <div className={sectionClass}>
          <ChipSelect label="Budget per night" options={BUDGETS} selected={budgetRange} onChange={setBudgetRange} multi={false} />
        </div>

        {/* S7: Plan scope */}
        <div className={sectionClass}>
          <ChipSelect label="What should we plan?" options={PLAN_SCOPE} selected={planScope} onChange={setPlanScope} />
        </div>

        {/* Cruise section (conditional) */}
        {isCruise && (
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-[#2B4A3E] mb-4">Cruise Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#8B7A5E] mb-1">Departure port preference</label>
                <input type="text" value={cruisePort} onChange={(e) => setCruisePort(e.target.value)} className={inputClass} />
              </div>
              <ChipSelect label="Stateroom type" options={STATEROOM_TYPES} selected={stateroom} onChange={setStateroom} multi={false} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8B7A5E] mb-1">Number of staterooms</label>
                  <input type="number" value={numStaterooms} onChange={(e) => setNumStaterooms(e.target.value)} min={1} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#8B7A5E] mb-1">Cruise line preference</label>
                  <input type="text" value={cruiseLine} onChange={(e) => setCruiseLine(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#8B7A5E] mb-1">Prior cruising experience</label>
                <textarea value={cruiseExperience} onChange={(e) => setCruiseExperience(e.target.value)} rows={2} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8B7A5E] mb-1">Loyalty program numbers</label>
                  <input type="text" value={loyaltyNumbers} onChange={(e) => setLoyaltyNumbers(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#8B7A5E] mb-1">Desired cruise duration</label>
                  <input type="text" value={cruiseDuration} onChange={(e) => setCruiseDuration(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#8B7A5E] mb-1">Destinations/ports of interest</label>
                <textarea value={cruiseDestinations} onChange={(e) => setCruiseDestinations(e.target.value)} rows={2} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[#8B7A5E] mb-1">Onboard amenity preferences</label>
                <textarea value={cruiseAmenities} onChange={(e) => setCruiseAmenities(e.target.value)} rows={2} className={inputClass} />
              </div>
              <ChipSelect label="Pre/post-cruise hotel nights?" options={['Yes', 'No']} selected={prePostHotel} onChange={setPrePostHotel} multi={false} />
              <ChipSelect label="Accessibility requirements (ADA cabin)" options={['Yes', 'No']} selected={adaCabin} onChange={setAdaCabin} multi={false} />
              {adaCabin[0] === 'Yes' && (
                <div>
                  <label className="block text-xs text-[#8B7A5E] mb-1">Accessibility details</label>
                  <input type="text" value={adaDetails} onChange={(e) => setAdaDetails(e.target.value)} className={inputClass} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* S8: About you */}
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-[#2B4A3E] mb-4">Tell us about you</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#8B7A5E] mb-1">What trips have really worked for you before?</label>
              <textarea value={pastTrips} onChange={(e) => setPastTrips(e.target.value)} rows={4} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-[#8B7A5E] mb-1">Hotels you&apos;ve loved</label>
              <input type="text" value={favoriteHotels} onChange={(e) => setFavoriteHotels(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-[#8B7A5E] mb-1">Anything else we should know? (accessibility needs, must-dos, deal-breakers)</label>
              <textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={3} className={inputClass} />
            </div>
          </div>
        </div>

        {/* S9: Travelers */}
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-[#2B4A3E] mb-4">Travelers</h3>
          <div className="space-y-3">
            {travelers.map((t, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs text-[#8B7A5E] mb-1">Full name</label>
                  <input type="text" value={t.name} onChange={(e) => updateTraveler(i, 'name', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#8B7A5E] mb-1">Age</label>
                  <input type="number" value={t.age} onChange={(e) => updateTraveler(i, 'age', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#8B7A5E] mb-1">Dietary</label>
                  <input type="text" value={t.dietary} onChange={(e) => updateTraveler(i, 'dietary', e.target.value)} className={inputClass} />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-[#8B7A5E] mb-1">Allergies</label>
                    <input type="text" value={t.allergies} onChange={(e) => updateTraveler(i, 'allergies', e.target.value)} className={inputClass} />
                  </div>
                  {travelers.length > 1 && (
                    <button type="button" onClick={() => removeTraveler(i)} className="text-[#D4C9B4] hover:text-red-400 px-2 py-3 text-sm transition-colors">&times;</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {travelers.length < 9 && (
            <button type="button" onClick={addTraveler} className="mt-3 text-sm text-[#2B4A3E] font-medium hover:text-[#B8975C] transition-colors">
              + Add traveler
            </button>
          )}
        </div>

        {/* S10: Contact */}
        <div className="py-8">
          <h3 className="text-sm font-semibold text-[#2B4A3E] mb-4">Contact details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Full name *</label>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className={inputClass} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-[#8B7A5E] mb-1">Phone (optional)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>
          <ChipSelect label="Preferred contact method" options={CONTACT_METHODS} selected={contactMethod} onChange={setContactMethod} multi={false} />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto md:mx-auto md:block bg-[#2B4A3E] text-white text-sm font-semibold px-12 py-3.5 rounded hover:bg-[#1d3a2e] transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit your travel request'}
        </button>
      </form>

      {/* Legal footer */}
      <p className="text-xs text-[#D4C9B4] text-center mt-6 max-w-xl mx-auto leading-relaxed">
        Travel advisory services featured on JOBLUX Escape are provided by independent advisors affiliated with Fora Travel, Inc. JOBLUX is a media partner and does not provide, arrange, or guarantee any travel services.
      </p>
    </div>
  )
}

export default function ConsultationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-[#8B7A5E]">Loading...</p></div>}>
      <ConsultationForm />
    </Suspense>
  )
}
