'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/* ─────────────────────────── IMAGE URLS ─────────────────────────── */

const IMG = {
  morocco: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200&q=80',
  amsterdam: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80',
  portugal: 'https://images.unsplash.com/photo-1513735492246-483525079686?w=1200&q=80',
  kenya: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80',
  japan: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
  // Hotels
  mamounia: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
  mansour: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
  sixsenses: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
  angama: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80',
  aman: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',
  giraffe: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
  amstel: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80',
  riadfes: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600&q=80',
  amanjena: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
  mandarin: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
  kasbah: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',
  // Itinerary per-destination
  moroccoDay: [
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
    'https://images.unsplash.com/photo-1553244675-d2ed01eeebea?w=800&q=80',
    'https://images.unsplash.com/photo-1545042746-ec9e5acadd43?w=800&q=80',
    'https://images.unsplash.com/photo-1517821362941-f7f753200fef?w=800&q=80',
    'https://images.unsplash.com/photo-1548018560-c7196e6e28e2?w=800&q=80',
    'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80',
    'https://images.unsplash.com/photo-1518544866330-4e716499f800?w=800&q=80',
    'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80',
    'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80',
  ],
  amsterdamDay: [
    'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',
    'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    'https://images.unsplash.com/photo-1576924542622-772281b13aa8?w=800&q=80',
  ],
  portugalDay: [
    'https://images.unsplash.com/photo-1513735492246-483525079686?w=800&q=80',
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
    'https://images.unsplash.com/photo-1569959220744-ff553533f492?w=800&q=80',
    'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80',
    'https://images.unsplash.com/photo-1536663815808-535e2280d2c2?w=800&q=80',
    'https://images.unsplash.com/photo-1558370781-d6196949e317?w=800&q=80',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    'https://images.unsplash.com/photo-1513735492246-483525079686?w=800&q=80',
  ],
  kenyaDay: [
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
    'https://images.unsplash.com/photo-1504945005722-33670dcaf685?w=800&q=80',
    'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80',
    'https://images.unsplash.com/photo-1535338454528-1b22a21bd1a0?w=800&q=80',
    'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
  ],
  japanDay: [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80',
    'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&q=80',
  ],
  gallery: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=200&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=200&q=80',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=200&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=200&q=80',
  ],
}

/* ─────────────────────────── DATA ─────────────────────────── */

const SLIDES = [
  { id: 'morocco', img: IMG.morocco, title: 'The colours of Morocco', sub: 'Souks, riads, and the Atlas Mountains. A 9-day journey through the cultural heart of North Africa.' },
  { id: 'amsterdam', img: IMG.amsterdam, title: 'Amsterdam by canal light', sub: 'Canal icons, Dutch masters, and creative corners. A 4-day guide to Amsterdam\'s cultural heart.' },
  { id: 'portugal', img: IMG.portugal, title: 'Adventure through Portugal', sub: 'From the Douro Valley to Lisbon via Porto. Wine country, river cruises, Pena Palace, and fado nights.' },
  { id: 'japan', img: IMG.japan, title: 'Ancient temples, modern soul', sub: 'Tokyo, Kyoto, Kanazawa, and Hakone. Kaiseki cuisine, ancient temples, and Mount Fuji on the horizon.' },
]

const DESTINATIONS: Record<string, { name: string; region: string; img: string; stat: string }> = {
  morocco: { name: 'Morocco', region: 'Africa', img: IMG.morocco, stat: '9-day guide · 17 hotels · 15 restaurants' },
  amsterdam: { name: 'Amsterdam', region: 'Europe', img: IMG.amsterdam, stat: '4-day guide · 9 hotels · 14 restaurants' },
  portugal: { name: 'Portugal', region: 'Europe', img: IMG.portugal, stat: '8-day guide · 3 hotels' },
  kenya: { name: 'Kenya', region: 'Africa', img: IMG.kenya, stat: '7-day guide · 8 lodges' },
  japan: { name: 'Japan', region: 'Asia', img: IMG.japan, stat: '12 hotels · 20 restaurants' },
}
const DEST_ORDER = ['morocco', 'amsterdam', 'portugal', 'kenya', 'japan']

interface Hotel { id: string; name: string; city: string; dest: string; preferred: boolean; img: string; desc: string; perks: string[]; credit: string }

