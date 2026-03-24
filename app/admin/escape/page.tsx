'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Globe, Plus, Pencil, Trash2, Star, FileText, MapPin, Building2, Ship, Users, Newspaper, ClipboardPaste } from 'lucide-react'
import { supabase as typedSupabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'

const SmartPasteImporter = dynamic(() => import('@/components/admin/SmartPasteImporter'), { ssr: false })
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false })

// Cast to any since new escape tables aren't in the generated Database type yet
const supabase = typedSupabase as any

type Tab = 'editions' | 'blog' | 'itineraries' | 'hotels' | 'cities' | 'cruises' | 'consultations'

interface Edition { id: string; month: number; year: number; title: string; intro: string; hero_image: string; is_current: boolean }
interface Article { id: string; edition_id: string; title: string; slug: string; excerpt: string; body: string; featured_image: string; tag: string; read_time: number; published: boolean; published_at: string }
interface Itinerary { id: string; edition_id: string; name: string; slug: string; duration: string; tagline: string; season: string; style: string; price_from: number; hero_image: string; card_image: string; season_note: string; published: boolean }
interface Hotel { id: string; name: string; slug: string; city: string; country: string; destination_tag: string; style_tag: string; image: string; hero_image: string; preferred: boolean; advisor_note: string; perks: string[]; itinerary_id: string; published: boolean }
interface Cruise { id: string; edition_id: string; name: string; slug: string; duration: string; route_summary: string; style: string; hero_image: string; published: boolean }
interface CityGuide { id: string; edition_id: string; city_name: string; slug: string; country: string; hero_image: string; intro: string; body: string; published: boolean }
interface Consultation { id: string; first_name: string; last_name: string; email: string; phone: string; preferred_language: string; travel_styles: string[]; destinations: string[]; preferred_dates: string; special_needs: string; budget_range: string; notes: string; source_context: string; source_page: string; status: string; created_at: string }

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }

