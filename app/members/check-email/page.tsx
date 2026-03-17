export default function CheckEmailPage() {
  return (
    <main className="min-h-screen bg-[#f5f4f0] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] text-center">
        {/* Logo */}
        <div className="mb-10">
          <h1
            className="text-4xl font-semibold text-[#1a1a1a] tracking-[3px]"
            style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}
          >
            JOBLUX
          </h1>
          <p className="text-[11px] text-[#a58e28] tracking-[4px] uppercase mt-1">
            Luxury Talents Intelligence
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#e8e6df] rounded-sm p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#f5f4f0] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#a58e28]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h2
            className="text-2xl text-[#1a1a1a] mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Check your email
          </h2>
          <p className="text-sm text-[#777] leading-relaxed">
            A sign-in link has been sent to your email address.
            Click the link to access JOBLUX.
          </p>
          <p className="text-xs text-[#999] mt-4">
            The link expires in 24 hours. Check your spam folder if you
            don&apos;t see it.
          </p>
        </div>

        <a
          href="/members"
          className="inline-block mt-6 text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors"
        >
          ← Back to sign in
        </a>
      </div>
    </main>
  );
}
