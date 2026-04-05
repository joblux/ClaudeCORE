export interface BrandInput {
  slug: string
  name: string
  sector?: string | null
  country?: string | null
  founded?: number | null
  group_name?: string | null
  /** @deprecated Use group_name. Kept for backward compatibility during migration. */
  group?: string | null
  headquarters?: string | null
  known_for?: string | null
  description?: string | null
}

export function buildRichPrompt(brand: BrandInput): string {
  return `You are writing a comprehensive brand intelligence profile for WikiLux by JOBLUX, the luxury talents society. Write authoritative, editorial-quality content in the style of Business of Fashion or the Financial Times luxury coverage.

You MUST generate ALL of the following sections. Each section should be a substantial paragraph of 150-300 words. Write in authoritative editorial prose — informative, precise, never promotional. Include specific dates, names, and facts.

Return ONLY a valid JSON object (no markdown, no backticks, just pure JSON) with these exact keys:

{
  "tagline": "one elegant sentence capturing the brand essence",
  "history": "Full brand history from founding to present. Key milestones, pivotal moments, ownership changes, global expansion. Minimum 200 words.",
  "founder": "The founder's biography — background, vision, philosophy, lasting impact. What drove them. Minimum 150 words.",
  "founder_facts": {
    "name": "founder full name",
    "birth": "birth year and place",
    "legacy": "1-2 sentences on lasting impact"
  },
  "signature_products": "Most iconic products and collections. What makes them distinctive. Include specific product names, launch dates, cultural significance. Minimum 150 words.",
  "creative_directors": "Timeline of creative leadership. Each director's contribution, tenure, and impact. Current creative leader. Minimum 150 words.",
  "brand_dna": "Core identity, aesthetic codes, values, positioning. What distinguishes this maison from competitors. The intangible qualities. Minimum 150 words.",
  "market_position": "Where this brand sits in the luxury hierarchy, pricing strategy, target clientele, competitive landscape. Minimum 100 words.",
  "current_strategy": "Current business strategy, recent moves, digital approach, sustainability initiatives, key markets being developed. Minimum 100 words.",
  "careers": "What it's like to work at this maison. Company culture, typical departments, career paths, what they look for in talent. Hiring approach. End by mentioning JOBLUX for luxury career opportunities. Minimum 100 words.",
  "hiring_intelligence": {
    "culture": "2 paragraphs on internal culture, values they hire for, what it's really like to work there",
    "profiles": "2 paragraphs on typical candidate profiles, backgrounds, qualities, what gives candidates an edge",
    "process": "1 paragraph on typical recruitment process and what to expect",
    "tips": ["tip 1 for candidates", "tip 2", "tip 3", "tip 4"]
  },
  "key_executives": [
    { "role": "CEO/President", "note": "brief note on leadership style or recent moves" }
  ],
  "key_facts": {
    "headquarters_city": "${brand.headquarters || ''}",
    "headquarters_country": "${brand.country || ''}",
    "founded_year": ${brand.founded || 0},
    "founder_name": "founder full name",
    "parent_group": "${brand.group_name || brand.group || ''}",
    "sector": "${brand.sector || ''}",
    "subsectors": ["subsector 1", "subsector 2"],
    "estimated_employees": "approximate number or range",
    "key_markets": ["market 1", "market 2", "market 3", "market 4"],
    "website_url": "official website URL"
  },
  "presence": {
    "headquarters": "${brand.country || ''}",
    "key_markets": ["market 1", "market 2", "market 3", "market 4"],
    "boutiques": "approximate number or description of retail presence"
  },
  "stock": {
    "listed": true,
    "exchange": "stock exchange name or null",
    "ticker": "ticker symbol or null",
    "parent_group": "${brand.group_name || brand.group || ''}"
  },
  "facts": ["interesting fact 1", "interesting fact 2", "interesting fact 3", "interesting fact 4", "interesting fact 5"]
}

Brand details: ${brand.name}, ${brand.sector || 'Luxury'} sector, founded ${brand.founded || 'unknown'}, ${brand.country || 'unknown'}, part of ${brand.group_name || brand.group || 'Independent'}.
Write with genuine expertise. This will be read by luxury industry executives and senior professionals. Be accurate, insightful and authoritative. Every sentence should add real information. Do NOT use markdown formatting inside the JSON values — plain text only with no headers or bullets.`
}

export function buildTranslationPrompt(languageName: string, englishContent: Record<string, unknown>): string {
  const translatableKeys = ['history', 'founder', 'signature_products', 'creative_directors', 'brand_dna', 'market_position', 'current_strategy', 'careers']
  const subset: Record<string, unknown> = {}
  for (const key of translatableKeys) {
    if (englishContent[key]) subset[key] = englishContent[key]
  }

  return `Translate the following WikiLux brand profile into ${languageName}. Maintain the same editorial quality, authority, and depth. Do not summarize — translate fully. Adapt cultural references where appropriate but keep all facts, dates, and names accurate.

Return ONLY a valid JSON object (no markdown, no backticks) with the same keys: ${translatableKeys.join(', ')}.

Do NOT translate key_facts, key_executives, presence, stock, facts, founder_facts, hiring_intelligence, or tagline.

English content to translate:
${JSON.stringify(subset, null, 2)}`
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']

export const DEFAULT_SEED_BRANDS = [
  'Alexander McQueen', 'Aston Martin', 'Audemars Piguet', 'Balenciaga', 'Bentley',
  'Berluti', 'Bottega Veneta', 'Boucheron', 'Breitling', 'Brunello Cucinelli',
  'Bulgari', 'Burberry', 'Cartier', 'Celine', 'Chanel',
  'Chopard', 'Dior', 'Dolce Gabbana', 'Ermenegildo Zegna', 'Fendi',
  'Ferrari', 'Giorgio Armani', 'Givenchy', 'Goyard', 'Graff',
  'Gucci', 'Hermes', 'IWC Schaffhausen', 'Jaeger-LeCoultre', 'Lamborghini',
  'Loewe', 'Longines', 'Loro Piana', 'Louis Vuitton', 'Miu Miu',
  'Moncler', 'Montblanc', 'Moynat', 'Omega', 'Panerai',
  'Patek Philippe', 'Piaget', 'Porsche', 'Prada', 'Ralph Lauren',
  'Rimowa', 'Rolex', 'Rolls-Royce', 'Saint Laurent', 'Salvatore Ferragamo',
  'Tiffany Co', 'Tom Ford', 'Vacheron Constantin', 'Valentino', 'Van Cleef Arpels',
]
