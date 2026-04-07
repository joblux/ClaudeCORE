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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, color: '#fff' }}>
            Upcoming Events
          </div>
          <Link href="/events" style={{ fontSize: 12, color: '#a58e28', whiteSpace: 'nowrap', textDecoration: 'none' }}>
            Full calendar &rarr;
          </Link>
        </div>

        {events.map((event) => {
          const date = new Date(event.event_date + 'T00:00:00')
          const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}`
          const location = [event.city, event.country].filter(Boolean).join(', ')

          return (
            <Link
              key={event.slug}
              href={`/events/${event.slug}`}
              style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 130px', gap: 16, alignItems: 'center',
                padding: '9px 0', borderBottom: '0.5px solid #1e1e1e', textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: 12, color: '#a58e28', fontWeight: 600 }}>{dateStr}</div>
              <div>
                <div style={{ fontSize: '13.5px', color: '#ccc' }}>{event.title}</div>
                {location && <div style={{ fontSize: 12, color: '#888' }}>{location}</div>}
              </div>
              <div style={{ fontSize: 11, color: '#888', textAlign: 'right' }}>{event.sector || ''}</div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
