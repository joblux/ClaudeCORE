'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Brand {
  slug: string
  brand_name: string
  status: string
  is_published: boolean
  last_regenerated_at: string | null
  regeneration_count: number | null
  content_version: number | null
}

export default function WikiLuxAdminPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'list' | 'add'>('list')
  const [regenerating, setRegenerating] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState('')

  // Add new brand form state
  const [newBrand, setNewBrand] = useState({
    name: '',
    slug: '',
    category: '',
    founded_year: '',
    country: ''
  })

  useEffect(() => {
    loadBrands()
  }, [])

  async function loadBrands() {
    try {
      const res = await fetch('/api/admin/wikilux/brands')
      const data = await res.json()
      setBrands(data.brands || [])
    } catch (error) {
      console.error('Failed to load brands:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerateAll() {
    if (!confirm('Regenerate all brands? This will cost ~$6.60 and take 15-20 minutes.')) return
    
    setRegenerating(true)
    try {
      const res = await fetch('/api/luxai/regenerate-wikilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'all' })
      })
      const data = await res.json()
      
      if (data.success) {
        alert(`Success! Generated ${data.data.brands_processed} brands. Cost: $${data.data.total_cost_usd.toFixed(2)}`)
        loadBrands()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      alert('Failed to regenerate brands')
    } finally {
      setRegenerating(false)
    }
  }

  async function handleRegenerateSingle() {
    if (!selectedBrand) {
      alert('Please select a brand')
      return
    }
    
    setRegenerating(true)
    try {
      const res = await fetch('/api/luxai/regenerate-wikilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'single', brand_slug: selectedBrand })
      })
      const data = await res.json()
      
      if (data.success) {
        alert(`Success! Generated ${selectedBrand}. Cost: $${data.data.total_cost_usd.toFixed(2)}`)
        loadBrands()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      alert('Failed to regenerate brand')
    } finally {
      setRegenerating(false)
    }
  }

  async function handleAddBrand(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/admin/wikilux/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrand)
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Brand added! Now generate content for it.')
        setNewBrand({ name: '', slug: '', category: '', founded_year: '', country: '' })
        setActiveView('list')
        loadBrands()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      alert('Failed to add brand')
    }
  }

  async function handleDeleteBrand(slug: string) {
    if (!confirm(`Delete ${slug}? This cannot be undone.`)) return
    
    try {
      const res = await fetch(`/api/admin/wikilux/brands?slug=${slug}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Brand deleted')
        loadBrands()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      alert('Failed to delete brand')
    }
  }

  const statusColor = (status: string) => {
    switch(status) {
      case 'draft': return '#999'
      case 'pending': return '#F59E0B'
      case 'approved': return '#10B981'
      case 'rejected': return '#EF4444'
      default: return '#666'
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 500, color: '#111' }}>WikiLux Management</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Manage luxury brand encyclopedia content</p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '0.5px solid #e8e8e8' }}>
          <button
            onClick={() => setActiveView('list')}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: activeView === 'list' ? 500 : 400,
              color: activeView === 'list' ? '#111' : '#666',
              borderBottom: activeView === 'list' ? '2px solid #111' : 'none',
              cursor: 'pointer',
              marginBottom: '-1px'
            }}
          >
            Brand List ({brands.length})
          </button>
          <button
            onClick={() => setActiveView('add')}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: activeView === 'add' ? 500 : 400,
              color: activeView === 'add' ? '#111' : '#666',
              borderBottom: activeView === 'add' ? '2px solid #111' : 'none',
              cursor: 'pointer',
              marginBottom: '-1px'
            }}
          >
            Add New Brand
          </button>
        </div>

        {/* List View */}
        {activeView === 'list' && (
          <>
            {/* Regeneration Controls */}
            <div style={{ background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#111', marginBottom: '16px' }}>Regeneration Controls</div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={handleRegenerateAll}
                  disabled={regenerating}
                  style={{
                    background: '#111',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: regenerating ? 'not-allowed' : 'pointer',
                    opacity: regenerating ? 0.5 : 1
                  }}
                >
                  {regenerating ? 'REGENERATING...' : `REGENERATE ALL BRANDS (${brands.length})`}
                </button>
                
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  style={{
                    padding: '10px',
                    border: '0.5px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '13px',
                    flex: 1
                  }}
                >
                  <option value="">Select brand to regenerate...</option>
                  {brands.map(brand => (
                    <option key={brand.slug} value={brand.slug}>{brand.brand_name}</option>
                  ))}
                </select>
                
                <button
                  onClick={handleRegenerateSingle}
                  disabled={!selectedBrand || regenerating}
                  style={{
                    background: '#fff',
                    color: '#111',
                    border: '0.5px solid #e8e8e8',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: (!selectedBrand || regenerating) ? 'not-allowed' : 'pointer',
                    opacity: (!selectedBrand || regenerating) ? 0.5 : 1
                  }}
                >
                  REGENERATE
                </button>
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                Cost: ~$0.044 per brand • All regenerations go to Approval Queue
              </div>
            </div>

            {/* Brand Table */}
            <div style={{ background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9f9f9', borderBottom: '0.5px solid #e8e8e8' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#666' }}>BRAND</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#666' }}>STATUS</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#666' }}>PUBLISHED</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#666' }}>REGENERATIONS</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#666' }}>LAST UPDATED</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 500, color: '#666' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand, idx) => (
                    <tr key={brand.slug} style={{ borderBottom: idx < brands.length - 1 ? '0.5px solid #e8e8e8' : 'none' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#111' }}>{brand.brand_name}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{brand.slug}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: statusColor(brand.status),
                          background: `${statusColor(brand.status)}20`
                        }}>
                          {brand.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>
                        {brand.is_published ? '✓ Live' : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>
                        {brand.regeneration_count || 0}× (v{brand.content_version || 1})
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>
                        {brand.last_regenerated_at ? new Date(brand.last_regenerated_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => router.push(`/wikilux/${brand.slug}`)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '13px',
                            color: '#3B82F6',
                            cursor: 'pointer',
                            marginRight: '12px'
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/admin/wikilux/edit/${brand.slug}`)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '13px',
                            color: '#10B981',
                            cursor: 'pointer',
                            marginRight: '12px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand.slug)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '13px',
                            color: '#EF4444',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {brands.length === 0 && (
                <div style={{ padding: '48px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                  No brands yet. Add your first brand to get started.
                </div>
              )}
            </div>
          </>
        )}

        {/* Add New Brand View */}
        {activeView === 'add' && (
          <div style={{ background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: '8px', padding: '32px', maxWidth: '600px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>Add New Brand</h2>
            
            <form onSubmit={handleAddBrand}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#111' }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({...newBrand, name: e.target.value})}
                  placeholder="e.g. Hermès"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#111' }}>
                  Slug * (URL-friendly, lowercase, hyphens only)
                </label>
                <input
                  type="text"
                  required
                  value={newBrand.slug}
                  onChange={(e) => setNewBrand({...newBrand, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                  placeholder="e.g. hermes"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#111' }}>
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={newBrand.category}
                  onChange={(e) => setNewBrand({...newBrand, category: e.target.value})}
                  placeholder="e.g. Fashion, Watches & Jewelry, Automotive"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#111' }}>
                  Founded Year *
                </label>
                <input
                  type="number"
                  required
                  value={newBrand.founded_year}
                  onChange={(e) => setNewBrand({...newBrand, founded_year: e.target.value})}
                  placeholder="e.g. 1837"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#111' }}>
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={newBrand.country}
                  onChange={(e) => setNewBrand({...newBrand, country: e.target.value})}
                  placeholder="e.g. France"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: '#111',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Add Brand
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('list')}
                  style={{
                    flex: 1,
                    background: '#fff',
                    color: '#111',
                    border: '0.5px solid #e8e8e8',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>

            <div style={{ marginTop: '24px', padding: '16px', background: '#F7F3E8', borderRadius: '6px', fontSize: '13px', color: '#78350F' }}>
              <strong>Note:</strong> After adding a brand, you'll need to generate its content using the regeneration controls. The brand page will remain empty until content is generated and approved.
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
