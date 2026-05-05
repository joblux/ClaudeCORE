/**
 * lib/profilux/vocabulary.ts
 *
 * Canonical ProfiLux vocabulary contract (Phase 4.A sub-phase 2).
 *
 * Source of truth for the rebuilt 11-screen ProfiLux editor and any future
 * surface that needs ProfiLux option lists. Authoritative ahead of legacy
 * lib/profile-options.ts and lib/assignment-options.ts; consumer migration
 * happens in later sub-phases (4.A → 4.E per STATE).
 *
 * Rules:
 * - DB columns are free-text / text[] with no CHECK constraints; values are
 *   enforced in code only. See PROFILUX_MATRIX_V1 §4.5 + §7.6.
 * - Lowercase snake_case values. Polished American-English labels.
 * - "Intern" and "members" are JOBLUX kill words; forbidden anywhere.
 * - Lowest seniority is `entry_level`.
 *
 * Do not migrate consumers in this sub-phase. Do not re-export from legacy
 * option files. Temporary duplication is accepted; hidden coupling is not.
 */

// -------------------------------------------------------------------------
// 1. Seniority — 9 levels (locked, STATE)
// -------------------------------------------------------------------------
export const PROFILUX_SENIORITY_OPTIONS = [
  { value: 'entry_level',     label: 'Entry Level' },
  { value: 'coordinator',     label: 'Coordinator' },
  { value: 'specialist',      label: 'Specialist' },
  { value: 'manager',         label: 'Manager' },
  { value: 'senior_manager',  label: 'Senior Manager' },
  { value: 'director',        label: 'Director' },
  { value: 'senior_director', label: 'Senior Director' },
  { value: 'vice_president',  label: 'Vice President' },
  { value: 'c_suite',         label: 'C-Suite' },
] as const

// -------------------------------------------------------------------------
// 2. Sectors — 8 (locked, STATE §18)
// -------------------------------------------------------------------------
export const PROFILUX_SECTOR_OPTIONS = [
  { value: 'fashion',      label: 'Fashion' },
  { value: 'jewelry',      label: 'Jewelry' },
  { value: 'watches',      label: 'Watches' },
  { value: 'beauty',       label: 'Beauty' },
  { value: 'hospitality',  label: 'Hospitality' },
  { value: 'automotive',   label: 'Automotive' },
  { value: 'spirits_wine', label: 'Spirits & Wine' },
  { value: 'art_culture',  label: 'Art & Culture' },
] as const

// -------------------------------------------------------------------------
// 3. Subsectors — 35
// Each subsector belongs to exactly one sector (sector field provided
// for editor cascading; consumers may ignore).
// -------------------------------------------------------------------------
export const PROFILUX_SUBSECTOR_OPTIONS = [
  // Fashion (7)
  { value: 'ready_to_wear',     label: 'Ready-to-Wear',     sector: 'fashion' },
  { value: 'leather_goods',     label: 'Leather Goods',     sector: 'fashion' },
  { value: 'footwear',          label: 'Footwear',          sector: 'fashion' },
  { value: 'accessories',       label: 'Accessories',       sector: 'fashion' },
  { value: 'eyewear',           label: 'Eyewear',           sector: 'fashion' },
  { value: 'lingerie',          label: 'Lingerie',          sector: 'fashion' },
  { value: 'athleisure',        label: 'Athleisure',        sector: 'fashion' },
  // Jewelry (2)
  { value: 'fine_jewelry',      label: 'Fine Jewelry',      sector: 'jewelry' },
  { value: 'high_jewelry',      label: 'High Jewelry',      sector: 'jewelry' },
  // Watches (2)
  { value: 'haute_horlogerie',  label: 'Haute Horlogerie',  sector: 'watches' },
  { value: 'fine_watchmaking',  label: 'Fine Watchmaking',  sector: 'watches' },
  // Beauty (5)
  { value: 'skincare',          label: 'Skincare',          sector: 'beauty' },
  { value: 'fragrance',         label: 'Fragrance',         sector: 'beauty' },
  { value: 'makeup',            label: 'Makeup',            sector: 'beauty' },
  { value: 'haircare',          label: 'Haircare',          sector: 'beauty' },
  { value: 'wellness',          label: 'Wellness',          sector: 'beauty' },
  // Hospitality (6)
  { value: 'hotels',            label: 'Hotels',            sector: 'hospitality' },
  { value: 'resorts',           label: 'Resorts',           sector: 'hospitality' },
  { value: 'fine_dining',       label: 'Fine Dining',       sector: 'hospitality' },
  { value: 'private_clubs',     label: 'Private Clubs',     sector: 'hospitality' },
  { value: 'cruises',           label: 'Cruises',           sector: 'hospitality' },
  { value: 'spas',              label: 'Spas',              sector: 'hospitality' },
  // Automotive (5)
  { value: 'luxury_cars',       label: 'Luxury Cars',       sector: 'automotive' },
  { value: 'sports_cars',       label: 'Sports Cars',       sector: 'automotive' },
  { value: 'hypercars',         label: 'Hypercars',         sector: 'automotive' },
  { value: 'yachts',            label: 'Yachts',            sector: 'automotive' },
  { value: 'private_aviation',  label: 'Private Aviation',  sector: 'automotive' },
  // Spirits & Wine (5)
  { value: 'champagne',         label: 'Champagne',         sector: 'spirits_wine' },
  { value: 'wine',              label: 'Wine',              sector: 'spirits_wine' },
  { value: 'whisky',            label: 'Whisky',            sector: 'spirits_wine' },
  { value: 'cognac',            label: 'Cognac',            sector: 'spirits_wine' },
  { value: 'spirits',           label: 'Spirits',           sector: 'spirits_wine' },
  // Art & Culture (3)
  { value: 'auction_houses',    label: 'Auction Houses',    sector: 'art_culture' },
  { value: 'galleries',         label: 'Galleries',         sector: 'art_culture' },
  { value: 'art_advisory',      label: 'Art Advisory',      sector: 'art_culture' },
] as const