const HOTELS: Hotel[] = [
  { id: 'la-mamounia', name: 'La Mamounia', city: 'Marrakech', dest: 'morocco', preferred: true, img: IMG.mamounia, desc: 'Legendary palace where Churchill painted. Gardens, hammam, and Moroccan grandeur at its finest. Since 1923, this iconic property has welcomed artists, heads of state, and discerning travelers.', perks: ['Suite upgrade subject to availability', 'Welcome amenity on arrival', 'Daily breakfast for two', 'Late checkout'], credit: 'Photo courtesy of La Mamounia' },
  { id: 'royal-mansour', name: 'Royal Mansour Marrakech', city: 'Marrakech', dest: 'morocco', preferred: true, img: IMG.mansour, desc: 'Three-storey riads within a palace. Unmatched privacy, artisan craftsmanship, and a subterranean spa.', perks: ['Complimentary breakfast', 'Spa credit', 'Airport transfer'], credit: 'Photo courtesy of Royal Mansour Marrakech' },
  { id: 'amanjena', name: 'Amanjena', city: 'Marrakech', dest: 'morocco', preferred: true, img: IMG.amanjena, desc: 'Rose-pink pavilions, ancient olive groves, and meditative calm minutes from the medina.', perks: ['Room upgrade', 'Late checkout', 'Welcome amenity'], credit: 'Photo courtesy of Amanjena' },
  { id: 'mandarin-marrakech', name: 'Mandarin Oriental, Marrakech', city: 'Marrakech', dest: 'morocco', preferred: false, img: IMG.mandarin, desc: 'Secluded villas in 20 hectares of gardens. World-class spa, three pools, and Atlas Mountain panoramas.', perks: [], credit: 'Photo courtesy of Mandarin Oriental, Marrakech' },
  { id: 'kasbah-tamadot', name: 'Kasbah Tamadot', city: 'Atlas Mountains', dest: 'morocco', preferred: true, img: IMG.kasbah, desc: 'Richard Branson\'s Atlas retreat. Infinity pool overlooking the valley and unforgettable mountain dining.', perks: ['Room upgrade', 'Welcome amenity'], credit: 'Photo courtesy of Kasbah Tamadot' },
  { id: 'riad-fes', name: 'Riad Fès', city: 'Fes', dest: 'morocco', preferred: false, img: IMG.riadfes, desc: 'Intimate riad with refined Moroccan craftsmanship. Rooftop views over the ancient medina.', perks: [], credit: 'Photo courtesy of Riad Fès' },
  { id: 'six-senses-douro', name: 'Six Senses Douro Valley', city: 'Douro Valley', dest: 'portugal', preferred: true, img: IMG.sixsenses, desc: 'Wellness sanctuary overlooking terraced vineyards. World-class spa and farm-to-table dining.', perks: ['Spa credit', 'Welcome amenity', 'Room upgrade'], credit: 'Photo courtesy of Six Senses Douro Valley' },
  { id: 'angama-mara', name: 'Angama Mara', city: 'Maasai Mara', dest: 'kenya', preferred: true, img: IMG.angama, desc: 'Perched on the rim of the Great Rift Valley. Sweeping Mara views and legendary hospitality.', perks: ['Bush breakfast', 'Sundowner experience', 'Photography guide'], credit: 'Photo courtesy of Angama Mara' },
  { id: 'giraffe-manor', name: 'Giraffe Manor', city: 'Nairobi', dest: 'kenya', preferred: true, img: IMG.giraffe, desc: 'The iconic manor where Rothschild giraffes join you for breakfast. One of Africa\'s most magical stays.', perks: ['Welcome amenity', 'Guided giraffe experience'], credit: 'Photo courtesy of Giraffe Manor' },
  { id: 'aman-tokyo', name: 'Aman Tokyo', city: 'Tokyo', dest: 'japan', preferred: true, img: IMG.aman, desc: 'Minimalist sanctuary in the Otemachi tower. Clean lines, onsen-inspired spa, and panoramic city views.', perks: ['Spa credit', 'Late checkout', 'Welcome amenity'], credit: 'Photo courtesy of Aman Tokyo' },
  { id: 'intercontinental-amstel', name: 'InterContinental Amstel Amsterdam', city: 'Amsterdam', dest: 'amsterdam', preferred: true, img: IMG.amstel, desc: 'Grand and historic along the Amstel River. Classic European elegance and old-world polish.', perks: ['Breakfast for two', 'Spa access'], credit: 'Photo courtesy of InterContinental Amstel Amsterdam' },
]

interface Day { day: number; title: string; morning: string | null; afternoon: string | null; evening: string | null }
interface DiningItem { name: string; desc: string; type: string }

