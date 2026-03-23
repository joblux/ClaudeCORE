'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/* ─── DATA ─── */

const SLIDES = [
  { id: 'morocco', img: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1600&q=80', title: 'The colours of Morocco', sub: 'Souks, riads, and the Atlas Mountains. A 9-day journey through the cultural heart of North Africa.' },
  { id: 'amsterdam', img: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1600&q=80', title: 'Amsterdam by canal light', sub: 'Canal icons, Dutch masters, and creative corners. A 4-day guide to Amsterdam\'s cultural heart.' },
  { id: 'portugal', img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600&q=80', title: 'Adventure through Portugal', sub: 'From the Douro Valley to Lisbon via Porto. Wine country, river cruises, Pena Palace, and fado nights.' },
  { id: 'japan', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&q=80', title: 'Ancient temples, modern soul', sub: 'Tokyo, Kyoto, Kanazawa, and Hakone. Kaiseki cuisine, ancient temples, and Mount Fuji on the horizon.' },
]

const DESTINATIONS = [
  { id: 'morocco', name: 'Morocco', region: 'Africa', img: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80', stat: '9-day guide · 17 hotels · 15 restaurants' },
  { id: 'amsterdam', name: 'Amsterdam', region: 'Europe', img: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80', stat: '4-day guide · 9 hotels · 14 restaurants' },
  { id: 'portugal', name: 'Portugal', region: 'Europe', img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80', stat: '8-day guide · 3 hotels' },
  { id: 'kenya', name: 'Kenya', region: 'Africa', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80', stat: '7-day guide · 8 lodges' },
  { id: 'japan', name: 'Japan', region: 'Asia', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', stat: '12 hotels · 20 restaurants' },
]

const HOTELS = [
  { id: 'la-mamounia', name: 'La Mamounia', city: 'Marrakech', dest: 'morocco', preferred: true, img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80', desc: 'Legendary palace where Churchill painted. Gardens, hammam, and Moroccan grandeur.', perks: ['Suite upgrade subject to availability', 'Welcome amenity on arrival', 'Daily breakfast for two', 'Late checkout'], credit: 'Photo courtesy of La Mamounia' },
  { id: 'royal-mansour', name: 'Royal Mansour Marrakech', city: 'Marrakech', dest: 'morocco', preferred: true, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', desc: 'Three-storey riads within a palace. Unmatched privacy and artisan craftsmanship.', perks: ['Complimentary breakfast', 'Spa credit', 'Airport transfer'], credit: 'Photo courtesy of Royal Mansour Marrakech' },
  { id: 'six-senses-douro', name: 'Six Senses Douro Valley', city: 'Douro Valley', dest: 'portugal', preferred: true, img: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80', desc: 'Wellness sanctuary overlooking terraced vineyards. World-class spa and farm-to-table dining.', perks: ['Spa credit', 'Welcome amenity', 'Room upgrade'], credit: 'Photo courtesy of Six Senses Douro Valley' },
  { id: 'angama-mara', name: 'Angama Mara', city: 'Maasai Mara', dest: 'kenya', preferred: true, img: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&q=80', desc: 'Perched on the rim of the Great Rift Valley. Sweeping Mara views and legendary hospitality.', perks: ['Bush breakfast', 'Sundowner experience', 'Photography guide'], credit: 'Photo courtesy of Angama Mara' },
  { id: 'aman-tokyo', name: 'Aman Tokyo', city: 'Tokyo', dest: 'japan', preferred: true, img: 'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=600&q=80', desc: 'Minimalist sanctuary in the Otemachi tower. Clean lines, onsen-inspired spa, and panoramic city views.', perks: ['Spa credit', 'Late checkout', 'Welcome amenity'], credit: 'Photo courtesy of Aman Tokyo' },
  { id: 'giraffe-manor', name: 'Giraffe Manor', city: 'Nairobi', dest: 'kenya', preferred: true, img: 'https://images.unsplash.com/photo-1516426122078-c23e76b4f21b?w=600&q=80', desc: 'The iconic manor where Rothschild giraffes join you for breakfast.', perks: ['Welcome amenity', 'Guided giraffe experience'], credit: 'Photo courtesy of Giraffe Manor' },
  { id: 'amanjena', name: 'Amanjena', city: 'Marrakech', dest: 'morocco', preferred: true, img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', desc: 'Rose-pink pavilions, ancient olive groves, and meditative calm minutes from the medina.', perks: ['Room upgrade', 'Late checkout', 'Welcome amenity'], credit: 'Photo courtesy of Amanjena' },
  { id: 'mandarin-oriental-marrakech', name: 'Mandarin Oriental, Marrakech', city: 'Marrakech', dest: 'morocco', preferred: false, img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', desc: 'Secluded villas in 20 hectares of gardens. World-class spa and Atlas Mountain panoramas.', perks: [], credit: 'Photo courtesy of Mandarin Oriental, Marrakech' },
  { id: 'four-seasons-marrakech', name: 'Four Seasons Resort Marrakech', city: 'Marrakech', dest: 'morocco', preferred: false, img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80', desc: 'Manicured gardens, multiple pools, and refined Moroccan-international dining with Atlas views.', perks: [], credit: 'Photo courtesy of Four Seasons Resort Marrakech' },
  { id: 'kasbah-tamadot', name: 'Kasbah Tamadot', city: 'Atlas Mountains', dest: 'morocco', preferred: true, img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80', desc: 'Richard Branson\'s Atlas retreat. Infinity pool overlooking the valley and unforgettable mountain dining.', perks: ['Room upgrade', 'Welcome amenity'], credit: 'Photo courtesy of Kasbah Tamadot' },
]

const MOROCCO_DAYS = [
  { day: 1, title: 'Arrival in Casablanca', morning: 'Check into Four Seasons Hotel Casablanca or Royal Mansour Casablanca. Unpack, freshen up, and enjoy the Atlantic breeze.', afternoon: 'Tour the iconic Hassan II Mosque with its intricate zellige tilework and sweeping ocean views. Stroll the art deco streets and wide boulevards, pausing at cafés for espresso or mint tea.', evening: 'Dinner at La Sqala — classic Moroccan dishes in a leafy courtyard inside the old medina. Finish with a sunset stroll along the Corniche.' },
  { day: 2, title: 'Casablanca to Fes', morning: 'Drive or fly to Fes. Settle into Riad Fès or Palais Faraj Suites & Spa.', afternoon: 'Wander narrow alleys of Fes el-Bali medina with a guide, exploring artisan workshops, spice shops, and historic madrasas.', evening: 'Dinner at Nur — modern Moroccan tasting menu in an intimate, creative setting.' },
  { day: 3, title: 'Fes cultural immersion', morning: 'Observe centuries-old leathercraft at Chouara Tannery and wander the courtyards of the University of al-Qarawiyyin, the world\'s oldest continuously operating university.', afternoon: 'Hike to the Merenid Tombs for panoramic medina views, then visit the Roman ruins of Volubilis and nearby Meknes.', evening: 'Rooftop dining at L\'Amandier at Palais Faraj with sweeping city views and elevated Moroccan-French flavors.' },
  { day: 4, title: 'Fes to Marrakech', morning: 'Fly or drive to Marrakech. Check into a riad or luxury resort — La Mamounia, Royal Mansour, Amanjena, or Mandarin Oriental.', afternoon: 'Navigate the winding markets of Jemaa el-Fna with a guide. Meet artisans and sample street foods.', evening: 'Dinner at Le Jardin — leafy courtyard setting with classic Moroccan dishes in the restored medina.' },
  { day: 5, title: 'Marrakech highlights', morning: 'Stroll the bold cobalt gardens of Jardin Majorelle, then explore the Yves Saint Laurent Museum and its Amazigh art collection.', afternoon: 'Discover whimsical sculptures at Anima Garden and prepare traditional Moroccan cuisine in a hands-on cooking class.', evening: 'Modern Moroccan flavors with rooftop medina views at Nomad Marrakech.' },
  { day: 6, title: 'Marrakech to Atlas Mountains', morning: 'Head to Imlil, Ouirgane, or Ourika Valley. Check into your mountain retreat — Olinto Atlas, Kasbah Tamadot, or Kasbah Bab Ourika.', afternoon: 'Guided hike through terraced farmland and Berber villages, soaking in mountain vistas.', evening: 'Local Moroccan fare at your lodge, paired with mountain sunset views.' },
  { day: 7, title: 'Atlas adventure', morning: 'Hike Mount Toubkal trails or the scenic Ourika Valley paths, pausing at waterfalls and panoramic terraces.', afternoon: 'Visit local artisan workshops, enjoy a hammam or spa treatment at your lodge.', evening: 'Relax with a mountain-view meal, followed by quiet stargazing in the Atlas night.' },
  { day: 8, title: 'Return to Marrakech', morning: 'Return to Marrakech and settle back into a luxury riad or hotel.', afternoon: 'Take a guided rooftop walk for sweeping views of minarets, gardens, and Atlas peaks.', evening: 'Savor locally sourced Moroccan dishes with creative cocktails at La Terrasse des Épices.' },
  { day: 9, title: 'Departure', morning: 'Enjoy a final breakfast in your riad or resort, with optional last-minute shopping or mint tea on the terrace.', afternoon: 'Private transfer to Marrakech Menara Airport for departure.', evening: null },
]

const MOROCCO_DINING = [
  { name: 'La Sqala', desc: 'Classic Moroccan courtyard fare in the old medina', type: 'Moroccan' },
  { name: 'Nur', desc: 'Modern tasting menu with Moroccan storytelling', type: 'Fine Dining' },
  { name: 'L\'Amandier at Palais Faraj', desc: 'Rooftop dining with sweeping medina views', type: 'Moroccan-French' },
  { name: 'Le Jardin', desc: 'Courtyard classic Moroccan in the restored medina', type: 'Moroccan' },
  { name: 'Nomad Marrakech', desc: 'Contemporary Moroccan flavors with rooftop views', type: 'Moroccan' },
  { name: 'Dar Yacout', desc: 'Multi-course Moroccan feast in candlelit salons', type: 'Moroccan' },
  { name: 'La Terrasse des Épices', desc: 'Rooftop medina dining with creative cocktails', type: 'Moroccan' },
  { name: 'Bacha Coffee', desc: 'Vibrant café with house-roasted coffee and pastries', type: 'Café' },
  { name: 'Al Fassia Aguedal', desc: 'Women-led authentic Moroccan dishes in serene garden', type: 'Moroccan' },
  { name: 'Comptoir Darna', desc: 'Moroccan & international cuisine with live performances', type: 'International' },
]

const CRUISE_PORTS = ['Barcelona', 'Marseille', 'Nice', 'La Spezia', 'Naples', 'Rome']

const HOTEL_GALLERY = [
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=200&q=80',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=200&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=200&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=200&q=80',
]

const ITINERARY_IMAGES = [
  'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80',
  'https://images.unsplash.com/photo-1553244675-d2ed01eeebea?w=800&q=80',
  'https://images.unsplash.com/photo-1548018560-c7196e6e28e2?w=800&q=80',
  'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80',
  'https://images.unsplash.com/photo-1517821362941-f7f753200fef?w=800&q=80',
  'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80',
]

/* ─── COMPONENT ─── */

type Screen = 'landing' | 'destination' | 'hotel' | 'consultation' | 'confirmation'

export default function EscapePreview() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null)
  const [selectedDest, setSelectedDest] = useState('morocco')
  const [selectedHotel, setSelectedHotel] = useState('la-mamounia')
  const [slideIdx, setSlideIdx] = useState(0)
  const [activeDay, setActiveDay] = useState(0)
  const [formDest, setFormDest] = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll-aware nav
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    if (screen !== 'landing') return
    const t = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [screen])

  const navigate = useCallback((to: Screen, opts?: { dest?: string; hotel?: string; formDest?: string }) => {
    setPrevScreen(screen)
    setTransitioning(true)
    if (opts?.dest) setSelectedDest(opts.dest)
    if (opts?.hotel) setSelectedHotel(opts.hotel)
    if (opts?.formDest) setFormDest(opts.formDest)
    else if (to === 'consultation' && !opts?.formDest) setFormDest('')
    if (to === 'confirmation') setSubmitted(true)
    else setSubmitted(false)
    setTimeout(() => {
      setScreen(to)
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      setTimeout(() => setTransitioning(false), 50)
    }, 200)
  }, [screen])

  const hotel = HOTELS.find(h => h.id === selectedHotel) || HOTELS[0]
  const moroccoHotels = HOTELS.filter(h => h.dest === 'morocco')
  const marrakechHotels = HOTELS.filter(h => h.dest === 'morocco' && h.city === 'Marrakech' && h.id !== selectedHotel)
  const dest = DESTINATIONS.find(d => d.id === selectedDest) || DESTINATIONS[0]

  const breadcrumb = () => {
    if (screen === 'destination') return <button onClick={() => navigate('landing')} className="text-sm hover:underline" style={{ color: '#B8975C' }}>&larr; Escape</button>
    if (screen === 'hotel') return <button onClick={() => navigate('destination', { dest: hotel.dest })} className="text-sm hover:underline" style={{ color: '#B8975C' }}>&larr; {DESTINATIONS.find(d => d.id === hotel.dest)?.name || 'Back'}</button>
    if (screen === 'consultation') return <button onClick={() => navigate(prevScreen === 'hotel' ? 'hotel' : prevScreen === 'destination' ? 'destination' : 'landing')} className="text-sm hover:underline" style={{ color: '#B8975C' }}>&larr; Back</button>
    return null
  }

  return (
    <>
      {/* Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div ref={containerRef} style={{ fontFamily: "'Inter', sans-serif", color: '#1a1a1a', background: '#fff', minHeight: '100vh' }}>
        {/* ─── NAV ─── */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            background: scrolled || screen === 'consultation' || screen === 'confirmation' ? 'rgba(255,255,255,0.97)' : 'transparent',
            borderBottom: scrolled || screen === 'consultation' || screen === 'confirmation' ? '1px solid #e8e2d8' : '1px solid transparent',
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('landing')} className="text-lg font-semibold tracking-wider" style={{ color: scrolled || screen === 'consultation' || screen === 'confirmation' ? '#1a1a1a' : '#fff', fontFamily: "'Inter', sans-serif" }}>
                JOBLUX.
              </button>
              {breadcrumb()}
            </div>
            <div className="hidden md:flex items-center gap-6">
              {['Intelligence', 'Wiki', 'Escape', 'Services'].map(l => (
                <span key={l} className="text-[13px] font-medium tracking-wide cursor-default" style={{ color: scrolled || screen === 'consultation' || screen === 'confirmation' ? '#1a1a1a99' : '#ffffff99' }}>{l}</span>
              ))}
              <span className="text-[13px] font-medium" style={{ color: scrolled || screen === 'consultation' || screen === 'confirmation' ? '#B8975C' : '#B8975C' }}>Mohammed</span>
            </div>
          </div>
        </nav>

        {/* ─── TRANSITION WRAPPER ─── */}
        <div className="transition-opacity duration-300" style={{ opacity: transitioning ? 0 : 1 }}>

          {/* ═══════ SCREEN 1: LANDING ═══════ */}
          {screen === 'landing' && (
            <div>
              {/* HERO CAROUSEL */}
              <div className="relative h-screen min-h-[600px] overflow-hidden">
                {SLIDES.map((s, i) => (
                  <div
                    key={s.id}
                    className="absolute inset-0 transition-opacity duration-1000 cursor-pointer"
                    style={{ opacity: i === slideIdx ? 1 : 0, zIndex: i === slideIdx ? 1 : 0 }}
                    onClick={() => navigate('destination', { dest: s.id })}
                  >
                    <div className="absolute inset-0" style={{ backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)' }} />
                  </div>
                ))}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-16">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: '#B8975C' }}>
                    Private Travel Advisory
                  </p>
                  <h1 className="text-4xl md:text-[56px] leading-[1.1] text-white mb-3 max-w-2xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {SLIDES[slideIdx].title}
                  </h1>
                  <p className="text-sm text-white/60 max-w-[480px] leading-relaxed">
                    {SLIDES[slideIdx].sub}
                  </p>
                </div>
                {/* Dots */}
                <div className="absolute bottom-8 right-8 md:right-16 z-10 flex gap-2">
                  {SLIDES.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setSlideIdx(i) }} className="w-2 h-2 rounded-full transition-all duration-300" style={{ background: i === slideIdx ? '#B8975C' : 'rgba(255,255,255,0.4)', transform: i === slideIdx ? 'scale(1.3)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>

              {/* DESTINATION GUIDES */}
              <div className="max-w-7xl mx-auto px-6 py-20">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Destination Guides</p>
                <h2 className="text-3xl mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>Where will you go?</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ gridAutoRows: '200px' }}>
                  {DESTINATIONS.map((d, i) => (
                    <button
                      key={d.id}
                      onClick={() => navigate('destination', { dest: d.id })}
                      className={`relative rounded-lg overflow-hidden group text-left ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                    >
                      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${d.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 70%)' }} />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-white/60 mb-1">{d.stat}</p>
                        <h3 className={`text-white font-medium ${i === 0 ? 'text-2xl' : 'text-base'}`} style={{ fontFamily: "'Playfair Display', serif" }}>{d.name}</h3>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* HOTEL CAROUSEL */}
              <div className="py-20" style={{ background: '#FAFAF8' }}>
                <div className="max-w-7xl mx-auto px-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Curated Hotels</p>
                  <h2 className="text-3xl mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Hand-selected properties</h2>
                  <p className="text-sm text-[#666] mb-10 max-w-lg">Each personally vetted by our advisors, with insider perks you won&apos;t find elsewhere.</p>
                  <div className="overflow-x-auto flex gap-5 pb-4 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
                    {HOTELS.slice(0, 6).map(h => (
                      <button key={h.id} onClick={() => navigate('hotel', { hotel: h.id })} className="w-[340px] flex-shrink-0 text-left group">
                        <div className="relative h-[240px] rounded-lg overflow-hidden">
                          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${h.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          {h.preferred && (
                            <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#B8975C', color: '#fff' }}>Preferred</span>
                          )}
                        </div>
                        <div className="pt-4">
                          <h4 className="text-lg font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>{h.name}</h4>
                          <p className="text-sm text-[#888] mt-0.5">{h.city}</p>
                          <p className="text-sm text-[#555] mt-2 leading-relaxed line-clamp-2">{h.desc}</p>
                          {h.perks.length > 0 && <p className="text-xs mt-2" style={{ color: '#B8975C' }}>{h.perks[0]}</p>}
                          <p className="text-[10px] italic text-[#bbb] mt-1">{h.credit}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* INSIDE THE GUIDE */}
              <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-xl overflow-hidden" style={{ minHeight: 520 }}>
                  <div className="relative min-h-[320px] md:min-h-0" style={{ backgroundImage: `url(${ITINERARY_IMAGES[activeDay] || ITINERARY_IMAGES[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 100%)' }} />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center" style={{ background: '#FAFAF8' }}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#B8975C' }}>Inside the Guide</p>
                    <h2 className="text-2xl md:text-3xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>9 days through Morocco</h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {MOROCCO_DAYS.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveDay(i)}
                          className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                          style={{ background: i === activeDay ? '#2B4A3E' : '#e8e2d8', color: i === activeDay ? '#fff' : '#555' }}
                        >
                          Day {d.day}
                        </button>
                      ))}
                    </div>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: '#2B4A3E' }}>{MOROCCO_DAYS[activeDay].title}</h3>
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                      {MOROCCO_DAYS[activeDay].morning && (
                        <div>
                          <p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>MORNING</p>
                          <p className="text-sm text-[#555] leading-relaxed">{MOROCCO_DAYS[activeDay].morning}</p>
                        </div>
                      )}
                      {MOROCCO_DAYS[activeDay].afternoon && (
                        <div>
                          <p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>AFTERNOON</p>
                          <p className="text-sm text-[#555] leading-relaxed">{MOROCCO_DAYS[activeDay].afternoon}</p>
                        </div>
                      )}
                      {MOROCCO_DAYS[activeDay].evening && (
                        <div>
                          <p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>EVENING</p>
                          <p className="text-sm text-[#555] leading-relaxed">{MOROCCO_DAYS[activeDay].evening}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CRUISE ROUTE */}
              <div className="py-20 px-6" style={{ background: '#2B4A3E' }}>
                <div className="max-w-7xl mx-auto">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Voyages</p>
                  <h2 className="text-3xl text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Mediterranean Discovery</h2>
                  <p className="text-sm text-white/50 mb-12 max-w-lg">Barcelona to Rome. 8 nights through the French Riviera and Tuscan coast.</p>
                  <div className="flex items-center justify-between max-w-3xl mx-auto relative">
                    <div className="absolute left-0 right-0 top-1/2 h-px" style={{ background: 'linear-gradient(to right, #B8975C, #B8975C)' }} />
                    {CRUISE_PORTS.map((port, i) => (
                      <div key={port} className="relative flex flex-col items-center z-10">
                        <div className="w-3 h-3 rounded-full mb-2 border-2" style={{ background: i === 0 || i === CRUISE_PORTS.length - 1 ? '#B8975C' : '#2B4A3E', borderColor: '#B8975C' }} />
                        <span className="text-[10px] md:text-xs text-white/80 whitespace-nowrap">{port}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ADVISOR */}
              <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center gap-4 rounded-lg border px-5 py-4" style={{ borderColor: '#e8e2d8', background: '#FAFAF8' }}>
                  <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium" style={{ background: '#2B4A3E', color: '#B8975C' }}>MA</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Mohammed Alex Mzaour</p>
                    <p className="text-xs text-[#888]">New York · London · Paris · Singapore</p>
                  </div>
                  <button onClick={() => navigate('consultation')} className="text-xs font-medium flex-shrink-0 whitespace-nowrap hover:underline" style={{ color: '#2B4A3E' }}>
                    Request consultation &gt;
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div className="py-24 text-center px-6" style={{ background: '#FAFAF8' }}>
                <h2 className="text-3xl md:text-4xl mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Ready to plan your escape?</h2>
                <p className="text-sm text-[#888] mb-8">Complimentary video consultation. No commitment.</p>
                <button onClick={() => navigate('consultation')} className="text-sm font-semibold px-10 py-3.5 rounded transition-colors hover:opacity-90" style={{ background: '#2B4A3E', color: '#fff' }}>
                  START PLANNING
                </button>
              </div>

              {/* FOOTER */}
              <div className="text-center py-10 px-6 border-t" style={{ borderColor: '#e8e2d8' }}>
                <p className="text-xs text-[#999]">Alex Mason on behalf of Joblux US LLC · Registered in Delaware · Joblux is an online media</p>
                <p className="text-xs mt-1" style={{ color: '#B8975C' }}>Travel advisory services provided by independent advisors affiliated with Fora Travel, Inc.</p>
              </div>
            </div>
          )}

          {/* ═══════ SCREEN 2: DESTINATION ═══════ */}
          {screen === 'destination' && (
            <div>
              {/* Hero */}
              <div className="relative h-[60vh] min-h-[400px] flex items-end" style={{ backgroundImage: `url(${dest.img.replace('w=800', 'w=1600')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)' }} />
                <div className="relative max-w-7xl mx-auto px-6 pb-12 w-full">
                  <p className="text-[10px] uppercase tracking-wider text-white/60 mb-2">{dest.stat}</p>
                  <h1 className="text-4xl md:text-6xl text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{dest.name}</h1>
                  <p className="text-lg text-white/70 mt-2">{dest.region}</p>
                </div>
              </div>

              {/* Hotels */}
              {moroccoHotels.length > 0 && selectedDest === 'morocco' && (
                <div className="max-w-7xl mx-auto px-6 py-20">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Where to Stay</p>
                  <h2 className="text-2xl mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Curated hotels in Morocco</h2>
                  <div className="overflow-x-auto flex gap-5 pb-4" style={{ scrollbarWidth: 'none' }}>
                    {moroccoHotels.map(h => (
                      <button key={h.id} onClick={() => navigate('hotel', { hotel: h.id })} className="w-[280px] flex-shrink-0 text-left group">
                        <div className="relative h-[200px] rounded-lg overflow-hidden">
                          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${h.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          {h.preferred && <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#B8975C', color: '#fff' }}>Preferred</span>}
                        </div>
                        <h4 className="text-base font-medium mt-3" style={{ fontFamily: "'Playfair Display', serif" }}>{h.name}</h4>
                        <p className="text-xs text-[#888] mt-0.5">{h.city}</p>
                        <p className="text-sm text-[#555] mt-1 line-clamp-2">{h.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary — Editorial */}
              {selectedDest === 'morocco' && (
                <div className="py-20" style={{ background: '#FAFAF8' }}>
                  <div className="max-w-7xl mx-auto px-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Day-by-Day Itinerary</p>
                    <h2 className="text-2xl mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>9 days through Morocco</h2>
                    <div className="space-y-0">
                      {MOROCCO_DAYS.map((d, i) => (
                        <div key={i} className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${i % 2 === 0 ? '' : 'md:[direction:rtl]'}`} style={{ minHeight: 300 }}>
                          <div className="relative min-h-[240px] md:min-h-0" style={{ backgroundImage: `url(${ITINERARY_IMAGES[i % ITINERARY_IMAGES.length]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.15)' }} />
                            <div className="absolute bottom-4 left-4">
                              <span className="text-white text-sm font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>Day {d.day}</span>
                            </div>
                          </div>
                          <div className={`p-8 md:p-10 flex flex-col justify-center bg-white ${i % 2 === 0 ? '' : 'md:[direction:ltr]'}`}>
                            <h3 className="text-lg font-semibold mb-4" style={{ color: '#2B4A3E', fontFamily: "'Playfair Display', serif" }}>{d.title}</h3>
                            <div className="space-y-3">
                              {d.morning && <div><p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>MORNING</p><p className="text-sm text-[#555] leading-relaxed">{d.morning}</p></div>}
                              {d.afternoon && <div><p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>AFTERNOON</p><p className="text-sm text-[#555] leading-relaxed">{d.afternoon}</p></div>}
                              {d.evening && <div><p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>EVENING</p><p className="text-sm text-[#555] leading-relaxed">{d.evening}</p></div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dining */}
              {selectedDest === 'morocco' && (
                <div className="max-w-7xl mx-auto px-6 py-20">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Dining Highlights</p>
                  <h2 className="text-2xl mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Where to eat</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MOROCCO_DINING.map((d, i) => (
                      <div key={i} className="p-5 rounded-lg border" style={{ borderColor: '#e8e2d8' }}>
                        <h4 className="font-medium">{d.name}</h4>
                        <p className="text-sm text-[#666] mt-1">{d.desc}</p>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-2" style={{ background: '#2B4A3E10', color: '#2B4A3E' }}>{d.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="py-20 text-center px-6" style={{ background: '#2B4A3E' }}>
                <h2 className="text-3xl text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Plan your {dest.name} escape</h2>
                <p className="text-sm text-white/50 mb-8">Complimentary consultation. No commitment.</p>
                <button onClick={() => navigate('consultation', { formDest: dest.name })} className="text-sm font-semibold px-10 py-3.5 rounded transition-colors" style={{ background: '#B8975C', color: '#fff' }}>
                  START PLANNING
                </button>
              </div>
            </div>
          )}

          {/* ═══════ SCREEN 3: HOTEL DETAIL ═══════ */}
          {screen === 'hotel' && (
            <div>
              {/* Hero */}
              <div className="relative h-[50vh] min-h-[360px]" style={{ backgroundImage: `url(${hotel.img.replace('w=600', 'w=1600')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
              </div>

              {/* Gallery strip */}
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {HOTEL_GALLERY.map((img, i) => (
                    <div key={i} className="w-16 h-16 flex-shrink-0 rounded overflow-hidden" style={{ border: i === 0 ? '2px solid #B8975C' : '2px solid transparent' }}>
                      <div className="w-full h-full" style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="max-w-3xl mx-auto px-6 py-8">
                {hotel.preferred && (
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3" style={{ background: '#B8975C', color: '#fff' }}>Fora Preferred</span>
                )}
                <p className="text-sm text-[#888]">{hotel.city}, {DESTINATIONS.find(d => d.id === hotel.dest)?.name}</p>
                <h1 className="text-3xl md:text-4xl mt-2 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>{hotel.name}</h1>
                <p className="text-[#555] leading-[1.8]">{hotel.desc} Since its founding, this iconic property has welcomed artists, heads of state, and discerning travelers seeking the very best of {DESTINATIONS.find(d => d.id === hotel.dest)?.name || 'this region'}.</p>

                {/* Perks */}
                {hotel.perks.length > 0 && (
                  <div className="mt-10 p-6 rounded-lg" style={{ background: '#FAFAF8', border: '1px solid #e8e2d8' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-4" style={{ color: '#B8975C' }}>Insider Perks — Book Through Your Advisor</p>
                    <ul className="space-y-2">
                      {hotel.perks.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#555]">
                          <span style={{ color: '#B8975C' }}>&#10003;</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Book CTA */}
                <button
                  onClick={() => navigate('consultation', { formDest: `${hotel.city} — ${hotel.name}` })}
                  className="w-full mt-8 text-sm font-semibold py-3.5 rounded transition-colors hover:opacity-90"
                  style={{ background: '#2B4A3E', color: '#fff' }}
                >
                  Plan a stay at {hotel.name}
                </button>

                <p className="text-[10px] italic text-[#bbb] mt-4 text-center">{hotel.credit}</p>
              </div>

              {/* Also in city */}
              {marrakechHotels.length > 0 && hotel.dest === 'morocco' && (
                <div className="max-w-7xl mx-auto px-6 py-16 border-t" style={{ borderColor: '#e8e2d8' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-6" style={{ color: '#888' }}>Also in {hotel.city}</h3>
                  <div className="overflow-x-auto flex gap-5 pb-4" style={{ scrollbarWidth: 'none' }}>
                    {marrakechHotels.map(h => (
                      <button key={h.id} onClick={() => navigate('hotel', { hotel: h.id })} className="w-[260px] flex-shrink-0 text-left group">
                        <div className="relative h-[180px] rounded-lg overflow-hidden">
                          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${h.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          {h.preferred && <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#B8975C', color: '#fff' }}>Preferred</span>}
                        </div>
                        <h4 className="text-sm font-medium mt-3" style={{ fontFamily: "'Playfair Display', serif" }}>{h.name}</h4>
                        <p className="text-xs text-[#888]">{h.city}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Advisor */}
              <div className="max-w-3xl mx-auto px-6 pb-16">
                <div className="flex items-center gap-4 rounded-lg border px-5 py-4" style={{ borderColor: '#e8e2d8' }}>
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium" style={{ background: '#2B4A3E', color: '#B8975C' }}>MA</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mohammed Alex Mzaour</p>
                    <p className="text-xs text-[#888]">New York · London · Paris · Singapore</p>
                  </div>
                  <button onClick={() => navigate('consultation')} className="text-xs font-medium hover:underline" style={{ color: '#2B4A3E' }}>Request consultation &gt;</button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ SCREEN 4: CONSULTATION ═══════ */}
          {screen === 'consultation' && (
            <div className="pt-24 pb-20 px-6 min-h-screen" style={{ background: '#FDF8EE' }}>
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#B8975C' }}>Escape · In partnership with Fora Travel</p>
                  <h1 className="text-3xl md:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>Start planning your escape.</h1>
                  <p className="text-sm text-[#888] mt-3 max-w-md mx-auto">A seasoned travel advisor will review your request and reach out within 48 hours for a complimentary video consultation.</p>
                </div>

                <div className="p-6 md:p-8 rounded-lg border" style={{ background: '#FFFDF7', borderColor: '#e8e2d8' }}>
                  {/* Trip type chips */}
                  <div className="mb-8 pb-8 border-b" style={{ borderColor: '#e8e2d850' }}>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2B4A3E' }}>What kind of trip?</label>
                    <div className="flex flex-wrap gap-2">
                      {['Hotels & resorts', 'Bespoke', 'Cruise', 'Honeymoon', 'Adventure', 'City break', 'Wellness'].map(t => (
                        <span key={t} className="text-sm px-4 py-2 rounded-full border cursor-pointer transition-colors hover:border-[#2B4A3E]" style={{ borderColor: '#D4C9B4', color: '#555' }}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="mb-8 pb-8 border-b" style={{ borderColor: '#e8e2d850' }}>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#2B4A3E' }}>Where would you like to go?</label>
                    <input
                      type="text"
                      defaultValue={formDest}
                      placeholder="A destination, a region, or just an idea"
                      className="w-full px-4 py-3 text-sm rounded border focus:outline-none transition-colors"
                      style={{ borderColor: '#D4C9B4', background: '#fff', color: '#2B4A3E' }}
                    />
                  </div>

                  {/* Budget */}
                  <div className="mb-8 pb-8 border-b" style={{ borderColor: '#e8e2d850' }}>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2B4A3E' }}>Budget per night</label>
                    <div className="flex flex-wrap gap-2">
                      {['$250–$400', '$400–$600', '$600–$1,000', '$1,000+', 'Let the advisor suggest'].map(b => (
                        <span key={b} className="text-sm px-4 py-2 rounded-full border cursor-pointer transition-colors hover:border-[#2B4A3E]" style={{ borderColor: '#D4C9B4', color: '#555' }}>{b}</span>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mb-8 pb-8 border-b" style={{ borderColor: '#e8e2d850' }}>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#2B4A3E' }}>Preferred dates</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="e.g. Late June 2026" className="px-4 py-3 text-sm rounded border focus:outline-none" style={{ borderColor: '#D4C9B4' }} />
                      <input type="text" placeholder="e.g. 7–10 days" className="px-4 py-3 text-sm rounded border focus:outline-none" style={{ borderColor: '#D4C9B4' }} />
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2B4A3E' }}>Contact details</label>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input type="text" placeholder="Full name *" className="px-4 py-3 text-sm rounded border focus:outline-none" style={{ borderColor: '#D4C9B4' }} />
                      <input type="email" placeholder="Email *" className="px-4 py-3 text-sm rounded border focus:outline-none" style={{ borderColor: '#D4C9B4' }} />
                    </div>
                    <input type="tel" placeholder="Phone (optional)" className="w-full px-4 py-3 text-sm rounded border focus:outline-none" style={{ borderColor: '#D4C9B4' }} />
                  </div>

                  <button
                    onClick={() => navigate('confirmation')}
                    className="w-full text-sm font-semibold py-3.5 rounded transition-colors hover:opacity-90"
                    style={{ background: '#2B4A3E', color: '#fff' }}
                  >
                    Submit your travel request
                  </button>
                </div>

                <p className="text-xs text-center mt-6" style={{ color: '#D4C9B4' }}>
                  Travel advisory services are provided by independent advisors affiliated with Fora Travel, Inc.
                </p>
              </div>
            </div>
          )}

          {/* ═══════ SCREEN 5: CONFIRMATION ═══════ */}
          {screen === 'confirmation' && (
            <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center" style={{ background: '#FDF8EE' }}>
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: '#2B4A3E' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h1 className="text-3xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#2B4A3E' }}>Thank you.</h1>
                <p className="text-sm text-[#555] leading-relaxed mb-3">Your request has been received.</p>
                <p className="text-sm text-[#888] leading-relaxed mb-10">A travel advisor will reach out within 48 hours for a complimentary video consultation. No commitment, no booking fees.</p>
                <button
                  onClick={() => navigate('landing')}
                  className="text-sm font-semibold px-10 py-3.5 rounded transition-colors hover:opacity-90"
                  style={{ background: '#2B4A3E', color: '#fff' }}
                >
                  Back to Escape
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