// -------------------------------------------------------------------------
// 4. Specializations — 28
// -------------------------------------------------------------------------
export const PROFILUX_SPECIALIZATION_OPTIONS = [
  { value: 'retail_management',       label: 'Retail Management' },
  { value: 'store_management',        label: 'Store Management' },
  { value: 'clienteling',             label: 'Clienteling' },
  { value: 'vip_relations',           label: 'VIP Relations' },
  { value: 'personal_shopping',       label: 'Personal Shopping' },
  { value: 'visual_merchandising',    label: 'Visual Merchandising' },
  { value: 'store_design',            label: 'Store Design' },
  { value: 'brand_management',        label: 'Brand Management' },
  { value: 'marketing_communications', label: 'Marketing & Communications' },
  { value: 'public_relations',        label: 'Public Relations' },
  { value: 'digital_marketing',       label: 'Digital Marketing' },
  { value: 'ecommerce',               label: 'E-Commerce' },
  { value: 'crm',                     label: 'CRM' },
  { value: 'social_media',            label: 'Social Media' },
  { value: 'buying_merchandising',    label: 'Buying & Merchandising' },
  { value: 'supply_chain',            label: 'Supply Chain' },
  { value: 'product_development',     label: 'Product Development' },
  { value: 'design',                  label: 'Design' },
  { value: 'craftsmanship_atelier',   label: 'Craftsmanship & Atelier' },
  { value: 'quality_control',         label: 'Quality Control' },
  { value: 'training_development',    label: 'Training & Development' },
  { value: 'talent_acquisition',      label: 'Talent Acquisition' },
  { value: 'finance_controlling',     label: 'Finance & Controlling' },
  { value: 'legal_compliance',        label: 'Legal & Compliance' },
  { value: 'real_estate_expansion',   label: 'Real Estate & Expansion' },
  { value: 'wholesale_distribution',  label: 'Wholesale & Distribution' },
  { value: 'press_relations',         label: 'Press Relations' },
  { value: 'after_sales_service',     label: 'After-Sales Service' },
] as const

// -------------------------------------------------------------------------
// 5. Departments — 20
// -------------------------------------------------------------------------
export const PROFILUX_DEPARTMENT_OPTIONS = [
  { value: 'retail',                label: 'Retail' },
  { value: 'wholesale',             label: 'Wholesale' },
  { value: 'marketing',             label: 'Marketing' },
  { value: 'communications',        label: 'Communications' },
  { value: 'digital',               label: 'Digital' },
  { value: 'ecommerce',             label: 'E-Commerce' },
  { value: 'merchandising',         label: 'Merchandising' },
  { value: 'buying',                label: 'Buying' },
  { value: 'design',                label: 'Design' },
  { value: 'product_development',   label: 'Product Development' },
  { value: 'supply_chain',          label: 'Supply Chain' },
  { value: 'operations',            label: 'Operations' },
  { value: 'finance',               label: 'Finance' },
  { value: 'legal',                 label: 'Legal' },
  { value: 'human_resources',       label: 'Human Resources' },
  { value: 'training',              label: 'Training' },
  { value: 'real_estate',           label: 'Real Estate' },
  { value: 'business_development',  label: 'Business Development' },
  { value: 'client_services',       label: 'Client Services' },
  { value: 'executive_leadership',  label: 'Executive Leadership' },
] as const

// -------------------------------------------------------------------------
// 6. Contract types — 6 (locked, GPT)
// -------------------------------------------------------------------------
export const PROFILUX_CONTRACT_TYPE_OPTIONS = [
  { value: 'permanent',  label: 'Permanent' },
  { value: 'fixed_term', label: 'Fixed Term' },
  { value: 'freelance',  label: 'Freelance' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'temporary',  label: 'Temporary' },
  { value: 'part_time',  label: 'Part Time' },
] as const

