import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Business | JOBLUX',
  description: 'JOBLUX Terms of Business for recruitment and placement services.',
}

const sections = [
  {
    title: '1. Positioning',
    body: 'JOBLUX operates as a discreet intelligence and recruitment partner, working on senior and strategic hiring mandates across luxury, private client, and adjacent sectors.',
  },
  {
    title: '2. Scope of Engagement',
    body: 'Executive and senior-level direct hiring search, targeted talent identification, market mapping, and advisory on role positioning and candidate calibration. JOBLUX does not provide temporary staffing, temp-to-hire, or interim placement services.',
  },
  {
    title: '3. Candidate Introduction',
    body: 'A Candidate introduced by JOBLUX remains attributable to JOBLUX for 12 months. Any engagement of such Candidate during this period gives rise to the applicable fee.',
  },
  {
    title: '4. Fees',
    body: '18% of total first-year compensation for roles up to USD 150,000. 20% for compensation above USD 150,000. Compensation includes base salary, bonuses, and commissions.',
    bold: 'All engagements are conducted on a contingency basis with no retainer fee.',
  },
  {
    title: '5. Payment Terms',
    body: 'Invoices are issued upon candidate acceptance. Payment is due within 14 days.',
  },
  {
    title: '6. Confidentiality',
    body: 'All engagements are handled under strict confidentiality regarding candidates, compensation, and business information.',
  },
  {
    title: '7. Non-Circumvention',
    body: 'The Client agrees not to engage introduced Candidates through alternative channels or intermediaries. Any such engagement remains subject to the applicable fee.',
  },
  {
    title: '8. Replacement',
    body: 'If a placed Candidate leaves within 90 days for reasons other than redundancy or termination by the Client, JOBLUX may provide a replacement search or apply a credit toward a future engagement.',
  },
  {
    title: '9. Limitation',
    body: 'JOBLUX does not guarantee candidate performance. Final hiring decisions remain the responsibility of the Client.',
  },
  {
    title: '10. Governing Law',
    body: 'These Terms are governed by applicable laws in the United States.',
  },
  {
    title: '11. Acceptance',
    body: 'Submission of a business brief constitutes acknowledgment of these Terms. Formal confirmation is obtained prior to any active engagement.',
  },
]

export default function TermsOfBusinessPage() {
  return (
    <main style={{ background: '#1a1a1a', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '80px 28px 0', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif', fontSize: 42, fontWeight: 400,
          color: '#fff', margin: '0 0 12px', lineHeight: 1.2,
        }}>
          Terms of Business
        </h1>
        <p style={{ fontSize: 15, color: '#999', fontFamily: 'Inter, sans-serif', margin: '0 0 20px' }}>
          Recruitment &amp; Placement Services
        </p>
        <p style={{ fontSize: 15, color: '#ccc', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, maxWidth: 560, margin: '0 auto 40px' }}>
          The following Terms govern recruitment and placement engagements conducted by JOBLUX LLC.
        </p>
        <div style={{ width: 60, height: 1, background: '#333', margin: '0 auto' }} />
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 28px 80px' }}>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 44 }}>
            <h2 style={{
              fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 400,
              color: '#fff', margin: '0 0 12px',
            }}>
              {s.title}
            </h2>
            <p style={{ fontSize: 15, color: '#ccc', fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}>
              {s.body}
            </p>
            {s.bold && (
              <p style={{ fontSize: 15, color: '#ccc', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, fontWeight: 600, marginTop: 14 }}>
                {s.bold}
              </p>
            )}
          </div>
        ))}

        {/* 12. Contact */}
        <div style={{ marginBottom: 44 }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 400,
            color: '#fff', margin: '0 0 12px',
          }}>
            12. Contact
          </h2>
          <p style={{ fontSize: 15, color: '#ccc', fontFamily: 'Inter, sans-serif', lineHeight: 1.9 }}>
            JOBLUX LLC<br />
            954 Lexington Ave.<br />
            New York, NY 10021<br />
            United States<br />
            <a href="mailto:alex@joblux.com" style={{ color: '#a58e28', textDecoration: 'none' }}>
              alex@joblux.com
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