export default function AdminEscapePage() {
  const [tab, setTab] = useState<Tab>('editions')
  const [editions, setEditions] = useState<Edition[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [cruises, setCruises] = useState<Cruise[]>([])
  const [cities, setCities] = useState<CityGuide[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [stats, setStats] = useState({ editions: 0, articles: 0, itineraries: 0, hotels: 0, cruises: 0, consultations: 0 })
  const [consultFilter, setConsultFilter] = useState('all')
  const [expandedConsult, setExpandedConsult] = useState<string | null>(null)

  // Edit states
  const [editEdition, setEditEdition] = useState<Partial<Edition> | null>(null)
  const [editArticle, setEditArticle] = useState<Partial<Article> | null>(null)
  const [showPasteImporter, setShowPasteImporter] = useState(false)
  const [editItinerary, setEditItinerary] = useState<Partial<Itinerary> | null>(null)
  const [editHotel, setEditHotel] = useState<any>(null)
  const [editCruise, setEditCruise] = useState<Partial<Cruise> | null>(null)
  const [editCity, setEditCity] = useState<Partial<CityGuide> | null>(null)

  const fetchAll = async () => {
    const [edRes, arRes, itRes, hoRes, crRes, ciRes, coRes] = await Promise.all([
      supabase.from('escape_editions').select('*').order('year', { ascending: false }).order('month', { ascending: false }),
      supabase.from('escape_articles').select('*').order('published_at', { ascending: false }),
      supabase.from('escape_itineraries').select('*').order('name'),
      supabase.from('escape_hotels').select('*').order('name'),
      supabase.from('escape_cruises').select('*').order('name'),
      supabase.from('escape_city_guides').select('*').order('city_name'),
      supabase.from('escape_consultations').select('*').order('created_at', { ascending: false }),
    ])
    setEditions((edRes.data as Edition[]) || [])
    setArticles((arRes.data as Article[]) || [])
    setItineraries((itRes.data as Itinerary[]) || [])
    setHotels((hoRes.data as Hotel[]) || [])
    setCruises((crRes.data as Cruise[]) || [])
    setCities((ciRes.data as CityGuide[]) || [])
    setConsultations((coRes.data as Consultation[]) || [])
    setStats({
      editions: (edRes.data || []).length,
      articles: (arRes.data || []).length,
      itineraries: (itRes.data || []).length,
      hotels: (hoRes.data || []).length,
      cruises: (crRes.data || []).length,
      consultations: (coRes.data || []).filter((c: any) => c.status === 'new').length,
    })
  }

  useEffect(() => { fetchAll() }, [])

  // --- CRUD handlers ---

  const handleSaveEdition = async () => {
    if (!editEdition?.title) return
    const payload = { ...editEdition, month: Number(editEdition.month), year: Number(editEdition.year) }
    if (editEdition.id) {
      await supabase.from('escape_editions').update(payload).eq('id', editEdition.id)
    } else {
      await supabase.from('escape_editions').insert(payload)
    }
    setEditEdition(null)
    fetchAll()
  }

  const handleDeleteEdition = async (id: string) => {
    if (!confirm('Delete this edition?')) return
    await supabase.from('escape_editions').delete().eq('id', id)
    fetchAll()
  }

  const handleSaveArticle = async () => {
    if (!editArticle?.title) return
    const payload = { ...editArticle, slug: editArticle.slug || slugify(editArticle.title), read_time: Number(editArticle.read_time) || 5 }
    if (editArticle.id) {
      await supabase.from('escape_articles').update(payload).eq('id', editArticle.id)
    } else {
      await supabase.from('escape_articles').insert(payload)
    }
    setEditArticle(null)
    fetchAll()
  }

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return
    await supabase.from('escape_articles').delete().eq('id', id)
    fetchAll()
  }

  const handleSaveItinerary = async () => {
    if (!editItinerary?.name) return
    const payload = { ...editItinerary, slug: editItinerary.slug || slugify(editItinerary.name), price_from: Number(editItinerary.price_from) || 0 }
    if (editItinerary.id) {
      await supabase.from('escape_itineraries').update(payload).eq('id', editItinerary.id)
    } else {
      await supabase.from('escape_itineraries').insert(payload)
    }
    setEditItinerary(null)
    fetchAll()
  }

  const handleDeleteItinerary = async (id: string) => {
    if (!confirm('Delete this itinerary?')) return
    await supabase.from('escape_itineraries').delete().eq('id', id)
    fetchAll()
  }

  const handleSaveHotel = async () => {
    if (!editHotel?.name) return
    const payload = {
      ...editHotel,
      slug: editHotel.slug || slugify(editHotel.name),
      perks: typeof editHotel.perks === 'string' ? editHotel.perks.split(',').map((s: string) => s.trim()).filter(Boolean) : (editHotel.perks || []),
    }
    if (editHotel.id) {
      await supabase.from('escape_hotels').update(payload).eq('id', editHotel.id)
    } else {
      await supabase.from('escape_hotels').insert(payload)
    }
    setEditHotel(null)
    fetchAll()
  }

  const handleDeleteHotel = async (id: string) => {
    if (!confirm('Delete this hotel?')) return
    await supabase.from('escape_hotels').delete().eq('id', id)
    fetchAll()
  }

  const handleSaveCruise = async () => {
    if (!editCruise?.name) return
    const payload = { ...editCruise, slug: editCruise.slug || slugify(editCruise.name) }
    if (editCruise.id) {
      await supabase.from('escape_cruises').update(payload).eq('id', editCruise.id)
    } else {
      await supabase.from('escape_cruises').insert(payload)
    }
    setEditCruise(null)
    fetchAll()
  }

  const handleDeleteCruise = async (id: string) => {
    if (!confirm('Delete this cruise?')) return
    await supabase.from('escape_cruises').delete().eq('id', id)
    fetchAll()
  }

  const handleSaveCity = async () => {
    if (!editCity?.city_name) return
    const payload = { ...editCity, slug: editCity.slug || slugify(editCity.city_name) }
    if (editCity.id) {
      await supabase.from('escape_city_guides').update(payload).eq('id', editCity.id)
    } else {
      await supabase.from('escape_city_guides').insert(payload)
    }
    setEditCity(null)
    fetchAll()
  }

  const handleDeleteCity = async (id: string) => {
    if (!confirm('Delete this city guide?')) return
    await supabase.from('escape_city_guides').delete().eq('id', id)
    fetchAll()
  }

  const handleConsultStatus = async (id: string, status: string) => {
    await supabase.from('escape_consultations').update({ status }).eq('id', id)
    fetchAll()
  }

  const tabClass = (t: Tab) => `px-4 py-2 text-sm font-medium rounded-t transition-colors ${tab === t ? 'bg-white text-[#2B4A3E] border border-b-0 border-gray-200' : 'text-gray-500 hover:text-gray-700'}`

  const editionLabel = (id: string) => {
    const e = editions.find(e => e.id === id)
    return e ? `${e.title} (${e.month}/${e.year})` : '—'
  }

  const filteredConsultations = consultFilter === 'all' ? consultations : consultations.filter(c => c.status === consultFilter)

  // --- Form helpers ---
  const Input = ({ label, value, onChange, type = 'text', placeholder }: { label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#2B4A3E]" />
    </div>
  )

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={checked || false} onChange={e => onChange(e.target.checked)} className="rounded border-gray-300" />
      {label}
    </label>
  )

  const Select = ({ label, value, onChange, options }: { label: string; value: any; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#2B4A3E]">
        <option value="">— Select —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  const TextArea = ({ label, value, onChange, rows = 3 }: { label: string; value: any; onChange: (v: string) => void; rows?: number }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#2B4A3E]" />
    </div>
  )

  const editionOptions = editions.map(e => ({ value: e.id, label: `${e.title} (${e.month}/${e.year})` }))
  const itineraryOptions = itineraries.map(i => ({ value: i.id, label: i.name }))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Globe size={20} className="text-[#2B4A3E]" />
        <h1 className="text-xl font-semibold text-[#1a1a1a]">Escape</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Editions', value: stats.editions },
          { label: 'Articles', value: stats.articles },
          { label: 'Itineraries', value: stats.itineraries },
          { label: 'Hotels', value: stats.hotels },
          { label: 'Cruises', value: stats.cruises },
          { label: 'New Consultations', value: stats.consultations },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-2xl font-medium text-[#1a1a1a]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-0 flex-wrap">
        <button className={tabClass('editions')} onClick={() => setTab('editions')}>
          <Newspaper size={14} className="inline mr-1" />Editions
        </button>
        <button className={tabClass('blog')} onClick={() => setTab('blog')}>
          <FileText size={14} className="inline mr-1" />Blog
        </button>
        <button className={tabClass('itineraries')} onClick={() => setTab('itineraries')}>
          <MapPin size={14} className="inline mr-1" />Itineraries
        </button>
        <button className={tabClass('hotels')} onClick={() => setTab('hotels')}>
          <Building2 size={14} className="inline mr-1" />Hotels
        </button>
        <button className={tabClass('cities')} onClick={() => setTab('cities')}>
          <Globe size={14} className="inline mr-1" />Cities
        </button>
        <button className={tabClass('cruises')} onClick={() => setTab('cruises')}>
          <Ship size={14} className="inline mr-1" />Cruises
        </button>
        <button className={tabClass('consultations')} onClick={() => setTab('consultations')}>
          <Users size={14} className="inline mr-1" />Consultations
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-lg rounded-tr-lg p-6">

        {/* ===== EDITIONS ===== */}
        {tab === 'editions' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Editions</h2>
              <button onClick={() => setEditEdition({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), is_current: false })} className="flex items-center gap-1 text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">
                <Plus size={14} />Add Edition
              </button>
            </div>
            {editEdition && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Input label="Title" value={editEdition.title} onChange={v => setEditEdition({ ...editEdition, title: v })} />
                  <Input label="Month (1-12)" value={editEdition.month} onChange={v => setEditEdition({ ...editEdition, month: Number(v) as any })} type="number" />
                  <Input label="Year" value={editEdition.year} onChange={v => setEditEdition({ ...editEdition, year: Number(v) as any })} type="number" />
                  <Input label="Hero Image URL" value={editEdition.hero_image} onChange={v => setEditEdition({ ...editEdition, hero_image: v })} />
                </div>
                <TextArea label="Intro" value={editEdition.intro} onChange={v => setEditEdition({ ...editEdition, intro: v })} />
                <div className="flex items-center gap-4 mt-3">
                  <Toggle label="Current Edition" checked={!!editEdition.is_current} onChange={v => setEditEdition({ ...editEdition, is_current: v })} />
                  <button onClick={handleSaveEdition} className="text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">Save</button>
                  <button onClick={() => setEditEdition(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              </div>
            )}
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-400 uppercase text-left"><th className="pb-2">Title</th><th className="pb-2">Month/Year</th><th className="pb-2">Current</th><th className="pb-2 text-right">Actions</th></tr></thead>
              <tbody>
                {editions.map(e => (
                  <tr key={e.id} className="border-t border-gray-100">
                    <td className="py-2 font-medium">{e.title}</td>
                    <td className="py-2">{e.month}/{e.year}</td>
                    <td className="py-2">{e.is_current ? <Star size={14} className="text-yellow-500 fill-yellow-500" /> : '—'}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => setEditEdition(e)} className="text-gray-400 hover:text-[#2B4A3E] mr-2"><Pencil size={14} /></button>
                      <button onClick={() => handleDeleteEdition(e.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {editions.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-gray-400">No editions yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== BLOG (Articles) ===== */}
        {tab === 'blog' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Articles</h2>
              <div className="flex gap-2">
                <button onClick={() => { setShowPasteImporter(true); setEditArticle(null) }} className="flex items-center gap-1 text-sm border border-[#2B4A3E] text-[#2B4A3E] px-4 py-2 rounded hover:bg-[#2B4A3E]/5">
                  <ClipboardPaste size={14} />Paste Article
                </button>
                <button onClick={() => { const cur = editions.find(e => e.is_current); setEditArticle({ published: false, read_time: 5, edition_id: cur?.id }); setShowPasteImporter(false) }} className="flex items-center gap-1 text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">
                  <Plus size={14} />Add Article
                </button>
              </div>
            </div>
            {showPasteImporter && (
              <SmartPasteImporter
                onImport={(result) => {
                  const currentEdition = editions.find(e => e.is_current)
                  setEditArticle({
                    title: result.title,
                    body: result.content,
                    excerpt: result.excerpt,
                    featured_image: result.coverImage || '',
                    slug: result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                    edition_id: currentEdition?.id || '',
                    published: false,
                    read_time: Math.max(1, Math.round((result.content.replace(/<[^>]*>/g, '').split(/\s+/).length) / 200)),
                  })
                  setShowPasteImporter(false)
                }}
                onCancel={() => setShowPasteImporter(false)}
              />
            )}
            {editArticle && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <Input label="Title" value={editArticle.title} onChange={v => setEditArticle({ ...editArticle, title: v, slug: editArticle.slug || slugify(v) })} />
                  <Input label="Slug" value={editArticle.slug} onChange={v => setEditArticle({ ...editArticle, slug: v })} />
                  <Select label="Edition" value={editArticle.edition_id} onChange={v => setEditArticle({ ...editArticle, edition_id: v })} options={editionOptions} />
                  <Input label="Tag" value={editArticle.tag} onChange={v => setEditArticle({ ...editArticle, tag: v })} placeholder="e.g. wellness, adventure" />
                  <Input label="Read Time (min)" value={editArticle.read_time} onChange={v => setEditArticle({ ...editArticle, read_time: Number(v) as any })} type="number" />
                  <Input label="Featured Image URL" value={editArticle.featured_image} onChange={v => setEditArticle({ ...editArticle, featured_image: v })} />
                </div>
                <TextArea label="Excerpt" value={editArticle.excerpt} onChange={v => setEditArticle({ ...editArticle, excerpt: v })} rows={2} />
                <div className="mb-3">
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>Body</label>
                  <RichTextEditor
                    content={editArticle.body || ''}
                    onChange={v => setEditArticle({ ...editArticle, body: v })}
                    placeholder="Write or paste article content..."
                  />
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <Toggle label="Published" checked={!!editArticle.published} onChange={v => setEditArticle({ ...editArticle, published: v, published_at: v ? new Date().toISOString() : editArticle.published_at })} />
                  <button onClick={handleSaveArticle} className="text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">Save</button>
                  <button onClick={() => setEditArticle(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              </div>
            )}
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-400 uppercase text-left"><th className="pb-2">Title</th><th className="pb-2">Tag</th><th className="pb-2">Edition</th><th className="pb-2">Status</th><th className="pb-2 text-right">Actions</th></tr></thead>
              <tbody>
                {articles.map(a => (
                  <tr key={a.id} className="border-t border-gray-100">
                    <td className="py-2 font-medium">{a.title}</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{a.tag || '—'}</span></td>
                    <td className="py-2 text-xs text-gray-500">{editionLabel(a.edition_id)}</td>
                    <td className="py-2">{a.published ? <span className="text-green-600 text-xs font-medium">Published</span> : <span className="text-gray-400 text-xs">Draft</span>}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => setEditArticle(a)} className="text-gray-400 hover:text-[#2B4A3E] mr-2"><Pencil size={14} /></button>
                      <button onClick={() => handleDeleteArticle(a.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {articles.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-400">No articles yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== ITINERARIES ===== */}
        {tab === 'itineraries' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Itineraries</h2>
              <button onClick={() => setEditItinerary({ published: false })} className="flex items-center gap-1 text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">
                <Plus size={14} />Add Itinerary
              </button>
            </div>
            {editItinerary && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <Input label="Name" value={editItinerary.name} onChange={v => setEditItinerary({ ...editItinerary, name: v, slug: editItinerary.slug || slugify(v) })} />
                  <Input label="Slug" value={editItinerary.slug} onChange={v => setEditItinerary({ ...editItinerary, slug: v })} />
                  <Select label="Edition" value={editItinerary.edition_id} onChange={v => setEditItinerary({ ...editItinerary, edition_id: v })} options={editionOptions} />
                  <Input label="Duration" value={editItinerary.duration} onChange={v => setEditItinerary({ ...editItinerary, duration: v })} placeholder="e.g. 7 days" />
                  <Input label="Tagline" value={editItinerary.tagline} onChange={v => setEditItinerary({ ...editItinerary, tagline: v })} />
                  <Input label="Season" value={editItinerary.season} onChange={v => setEditItinerary({ ...editItinerary, season: v })} placeholder="e.g. Spring, Year-round" />
                  <Input label="Style" value={editItinerary.style} onChange={v => setEditItinerary({ ...editItinerary, style: v })} placeholder="e.g. Luxury, Adventure" />
                  <Input label="Price From" value={editItinerary.price_from} onChange={v => setEditItinerary({ ...editItinerary, price_from: Number(v) as any })} type="number" />
                  <Input label="Hero Image URL" value={editItinerary.hero_image} onChange={v => setEditItinerary({ ...editItinerary, hero_image: v })} />
                  <Input label="Card Image URL" value={editItinerary.card_image} onChange={v => setEditItinerary({ ...editItinerary, card_image: v })} />
                  <Input label="Season Note" value={editItinerary.season_note} onChange={v => setEditItinerary({ ...editItinerary, season_note: v })} />
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <Toggle label="Published" checked={!!editItinerary.published} onChange={v => setEditItinerary({ ...editItinerary, published: v })} />
                  <button onClick={handleSaveItinerary} className="text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">Save</button>
                  <button onClick={() => setEditItinerary(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              </div>
            )}
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-400 uppercase text-left"><th className="pb-2">Name</th><th className="pb-2">Duration</th><th className="pb-2">Style</th><th className="pb-2">Edition</th><th className="pb-2">Status</th><th className="pb-2 text-right">Actions</th></tr></thead>
              <tbody>
                {itineraries.map(i => (
                  <tr key={i.id} className="border-t border-gray-100">
                    <td className="py-2 font-medium">{i.name}</td>
                    <td className="py-2">{i.duration}</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{i.style || '—'}</span></td>
                    <td className="py-2 text-xs text-gray-500">{editionLabel(i.edition_id)}</td>
                    <td className="py-2">{i.published ? <span className="text-green-600 text-xs font-medium">Published</span> : <span className="text-gray-400 text-xs">Draft</span>}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => setEditItinerary(i)} className="text-gray-400 hover:text-[#2B4A3E] mr-2"><Pencil size={14} /></button>
                      <button onClick={() => handleDeleteItinerary(i.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {itineraries.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-400">No itineraries yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== HOTELS ===== */}
        {tab === 'hotels' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Hotels</h2>
              <button onClick={() => setEditHotel({ published: false, preferred: false, perks: [] })} className="flex items-center gap-1 text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">
                <Plus size={14} />Add Hotel
              </button>
            </div>
            {editHotel && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <Input label="Name" value={editHotel.name} onChange={v => setEditHotel({ ...editHotel, name: v, slug: editHotel.slug || slugify(v) })} />
                  <Input label="Slug" value={editHotel.slug} onChange={v => setEditHotel({ ...editHotel, slug: v })} />
                  <Input label="City" value={editHotel.city} onChange={v => setEditHotel({ ...editHotel, city: v })} />
                  <Input label="Country" value={editHotel.country} onChange={v => setEditHotel({ ...editHotel, country: v })} />
                  <Input label="Destination Tag" value={editHotel.destination_tag} onChange={v => setEditHotel({ ...editHotel, destination_tag: v })} placeholder="e.g. europe, caribbean" />
                  <Input label="Style Tag" value={editHotel.style_tag} onChange={v => setEditHotel({ ...editHotel, style_tag: v })} placeholder="e.g. boutique, resort" />
                  <Input label="Image URL" value={editHotel.image} onChange={v => setEditHotel({ ...editHotel, image: v })} />
                  <Input label="Hero Image URL" value={editHotel.hero_image} onChange={v => setEditHotel({ ...editHotel, hero_image: v })} />
                  <Select label="Itinerary" value={editHotel.itinerary_id} onChange={v => setEditHotel({ ...editHotel, itinerary_id: v || null })} options={itineraryOptions} />
                </div>
                <TextArea label="Advisor Note" value={editHotel.advisor_note} onChange={v => setEditHotel({ ...editHotel, advisor_note: v })} rows={2} />
                <div className="mt-3">
                  <Input label="Perks (comma-separated)" value={Array.isArray(editHotel.perks) ? editHotel.perks.join(', ') : editHotel.perks} onChange={v => setEditHotel({ ...editHotel, perks: v })} placeholder="e.g. Spa credit, Airport transfer, Late checkout" />
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <Toggle label="Preferred" checked={!!editHotel.preferred} onChange={v => setEditHotel({ ...editHotel, preferred: v })} />
                  <Toggle label="Published" checked={!!editHotel.published} onChange={v => setEditHotel({ ...editHotel, published: v })} />
                  <button onClick={handleSaveHotel} className="text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">Save</button>
                  <button onClick={() => setEditHotel(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              </div>
            )}
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-400 uppercase text-left"><th className="pb-2">Name</th><th className="pb-2">City</th><th className="pb-2">Country</th><th className="pb-2">Style</th><th className="pb-2">Preferred</th><th className="pb-2">Status</th><th className="pb-2 text-right">Actions</th></tr></thead>
              <tbody>
                {hotels.map(h => (
                  <tr key={h.id} className="border-t border-gray-100">
                    <td className="py-2 font-medium">{h.name}</td>
                    <td className="py-2">{h.city}</td>
                    <td className="py-2">{h.country}</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{h.style_tag || '—'}</span></td>
                    <td className="py-2">{h.preferred ? <Star size={14} className="text-yellow-500 fill-yellow-500" /> : '—'}</td>
                    <td className="py-2">{h.published ? <span className="text-green-600 text-xs font-medium">Published</span> : <span className="text-gray-400 text-xs">Draft</span>}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => setEditHotel(h)} className="text-gray-400 hover:text-[#2B4A3E] mr-2"><Pencil size={14} /></button>
                      <button onClick={() => handleDeleteHotel(h.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {hotels.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-gray-400">No hotels yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== CITIES ===== */}
        {tab === 'cities' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-700">City Guides</h2>
              <button onClick={() => setEditCity({ published: false })} className="flex items-center gap-1 text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">
                <Plus size={14} />Add City Guide
              </button>
            </div>
            {editCity && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <Input label="City Name" value={editCity.city_name} onChange={v => setEditCity({ ...editCity, city_name: v, slug: editCity.slug || slugify(v) })} />
                  <Input label="Slug" value={editCity.slug} onChange={v => setEditCity({ ...editCity, slug: v })} />
                  <Input label="Country" value={editCity.country} onChange={v => setEditCity({ ...editCity, country: v })} />
                  <Input label="Hero Image URL" value={editCity.hero_image} onChange={v => setEditCity({ ...editCity, hero_image: v })} />
                  <Select label="Edition" value={editCity.edition_id} onChange={v => setEditCity({ ...editCity, edition_id: v })} options={editionOptions} />
                </div>
                <TextArea label="Intro" value={editCity.intro} onChange={v => setEditCity({ ...editCity, intro: v })} rows={2} />
                <TextArea label="Body" value={editCity.body} onChange={v => setEditCity({ ...editCity, body: v })} rows={6} />
                <div className="flex items-center gap-4 mt-3">
                  <Toggle label="Published" checked={!!editCity.published} onChange={v => setEditCity({ ...editCity, published: v })} />
                  <button onClick={handleSaveCity} className="text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">Save</button>
                  <button onClick={() => setEditCity(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              </div>
            )}
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-400 uppercase text-left"><th className="pb-2">City</th><th className="pb-2">Country</th><th className="pb-2">Edition</th><th className="pb-2">Status</th><th className="pb-2 text-right">Actions</th></tr></thead>
              <tbody>
                {cities.map(c => (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="py-2 font-medium">{c.city_name}</td>
                    <td className="py-2">{c.country}</td>
                    <td className="py-2 text-xs text-gray-500">{editionLabel(c.edition_id)}</td>
                    <td className="py-2">{c.published ? <span className="text-green-600 text-xs font-medium">Published</span> : <span className="text-gray-400 text-xs">Draft</span>}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => setEditCity(c)} className="text-gray-400 hover:text-[#2B4A3E] mr-2"><Pencil size={14} /></button>
                      <button onClick={() => handleDeleteCity(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {cities.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-400">No city guides yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== CRUISES ===== */}
        {tab === 'cruises' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Cruises</h2>
              <button onClick={() => setEditCruise({ published: false })} className="flex items-center gap-1 text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">
                <Plus size={14} />Add Cruise
              </button>
            </div>
            {editCruise && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <Input label="Name" value={editCruise.name} onChange={v => setEditCruise({ ...editCruise, name: v, slug: editCruise.slug || slugify(v) })} />
                  <Input label="Slug" value={editCruise.slug} onChange={v => setEditCruise({ ...editCruise, slug: v })} />
                  <Select label="Edition" value={editCruise.edition_id} onChange={v => setEditCruise({ ...editCruise, edition_id: v })} options={editionOptions} />
                  <Input label="Duration" value={editCruise.duration} onChange={v => setEditCruise({ ...editCruise, duration: v })} placeholder="e.g. 12 nights" />
                  <Input label="Style" value={editCruise.style} onChange={v => setEditCruise({ ...editCruise, style: v })} placeholder="e.g. Expedition, River" />
                  <Input label="Hero Image URL" value={editCruise.hero_image} onChange={v => setEditCruise({ ...editCruise, hero_image: v })} />
                </div>
                <TextArea label="Route Summary" value={editCruise.route_summary} onChange={v => setEditCruise({ ...editCruise, route_summary: v })} rows={2} />
                <div className="flex items-center gap-4 mt-3">
                  <Toggle label="Published" checked={!!editCruise.published} onChange={v => setEditCruise({ ...editCruise, published: v })} />
                  <button onClick={handleSaveCruise} className="text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e]">Save</button>
                  <button onClick={() => setEditCruise(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              </div>
            )}
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-400 uppercase text-left"><th className="pb-2">Name</th><th className="pb-2">Duration</th><th className="pb-2">Style</th><th className="pb-2">Edition</th><th className="pb-2">Status</th><th className="pb-2 text-right">Actions</th></tr></thead>
              <tbody>
                {cruises.map(c => (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="py-2 font-medium">{c.name}</td>
                    <td className="py-2">{c.duration}</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{c.style || '—'}</span></td>
                    <td className="py-2 text-xs text-gray-500">{editionLabel(c.edition_id)}</td>
                    <td className="py-2">{c.published ? <span className="text-green-600 text-xs font-medium">Published</span> : <span className="text-gray-400 text-xs">Draft</span>}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => setEditCruise(c)} className="text-gray-400 hover:text-[#2B4A3E] mr-2"><Pencil size={14} /></button>
                      <button onClick={() => handleDeleteCruise(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {cruises.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-400">No cruises yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== CONSULTATIONS ===== */}
        {tab === 'consultations' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Consultations</h2>
              <div className="flex gap-1">
                {['all', 'new', 'in_progress', 'replied', 'completed'].map(f => (
                  <button key={f} onClick={() => setConsultFilter(f)} className={`px-3 py-1 text-xs rounded ${consultFilter === f ? 'bg-[#2B4A3E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-400 uppercase text-left"><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Source</th><th className="pb-2">Styles</th><th className="pb-2">Date</th><th className="pb-2">Status</th></tr></thead>
              <tbody>
                {filteredConsultations.map(c => (
                  <>
                    <tr key={c.id} className="border-t border-gray-100 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedConsult(expandedConsult === c.id ? null : c.id)}>
                      <td className="py-2 font-medium">{c.first_name} {c.last_name}</td>
                      <td className="py-2">{c.email}</td>
                      <td className="py-2 text-xs text-gray-500">{c.source_page || c.source_context || '—'}</td>
                      <td className="py-2">
                        <div className="flex gap-1 flex-wrap">
                          {(c.travel_styles || []).map((s: string) => (
                            <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="py-2">
                        <select value={c.status} onChange={e => { e.stopPropagation(); handleConsultStatus(c.id, e.target.value) }} onClick={e => e.stopPropagation()} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="replied">Replied</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                    {expandedConsult === c.id && (
                      <tr key={`${c.id}-detail`} className="bg-gray-50">
                        <td colSpan={6} className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div><span className="text-xs text-gray-400 block">Phone</span>{c.phone || '—'}</div>
                            <div><span className="text-xs text-gray-400 block">Language</span>{c.preferred_language || '—'}</div>
                            <div><span className="text-xs text-gray-400 block">Budget</span>{c.budget_range || '—'}</div>
                            <div><span className="text-xs text-gray-400 block">Preferred Dates</span>{c.preferred_dates || '—'}</div>
                            <div><span className="text-xs text-gray-400 block">Destinations</span>
                              <div className="flex gap-1 flex-wrap mt-1">
                                {(c.destinations || []).map((d: string) => (
                                  <span key={d} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{d}</span>
                                ))}
                                {(!c.destinations || c.destinations.length === 0) && '—'}
                              </div>
                            </div>
                            <div><span className="text-xs text-gray-400 block">Source Context</span>{c.source_context || '—'}</div>
                            <div className="col-span-2 md:col-span-3"><span className="text-xs text-gray-400 block">Special Needs</span>{c.special_needs || '—'}</div>
                            <div className="col-span-2 md:col-span-3"><span className="text-xs text-gray-400 block">Notes</span>{c.notes || '—'}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filteredConsultations.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-400">No consultations found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