// -------------------------------------------------------------------------
// 7. Product categories — 16
// -------------------------------------------------------------------------
export const PROFILUX_PRODUCT_CATEGORY_OPTIONS = [
  { value: 'ready_to_wear',           label: 'Ready-to-Wear' },
  { value: 'leather_goods',           label: 'Leather Goods' },
  { value: 'handbags',                label: 'Handbags' },
  { value: 'footwear',                label: 'Footwear' },
  { value: 'accessories',             label: 'Accessories' },
  { value: 'fine_jewelry',            label: 'Fine Jewelry' },
  { value: 'high_jewelry',            label: 'High Jewelry' },
  { value: 'watches',                 label: 'Watches' },
  { value: 'fragrance',               label: 'Fragrance' },
  { value: 'skincare',                label: 'Skincare' },
  { value: 'makeup',                  label: 'Makeup' },
  { value: 'eyewear',                 label: 'Eyewear' },
  { value: 'home_lifestyle',          label: 'Home & Lifestyle' },
  { value: 'wines_spirits',           label: 'Wines & Spirits' },
  { value: 'hospitality_experiences', label: 'Hospitality Experiences' },
  { value: 'art_collectibles',        label: 'Art & Collectibles' },
] as const

// -------------------------------------------------------------------------
// 8. Expertise tags — 12
// -------------------------------------------------------------------------
export const PROFILUX_EXPERTISE_TAG_OPTIONS = [
  { value: 'vic_program_management',    label: 'VIC Program Management' },
  { value: 'brand_storytelling',        label: 'Brand Storytelling' },
  { value: 'event_activation',          label: 'Event Activation' },
  { value: 'omnichannel',               label: 'Omnichannel' },
  { value: 'high_value_sales',          label: 'High-Value Sales' },
  { value: 'team_leadership',           label: 'Team Leadership' },
  { value: 'store_opening',             label: 'Store Opening' },
  { value: 'market_development',        label: 'Market Development' },
  { value: 'luxury_hospitality',        label: 'Luxury Hospitality' },
  { value: 'bespoke_made_to_measure',   label: 'Bespoke & Made-to-Measure' },
  { value: 'craftsmanship_storytelling', label: 'Craftsmanship Storytelling' },
  { value: 'archive_heritage',          label: 'Archive & Heritage' },
] as const

// -------------------------------------------------------------------------
// 9. Currency — 9 (ISO 4217 codes)
// -------------------------------------------------------------------------
export const PROFILUX_CURRENCY_OPTIONS = [
  'EUR',
  'USD',
  'GBP',
  'CHF',
  'AED',
  'HKD',
  'SGD',
  'JPY',
  'CNY',
] as const

// -------------------------------------------------------------------------
// 10. Locations — 15 (Europe → North America → Middle East → Asia-Pacific)
// -------------------------------------------------------------------------
export const PROFILUX_LOCATION_OPTIONS = [
  'Paris',
  'London',
  'Milan',
  'Geneva',
  'Zurich',
  'New York',
  'Los Angeles',
  'Miami',
  'Dubai',
  'Riyadh',
  'Hong Kong',
  'Singapore',
  'Tokyo',
  'Shanghai',
  'Seoul',
] as const

// -------------------------------------------------------------------------
// Type unions (derived)
// -------------------------------------------------------------------------
export type ProfiLuxSeniority        = typeof PROFILUX_SENIORITY_OPTIONS[number]['value']
export type ProfiLuxSector           = typeof PROFILUX_SECTOR_OPTIONS[number]['value']
export type ProfiLuxSubsector        = typeof PROFILUX_SUBSECTOR_OPTIONS[number]['value']
export type ProfiLuxSpecialization   = typeof PROFILUX_SPECIALIZATION_OPTIONS[number]['value']
export type ProfiLuxDepartment       = typeof PROFILUX_DEPARTMENT_OPTIONS[number]['value']
export type ProfiLuxContractType     = typeof PROFILUX_CONTRACT_TYPE_OPTIONS[number]['value']
export type ProfiLuxProductCategory  = typeof PROFILUX_PRODUCT_CATEGORY_OPTIONS[number]['value']
export type ProfiLuxExpertiseTag     = typeof PROFILUX_EXPERTISE_TAG_OPTIONS[number]['value']
export type ProfiLuxCurrency         = (typeof PROFILUX_CURRENCY_OPTIONS)[number]
export type ProfiLuxLocation         = (typeof PROFILUX_LOCATION_OPTIONS)[number]

// -------------------------------------------------------------------------
// Grouped object (single import for editor screens)
// -------------------------------------------------------------------------
export const PROFILUX_VOCABULARY = {
  seniority:          PROFILUX_SENIORITY_OPTIONS,
  sectors:            PROFILUX_SECTOR_OPTIONS,
  subsectors:         PROFILUX_SUBSECTOR_OPTIONS,
  specializations:    PROFILUX_SPECIALIZATION_OPTIONS,
  departments:        PROFILUX_DEPARTMENT_OPTIONS,
  contract_types:     PROFILUX_CONTRACT_TYPE_OPTIONS,
  product_categories: PROFILUX_PRODUCT_CATEGORY_OPTIONS,
  expertise_tags:     PROFILUX_EXPERTISE_TAG_OPTIONS,
  currency:           PROFILUX_CURRENCY_OPTIONS,
  location:           PROFILUX_LOCATION_OPTIONS,
} as const
