"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const formatProvider = (p: string | null) => {
  if (!p) return "another method";
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
};

function SignInContent() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [precheckError, setPrecheckError] = useState<{ provider: string } | null>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const provider = searchParams.get("provider");
  const router = useRouter();
  const [returnTo] = useState(() => {
    try {
      return sessionStorage.getItem("joblux_return_to") || "/dashboard"
    } catch {
      return "/dashboard"
    }
  })
  const clearReturnTo = () => {
    try { sessionStorage.removeItem("joblux_return_to") } catch {}
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      setPrecheckError(null);

      const preRes = await fetch("/api/auth/check-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const preData = await preRes.json().catch(() => null);

      if (preData?.status === "provider_mismatch" && preData?.provider) {
        setPrecheckError({ provider: preData.provider });
        return;
      }

      const result = await signIn("email", { email, redirect: false });

      if (result?.url && result.url.includes("?error=")) {
        router.push(result.url);
        return;
      }

      setEmailSent(true);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error === "inactivity" && (
        <div className="mb-6 p-4 bg-[#fdf8e8] border border-[#e8e2c0] rounded-sm text-sm text-[#1a1a1a]">
          You were signed out due to inactivity. Sign in to continue.
        </div>
      )}
      {error === "pending" && (
        <div className="mb-6 p-4 bg-[#fdf8e8] border border-[#e8e2c0] rounded-sm text-sm text-[#1a1a1a]">
          Your application is pending approval.
        </div>
      )}
      {error === "rejected" && (
        <div className="mb-6 p-4 bg-[#fde8e8] border border-[#e8c0c0] rounded-sm text-sm text-[#1a1a1a]">
          Your application was not approved.
        </div>
      )}
      {error === "OAuthAccountNotLinked" && (
        <div className="mb-6 p-4 bg-[#fde8e8] border border-[#e8c0c0] rounded-sm text-sm text-[#1a1a1a]">
          This email is already associated with another sign-in method.
        </div>
      )}
      {error === "EmailOnOAuthAccount" && (
        <div className="mb-6 p-4 bg-[#fde8e8] border border-[#e8c0c0] rounded-sm text-sm text-[#1a1a1a]">
          This account was created with {formatProvider(provider)}. Please continue with {formatProvider(provider)}.
        </div>
      )}
      {precheckError && (
        <div className="mb-6 p-4 bg-[#fde8e8] border border-[#e8c0c0] rounded-sm text-sm text-[#1a1a1a]">
          This account was created with {formatProvider(precheckError.provider)}. Please continue with {formatProvider(precheckError.provider)}.
        </div>
      )}
      {error && error !== "pending" && error !== "rejected" && error !== "inactivity" && error !== "OAuthAccountNotLinked" && error !== "EmailOnOAuthAccount" && (
        <div className="mb-6 p-4 bg-[#fde8e8] border border-[#e8c0c0] rounded-sm text-sm text-[#1a1a1a]">
          Something went wrong. Please try again.
        </div>
      )}
      <div className="space-y-3 mb-6">
        <button onClick={() => { clearReturnTo(); signIn("linkedin", { callbackUrl: returnTo }) }} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0A66C2] text-white text-sm font-medium rounded-sm hover:bg-[#004182] transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Continue with LinkedIn
        </button>
        <button onClick={() => { clearReturnTo(); signIn("google", { callbackUrl: returnTo }) }} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-[#1a1a1a] text-sm font-medium rounded-sm border border-[#e8e6df] hover:bg-[#f5f4f0] transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
      </div>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e8e6df]" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-white px-4 text-[#999] uppercase tracking-widest">or</span></div>
      </div>
      {emailSent ? (
        <div className="text-center py-4">
          <p className="text-sm text-[#1a1a1a] font-medium mb-1">Check your email</p>
          <p className="text-xs text-[#777]">We sent a sign-in link to <span className="text-[#1a1a1a]">{email}</span></p>
        </div>
      ) : (
        <form onSubmit={handleMagicLink}>
          <label htmlFor="email" className="block text-xs text-[#777] uppercase tracking-wider mb-2">Email address</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-3 text-sm border border-[#e8e6df] rounded-sm bg-white text-[#1a1a1a] placeholder:text-[#ccc] focus:outline-none focus:border-[#a58e28] transition-colors" />
          <button type="submit" disabled={isSubmitting} className="w-full mt-3 px-4 py-3 bg-[#1a1a1a] text-white text-sm font-medium rounded-sm hover:bg-[#333] transition-colors disabled:opacity-50">
            {isSubmitting ? "Sending..." : "Sign in with email"}
          </button>
        </form>
      )}
    </>
  );
}

export default function MembersPage() {
  return (
    <main className="min-h-screen bg-[#f5f4f0] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="bg-white border border-[#e8e6df] rounded-sm p-8">
          <h2 className="text-2xl text-[#1a1a1a] mb-1 text-center" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Sign in to JOBLUX</h2>
          <p className="text-sm text-[#777] text-center mb-8">Luxury, decoded.</p>
          <Suspense fallback={<div className="text-center text-sm text-[#999] py-4">Loading...</div>}>
            <SignInContent />
          </Suspense>
        </div>
        <p className="text-center text-xs text-[#999] mt-6 leading-relaxed">All profiles are reviewed by the JOBLUX team.</p>
        <p className="text-center text-xs mt-3"><Link href="/join" className="text-[#a58e28] hover:text-[#1a1a1a] transition-colors">Request access</Link></p>
      </div>
    </main>
  );
}
