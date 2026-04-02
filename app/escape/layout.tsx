import type { Metadata } from 'next'
import EscapeNav from '@/components/escape/EscapeNav'

export const metadata: Metadata = {
  title: { default: 'JOBLUX Escape | Travel Intelligence', template: '%s | JOBLUX Escape' },
  description: 'Curated travel intelligence from your private advisor. Destinations, hotels, itineraries, and city guides.',
}

export default function EscapeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F3E8', fontFamily: "'DM Sans', sans-serif" }}>
      <EscapeNav />

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p style={{ fontSize: '10.5px', color: '#bbb', fontFamily: "'DM Sans', sans-serif" }}>
          JOBLUX Escape · April 2026 Edition
        </p>
      </footer>
    </div>
  )
}
