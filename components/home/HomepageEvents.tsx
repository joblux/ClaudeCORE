import Link from 'next/link'

interface Event {
  slug: string
  title: string | null
  event_date: string
  city: string | null
  country: string | null
  sector: string | null
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function HomepageEvents({ events }: { events: Event[] }) {
  if (events.length === 0) return null

  return (
    <section style={{ padding: '44px 0', borderTop: '0.5px solid #2b2b2b' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 22, fontWeight: 400, color: '#fff' }}>Upcoming events</h2>
            <p style={{ marginTop: 6, color: '#989898', fontSize: '12.8px', lineHeight: 1.7, maxWidth: 560 }}>
              Industry dates worth tracking across fashion, beauty, watches, jewellery, and retail.
            </p>
          </div>
          <Link href="/events" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Full calendar &rarr;
          </Link>
        </div>

        <div style={{ background: '#202020', border: '1px solid #2b2b2b', borderRadius: 16, overflow: 'hidden' }}>
          {events.map((event, i) => {
            const date = new Date(event.event_date + 'T00:00:00')
            const month = monthNames[date.getMonth()]
            const day = date.getDate()
            const location = [event.city, event.country].filter(Boolean).join(', ')

            return (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                style={{
                  display: 'grid', gridTemplateColumns: '66px 1fr auto', gap: 18, alignItems: 'center',
                  padding: 18, borderBottom: i < events.length - 1 ? '0.5px solid #2b2b2b' : 'none',
                  textDecoration: 'none', transition: 'background 0.2s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', color: '#a58e28', fontWeight: 700, textAlign: 'center' }}>
                    {month}
                  </div>
                  <div style={{ fontFamily: 'var(--font-playfair), Playfair Display, serif', fontSize: 27, lineHeight: 1.1, textAlign: 'center', color: '#fff' }}>
                    {day}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '13.8px', fontWeight: 600, marginBottom: 4, color: '#fff' }}>
                    {event.title}
                  </h3>
                  {location && (
                    <p style={{ fontSize: 12, color: '#6f6f6f', margin: 0 }}>{location}</p>
                  )}
                </div>

                {event.sector && (
                  <span style={{ fontSize: 10, color: '#7f7f7f', border: '1px solid #404040', padding: '5px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    {event.sector}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