const ITINERARIES: Record<string, Day[]> = {
  morocco: [
    { day: 1, title: 'Arrival in Casablanca', morning: 'Check into Four Seasons Hotel Casablanca. Unpack, freshen up, enjoy the Atlantic breeze.', afternoon: 'Tour the iconic Hassan II Mosque with its intricate zellige tilework and sweeping ocean views. Stroll the art deco boulevards.', evening: 'Dinner at La Sqala — classic Moroccan dishes in a leafy courtyard inside the old medina.' },
    { day: 2, title: 'Casablanca to Fes', morning: 'Drive or fly to Fes. Settle into Riad Fès or Palais Faraj Suites & Spa.', afternoon: 'Wander narrow alleys of Fes el-Bali medina with a guide, exploring artisan workshops and spice shops.', evening: 'Dinner at Nur — modern Moroccan tasting menu in an intimate, creative setting.' },
    { day: 3, title: 'Fes cultural immersion', morning: 'Observe centuries-old leathercraft at Chouara Tannery and the courtyards of the University of al-Qarawiyyin.', afternoon: 'Hike to the Merenid Tombs for panoramic medina views, then visit the Roman ruins of Volubilis.', evening: 'Rooftop dining at L\'Amandier at Palais Faraj with sweeping city views.' },
    { day: 4, title: 'Fes to Marrakech', morning: 'Fly or drive to Marrakech. Check into La Mamounia, Royal Mansour, or Amanjena.', afternoon: 'Navigate the winding markets of Jemaa el-Fna. Meet artisans and sample street foods.', evening: 'Dinner at Le Jardin — leafy courtyard setting with classic Moroccan dishes.' },
    { day: 5, title: 'Marrakech highlights', morning: 'Stroll the cobalt gardens of Jardin Majorelle, then explore the Yves Saint Laurent Museum.', afternoon: 'Discover Anima Garden and join a hands-on Moroccan cooking class with a local chef.', evening: 'Modern Moroccan flavors with rooftop medina views at Nomad Marrakech.' },
    { day: 6, title: 'Atlas Mountains', morning: 'Head to Ourika Valley. Check into Kasbah Tamadot or Kasbah Bab Ourika.', afternoon: 'Guided hike through terraced farmland and Berber villages, soaking in mountain vistas.', evening: 'Local Moroccan fare at your lodge, paired with mountain sunset views.' },
    { day: 7, title: 'Atlas adventure', morning: 'Hike Mount Toubkal trails, pausing at waterfalls and panoramic terraces.', afternoon: 'Visit local artisan workshops, enjoy a hammam or spa treatment at your lodge.', evening: 'Mountain-view meal, followed by quiet stargazing in the Atlas night.' },
    { day: 8, title: 'Return to Marrakech', morning: 'Return to Marrakech and settle back into a luxury riad.', afternoon: 'Guided rooftop walk for sweeping views of minarets, gardens, and Atlas peaks.', evening: 'Locally sourced dishes with creative cocktails at La Terrasse des Épices.' },
    { day: 9, title: 'Departure', morning: 'Final breakfast with optional last-minute shopping or mint tea on the terrace.', afternoon: 'Private transfer to Marrakech Menara Airport for departure.', evening: null },
  ],
  amsterdam: [
    { day: 1, title: 'Canal icons & historic heart', morning: 'Begin at the Anne Frank House — timed tickets essential. Afterward, wander into the Jordaan. Stop at De Drie Graefjes for coffee and cake.', afternoon: 'Canal cruise past 17th-century merchant houses. Continue toward Dam Square, anchored by the Royal Palace.', evening: 'Dinner at Restaurant Flore at De L\'Europe — innovative plant-based tasting menu.' },
    { day: 2, title: 'Dutch masters & museum quarter', morning: 'Head to Museumplein. Visit the Rijksmuseum for Rembrandt, the Van Gogh Museum, and the Stedelijk.', afternoon: 'Tour the Heineken Experience. Relax in Vondelpark where locals picnic and cycle.', evening: 'Dinner at Restaurant de Kas in a former greenhouse. Seasonal, ingredient-driven dishes.' },
    { day: 3, title: 'Markets, maritime & creative corners', morning: 'Albert Cuyp Market in De Pijp for vintage clothing, Dutch cheeses, and specialty stalls. Floating tulip market.', afternoon: 'National Maritime Museum. Free ferry to Amsterdam Noord — NDSM Werf street art and STRAAT Museum.', evening: 'Waterfront drinks at Pllek, or bold plant-based comfort food at Vegan Junk Food Bar.' },
    { day: 4, title: 'Local life & slow wandering', morning: 'Walk through Oosterpark, Westerpark, or Rembrandtpark. Friday? Browse the Amsterdam Book Market.', afternoon: 'Kaasbar Amsterdam — Dutch and European cheeses glide by on a conveyor belt. Interactive and distinctly local.', evening: 'Cocktails at Freddy\'s Bar at De L\'Europe, or park-side dinner at Spring Café Brasserie at Pillows.' },
  ],
  portugal: [
    { day: 1, title: 'Arrival — Douro Valley', morning: null, afternoon: 'Private transfer from Porto Airport to Six Senses Douro Valley. Settle into the serene landscape.', evening: 'Alchemy Bar Workshop followed by dinner with views across the terraced vineyards.' },
    { day: 2, title: 'Douro River cruise', morning: 'Board in Folgosa for a Douro River cruise through the vineyard-lined valley.', afternoon: 'Disembark at Cais do Ferrão. Visit the Wine Museum, then lunch at Terraço\'s with QN Wines.', evening: 'Return to hotel. Evening at leisure enjoying resort amenities.' },
    { day: 3, title: 'Serra do Marão to Porto', morning: 'Check out from Six Senses. Transfer by Jeep through Serra do Marão with scenic viewpoints.', afternoon: 'Picnic lunch and mountain panoramas. Arrive in Porto by late afternoon.', evening: 'Check in at Hospes Infante Sagres. Explore Porto\'s historic center.' },
    { day: 4, title: 'Porto food & wine', morning: 'Culinary Backstreets Experience — Porto\'s best food tour through hidden neighborhoods.', afternoon: 'Private visit and wine tasting at Graham\'s Cellars, one of Porto\'s legendary port houses.', evening: 'Evening at leisure to explore Porto or dine at local restaurants.' },
    { day: 5, title: 'Porto to Lisbon via Aveiro & Coimbra', morning: 'Check out from Porto. Begin transfer to Lisbon with stops along the way.', afternoon: 'Navigate the canals of Aveiro aboard a Moliceiro. Visit University of Coimbra\'s Joanina Library.', evening: 'Check in at Bairro Alto Hotel in Lisbon. Evening in the Bairro Alto district.' },
    { day: 6, title: 'Lisbon cooking & sidecar', morning: 'Cooking class with a local market visit. Prepare traditional Portuguese dishes.', afternoon: 'Discover Lisbon by sidecar — vintage motorcycle tour through hills and viewpoints.', evening: 'Evening at leisure exploring Lisbon\'s dining scene.' },
    { day: 7, title: 'Sintra & fado farewell', morning: 'Day trip to Sintra. Visit Pena National Palace with fast-track entry.', afternoon: 'Continue exploring Sintra\'s gardens and the coastal town of Cascais.', evening: 'Farewell dinner with Fado tour — live show at Casa de Linhares.' },
    { day: 8, title: 'Departure', morning: 'Final breakfast at Bairro Alto Hotel.', afternoon: 'Private transfer to Lisbon Airport for departure.', evening: null },
  ],
  kenya: [
    { day: 1, title: 'Arrival in Nairobi', morning: null, afternoon: 'Arrive at Jomo Kenyatta Airport. Transfer to your hotel. Optional Giraffe Centre visit.', evening: 'Welcome dinner featuring nyama choma and sukuma wiki with a Dawa cocktail.' },
    { day: 2, title: 'Nairobi wildlife & culture', morning: 'Game drive in Nairobi National Park. Visit David Sheldrick Wildlife Trust for rescued elephants.', afternoon: 'Relax before safari begins.', evening: 'Evening at leisure.' },
    { day: 3, title: 'Lewa Conservancy', morning: 'Bush flight from Wilson Airport to Lewa Conservancy.', afternoon: 'Afternoon game drives spotting rhinos, Grevy\'s zebras, and elephants.', evening: 'Sundowners overlooking the savannah and dinner under the stars.' },
    { day: 4, title: 'Lewa immersive safari', morning: 'Early morning game drives through Lewa\'s private conservancy.', afternoon: 'Guided walking safaris and optional horseback safaris. Visit community initiatives.', evening: 'Evening storytelling around the fire pit.' },
    { day: 5, title: 'Maasai Mara — big game', morning: 'Fly to the Maasai Mara, known for sweeping plains and big-cat sightings.', afternoon: 'First game drive. Track lions, elephants, and cheetahs across the open savannah.', evening: 'Sunset drinks overlooking the savannah at your camp.' },
    { day: 6, title: 'A classic safari day', morning: 'Optional sunrise hot air balloon ride with champagne bush breakfast. Morning game drives.', afternoon: 'Afternoon game drives tracking the Big Five. Visit a Maasai village.', evening: 'Bush dinner beneath the stars.' },
    { day: 7, title: 'Return to Nairobi', morning: 'Optional final morning game drive before flying back to Nairobi.', afternoon: 'Lunch or last-minute shopping before departing from Jomo Kenyatta Airport.', evening: null },
  ],
  japan: [
    { day: 1, title: 'Tokyo', morning: 'Check into Aman Tokyo or Four Seasons Otemachi. Walk the Imperial Palace East Gardens.', afternoon: 'Explore Ginza — Sukiyabashi Jiro for sushi, Ten-ichi for tempura, cocktails at Bar High Five.', evening: 'Atmospheric dinner at Gonpachi, the izakaya that inspired Kill Bill.' },
    { day: 2, title: 'Kyoto', morning: 'Bullet train to Kyoto. Check into HOTEL THE MITSUI KYOTO. Visit Kinkaku-ji and Fushimi Inari.', afternoon: 'Stroll the bamboo groves of Arashiyama. Tea ceremony at a traditional machiya.', evening: 'Kaiseki dinner at Yoshikawa, a tranquil tempura institution.' },
    { day: 3, title: 'Kanazawa', morning: 'Train to Kanazawa. Explore Kenrokuen Garden and Omicho Market for fresh seafood.', afternoon: 'Visit the samurai and geisha districts. Sushi at Sushi Kinari with Sea of Japan fish.', evening: 'Michelin-starred kaiseki at Zeniya in Kanazawa\'s historic quarter.' },
    { day: 4, title: 'Hakone', morning: 'Travel to Hakone. Check into Gōra Kadan, a former imperial villa turned luxury ryokan.', afternoon: 'Open-air onsen with Mount Fuji views. Cruise Lake Ashi, ride the ropeway.', evening: 'Imperial-style kaiseki dinner at Gora Kadan Restaurant.' },
  ],
}

