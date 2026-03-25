import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers — JOBLUX',
  description: 'Confidential luxury search assignments, salary intelligence, and interview preparation. Manager-level and above.',
}

export default function CareersPage() {
  return (
    <div className="bg-[#1a1a1a] min-h-[60vh] flex items-center justify-center px-7">
      <div className="text-center">
        <h1 className="text-[28px] text-white font-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Coming soon
        </h1>
        <p className="text-[13px] text-[#777] max-w-[360px] mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          Confidential search assignments, complete salary intelligence, and interview preparation. Your next move in luxury, powered by real data.
        </p>
      </div>
    </div>
  )
}
