/**
 * Maps sector names to their SVG file paths.
 * 12 luxury sectors used in registration + WikiLux.
 */

// Full 12-sector map (registration / dashboard)
export const SECTOR_ICONS: Record<string, string> = {
  'Fashion & leather goods': '/images/sectors/fashion.svg',
  'Watches & jewellery': '/images/sectors/watches.svg',
  'Perfumes & cosmetics': '/images/sectors/perfumes.svg',
  'Wines & spirits': '/images/sectors/spirits.svg',
  'Hospitality & travel': '/images/sectors/hospitality.svg',
  'Automotive': '/images/sectors/automotive.svg',
  'Aviation & yachting': '/images/sectors/aviation.svg',
  'Real estate': '/images/sectors/realestate.svg',
  'Design': '/images/sectors/design.svg',
  'Art & auction houses': '/images/sectors/art.svg',
  'Media & publishing': '/images/sectors/media.svg',
  'Technology for luxury': '/images/sectors/technology.svg',
}

// 8-category map for WikiLux (uses slightly different naming)
export const WIKILUX_CATEGORY_ICONS: Record<string, string> = {
  'Fashion': '/images/sectors/fashion.svg',
  'Watches & Jewellery': '/images/sectors/watches.svg',
  'Automotive': '/images/sectors/automotive.svg',
  'Hospitality': '/images/sectors/hospitality.svg',
  'Beauty & Fragrance': '/images/sectors/perfumes.svg',
  'Spirits & Dining': '/images/sectors/spirits.svg',
  'Aviation & Yachting': '/images/sectors/aviation.svg',
  'Art & Culture': '/images/sectors/art.svg',
}

// Unsplash search terms for each WikiLux category
export const WIKILUX_CATEGORY_SEARCH: Record<string, string> = {
  'Fashion': 'luxury fashion runway',
  'Watches & Jewellery': 'luxury watches jewellery',
  'Automotive': 'luxury cars automotive',
  'Hospitality': 'luxury hotel resort',
  'Beauty & Fragrance': 'luxury perfume beauty',
  'Spirits & Dining': 'luxury wine spirits',
  'Aviation & Yachting': 'luxury yacht aviation',
  'Art & Culture': 'art gallery auction',
}

export function getSectorIcon(sector: string): string | null {
  return SECTOR_ICONS[sector] || WIKILUX_CATEGORY_ICONS[sector] || null
}
