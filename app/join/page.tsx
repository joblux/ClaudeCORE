"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type MemberType = "candidate" | "employer" | "influencer" | null;

const TYPE_OPTIONS = [
  { value: "candidate" as const, label: "Candidate", description: "Luxury professional seeking new opportunities" },
  { value: "employer" as const, label: "Employer", description: "Maison or brand looking to hire top talent" },
  { value: "influencer" as const, label: "Insider", description: "Media, content or intelligence professional in luxury" },
];

export default function JoinPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [memberType, setMemberType] = useState<MemberType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentMaison, setCurrentMaison] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [instagramFollowers, setInstagramFollowers] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/members");
    if (session?.user?.name) {
      const parts = session.user.name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberType) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/members/complete-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberType, firstName, lastName, phone, city, country, bio, linkedinUrl, currentTitle, currentMaison, companyName, companyRole, instagramHandle, instagramFollowers: instagramFollowers ? parseInt(instagramFollowers) : null }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Something went wrong"); }
      router.push("/members/pending");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") return <main className="min-h-screen bg-[#f5f4f0] flex items-center justify-center"><p className="text-sm text-[#999]">Loading...</p></main>;

  const inputClass = "w-full px-4 py-3 text-sm border border-[#e8e6df] rounded-sm bg-white text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#a58e28] transition-colors";
  const labelClass = "block text-xs text-[#777] uppercase tracking-wider mb-2";

  return (
    <main className="min-h-screen bg-[#f5f4f0] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[520px]">
        <div className="text-center mb-8">
          <h2 className="text-2xl text-[#1a1a1a] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {step === 1 ? "Request Membership" : `Join as ${memberType ? memberType.charAt(0).toUpperCase() + memberType.slice(1) : ""}`}
          </h2>
          <p className="text-sm text-[#777]">{step === 1 ? "Select the profile that best describes you" : "Complete your profile to submit your application"}</p>
        </div>
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`h-1 w-12 rounded-full transition-colors ${step >= 1 ? "bg-[#a58e28]" : "bg-[#e8e6df]"}`} />
          <div className={`h-1 w-12 rounded-full transition-colors ${step >= 2 ? "bg-[#a58e28]" : "bg-[#e8e6df]"}`} />
        </div>
        <div className="bg-white border border-[#e8e6df] rounded-sm p-8">
          {step === 1 && (
            <div className="space-y-3">
              {TYPE_OPTIONS.map((option) => (
                <button key={option.value} onClick={() => { setMemberType(option.value); setStep(2); }}
                  className="w-full text-left px-5 py-4 border border-[#e8e6df] rounded-sm transition-all hover:border-[#a58e28] hover:bg-[#fdfcf7] group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1a1a1a]">{option.label}</p>
                      <p className="text-xs text-[#999] mt-0.5">{option.description}</p>
                    </div>
                    <div className="text-[#a58e28] opacity-0 group-hover:opacity-100 transition-opacity text-lg">→</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-4 bg-[#fde8e8] border border-[#e8c0c0] rounded-sm text-sm text-[#1a1a1a]">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>First name *</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Marie" required className={inputClass} /></div>
                <div><label className={labelClass}>Last name *</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" required className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>City *</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Paris" required className={inputClass} /></div>
                <div><label className={labelClass}>Country *</label><input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="France" required className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 00 00 00 00" className={inputClass} /></div>
              <div><label className={labelClass}>LinkedIn URL</label><input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className={inputClass} /></div>
              {memberType === "candidate" && <>
                <div><label className={labelClass}>Current title *</label><input type="text" value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} placeholder="Senior Retail Manager" required className={inputClass} /></div>
                <div><label className={labelClass}>Current maison / company</label><input type="text" value={currentMaison} onChange={(e) => setCurrentMaison(e.target.value)} placeholder="Louis Vuitton" className={inputClass} /></div>
              </>}
              {memberType === "employer" && <>
                <div><label className={labelClass}>Company / Maison *</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Chanel" required className={inputClass} /></div>
                <div><label className={labelClass}>Your role *</label><input type="text" value={companyRole} onChange={(e) => setCompanyRole(e.target.value)} placeholder="HR Director" required className={inputClass} /></div>
              </>}
              {memberType === "influencer" && <>
                <div><label className={labelClass}>Instagram handle *</label><input type="text" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="@youraccount" required className={inputClass} /></div>
                <div><label className={labelClass}>Instagram followers</label><input type="number" value={instagramFollowers} onChange={(e) => setInstagramFollowers(e.target.value)} placeholder="25000" className={inputClass} /></div>
              </>}
              <div>
                <label className={labelClass}>A few words about you * <span className="normal-case text-[#ccc]">({bio.length}/280)</span></label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 280))} placeholder="Tell us about your background and why you'd like to join JOBLUX..." required rows={4} className={`${inputClass} resize-none`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="px-4 py-3 text-sm text-[#777] border border-[#e8e6df] rounded-sm hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors">← Back</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-[#1a1a1a] text-white text-sm font-medium rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50">{isSubmitting ? "Submitting..." : "Submit application"}</button>
              </div>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-[#999] mt-6 leading-relaxed">All memberships are personally reviewed and approved by JOBLUX.</p>
      </div>
    </main>
  );
}
