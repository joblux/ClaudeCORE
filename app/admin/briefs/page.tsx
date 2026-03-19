'use client'

import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'

const jobs = [
  { id: '1', maison: 'Major French Fashion Maison', title: 'Store Director — Paris Flagship', market: 'Paris · France', salary: '€110–140K + bonus', status: 'Open' },
  { id: '2', maison: 'Swiss Watch Group — Richemont', title: 'Regional Director — Gulf & Levant', market: 'Dubai · UAE', salary: 'AED 380–450K + package', status: 'Open' },
  { id: '3', maison: 'LVMH Group Brand', title: 'HR Director — Asia Pacific', market: 'Singapore', salary: 'SGD 200–250K', status: 'Open' },
  { id: '4', maison: 'Italian Leather Goods Maison', title: 'Buying Director — RTW & Accessories', market: 'Milan · Italy', salary: '€95–120K + bonus', status: 'Filled' },
  { id: '5', maison: 'Ultra Luxury Hotel Group', title: 'General Manager — New Property', market: 'London · UK', salary: '£130–160K + benefits', status: 'Open' },
  { id: '6', maison: 'French Jewellery Maison', title: 'Country Manager — UK & Ireland', market: 'London · UK', salary: '£110–135K + bonus', status: 'Closed' },
]

const statusColor: Record<string, string> = {
  Open: '#a58e28',
  Filled: '#555',
  Closed: '#999',
}

export default function AdminBriefsPage() {
  const { isAdmin, isLoading } = useRequireAdmin()

  if (isLoading || !isAdmin) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: '#888', fontSize: 14 }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#fff', minHeight: '100vh' }}>

      {/* Top bar */}
      <div style={{ borderBottom: '2px solid #1a1a1a', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif", fontWeight: 600, fontSize: 18, color: '#1a1a1a', letterSpacing: 1 }}>JOBLUX</span>
          <span style={{ color: '#ccc', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Job Briefs</span>
        </div>
        <Link href="/admin" style={{ fontSize: 12, color: '#a58e28', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
          &larr; Back to Admin
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Job Briefs</h1>
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{jobs.length} positions</p>
          </div>
          <Link
            href="/admin/briefs/new"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#1a1a1a', color: '#a58e28', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              padding: '10px 20px', textDecoration: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            + Add New Brief
          </Link>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
              {['Title', 'Maison', 'Market', 'Salary', 'Status'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#888' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} style={{ borderBottom: '1px solid #f0ece4' }}>
                <td style={{ padding: '12px 12px' }}>
                  <Link href={`/jobs/${job.id}`} style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 500 }}>
                    {job.title}
                  </Link>
                </td>
                <td style={{ padding: '12px 12px', color: '#888', fontSize: 12 }}>{job.maison}</td>
                <td style={{ padding: '12px 12px', color: '#888', fontSize: 12 }}>{job.market}</td>
                <td style={{ padding: '12px 12px', fontWeight: 600, fontSize: 12 }}>{job.salary}</td>
                <td style={{ padding: '12px 12px' }}>
                  <span style={{
                    display: 'inline-block', fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                    padding: '3px 10px', background: job.status === 'Open' ? '#1a1a1a' : '#f5f4f0',
                    color: statusColor[job.status] || '#888',
                  }}>
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  )
}
