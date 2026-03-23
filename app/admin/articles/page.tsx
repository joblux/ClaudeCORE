'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { PenLine, Trash2, Star, Home, Search } from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  category: string
  author_name: string
  published: boolean
  published_at: string | null
  created_at: string
  featured_homepage: boolean
  homepage_feature: boolean
}

export default function AdminArticlesPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [togglingHome, setTogglingHome] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  const toggleFeatured = async (id: string, current: boolean) => {
    setToggling(id)
    const res = await fetch('/api/articles/featured', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, featured_homepage: !current }),
    })
    if (res.ok) {
      setArticles((prev) => prev.map((a) =>
        a.id === id ? { ...a, featured_homepage: !current } : a
      ))
    }
    setToggling(null)
  }

  const toggleHomepageFeature = async (id: string, current: boolean) => {
    setTogglingHome(id)
    const res = await fetch('/api/articles/homepage-feature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, homepage_feature: !current }),
    })
    if (res.ok) {
      setArticles((prev) => prev.map((a) =>
        a.id === id ? { ...a, homepage_feature: !current } : { ...a, homepage_feature: false }
      ))
    }
    setTogglingHome(null)
  }

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))]
  const afterCategory = categoryFilter === 'all' ? articles : articles.filter(a => a.category === categoryFilter)
  const filtered = searchQuery.trim()
    ? afterCategory.filter(a => {
        const q = searchQuery.toLowerCase()
        return a.title.toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q) || (a.author_name || '').toLowerCase().includes(q)
      })
    : afterCategory

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

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles by title, category, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:border-[#a58e28]/40 transition-colors"
          />
        </div>

        {/* Articles table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          {/* Header */}
          <div className="hidden lg:grid bg-gray-50 px-5 py-3 text-[11px] uppercase tracking-wide text-gray-400 font-medium" style={{ gridTemplateColumns: '2fr 1fr 0.8fr 0.8fr 0.6fr 0.4fr 0.4fr 0.5fr' }}>
            <div>Title</div>
            <div>Category</div>
            <div>Author</div>
            <div>Date</div>
            <div>Status</div>
            <div className="text-center">Ticker</div>
            <div className="text-center">Feature</div>
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
                style={{ gridTemplateColumns: '2fr 1fr 0.8fr 0.8fr 0.6fr 0.4fr 0.4fr 0.5fr' }}
              >
                {/* Title */}
                <div className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a] truncate pr-4 col-span-2 lg:col-span-1">
                  {article.featured_homepage && <Star size={13} className="text-[#a58e28] fill-[#a58e28] flex-shrink-0" />}
                  <span className="truncate">{article.title}</span>
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

                {/* Featured toggle */}
                <div className="hidden lg:flex justify-center">
                  <button
                    onClick={() => toggleFeatured(article.id, article.featured_homepage)}
                    disabled={toggling === article.id}
                    className={`p-1 rounded transition-colors ${
                      article.featured_homepage
                        ? 'text-[#a58e28] hover:text-[#8a7622]'
                        : 'text-gray-300 hover:text-[#a58e28]'
                    } ${toggling === article.id ? 'opacity-40' : ''}`}
                    title={article.featured_homepage ? 'Remove from homepage' : 'Feature on homepage'}
                  >
                    <Star size={16} className={article.featured_homepage ? 'fill-current' : ''} />
                  </button>
                </div>

                {/* Homepage feature toggle */}
                <div className="hidden lg:flex justify-center">
                  <button
                    onClick={() => toggleHomepageFeature(article.id, article.homepage_feature)}
                    disabled={togglingHome === article.id}
                    className={`p-1 rounded transition-colors ${
                      article.homepage_feature
                        ? 'text-[#a58e28] hover:text-[#8a7622]'
                        : 'text-gray-300 hover:text-[#a58e28]'
                    } ${togglingHome === article.id ? 'opacity-40' : ''}`}
                    title={article.homepage_feature ? 'Remove from homepage feature' : 'Feature on homepage'}
                  >
                    <Home size={16} className={article.homepage_feature ? 'fill-current' : ''} />
                  </button>
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
