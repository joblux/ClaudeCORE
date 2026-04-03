"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PHONE_CODES, detectPhoneCode } from '@/lib/phone-codes'
import { ORG_TYPES } from '@/lib/org-types'

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Brazil","Bulgaria","Cambodia","Canada",
  "Chile","China","Colombia","Croatia","Cyprus","Czech Republic","Denmark","Egypt","Estonia",
  "Finland","France","Germany","Ghana","Greece","Hungary","Iceland","India","Indonesia","Iran",
  "Iraq","Ireland","Israel","Italy","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia",
  "Lebanon","Lithuania","Luxembourg","Malaysia","Mexico","Monaco","Morocco","Netherlands",
  "New Zealand","Nigeria","Norway","Oman","Pakistan","Philippines","Poland","Portugal","Qatar",
  "Romania","Russia","Saudi Arabia","Serbia","Singapore","Slovakia","Slovenia","South Africa",
  "South Korea","Spain","Sweden","Switzerland","Taiwan","Thailand","Tunisia","Turkey",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Vietnam","Other",
]

export default function EmployerSignupClient() {
  const router = useRouter()
  const [company, setCompany] = useState("")
  const [orgType, setOrgType] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [title, setTitle] = useState("")
  const [country, setCountry] = useState("")
  const [phoneCode, setPhoneCode] = useState(() => detectPhoneCode())
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [emailExists, setEmailExists] = useState(false)

  const inputClass = "w-full px-3 py-2.5 text-[13px] bg-[#222] border border-[#333] rounded-md text-white outline-none focus:border-[#a58e28] transition-colors"
  const selectClass = inputClass + " appearance-none"
  const labelClass = "block text-[9px] text-[#aaa] uppercase tracking-[2px] mb-1.5"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company || !firstName || !lastName || !email || !country) {
      setError("Please fill in all required fields.")
      return
    }
    setError("")
    setEmailExists(false)
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/members/employer-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, orgType, firstName, lastName, email, title, country, phone: phone ? `${phoneCode} ${phone}` : '' }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === "EMAIL_EXISTS") {
          setEmailExists(true)
        } else {
          setError(data.error || "Something went wrong.")
        }
        return
      }
      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4 py-16">
        <p className="text-[10px] tracking-[3.5px] uppercase text-[#999] mb-7">Luxury Talent Intelligence</p>
        <div className="w-full max-w-[420px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-8 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-[#1a1a0f] border border-[#a58e28] flex items-center justify-center text-[#a58e28] text-xl mx-auto mb-5">✓</div>
          <h2 className="text-xl font-light text-white mb-3" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>Request received.</h2>
          <p className="text-sm text-[#888] leading-relaxed mb-3">We'll review your details and be in touch within 24 hours.</p>
          <p className="text-[10px] text-[#999]">No noise. No ads. No data reselling.</p>
        </div>
        <Link href="/" className="text-[10px] text-[#999] underline underline-offset-4 mt-5 hover:text-[#888] transition-colors">← Back to JOBLUX</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4 py-16">
      <p className="text-[10px] tracking-[3.5px] uppercase text-[#999] mb-7">Luxury Talent Intelligence</p>

      <div className="w-full max-w-[420px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-8 py-9">
        <h1 className="text-[22px] font-light text-white text-center mb-6" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
          Tell us about your organisation.
        </h1>

        {emailExists && (
          <div className="bg-[#1a0f0f] border border-[#5a1e1e] rounded-lg px-4 py-3 mb-5">
            <p className="text-[11px] text-[#cc8888] leading-relaxed">
              An account with this email already exists.{" "}
              <Link href="/join" className="text-white underline underline-offset-2 hover:text-[#ccc]">Sign in here →</Link>
            </p>
          </div>
        )}

        {error && (
          <div className="bg-[#1a0f0f] border border-[#5a1e1e] rounded-lg px-4 py-3 mb-5">
            <p className="text-[11px] text-[#cc8888]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className={labelClass}>Company / Maison *</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} required className={inputClass} />
          </div>

          <div className="mb-5">
            <label className={labelClass}>Type of organisation</label>
            <select value={orgType} onChange={e => setOrgType(e.target.value)} className={selectClass}>
              <option value=""></option>
              {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="border-t border-[#2a2a2a] pt-4 mb-3">
            <p className="text-[9px] text-[#999] uppercase tracking-[2px]">Your details</p>
            <p className="text-[10px] text-[#999] italic mt-1 mb-3">Not published or listed.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelClass}>First name *</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last name *</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className={inputClass} />
            </div>
          </div>

          <div className="mb-3">
            <label className={labelClass}>Work email *</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailExists(false) }} required className={inputClass + (emailExists ? " border-[#8b1e1e]" : "")} />
          </div>

          <div className="mb-3">
            <label className={labelClass}>Your title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className={labelClass}>Country *</label>
              <select value={country} onChange={e => setCountry(e.target.value)} required className={selectClass}>
                <option value=""></option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <div className="flex gap-1.5">
                <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)} className="px-2 py-2.5 text-[13px] bg-[#222] border border-[#333] rounded-md text-white outline-none focus:border-[#a58e28] transition-colors appearance-none w-[130px] flex-shrink-0">
                  {PHONE_CODES.map(pc => <option key={pc.code} value={pc.code}>{pc.label}</option>)}
                </select>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="flex-1 min-w-0 px-3 py-2.5 text-[13px] bg-[#222] border border-[#333] rounded-md text-white outline-none focus:border-[#a58e28] transition-colors" />
              </div>
            </div>
          </div>

          <div className="border-t border-[#2a2a2a] pt-5 mb-4">
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-white text-black text-[10px] font-bold tracking-[2.5px] uppercase rounded-md hover:bg-[#f0f0f0] transition-colors disabled:opacity-50">
              {isSubmitting ? "Submitting..." : "Submit →"}
            </button>
          </div>

          <p className="text-[10px] text-[#999] text-center mb-4 leading-relaxed">We'll be in touch within 24 hours.</p>

          <div className="border-t border-[#222] pt-4 text-center">
            <p className="text-[11px] text-[#999]">
              Already have access?{" "}
              <Link href="/join" className="text-[#777] underline underline-offset-3 hover:text-[#aaa] transition-colors">Sign in here →</Link>
            </p>
          </div>
        </form>
      </div>

      <Link href="/connect" className="text-[10px] text-[#999] underline underline-offset-4 mt-5 hover:text-[#888] transition-colors">← Back to connect</Link>
    </main>
  )
}
