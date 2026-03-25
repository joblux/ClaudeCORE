import Link from 'next/link'

interface Event {
  id: string
  slug: string
  name: string
  location_city: string | null
  location_country: string | null
  sector: string | null
  start_date: string
}

const placeholderEvents: Event[] = [
  { id: '1', slug: 'paris-fashion-week-fw26', name: 'Paris Fashion Week — Fall/Winter 2026', location_city: 'Paris', location_country: 'France', sector: 'Fashion', start_date: '2026-06-23' },
  { id: '2', slug: 'watches-wonders-2026', name: 'Watches & Wonders 2026', location_city: 'Geneva', location_country: 'Switzerland', sector: 'Watches', start_date: '2026-04-05' },
  { id: '3', slug: 'luxury-hospitality-summit', name: 'Luxury Hospitality Summit', location_city: 'London', location_country: 'UK', sector: 'Hospitality', start_date: '2026-05-14' },
  { id: '4', slug: 'cosmoprof-asia-2026', name: 'Cosmoprof Asia 2026', location_city: 'Hong Kong', location_country: 'China', sector: 'Beauty', start_date: '2026-11-11' },
]

const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export function HomepageEvents({ events }: { events: Event[] }) {
  const items = events.length > 0 ? events : placeholderEvents

  return (
    <section className="px-7 py-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[22px] text-white font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
            Upcoming events
          </h2>
          <Link href="/events" className="text-[12px] text-[#a58e28] hover:text-[#e4b042] transition-colors">
            Full calendar →
          </Link>
        </div>

        <div className="space-y-0">
          {items.slice(0, 4).map((event) => {
            const date = new Date(event.start_date + 'T00:00:00')
            const month = monthNames[date.getMonth()]
            const day = date.getDate()
            const location = [event.location_city, event.location_country].filter(Boolean).join(', ')

            return (
              <Link
                key={event.id}
                href={`/events`}
                className="flex items-center gap-6 py-4 border-b border-[#2a2a2a] hover:bg-[#222] px-3 -mx-3 transition-colors group"
              >
                {/* Date */}
                <div className="flex-shrink-0 text-center w-12">
                  <div className="text-[10px] text-[#a58e28] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {month}
                  </div>
                  <div className="text-[24px] text-white font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {day}
                  </div>
                </div>

                {/* Name + location */}
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-white group-hover:text-[#a58e28] transition-colors truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {event.name}
                  </div>
                  {location && (
                    <div className="text-[12px] text-[#888]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {location}
                    </div>
                  )}
                </div>

                {/* Sector pill */}
                {event.sector && (
                  <div className="flex-shrink-0 hidden sm:block">
                    <span
                      className="text-[10px] text-[#888] bg-[#333] rounded-full px-3 py-1"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {event.sector}
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
