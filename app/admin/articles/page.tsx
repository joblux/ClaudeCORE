'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { PenLine, Trash2 } from 'lucide-react'

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
  const [categoryFilter, setCategoryFilter] = useState('all')

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
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))]
  const filtered = categoryFilter === 'all' ? articles : articles.filter(a => a.category === categoryFilter)

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf5]">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <div className="px-6 py-5 lg:px-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <div>
            <h1 className="text-xl font-medium text-[#1a1a1a]">BlogLux</h1>
            <p className="text-sm text-gray-400 mt-0.5">{articles.length} articles</p>
          </div>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase bg-[#a58e28] text-white rounded-lg hover:bg-[#8a7622] transition-colors"
          >
            <PenLine size={13} />
            Write article
          </Link>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#a58e28]/10 text-[#a58e28] font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {/* Articles table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          {/* Header */}
          <div className="hidden lg:grid bg-gray-50 px-5 py-3 text-[11px] uppercase tracking-wide text-gray-400 font-medium" style={{ gridTemplateColumns: '2.5fr 1fr 0.8fr 0.8fr 0.6fr 0.5fr' }}>
            <div>Title</div>
            <div>Category</div>
            <div>Author</div>
            <div>Date</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-gray-400">No articles yet.</div>
          ) : (
            filtered.map((article) => (
              <div
                key={article.id}
                className="grid items-center px-5 py-3 border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
                style={{ gridTemplateColumns: '2.5fr 1fr 0.8fr 0.8fr 0.6fr 0.5fr' }}
              >
                {/* Title */}
                <div className="text-sm font-medium text-[#1a1a1a] truncate pr-4 col-span-2 lg:col-span-1">
                  {article.title}
                </div>

                {/* Category */}
                <div className="hidden lg:block text-xs text-gray-500">{article.category || '—'}</div>

                {/* Author */}
                <div className="hidden lg:block text-xs text-gray-500">{article.author_name || '—'}</div>

                {/* Date */}
                <div className="hidden lg:block text-xs text-gray-400">
                  {formatDate(article.published ? article.published_at : article.created_at)}
                </div>

                {/* Status */}
                <div className="hidden lg:block">
                  <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
                    article.published ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'
                  }`}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="text-[11px] font-medium text-[#a58e28] hover:text-[#8a7622] uppercase tracking-wide transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
                    disabled={deleting === article.id}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