const DINING: Record<string, DiningItem[]> = {
  morocco: [
    { name: 'La Sqala', desc: 'Classic Moroccan courtyard fare in the old medina', type: 'Moroccan' },
    { name: 'Nur', desc: 'Modern tasting menu with Moroccan storytelling', type: 'Fine Dining' },
    { name: 'L\'Amandier at Palais Faraj', desc: 'Rooftop dining with sweeping medina views', type: 'Moroccan-French' },
    { name: 'Le Jardin', desc: 'Courtyard classic Moroccan in the restored medina', type: 'Moroccan' },
    { name: 'Nomad Marrakech', desc: 'Contemporary Moroccan flavors with rooftop views', type: 'Moroccan' },
    { name: 'Dar Yacout', desc: 'Multi-course feast in candlelit salons', type: 'Moroccan' },
    { name: 'La Terrasse des Épices', desc: 'Rooftop medina dining with creative cocktails', type: 'Moroccan' },
    { name: 'Bacha Coffee', desc: 'House-roasted coffee and pastries', type: 'Café' },
  ],
  amsterdam: [
    { name: 'Restaurant Flore', desc: 'Innovative plant-based tasting menu at De L\'Europe', type: 'Fine Dining' },
    { name: 'Restaurant de Kas', desc: 'Seasonal dishes in a former greenhouse', type: 'Farm to Table' },
    { name: 'Kaasbar Amsterdam', desc: 'Conveyor belt cheese tasting — distinctly local', type: 'Dutch' },
    { name: 'De Drie Graefjes', desc: 'Coffee and oversized cake in the Jordaan', type: 'Café' },
    { name: 'Freddy\'s Bar', desc: 'Glamorous cocktails at De L\'Europe', type: 'Bar' },
    { name: 'Vegan Junk Food Bar', desc: 'Bold, plant-based comfort food', type: 'Vegan' },
  ],
  portugal: [
    { name: 'Terraço\'s Restaurant', desc: 'Douro Valley lunch paired with QN Wines', type: 'Portuguese' },
    { name: 'Graham\'s Cellars', desc: 'Legendary port wine tasting in Vila Nova de Gaia', type: 'Wine' },
    { name: 'Casa de Linhares', desc: 'Live fado with traditional Portuguese dinner', type: 'Portuguese' },
  ],
  kenya: [],
  japan: [
    { name: 'Bar High Five', desc: 'World-renowned cocktail bar in Ginza', type: 'Bar' },
    { name: 'Ginza Kyubey Honten', desc: 'Legendary sushi counter since 1935', type: 'Sushi' },
    { name: 'Yoshikawa', desc: 'Tranquil tempura in a traditional machiya', type: 'Tempura' },
    { name: 'Zeniya', desc: 'Michelin-starred kaiseki in Kanazawa', type: 'Kaiseki' },
    { name: 'Gora Kadan Restaurant', desc: 'Imperial-style kaiseki in the ryokan', type: 'Kaiseki' },
    { name: 'Gonpachi', desc: 'Atmospheric izakaya that inspired Kill Bill', type: 'Izakaya' },
  ],
}

const CRUISE_PORTS = ['Barcelona', 'Marseille', 'Nice', 'La Spezia', 'Naples', 'Rome']

/* ─────────────────────────── HELPERS ─────────────────────────── */

const serif = "'Playfair Display', Georgia, serif"

