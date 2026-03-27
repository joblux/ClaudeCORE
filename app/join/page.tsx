"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

function SignInContent() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const ref = searchParams.get("ref");
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (ref && typeof window !== "undefined") {
      sessionStorage.setItem("joblux_ref", ref);
    }
  }, [ref]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const regCompleted = (session.user as any).registrationCompleted;
      const userStatus = (session.user as any).status;
      const role = (session.user as any).role;
      if (role === "admin") {
        router.push("/admin");
      } else if (regCompleted && userStatus === "approved") {
        router.push("/dashboard");
      } else if (regCompleted && userStatus === "pending") {
        router.push("/members/pending");
      } else {
        router.push("/select-profile");
      }
    }
  }, [status, session, router]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await signIn("email", { email, redirect: false, callbackUrl: "/join" });
      setEmailSent(true);
      const refCode = typeof window !== "undefined" ? sessionStorage.getItem("joblux_ref") : null;
      if (refCode) {
        fetch("/api/invite/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refCode, newMemberEmail: email }),
        }).then(() => sessionStorage.removeItem("joblux_ref")).catch(() => {});
      }
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border border-[#333] border-t-[#a58e28] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {error === "pending" && (
        <div className="mb-6 p-4 bg-[#1a1a0f] border border-[#3a3520] rounded text-sm text-[#d4c878]">
          Your application is under review. You&apos;ll receive an email once approved.
        </div>
      )}
      {error === "rejected" && (
        <div className="mb-6 p-4 bg-[#1a0f0f] border border-[#3a2020] rounded text-sm text-[#d47878]">
          Your application was not approved. Contact us for more information.
        </div>
      )}
      {error && error !== "pending" && error !== "rejected" && error !== "OAuthCallback" && (
        <div className="mb-6 p-4 bg-[#1a0f0f] border border-[#3a2020] rounded text-sm text-[#d47878]">
          Something went wrong. Please try again.
        </div>
      )}

      <div className="space-y-3 mb-6">
        <button
          onClick={() => signIn("linkedin", { callbackUrl: "/join" })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#0A66C2] text-white text-sm font-medium rounded hover:bg-[#004182] transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Continue with LinkedIn
        </button>
        <button
          onClick={() => signIn("google", { callbackUrl: "/join" })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#1e1e1e] text-[#e0e0e0] text-sm font-medium rounded border border-[#333] hover:bg-[#2a2a2a] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#2a2a2a]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#141414] px-4 text-[#666] uppercase tracking-widest">or</span>
        </div>
      </div>

      {emailSent ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#1a1a0f] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#a58e28]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <p className="text-sm text-[#e0e0e0] font-medium mb-1">Check your inbox</p>
          <p className="text-xs text-[#666]">We sent a sign-in link to <span className="text-[#e0e0e0]">{email}</span></p>
        </div>
      ) : (
        <form onSubmit={handleMagicLink}>
          <label htmlFor="email" className="block text-xs text-[#666] uppercase tracking-wider mb-2">Email address</label>
          <input
            id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required
            className="w-full px-4 py-3 text-sm border border-[#2a2a2a] rounded bg-[#1a1a1a] text-[#e0e0e0] placeholder:text-[#555] focus:outline-none focus:border-[#a58e28] transition-colors"
          />
          <button type="submit" disabled={isSubmitting}
            className="w-full mt-3 px-4 py-3.5 bg-[#a58e28] text-white text-sm font-medium rounded hover:bg-[#8a7620] transition-colors disabled:opacity-50">
            {isSubmitting ? "Sending..." : "Continue with email"}
          </button>
        </form>
      )}
    </>
  );
}

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-8">
          <a href="/"><Image src="/logos/joblux-header.png" alt="JOBLUX" width={120} height={32} className="h-8 w-auto" /></a>
        </div>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded p-8">
          <h2 className="text-2xl text-white mb-1 text-center" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Request Access
          </h2>
          <p className="text-sm text-[#a58e28] text-center mb-8 tracking-wide">Intelligence Gateway</p>
          <Suspense fallback={<div className="text-center text-sm text-[#555] py-4">Loading...</div>}>
            <SignInContent />
          </Suspense>
        </div>
        <p className="text-center text-xs text-[#555] mt-6 leading-relaxed">
          Already have access? <span className="text-[#888]">Sign in above</span> — we&apos;ll take you straight to your dashboard.
        </p>
      </div>
    </main>
  );
}
