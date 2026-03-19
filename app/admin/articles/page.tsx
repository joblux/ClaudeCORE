'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'

interface Article {
  id: string
  title: string
  slug: string
  category: string
  author_name: string
  published: boolean
  published_at: string | null
  created_at: string
}

export default function AdminArticlesPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/articles')
      .then((r) => r.json())
      .then((data) => setArticles(data.articles || []))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article? This cannot be undone.')) return
    setDeleting(id)
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setArticles((prev) => prev.filter((a) => a.id !== id))
    }
    setDeleting(null)
  }

  const formatDate = (d: string | null) => {
    if (!d) return '\u2014'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

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
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Articles</span>
        </div>
        <Link href="/admin" style={{ fontSize: 12, color: '#a58e28', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
          &larr; Back to Admin
        </Link>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Articles</h1>
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{articles.length} articles</p>
          </div>
          <Link
            href="/admin/articles/new"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#1a1a1a', color: '#a58e28', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              padding: '10px 20px', textDecoration: 'none',
            }}
          >
            + New Article
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#888', fontSize: 14 }}>Loading...</p>
        ) : articles.length === 0 ? (
          <p style={{ color: '#888', fontSize: 14 }}>No articles yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
                {['Title', 'Category', 'Author', 'Date', 'Status', ''].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#888' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} style={{ borderBottom: '1px solid #f0ece4' }}>
                  <td style={{ padding: '12px', maxWidth: 300 }}>
                    <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{article.title}</span>
                  </td>
                  <td style={{ padding: '12px', color: '#888', fontSize: 12 }}>{article.category}</td>
                  <td style={{ padding: '12px', color: '#888', fontSize: 12 }}>{article.author_name}</td>
                  <td style={{ padding: '12px', color: '#888', fontSize: 12 }}>{formatDate(article.published ? article.published_at : article.created_at)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-block', fontSize: 10, fontWeight: 600,
                      letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                      padding: '3px 10px',
                      background: article.published ? '#1a1a1a' : '#f5f4f0',
                      color: article.published ? '#a58e28' : '#999',
                    }}>
                      {article.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        style={{ fontSize: 11, color: '#a58e28', textDecoration: 'none', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        disabled={deleting === article.id}
                        style={{ fontSize: 11, color: '#cc4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' as const, opacity: deleting === article.id ? 0.5 : 1 }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