function HotelCarousel({ hotels, onClickHotel }: { hotels: Hotel[]; onClickHotel: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }
  return (
    <div className="relative group">
      <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg" style={{ color: '#2B4A3E' }}>&lsaquo;</button>
      <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg" style={{ color: '#2B4A3E' }}>&rsaquo;</button>
      <div ref={ref} className="overflow-x-auto flex gap-5 pb-4 px-1 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        {hotels.map(h => (
          <button key={h.id} onClick={() => onClickHotel(h.id)} className="w-[300px] flex-shrink-0 text-left group/card">
            <div className="relative h-[210px] rounded-lg overflow-hidden">
              <div className="absolute inset-0 transition-transform duration-700 group-hover/card:scale-105" style={{ backgroundImage: `url(${h.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              {h.preferred && <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: '#B8975C', color: '#fff' }}>Preferred</span>}
            </div>
            <h4 className="text-base font-medium mt-3" style={{ fontFamily: serif }}>{h.name}</h4>
            <p className="text-xs mt-0.5" style={{ color: '#888' }}>{h.city}</p>
            <p className="text-sm mt-1 line-clamp-2" style={{ color: '#555' }}>{h.desc}</p>
            {h.perks.length > 0 && <p className="text-xs mt-1.5" style={{ color: '#B8975C' }}>{h.perks[0]}</p>}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */

type Screen = 'landing' | 'destination' | 'hotel' | 'consultation' | 'confirmation'

export default function EscapePreview() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [selectedDest, setSelectedDest] = useState('morocco')
  const [selectedHotel, setSelectedHotel] = useState('la-mamounia')
  const [slideIdx, setSlideIdx] = useState(0)
  const [formDest, setFormDest] = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDayLanding, setActiveDayLanding] = useState(0)
  const [selectedChips, setSelectedChips] = useState<string[]>([])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    if (screen !== 'landing') return
    const t = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [screen])

  const go = useCallback((to: Screen, opts?: { dest?: string; hotel?: string; formDest?: string }) => {
    setTransitioning(true)
    if (opts?.dest) setSelectedDest(opts.dest)
    if (opts?.hotel) setSelectedHotel(opts.hotel)
    setFormDest(opts?.formDest || '')
    setTimeout(() => {
      setScreen(to)
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      setTimeout(() => setTransitioning(false), 50)
    }, 200)
  }, [])

  const toggleChip = (c: string) => setSelectedChips(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  const hotel = HOTELS.find(h => h.id === selectedHotel) || HOTELS[0]
  const dest = DESTINATIONS[selectedDest] || DESTINATIONS.morocco
  const destHotels = HOTELS.filter(h => h.dest === selectedDest)
  const cityHotels = HOTELS.filter(h => h.city === hotel.city && h.id !== hotel.id)
  const days = ITINERARIES[selectedDest] || []
  const dining = DINING[selectedDest] || []
  const dayImages = (IMG as any)[selectedDest + 'Day'] || IMG.moroccoDay

  const isHeroScreen = screen === 'landing' || screen === 'destination' || screen === 'hotel'
  const navDark = scrolled || !isHeroScreen
  const navColor = navDark ? '#1a1a1a' : '#fff'

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{ fontFamily: "'Inter', sans-serif", color: '#1a1a1a', background: '#fff', minHeight: '100vh' }}>
        {/* ─── NAV ─── */}
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{ background: navDark ? 'rgba(255,255,255,0.97)' : 'transparent', borderBottom: navDark ? '1px solid #e8e2d8' : '1px solid transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none' }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button onClick={() => go('landing')} className="text-lg font-semibold tracking-wider flex-shrink-0" style={{ color: navColor }}>JOBLUX.</button>
              {screen === 'destination' && <button onClick={() => go('landing')} className="text-sm hover:underline flex-shrink-0" style={{ color: '#B8975C' }}>&larr; Escape</button>}
              {screen === 'hotel' && <button onClick={() => go('destination', { dest: hotel.dest })} className="text-sm hover:underline flex-shrink-0" style={{ color: '#B8975C' }}>&larr; {DESTINATIONS[hotel.dest]?.name}</button>}
              {screen === 'consultation' && <button onClick={() => go('landing')} className="text-sm hover:underline flex-shrink-0" style={{ color: '#B8975C' }}>&larr; Back</button>}
            </div>
            <div className="hidden md:flex items-center gap-6">
              {['Intelligence', 'Wiki', 'Escape', 'Services'].map(l => (
                <span key={l} className="text-[13px] font-medium tracking-wide cursor-default" style={{ color: navDark ? '#1a1a1a99' : '#ffffff99' }}>{l}</span>
              ))}
              <span className="text-[13px] font-medium" style={{ color: '#B8975C' }}>Mohammed</span>
            </div>
          </div>
        </nav>

        {/* ─── CONTENT ─── */}
        <div className="transition-opacity duration-300" style={{ opacity: transitioning ? 0 : 1 }}>

          {/* ═══ SCREEN 1: LANDING ═══ */}
          {screen === 'landing' && (
            <div>
              {/* Hero carousel */}
              <div className="relative h-screen min-h-[600px] overflow-hidden">
                {SLIDES.map((s, i) => (
                  <div key={s.id} className="absolute inset-0 transition-opacity duration-1000 cursor-pointer" style={{ opacity: i === slideIdx ? 1 : 0, zIndex: i === slideIdx ? 1 : 0 }} onClick={() => go('destination', { dest: s.id })}>
                    <div className="absolute inset-0" style={{ backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)' }} />
                  </div>
                ))}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-16">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: '#B8975C' }}>Private Travel Advisory</p>
                  <h1 className="text-4xl md:text-[56px] leading-[1.1] text-white mb-3 max-w-2xl" style={{ fontFamily: serif }}>{SLIDES[slideIdx].title}</h1>
                  <p className="text-sm text-white/60 max-w-[480px] leading-relaxed">{SLIDES[slideIdx].sub}</p>
                </div>
                <div className="absolute bottom-8 right-8 md:right-16 z-10 flex gap-2">
                  {SLIDES.map((_, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); setSlideIdx(i) }} className="w-2 h-2 rounded-full transition-all" style={{ background: i === slideIdx ? '#B8975C' : 'rgba(255,255,255,0.4)', transform: i === slideIdx ? 'scale(1.3)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>

              {/* Destination grid */}
              <div className="max-w-7xl mx-auto px-6 py-20">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Destination Guides</p>
                <h2 className="text-3xl mb-10" style={{ fontFamily: serif }}>Where will you go?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3" style={{ gridAutoRows: '200px' }}>
                  {DEST_ORDER.map((did, i) => {
                    const d = DESTINATIONS[did]
                    return (
                      <button key={did} onClick={() => go('destination', { dest: did })} className={`relative rounded-lg overflow-hidden group text-left ${i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}>
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${d.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-[10px] uppercase tracking-wider text-white/60 mb-1">{d.stat}</p>
                          <h3 className={`text-white font-medium ${i === 0 ? 'text-2xl' : 'text-base'}`} style={{ fontFamily: serif }}>{d.name}</h3>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Hotels */}
              <div className="py-20" style={{ background: '#FAFAF8' }}>
                <div className="max-w-7xl mx-auto px-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Curated Hotels</p>
                  <h2 className="text-3xl mb-3" style={{ fontFamily: serif }}>Hand-selected properties</h2>
                  <p className="text-sm mb-10 max-w-lg" style={{ color: '#666' }}>Each personally vetted by our advisors, with insider perks you won&apos;t find elsewhere.</p>
                  <HotelCarousel hotels={HOTELS.slice(0, 8)} onClickHotel={id => go('hotel', { hotel: id })} />
                </div>
              </div>

              {/* Inside the Guide */}
              <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-xl overflow-hidden" style={{ minHeight: 500 }}>
                  <div className="relative min-h-[300px]" style={{ backgroundImage: `url(${IMG.moroccoDay[activeDayLanding] || IMG.moroccoDay[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.2), transparent)' }} />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center" style={{ background: '#FAFAF8' }}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#B8975C' }}>Inside the Guide</p>
                    <h2 className="text-2xl md:text-3xl mb-6" style={{ fontFamily: serif }}>9 days through Morocco</h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {ITINERARIES.morocco.map((d, i) => (
                        <button key={i} onClick={() => setActiveDayLanding(i)} className="text-xs font-medium px-3 py-1.5 rounded-full transition-all" style={{ background: i === activeDayLanding ? '#2B4A3E' : '#e8e2d8', color: i === activeDayLanding ? '#fff' : '#555' }}>Day {d.day}</button>
                      ))}
                    </div>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: '#2B4A3E' }}>{ITINERARIES.morocco[activeDayLanding].title}</h3>
                    <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                      {ITINERARIES.morocco[activeDayLanding].morning && <div><p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>MORNING</p><p className="text-sm leading-relaxed" style={{ color: '#555' }}>{ITINERARIES.morocco[activeDayLanding].morning}</p></div>}
                      {ITINERARIES.morocco[activeDayLanding].afternoon && <div><p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>AFTERNOON</p><p className="text-sm leading-relaxed" style={{ color: '#555' }}>{ITINERARIES.morocco[activeDayLanding].afternoon}</p></div>}
                      {ITINERARIES.morocco[activeDayLanding].evening && <div><p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>EVENING</p><p className="text-sm leading-relaxed" style={{ color: '#555' }}>{ITINERARIES.morocco[activeDayLanding].evening}</p></div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cruise */}
              <div className="py-20 px-6" style={{ background: '#2B4A3E' }}>
                <div className="max-w-7xl mx-auto">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Voyages</p>
                  <h2 className="text-3xl text-white mb-3" style={{ fontFamily: serif }}>Mediterranean Discovery</h2>
                  <p className="text-sm text-white/50 mb-12 max-w-lg">Barcelona to Rome. 8 nights through the French Riviera and Tuscan coast.</p>
                  <div className="flex items-center justify-between max-w-3xl mx-auto relative">
                    <div className="absolute left-0 right-0 top-1/2 h-px" style={{ background: '#B8975C' }} />
                    {CRUISE_PORTS.map((port, i) => (
                      <div key={port} className="relative flex flex-col items-center z-10">
                        <div className="w-3 h-3 rounded-full mb-2 border-2" style={{ background: i === 0 || i === CRUISE_PORTS.length - 1 ? '#B8975C' : '#2B4A3E', borderColor: '#B8975C' }} />
                        <span className="text-[10px] md:text-xs text-white/80 whitespace-nowrap">{port}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advisor + CTA + Footer */}
              <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
                <div className="flex items-center gap-4 rounded-lg border px-5 py-4" style={{ borderColor: '#e8e2d8', background: '#FAFAF8' }}>
                  <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium" style={{ background: '#2B4A3E', color: '#B8975C' }}>MA</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Mohammed Alex Mzaour</p>
                    <p className="text-xs" style={{ color: '#888' }}>New York · London · Paris · Singapore</p>
                  </div>
                  <button onClick={() => go('consultation')} className="text-xs font-medium flex-shrink-0 hover:underline" style={{ color: '#2B4A3E' }}>Request consultation &gt;</button>
                </div>
              </div>
              <div className="py-20 text-center px-6" style={{ background: '#FAFAF8' }}>
                <h2 className="text-3xl md:text-4xl mb-4" style={{ fontFamily: serif }}>Ready to plan your escape?</h2>
                <p className="text-sm mb-8" style={{ color: '#888' }}>Complimentary video consultation. No commitment.</p>
                <button onClick={() => go('consultation')} className="text-sm font-semibold px-10 py-3.5 rounded hover:opacity-90 transition-opacity" style={{ background: '#2B4A3E', color: '#fff' }}>START PLANNING</button>
              </div>
              <div className="text-center py-10 px-6 border-t" style={{ borderColor: '#e8e2d8' }}>
                <p className="text-xs" style={{ color: '#999' }}>Alex Mason on behalf of Joblux US LLC · Registered in Delaware · Joblux is an online media</p>
                <p className="text-xs mt-1" style={{ color: '#B8975C' }}>Travel advisory services provided by independent advisors affiliated with Fora Travel, Inc.</p>
                <p className="text-xs mt-2" style={{ color: '#bbb' }}>Help centre · Terms · JOBLUX</p>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 2: DESTINATION ═══ */}
          {screen === 'destination' && (
            <div>
              <div className="relative h-[60vh] min-h-[400px] flex items-end" style={{ backgroundImage: `url(${dest.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                <div className="relative max-w-7xl mx-auto px-6 pb-12 w-full">
                  <p className="text-[10px] uppercase tracking-wider text-white/60 mb-2">{dest.stat}</p>
                  <h1 className="text-4xl md:text-6xl text-white" style={{ fontFamily: serif }}>{dest.name}</h1>
                  <p className="text-lg text-white/70 mt-2">{dest.region}</p>
                </div>
              </div>

              {/* Hotels */}
              {destHotels.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-20">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Where to Stay</p>
                  <h2 className="text-2xl mb-8" style={{ fontFamily: serif }}>Curated hotels in {dest.name}</h2>
                  <HotelCarousel hotels={destHotels} onClickHotel={id => go('hotel', { hotel: id })} />
                </div>
              )}

              {/* Itinerary */}
              {days.length > 0 && (
                <div className="py-20" style={{ background: '#FAFAF8' }}>
                  <div className="max-w-7xl mx-auto px-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Day-by-Day Itinerary</p>
                    <h2 className="text-2xl mb-12" style={{ fontFamily: serif }}>{days.length} days in {dest.name}</h2>
                    {days.map((d, i) => (
                      <div key={i} className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`} style={{ minHeight: 280 }}>
                        <div className="relative min-h-[220px] md:min-h-0" style={{ backgroundImage: `url(${dayImages[i % dayImages.length]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.15)' }} />
                          <div className="absolute bottom-4 left-4"><span className="text-white text-sm font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>Day {d.day}</span></div>
                        </div>
                        <div className={`p-8 md:p-10 flex flex-col justify-center bg-white ${i % 2 === 1 ? 'md:[direction:ltr]' : ''}`}>
                          <h3 className="text-lg font-semibold mb-4" style={{ color: '#2B4A3E', fontFamily: serif }}>{d.title}</h3>
                          <div className="space-y-3">
                            {d.morning && <div><p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>MORNING</p><p className="text-sm leading-relaxed" style={{ color: '#555' }}>{d.morning}</p></div>}
                            {d.afternoon && <div><p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>AFTERNOON</p><p className="text-sm leading-relaxed" style={{ color: '#555' }}>{d.afternoon}</p></div>}
                            {d.evening && <div><p className="text-[10px] tracking-widest font-semibold mb-1" style={{ color: '#B8975C' }}>EVENING</p><p className="text-sm leading-relaxed" style={{ color: '#555' }}>{d.evening}</p></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dining */}
              {dining.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-20">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: '#B8975C' }}>Dining Highlights</p>
                  <h2 className="text-2xl mb-8" style={{ fontFamily: serif }}>Where to eat</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dining.map((d, i) => (
                      <div key={i} className="p-5 rounded-lg border" style={{ borderColor: '#e8e2d8' }}>
                        <h4 className="font-medium">{d.name}</h4>
                        <p className="text-sm mt-1" style={{ color: '#666' }}>{d.desc}</p>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-2" style={{ background: '#2B4A3E10', color: '#2B4A3E' }}>{d.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="py-20 text-center px-6" style={{ background: '#2B4A3E' }}>
                <h2 className="text-3xl text-white mb-4" style={{ fontFamily: serif }}>Plan your {dest.name} escape</h2>
                <p className="text-sm text-white/50 mb-8">Complimentary consultation. No commitment.</p>
                <button onClick={() => go('consultation', { formDest: dest.name })} className="text-sm font-semibold px-10 py-3.5 rounded hover:opacity-90 transition-opacity" style={{ background: '#B8975C', color: '#fff' }}>START PLANNING</button>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 3: HOTEL ═══ */}
          {screen === 'hotel' && (
            <div>
              <div className="relative h-[50vh] min-h-[360px]" style={{ backgroundImage: `url(${hotel.img.replace('w=600', 'w=1200')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent 50%)' }} />
              </div>
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {IMG.gallery.map((img, i) => (
                    <div key={i} className="w-16 h-16 flex-shrink-0 rounded overflow-hidden" style={{ border: i === 0 ? '2px solid #B8975C' : '2px solid transparent' }}>
                      <div className="w-full h-full" style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="max-w-3xl mx-auto px-6 py-8">
                {hotel.preferred && <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3" style={{ background: '#B8975C', color: '#fff' }}>Fora Preferred</span>}
                <p className="text-sm" style={{ color: '#888' }}>{hotel.city}, {DESTINATIONS[hotel.dest]?.name}</p>
                <h1 className="text-3xl md:text-4xl mt-2 mb-6" style={{ fontFamily: serif }}>{hotel.name}</h1>
                <p className="leading-[1.8]" style={{ color: '#555' }}>{hotel.desc}</p>
                {hotel.perks.length > 0 && (
                  <div className="mt-10 p-6 rounded-lg" style={{ background: '#FAFAF8', border: '1px solid #e8e2d8' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-4" style={{ color: '#B8975C' }}>Insider Perks — Book Through Your Advisor</p>
                    <ul className="space-y-2">{hotel.perks.map((p, i) => <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#555' }}><span style={{ color: '#B8975C' }}>&#10003;</span> {p}</li>)}</ul>
                  </div>
                )}
                <button onClick={() => go('consultation', { formDest: `${hotel.city} — ${hotel.name}` })} className="w-full mt-8 text-sm font-semibold py-3.5 rounded hover:opacity-90 transition-opacity" style={{ background: '#2B4A3E', color: '#fff' }}>Plan a stay at {hotel.name}</button>
                <p className="text-[10px] italic text-center mt-4" style={{ color: '#bbb' }}>{hotel.credit}</p>
              </div>
              {cityHotels.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 py-16 border-t" style={{ borderColor: '#e8e2d8' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-6" style={{ color: '#888' }}>Also in {hotel.city}</h3>
                  <HotelCarousel hotels={cityHotels} onClickHotel={id => go('hotel', { hotel: id })} />
                </div>
              )}
              <div className="max-w-3xl mx-auto px-6 pb-16">
                <div className="flex items-center gap-4 rounded-lg border px-5 py-4" style={{ borderColor: '#e8e2d8' }}>
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium" style={{ background: '#2B4A3E', color: '#B8975C' }}>MA</div>
                  <div className="flex-1"><p className="text-sm font-medium">Mohammed Alex Mzaour</p><p className="text-xs" style={{ color: '#888' }}>New York · London · Paris · Singapore</p></div>
                  <button onClick={() => go('consultation')} className="text-xs font-medium hover:underline" style={{ color: '#2B4A3E' }}>Request consultation &gt;</button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 4: CONSULTATION ═══ */}
          {screen === 'consultation' && (
            <div className="pt-24 pb-20 px-6 min-h-screen" style={{ background: '#FDF8EE' }}>
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#B8975C' }}>Escape · In partnership with Fora Travel</p>
                  <h1 className="text-3xl md:text-4xl" style={{ fontFamily: serif }}>Start planning your escape.</h1>
                  <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: '#888' }}>A travel advisor will reach out within 48 hours for a complimentary video consultation.</p>
                </div>
                {formDest && <div className="text-center mb-6 text-sm font-medium" style={{ color: '#2B4A3E' }}>Planning: {formDest}</div>}
                <div className="p-6 md:p-8 rounded-lg border" style={{ background: '#FFFDF7', borderColor: '#e8e2d8' }}>
                  <div className="mb-8 pb-8 border-b" style={{ borderColor: '#e8e2d850' }}>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2B4A3E' }}>What kind of trip?</label>
                    <div className="flex flex-wrap gap-2">
                      {['Hotels & resorts', 'Cruise', 'Honeymoon', 'Cultural immersion', 'Gastronomy', 'Adventure', 'Wellness', 'Family'].map(t => (
                        <button key={t} onClick={() => toggleChip(t)} className="text-sm px-4 py-2 rounded-full border transition-colors" style={{ borderColor: selectedChips.includes(t) ? '#2B4A3E' : '#D4C9B4', background: selectedChips.includes(t) ? '#2B4A3E' : 'transparent', color: selectedChips.includes(t) ? '#fff' : '#555' }}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-8 pb-8 border-b" style={{ borderColor: '#e8e2d850' }}>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#2B4A3E' }}>Where would you like to go?</label>
                    <input type="text" defaultValue={formDest} placeholder="A destination, a region, or just an idea" className="w-full px-4 py-3 text-sm rounded border focus:outline-none focus:border-[#2B4A3E]" style={{ borderColor: '#D4C9B4' }} />
                  </div>
                  <div className="mb-8 pb-8 border-b" style={{ borderColor: '#e8e2d850' }}>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2B4A3E' }}>Budget per night</label>
                    <div className="flex flex-wrap gap-2">
                      {['$250–$400', '$400–$600', '$600–$1,000', '$1,000+', 'Advisor suggests'].map(b => (
                        <button key={b} onClick={() => toggleChip(b)} className="text-sm px-4 py-2 rounded-full border transition-colors" style={{ borderColor: selectedChips.includes(b) ? '#2B4A3E' : '#D4C9B4', background: selectedChips.includes(b) ? '#2B4A3E' : 'transparent', color: selectedChips.includes(b) ? '#fff' : '#555' }}>{b}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-8 pb-8 border-b" style={{ borderColor: '#e8e2d850' }}>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#2B4A3E' }}>Preferred dates</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="text" placeholder="e.g. Late June 2026" className="px-4 py-3 text-sm rounded border focus:outline-none focus:border-[#2B4A3E]" style={{ borderColor: '#D4C9B4' }} />
                      <input type="text" placeholder="e.g. 7–10 days" className="px-4 py-3 text-sm rounded border focus:outline-none focus:border-[#2B4A3E]" style={{ borderColor: '#D4C9B4' }} />
                    </div>
                  </div>
                  <div className="mb-8">
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2B4A3E' }}>Contact details</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <input type="text" placeholder="Full name *" className="px-4 py-3 text-sm rounded border focus:outline-none focus:border-[#2B4A3E]" style={{ borderColor: '#D4C9B4' }} />
                      <input type="email" placeholder="Email *" className="px-4 py-3 text-sm rounded border focus:outline-none focus:border-[#2B4A3E]" style={{ borderColor: '#D4C9B4' }} />
                    </div>
                    <input type="tel" placeholder="Phone (optional)" className="w-full px-4 py-3 text-sm rounded border focus:outline-none focus:border-[#2B4A3E]" style={{ borderColor: '#D4C9B4' }} />
                  </div>
                  <button onClick={() => go('confirmation')} className="w-full text-sm font-semibold py-3.5 rounded hover:opacity-90 transition-opacity" style={{ background: '#2B4A3E', color: '#fff' }}>Submit your travel request</button>
                </div>
                <p className="text-xs text-center mt-6" style={{ color: '#D4C9B4' }}>Travel advisory services are provided by independent advisors affiliated with Fora Travel, Inc.</p>
              </div>
            </div>
          )}

          {/* ═══ SCREEN 5: CONFIRMATION ═══ */}
          {screen === 'confirmation' && (
            <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center" style={{ background: '#FDF8EE' }}>
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: '#2B4A3E' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h1 className="text-3xl mb-4" style={{ fontFamily: serif, color: '#2B4A3E' }}>Thank you.</h1>
                <p className="text-sm leading-relaxed mb-3" style={{ color: '#555' }}>Your request has been received.</p>
                <p className="text-sm leading-relaxed mb-10" style={{ color: '#888' }}>A travel advisor will reach out within 48 hours for a complimentary video consultation. No commitment, no booking fees.</p>
                <button onClick={() => go('landing')} className="text-sm font-semibold px-10 py-3.5 rounded hover:opacity-90 transition-opacity" style={{ background: '#2B4A3E', color: '#fff' }}>Back to Escape</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
