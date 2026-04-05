'use client'

import { signIn } from 'next-auth/react'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2.5 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg className="w-4 h-4 mr-2.5 flex-shrink-0" fill="#0A66C2" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

function SignInContent() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await signIn('email', { email: email.trim(), callbackUrl })
      setEmailSent(true)
    } catch {
      setIsSubmitting(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#171717] flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] text-center">
          <h1 className="font-['Playfair_Display'] text-2xl text-white mb-3">Check your email</h1>
          <p className="text-[#999] text-sm leading-relaxed">
            A sign-in link has been sent to <span className="text-white">{email}</span>.
            Click the link to access your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#171717] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="font-['Playfair_Display'] text-[1.6rem] text-white mb-2">Sign in to JOBLUX</h1>
          <p className="text-[#999] text-sm">Access your talent intelligence dashboard.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md bg-red-900/20 border border-red-800/30 text-red-400 text-sm text-center">
            {error === 'OAuthAccountNotLinked'
              ? 'This email is already associated with another sign-in method.'
              : 'Something went wrong. Please try again.'}
          </div>
        )}

        <form onSubmit={handleEmail} className="mb-6 flex flex-col items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-[70%] h-12 px-4 rounded-md bg-[#1e1e1e] border border-[#2b2b2b] text-white text-sm placeholder-[#666] outline-none focus:border-[#a58e28] transition-colors mb-3"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-[70%] h-12 rounded-md bg-white text-[#171717] text-sm font-semibold tracking-wider hover:bg-[#f0f0f0] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'SENDING...' : 'CONTINUE WITH EMAIL'}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[#2b2b2b]" />
          <span className="text-[#666] text-xs tracking-wider">OR</span>
          <div className="flex-1 h-px bg-[#2b2b2b]" />
        </div>

        <div className="flex flex-col gap-3 mb-10">
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full h-12 rounded-full bg-[#1e1e1e] border border-[#2b2b2b] text-white text-sm font-medium hover:border-[#444] transition-colors flex items-center justify-center"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button
            onClick={() => signIn('linkedin', { callbackUrl })}
            className="w-full h-12 rounded-full bg-[#1e1e1e] border border-[#2b2b2b] text-white text-sm font-medium hover:border-[#444] transition-colors flex items-center justify-center"
          >
            <LinkedInIcon />
            Continue with LinkedIn
          </button>
        </div>

        <p className="text-center text-[#666] text-sm">
          Don&apos;t have access?{' '}
          <Link href="/connect" className="text-[#a58e28] hover:underline">
            Request access
          </Link>
        </p>
        <p className="text-center text-[#666] text-sm mt-2">
          <Link href="/faq" className="text-[#a58e28] hover:underline">
            Need help?
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <div className="text-[#666] text-sm">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
