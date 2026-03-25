import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events — JOBLUX',
  description: 'Luxury industry calendar. Fashion weeks, trade shows, summits, and awards — with career context.',
}

export default function EventsPage() {
  return (
    <div className="bg-[#1a1a1a] min-h-[60vh] flex items-center justify-center px-7">
      <div className="text-center">
        <h1 className="text-[28px] text-white font-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Coming soon
        </h1>
        <p className="text-[13px] text-[#777] max-w-[360px] mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          The luxury industry calendar — fashion weeks, trade shows, summits, and awards. With career context and networking opportunities.
        </p>
      </div>
    </div>
  )
}
