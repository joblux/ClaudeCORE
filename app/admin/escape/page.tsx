'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, FileText, Users, Plus, Pencil, Trash2, Star, Globe, Building2, Ship } from 'lucide-react'

type Tab = 'destinations' | 'articles' | 'advisors' | 'hotels' | 'cruises'

interface Destination {
  id: string; slug: string; name: string; region?: string; status: string; featured: boolean; experience_count: number; hero_image?: string; hotel_count?: number; restaurant_count?: number; days_count?: number
}
interface Article {
  id: string; title: string; slug: string; published_at: string; status: string; tags: string[]
}
interface Advisor {
  id: string; name: string; bases: string[]; languages: string[]; status: string; specialties: string[]
}

export default function AdminEscapePage() {
  const [tab, setTab] = useState<Tab>('destinations')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [hotels, setHotels] = useState<any[]>([])
  const [cruises, setCruises] = useState<any[]>([])
  const [stats, setStats] = useState({ destinations: 0, articles: 0, pendingConsultations: 0, totalRequests: 0, hotels: 0, cruises: 0 })
  const [search, setSearch] = useState('')
  const [hotelSearch, setHotelSearch] = useState('')
  const [cruiseSearch, setCruiseSearch] = useState('')
  const [editDest, setEditDest] = useState<Partial<Destination> | null>(null)
  const [editAdvisor, setEditAdvisor] = useState<any>(null)
  const [editHotel, setEditHotel] = useState<any>(null)
  const [editCruise, setEditCruise] = useState<any>(null)

  useEffect(() => {
    // Fetch stats
    Promise.all([
      fetch('/api/escape/destinations?limit=200').then(r => r.json()),
      fetch('/api/escape/advisors').then(r => r.json()),
      fetch('/api/escape/consultations?limit=1').then(r => r.json()),
      fetch('/api/escape/consultations?status=new&limit=1').then(r => r.json()),
      fetch('/api/escape/hotels?limit=200').then(r => r.json()),
      fetch('/api/escape/cruises?limit=200').then(r => r.json()),
    ]).then(([destData, advData, allConsult, pendingConsult, hotelData, cruiseData]) => {
      setDestinations(destData.destinations || [])
      setAdvisors(advData.advisors || [])
      setHotels(hotelData.hotels || [])
      setCruises(cruiseData.cruises || [])
      setStats({
        destinations: (destData.destinations || []).filter((d: any) => d.status === 'published').length,
        articles: 0, // updated below
        pendingConsultations: pendingConsult.total || 0,
        totalRequests: allConsult.total || 0,
        hotels: (hotelData.hotels || []).length,
        cruises: (cruiseData.cruises || []).length,
      })
    }).catch(() => {})

    // Fetch travel-tagged articles
    fetch('/api/articles?tag=travel').then(r => r.ok ? r.json() : { articles: [] }).then(data => {
      setArticles(data.articles || [])
      setStats(s => ({ ...s, articles: (data.articles || []).length }))
    }).catch(() => {})
  }, [])

  const handleSaveDest = async () => {
    if (!editDest?.name) return
    const method = editDest.id ? 'PUT' : 'POST'
    const url = editDest.id ? `/api/escape/destinations/${editDest.id}` : '/api/escape/destinations'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editDest) })
    if (res.ok) {
      setEditDest(null)
      const data = await fetch('/api/escape/destinations?limit=200').then(r => r.json())
      setDestinations(data.destinations || [])
    }
  }

  const handleDeleteDest = async (id: string) => {
    if (!confirm('Delete this destination?')) return
    await fetch(`/api/escape/destinations/${id}`, { method: 'DELETE' })
    setDestinations(d => d.filter(x => x.id !== id))
  }

  const toggleFeatured = async (dest: Destination) => {
    await fetch(`/api/escape/destinations/${dest.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !dest.featured }),
    })
    setDestinations(d => d.map(x => x.id === dest.id ? { ...x, featured: !x.featured } : x))
  }

  const handleSaveAdvisor = async () => {
    if (!editAdvisor?.name) return
    const method = editAdvisor.id ? 'PUT' : 'POST'
    const url = editAdvisor.id ? `/api/escape/advisors/${editAdvisor.id}` : '/api/escape/advisors'
    const body = {
      ...editAdvisor,
      bases: typeof editAdvisor.bases === 'string' ? editAdvisor.bases.split(',').map((s: string) => s.trim()) : editAdvisor.bases,
      languages: typeof editAdvisor.languages === 'string' ? editAdvisor.languages.split(',').map((s: string) => s.trim()) : editAdvisor.languages,
      specialties: typeof editAdvisor.specialties === 'string' ? editAdvisor.specialties.split(',').map((s: string) => s.trim()) : editAdvisor.specialties,
      regions: typeof editAdvisor.regions === 'string' ? editAdvisor.regions.split(',').map((s: string) => s.trim()) : editAdvisor.regions,
    }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      setEditAdvisor(null)
      const data = await fetch('/api/escape/advisors').then(r => r.json())
      setAdvisors(data.advisors || [])
    }
  }

  const handleSaveHotel = async () => {
    if (!editHotel?.name) return
    const method = editHotel.id ? 'PUT' : 'POST'
    const url = editHotel.id ? `/api/escape/hotels/${editHotel.id}` : '/api/escape/hotels'
    const body = {
      ...editHotel,
      perks: typeof editHotel.perks === 'string' ? editHotel.perks.split(',').map((s: string) => s.trim()).filter(Boolean) : editHotel.perks,
      photos: typeof editHotel.photos === 'string' ? editHotel.photos.split(',').map((s: string) => s.trim()).filter(Boolean) : editHotel.photos,
    }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      setEditHotel(null)
      const data = await fetch('/api/escape/hotels?limit=200').then(r => r.json())
      setHotels(data.hotels || [])
      setStats(s => ({ ...s, hotels: (data.hotels || []).length }))
    }
  }

  const handleDeleteHotel = async (id: string) => {
    if (!confirm('Delete this hotel?')) return
    await fetch(`/api/escape/hotels/${id}`, { method: 'DELETE' })
    setHotels(h => h.filter(x => x.id !== id))
    setStats(s => ({ ...s, hotels: s.hotels - 1 }))
  }

  const handleSaveCruise = async () => {
    if (!editCruise?.name) return
    const method = editCruise.id ? 'PUT' : 'POST'
    const url = editCruise.id ? `/api/escape/cruises/${editCruise.id}` : '/api/escape/cruises'
    const body = {
      ...editCruise,
      departure_ports: typeof editCruise.departure_ports === 'string' ? editCruise.departure_ports.split(',').map((s: string) => s.trim()).filter(Boolean) : editCruise.departure_ports,
      ports_of_call: typeof editCruise.ports_of_call === 'string' ? editCruise.ports_of_call.split(',').map((s: string) => s.trim()).filter(Boolean) : editCruise.ports_of_call,
      highlights: typeof editCruise.highlights === 'string' ? editCruise.highlights.split(',').map((s: string) => s.trim()).filter(Boolean) : editCruise.highlights,
      stateroom_types: typeof editCruise.stateroom_types === 'string' ? editCruise.stateroom_types.split(',').map((s: string) => s.trim()).filter(Boolean) : editCruise.stateroom_types,
      photos: typeof editCruise.photos === 'string' ? editCruise.photos.split(',').map((s: string) => s.trim()).filter(Boolean) : editCruise.photos,
      duration_nights: editCruise.duration_nights ? Number(editCruise.duration_nights) : undefined,
    }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      setEditCruise(null)
      const data = await fetch('/api/escape/cruises?limit=200').then(r => r.json())
      setCruises(data.cruises || [])
      setStats(s => ({ ...s, cruises: (data.cruises || []).length }))
    }
  }

  const handleDeleteCruise = async (id: string) => {
    if (!confirm('Delete this cruise?')) return
    await fetch(`/api/escape/cruises/${id}`, { method: 'DELETE' })
    setCruises(c => c.filter(x => x.id !== id))
    setStats(s => ({ ...s, cruises: s.cruises - 1 }))
  }

  const tabClass = (t: Tab) => `px-4 py-2 text-sm font-medium rounded-t transition-colors ${tab === t ? 'bg-white text-[#2B4A3E] border border-b-0 border-gray-200' : 'text-gray-500 hover:text-gray-700'}`

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Globe size={20} className="text-[#2B4A3E]" />
        <h1 className="text-xl font-semibold text-[#1a1a1a]">Escape</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Published Destinations', value: stats.destinations },
          { label: 'Travel Articles', value: stats.articles },
          { label: 'Curated Hotels', value: stats.hotels },
          { label: 'Cruise Voyages', value: stats.cruises },
          { label: 'Pending Consultations', value: stats.pendingConsultations },
          { label: 'Total Requests', value: stats.totalRequests },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-2xl font-medium text-[#1a1a1a]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-0">
        <button className={tabClass('destinations')} onClick={() => setTab('destinations')}>
          <MapPin size={14} className="inline mr-1" />Destinations
        </button>
        <button className={tabClass('articles')} onClick={() => setTab('articles')}>
          <FileText size={14} className="inline mr-1" />Articles
        </button>
        <button className={tabClass('advisors')} onClick={() => setTab('advisors')}>
          <Users size={14} className="inline mr-1" />Advisors
        </button>
        <button className={tabClass('hotels')} onClick={() => setTab('hotels')}>
          <Building2 size={14} className="inline mr-1" />Hotels
        </button>
        <button className={tabClass('cruises')} onClick={() => setTab('cruises')}>
          <Ship size={14} className="inline mr-1" />Cruises
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-lg rounded-tr-lg p-6">
        {/* ── DESTINATIONS TAB ── */}
        {tab === 'destinations' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <input
                type="text" placeholder="Search destinations..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded w-64"
              />
              <button onClick={() => setEditDest({ name: '', status: 'draft', featured: false })} className="flex items-center gap-1 text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1d3a2e] transition-colors">
                <Plus size={14} /> Add Destination
              </button>
            </div>

            {editDest && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-semibold mb-3">{editDest.id ? 'Edit' : 'Add'} Destination</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input placeholder="Name *" value={editDest.name || ''} onChange={(e) => setEditDest({ ...editDest, name: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Region" value={editDest.region || ''} onChange={(e) => setEditDest({ ...editDest, region: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Hero image URL" value={editDest.hero_image || ''} onChange={(e) => setEditDest({ ...editDest, hero_image: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                </div>
                <div className="flex gap-3 items-center">
                  <select value={editDest.status || 'draft'} onChange={(e) => setEditDest({ ...editDest, status: e.target.value })} className="px-3 py-2 text-sm border rounded">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <button onClick={handleSaveDest} className="text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded">Save</button>
                  <button onClick={() => setEditDest(null)} className="text-sm text-gray-500">Cancel</button>
                </div>
              </div>
            )}

            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 uppercase border-b">
                <th className="pb-2">Name</th><th className="pb-2">Region</th><th className="pb-2">Status</th><th className="pb-2">Featured</th><th className="pb-2">Exp.</th><th className="pb-2">Hotels</th><th className="pb-2">Restaurants</th><th className="pb-2">Days</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {destinations.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase())).map(d => (
                  <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 font-medium">{d.name}</td>
                    <td className="py-2.5 text-gray-500">{d.region || '—'}</td>
                    <td className="py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${d.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{d.status}</span></td>
                    <td className="py-2.5"><button onClick={() => toggleFeatured(d)}><Star size={14} className={d.featured ? 'text-[#B8975C] fill-[#B8975C]' : 'text-gray-300'} /></button></td>
                    <td className="py-2.5 text-gray-500">{d.experience_count}</td>
                    <td className="py-2.5 text-gray-500">{d.hotel_count ?? '—'}</td>
                    <td className="py-2.5 text-gray-500">{d.restaurant_count ?? '—'}</td>
                    <td className="py-2.5 text-gray-500">{d.days_count ?? '—'}</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => setEditDest(d)} className="text-gray-400 hover:text-[#2B4A3E] mr-2"><Pencil size={14} /></button>
                      <button onClick={() => handleDeleteDest(d.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ARTICLES TAB ── */}
        {tab === 'articles' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">Articles tagged with &quot;travel&quot; appear in both Intelligence and Escape sections.</p>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 uppercase border-b">
                <th className="pb-2">Title</th><th className="pb-2">Published</th><th className="pb-2">Status</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">No travel-tagged articles yet. Add the &quot;travel&quot; tag to articles in the Intelligence editor.</td></tr>
                ) : articles.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 font-medium">{a.title}</td>
                    <td className="py-2.5 text-gray-500">{a.published_at ? new Date(a.published_at).toLocaleDateString() : '—'}</td>
                    <td className="py-2.5"><span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700">{a.status}</span></td>
                    <td className="py-2.5 text-right"><Link href={`/admin/articles/${a.id}`} className="text-sm text-[#2B4A3E] hover:text-[#B8975C]">Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ADVISORS TAB ── */}
        {tab === 'advisors' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setEditAdvisor({ name: '', bases: '', languages: '', specialties: '', regions: '', bio: '', travel_style: '', min_budget_per_night: '$250', status: 'active' })} className="flex items-center gap-1 text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1d3a2e] transition-colors">
                <Plus size={14} /> Add Advisor
              </button>
            </div>

            {editAdvisor && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-semibold mb-3">{editAdvisor.id ? 'Edit' : 'Add'} Advisor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input placeholder="Name *" value={editAdvisor.name || ''} onChange={(e) => setEditAdvisor({ ...editAdvisor, name: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Photo URL" value={editAdvisor.photo_url || ''} onChange={(e) => setEditAdvisor({ ...editAdvisor, photo_url: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Bases (comma-separated)" value={Array.isArray(editAdvisor.bases) ? editAdvisor.bases.join(', ') : editAdvisor.bases || ''} onChange={(e) => setEditAdvisor({ ...editAdvisor, bases: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Languages (comma-separated)" value={Array.isArray(editAdvisor.languages) ? editAdvisor.languages.join(', ') : editAdvisor.languages || ''} onChange={(e) => setEditAdvisor({ ...editAdvisor, languages: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Specialties (comma-separated)" value={Array.isArray(editAdvisor.specialties) ? editAdvisor.specialties.join(', ') : editAdvisor.specialties || ''} onChange={(e) => setEditAdvisor({ ...editAdvisor, specialties: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Regions (comma-separated)" value={Array.isArray(editAdvisor.regions) ? editAdvisor.regions.join(', ') : editAdvisor.regions || ''} onChange={(e) => setEditAdvisor({ ...editAdvisor, regions: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                </div>
                <textarea placeholder="Bio" value={editAdvisor.bio || ''} onChange={(e) => setEditAdvisor({ ...editAdvisor, bio: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border rounded mb-3" />
                <input placeholder="Travel style" value={editAdvisor.travel_style || ''} onChange={(e) => setEditAdvisor({ ...editAdvisor, travel_style: e.target.value })} className="w-full px-3 py-2 text-sm border rounded mb-3" />
                <div className="flex gap-3 items-center">
                  <select value={editAdvisor.status || 'active'} onChange={(e) => setEditAdvisor({ ...editAdvisor, status: e.target.value })} className="px-3 py-2 text-sm border rounded">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button onClick={handleSaveAdvisor} className="text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded">Save</button>
                  <button onClick={() => setEditAdvisor(null)} className="text-sm text-gray-500">Cancel</button>
                </div>
              </div>
            )}

            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 uppercase border-b">
                <th className="pb-2">Name</th><th className="pb-2">Bases</th><th className="pb-2">Languages</th><th className="pb-2">Status</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {advisors.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 font-medium">{a.name}</td>
                    <td className="py-2.5 text-gray-500">{(a.bases || []).join(', ')}</td>
                    <td className="py-2.5 text-gray-500">{(a.languages || []).join(', ')}</td>
                    <td className="py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${a.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{a.status}</span></td>
                    <td className="py-2.5 text-right"><button onClick={() => setEditAdvisor(a)} className="text-gray-400 hover:text-[#2B4A3E]"><Pencil size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── HOTELS TAB ── */}
        {tab === 'hotels' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <input
                type="text" placeholder="Search by name or city..." value={hotelSearch} onChange={(e) => setHotelSearch(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded w-64"
              />
              <button onClick={() => setEditHotel({ name: '', city: '', country: '', region: '', description: '', perks: '', preferred: false, photos: '', photo_credit: '', category: '', destination_id: '', status: 'active' })} className="flex items-center gap-1 text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1d3a2e] transition-colors">
                <Plus size={14} /> Add Hotel
              </button>
            </div>

            {editHotel && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-semibold mb-3">{editHotel.id ? 'Edit' : 'Add'} Hotel</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input placeholder="Name *" value={editHotel.name || ''} onChange={(e) => setEditHotel({ ...editHotel, name: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="City" value={editHotel.city || ''} onChange={(e) => setEditHotel({ ...editHotel, city: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Country" value={editHotel.country || ''} onChange={(e) => setEditHotel({ ...editHotel, country: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Region" value={editHotel.region || ''} onChange={(e) => setEditHotel({ ...editHotel, region: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <select value={editHotel.category || ''} onChange={(e) => setEditHotel({ ...editHotel, category: e.target.value })} className="px-3 py-2 text-sm border rounded">
                    <option value="">Category...</option>
                    <option value="Palace">Palace</option>
                    <option value="Boutique">Boutique</option>
                    <option value="Design">Design</option>
                    <option value="Resort">Resort</option>
                    <option value="Historic">Historic</option>
                    <option value="Contemporary">Contemporary</option>
                  </select>
                  <select value={editHotel.destination_id || ''} onChange={(e) => setEditHotel({ ...editHotel, destination_id: e.target.value })} className="px-3 py-2 text-sm border rounded">
                    <option value="">Link to destination (optional)</option>
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <textarea placeholder="Description" value={editHotel.description || ''} onChange={(e) => setEditHotel({ ...editHotel, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border rounded mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input placeholder="Perks (comma-separated)" value={Array.isArray(editHotel.perks) ? editHotel.perks.join(', ') : editHotel.perks || ''} onChange={(e) => setEditHotel({ ...editHotel, perks: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Photos (comma-separated URLs)" value={Array.isArray(editHotel.photos) ? editHotel.photos.join(', ') : editHotel.photos || ''} onChange={(e) => setEditHotel({ ...editHotel, photos: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Photo Credit" value={editHotel.photo_credit || ''} onChange={(e) => setEditHotel({ ...editHotel, photo_credit: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                </div>
                <div className="flex gap-3 items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editHotel.preferred || false} onChange={(e) => setEditHotel({ ...editHotel, preferred: e.target.checked })} className="rounded" />
                    Preferred Partner
                  </label>
                  <select value={editHotel.status || 'active'} onChange={(e) => setEditHotel({ ...editHotel, status: e.target.value })} className="px-3 py-2 text-sm border rounded">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button onClick={handleSaveHotel} className="text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded">Save</button>
                  <button onClick={() => setEditHotel(null)} className="text-sm text-gray-500">Cancel</button>
                </div>
              </div>
            )}

            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 uppercase border-b">
                <th className="pb-2">Name</th><th className="pb-2">City</th><th className="pb-2">Country</th><th className="pb-2">Preferred</th><th className="pb-2">Photos</th><th className="pb-2">Destination</th><th className="pb-2">Status</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {hotels.filter(h => !hotelSearch || h.name?.toLowerCase().includes(hotelSearch.toLowerCase()) || h.city?.toLowerCase().includes(hotelSearch.toLowerCase())).map(h => (
                  <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 font-medium">{h.name}</td>
                    <td className="py-2.5 text-gray-500">{h.city || '—'}</td>
                    <td className="py-2.5 text-gray-500">{h.country || '—'}</td>
                    <td className="py-2.5">{h.preferred ? <Star size={14} className="text-[#B8975C] fill-[#B8975C]" /> : <span className="text-gray-300">—</span>}</td>
                    <td className="py-2.5 text-gray-500">{Array.isArray(h.photos) ? h.photos.length : 0}</td>
                    <td className="py-2.5 text-gray-500">{h.destination_id ? destinations.find(d => d.id === h.destination_id)?.name || '—' : '—'}</td>
                    <td className="py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${h.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{h.status || 'active'}</span></td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => setEditHotel({ ...h, perks: Array.isArray(h.perks) ? h.perks.join(', ') : h.perks || '', photos: Array.isArray(h.photos) ? h.photos.join(', ') : h.photos || '' })} className="text-gray-400 hover:text-[#2B4A3E] mr-2"><Pencil size={14} /></button>
                      <button onClick={() => handleDeleteHotel(h.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {hotels.filter(h => !hotelSearch || h.name?.toLowerCase().includes(hotelSearch.toLowerCase()) || h.city?.toLowerCase().includes(hotelSearch.toLowerCase())).length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-400">No hotels found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CRUISES TAB ── */}
        {tab === 'cruises' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <input
                type="text" placeholder="Search by name or cruise line..." value={cruiseSearch} onChange={(e) => setCruiseSearch(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded w-64"
              />
              <button onClick={() => setEditCruise({ name: '', cruise_line: '', ship_name: '', route_name: '', departure_ports: '', ports_of_call: '', duration_nights: '', description: '', highlights: '', stateroom_types: '', photos: '', photo_credit: '', preferred: false, status: 'active' })} className="flex items-center gap-1 text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1d3a2e] transition-colors">
                <Plus size={14} /> Add Cruise
              </button>
            </div>

            {editCruise && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-semibold mb-3">{editCruise.id ? 'Edit' : 'Add'} Cruise</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input placeholder="Name *" value={editCruise.name || ''} onChange={(e) => setEditCruise({ ...editCruise, name: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Cruise Line" value={editCruise.cruise_line || ''} onChange={(e) => setEditCruise({ ...editCruise, cruise_line: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Ship Name" value={editCruise.ship_name || ''} onChange={(e) => setEditCruise({ ...editCruise, ship_name: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Route Name" value={editCruise.route_name || ''} onChange={(e) => setEditCruise({ ...editCruise, route_name: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Duration (nights)" type="number" value={editCruise.duration_nights || ''} onChange={(e) => setEditCruise({ ...editCruise, duration_nights: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Photo Credit" value={editCruise.photo_credit || ''} onChange={(e) => setEditCruise({ ...editCruise, photo_credit: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                </div>
                <textarea placeholder="Description" value={editCruise.description || ''} onChange={(e) => setEditCruise({ ...editCruise, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border rounded mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input placeholder="Departure Ports (comma-separated)" value={Array.isArray(editCruise.departure_ports) ? editCruise.departure_ports.join(', ') : editCruise.departure_ports || ''} onChange={(e) => setEditCruise({ ...editCruise, departure_ports: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Ports of Call (comma-separated)" value={Array.isArray(editCruise.ports_of_call) ? editCruise.ports_of_call.join(', ') : editCruise.ports_of_call || ''} onChange={(e) => setEditCruise({ ...editCruise, ports_of_call: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Highlights (comma-separated)" value={Array.isArray(editCruise.highlights) ? editCruise.highlights.join(', ') : editCruise.highlights || ''} onChange={(e) => setEditCruise({ ...editCruise, highlights: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Stateroom Types (e.g. Balcony, Suite, Penthouse)" value={Array.isArray(editCruise.stateroom_types) ? editCruise.stateroom_types.join(', ') : editCruise.stateroom_types || ''} onChange={(e) => setEditCruise({ ...editCruise, stateroom_types: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                  <input placeholder="Photos (comma-separated URLs)" value={Array.isArray(editCruise.photos) ? editCruise.photos.join(', ') : editCruise.photos || ''} onChange={(e) => setEditCruise({ ...editCruise, photos: e.target.value })} className="px-3 py-2 text-sm border rounded" />
                </div>
                <div className="flex gap-3 items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editCruise.preferred || false} onChange={(e) => setEditCruise({ ...editCruise, preferred: e.target.checked })} className="rounded" />
                    Preferred
                  </label>
                  <select value={editCruise.status || 'active'} onChange={(e) => setEditCruise({ ...editCruise, status: e.target.value })} className="px-3 py-2 text-sm border rounded">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button onClick={handleSaveCruise} className="text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded">Save</button>
                  <button onClick={() => setEditCruise(null)} className="text-sm text-gray-500">Cancel</button>
                </div>
              </div>
            )}

            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 uppercase border-b">
                <th className="pb-2">Name</th><th className="pb-2">Cruise Line</th><th className="pb-2">Route</th><th className="pb-2">Duration</th><th className="pb-2">Preferred</th><th className="pb-2">Status</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {cruises.filter(c => !cruiseSearch || c.name?.toLowerCase().includes(cruiseSearch.toLowerCase()) || c.cruise_line?.toLowerCase().includes(cruiseSearch.toLowerCase())).map(c => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 font-medium">{c.name}</td>
                    <td className="py-2.5 text-gray-500">{c.cruise_line || '—'}</td>
                    <td className="py-2.5 text-gray-500">{c.route_name || '—'}</td>
                    <td className="py-2.5 text-gray-500">{c.duration_nights ? `${c.duration_nights} nights` : '—'}</td>
                    <td className="py-2.5">{c.preferred ? <Star size={14} className="text-[#B8975C] fill-[#B8975C]" /> : <span className="text-gray-300">—</span>}</td>
                    <td className="py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.status || 'active'}</span></td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => setEditCruise({ ...c, departure_ports: Array.isArray(c.departure_ports) ? c.departure_ports.join(', ') : c.departure_ports || '', ports_of_call: Array.isArray(c.ports_of_call) ? c.ports_of_call.join(', ') : c.ports_of_call || '', highlights: Array.isArray(c.highlights) ? c.highlights.join(', ') : c.highlights || '', stateroom_types: Array.isArray(c.stateroom_types) ? c.stateroom_types.join(', ') : c.stateroom_types || '', photos: Array.isArray(c.photos) ? c.photos.join(', ') : c.photos || '' })} className="text-gray-400 hover:text-[#2B4A3E] mr-2"><Pencil size={14} /></button>
                      <button onClick={() => handleDeleteCruise(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {cruises.filter(c => !cruiseSearch || c.name?.toLowerCase().includes(cruiseSearch.toLowerCase()) || c.cruise_line?.toLowerCase().includes(cruiseSearch.toLowerCase())).length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No cruises found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
