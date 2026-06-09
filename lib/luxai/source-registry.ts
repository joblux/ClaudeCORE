// ---------------------------------------------------------------------------
// LuxAI Acquisition — Source Registry (V1-B, declarative typed module only)
//
// Per docs/luxai/LUXAI_ACQUISITION_V1A_SPEC.md (§1 record shape, §2 categories +
// candidates, §4 query patterns, §5 cadence). Form decided by Mo+GPT: typed
// module — no DB table, no migration, no runner. This file DECLARES the
// acquisition map as typed data. NOTHING here runs.
//
// HARD SCOPE (V1-B): declarative types + seed registry + query-pattern consts.
//   - NO DB table, NO schema, NO migration.
//   - NO route, NO API, NO runner (= V1-C).
//   - NO Apify execution, NO Haiku call, NO triage, NO persistence, NO scheduler.
// The Discovery Runner (V1-C) will CONSUME this registry; it is not built here.
//
// Every value below is anchored to the V1-A spec candidates. No source is
// invented beyond the spec's named candidates.
// ---------------------------------------------------------------------------

// --- Types (spec §1) --------------------------------------------------------

export type SourceType =
  | 'parent_newsroom'
  | 'trade_press_open'
  | 'brand_official'
  | 'press_wire'
  | 'filing'
  | 'encyclopedic';

export type ExtractionPath = 'direct_html' | 'search' | 'pdf';

export type Access =
  | 'direct_open'
  | 'search_open'
  | 'snippet_first'
  | 'premium_or_blocked';

export type Trust = 'primary' | 'secondary' | 'tertiary';

export type Feed = 'signals' | 'brands' | 'market_reports' | 'events' | 'hiring';

export type Cadence = 'daily' | 'weekly' | 'manual' | 'quarterly';

export type SourceRecord = {
  name: string;
  type: SourceType;
  entry: string;
  extraction_path: ExtractionPath;
  access: Access;
  trust: Trust;
  feeds: Feed[];
  cadence: Cadence;
  notes?: string;
};

// --- Source registry (spec §2 candidates) -----------------------------------
// Acquisition map. Declarative seed only — the runner that reads it is V1-C.

export const SOURCE_REGISTRY: SourceRecord[] = [
  // parent_newsroom — group press rooms, probe-proven full extraction.
  {
    name: 'Richemont Newsroom',
    type: 'parent_newsroom',
    entry: 'richemont.com',
    extraction_path: 'direct_html',
    access: 'direct_open',
    trust: 'primary',
    feeds: ['signals', 'brands', 'events', 'hiring'],
    cadence: 'daily',
  },
  {
    name: 'LVMH Newsroom',
    type: 'parent_newsroom',
    entry: 'lvmh.com',
    extraction_path: 'direct_html',
    access: 'direct_open',
    trust: 'primary',
    feeds: ['signals', 'brands', 'events', 'hiring'],
    cadence: 'daily',
  },
  {
    name: 'Kering Newsroom',
    type: 'parent_newsroom',
    entry: 'kering.com',
    extraction_path: 'direct_html',
    access: 'direct_open',
    trust: 'primary',
    feeds: ['signals', 'brands', 'events', 'hiring'],
    cadence: 'daily',
  },
  {
    name: 'Four Seasons Newsroom',
    type: 'parent_newsroom',
    entry: 'fourseasons.com',
    extraction_path: 'direct_html',
    access: 'direct_open',
    trust: 'primary',
    feeds: ['signals', 'brands', 'events', 'hiring'],
    cadence: 'daily',
  },
  {
    name: 'Aman Newsroom',
    type: 'parent_newsroom',
    entry: 'aman.com',
    extraction_path: 'direct_html',
    access: 'direct_open',
    trust: 'primary',
    feeds: ['signals', 'brands', 'events', 'hiring'],
    cadence: 'daily',
  },
  {
    name: 'Rolex Newsroom',
    type: 'parent_newsroom',
    entry: 'rolex.com',
    extraction_path: 'direct_html',
    access: 'direct_open',
    trust: 'primary',
    feeds: ['signals', 'brands', 'events', 'hiring'],
    cadence: 'daily',
  },

  // trade_press_open — luxury/business press that returned open full text.
  {
    name: 'FashionNetwork',
    type: 'trade_press_open',
    entry: 'fashionnetwork.com',
    extraction_path: 'search',
    access: 'search_open',
    trust: 'secondary',
    feeds: ['signals', 'brands', 'market_reports', 'events', 'hiring'],
    cadence: 'daily',
  },
  {
    name: 'National Jeweler',
    type: 'trade_press_open',
    entry: 'nationaljeweler.com',
    extraction_path: 'search',
    access: 'search_open',
    trust: 'secondary',
    feeds: ['signals', 'brands', 'market_reports', 'events', 'hiring'],
    cadence: 'daily',
  },
  {
    name: 'Formes de Luxe',
    type: 'trade_press_open',
    entry: 'formes-de-luxe.com',
    extraction_path: 'search',
    access: 'search_open',
    trust: 'secondary',
    feeds: ['signals', 'brands', 'market_reports', 'events', 'hiring'],
    cadence: 'daily',
  },
  {
    name: 'Luxury Daily',
    type: 'trade_press_open',
    entry: 'luxurydaily.com',
    extraction_path: 'search',
    access: 'search_open',
    trust: 'secondary',
    feeds: ['signals', 'brands', 'market_reports', 'events', 'hiring'],
    cadence: 'daily',
  },
  {
    name: 'Heidrick & Struggles interviews',
    type: 'trade_press_open',
    entry: 'heidrick.com',
    extraction_path: 'search',
    access: 'search_open',
    trust: 'secondary',
    feeds: ['signals', 'brands', 'market_reports', 'events', 'hiring'],
    cadence: 'daily',
  },
  {
    name: 'Business of Fashion (BoF)',
    type: 'trade_press_open',
    entry: 'businessoffashion.com',
    extraction_path: 'search',
    access: 'snippet_first',
    trust: 'secondary',
    feeds: ['signals', 'brands', 'market_reports', 'events', 'hiring'],
    notes: 'opportunistic only, not a stable primary feed',
    cadence: 'daily',
  },
  {
    name: "Women's Wear Daily (WWD)",
    type: 'trade_press_open',
    entry: 'wwd.com',
    extraction_path: 'search',
    access: 'snippet_first',
    trust: 'secondary',
    feeds: ['signals', 'brands', 'market_reports', 'events', 'hiring'],
    notes: 'opportunistic only, not a stable primary feed',
    cadence: 'daily',
  },

  // brand_official — maison sites/newsrooms; brand-dependent, many walled.
  {
    name: 'Brand official sites',
    type: 'brand_official',
    entry: '{brand_domain}',
    extraction_path: 'direct_html',
    access: 'snippet_first',
    trust: 'tertiary',
    feeds: ['signals', 'brands', 'events'],
    cadence: 'weekly',
    notes: 'brand-dependent, many walled (Chanel 403, Baccarat 403)',
  },

  // press_wire — declared, not yet probed.
  {
    name: 'GlobeNewswire',
    type: 'press_wire',
    entry: 'globenewswire.com',
    extraction_path: 'search',
    access: 'search_open',
    trust: 'secondary',
    feeds: ['signals', 'market_reports'],
    cadence: 'weekly',
    notes: 'declared, not yet probed',
  },
  {
    name: 'PR Newswire',
    type: 'press_wire',
    entry: 'prnewswire.com',
    extraction_path: 'search',
    access: 'search_open',
    trust: 'secondary',
    feeds: ['signals', 'market_reports'],
    cadence: 'weekly',
    notes: 'declared, not yet probed',
  },

  // filing — SEC EDGAR / annual reports; PDF gap noted.
  {
    name: 'SEC EDGAR',
    type: 'filing',
    entry: 'sec.gov/edgar',
    extraction_path: 'pdf',
    access: 'premium_or_blocked',
    trust: 'primary',
    feeds: ['market_reports'],
    cadence: 'quarterly',
    notes: 'PDF not yet parseable — known gap',
  },
  {
    name: 'Annual reports',
    type: 'filing',
    entry: '{brand_domain}/investors',
    extraction_path: 'pdf',
    access: 'premium_or_blocked',
    trust: 'primary',
    feeds: ['market_reports'],
    cadence: 'quarterly',
    notes: 'PDF not yet parseable — known gap',
  },

  // encyclopedic — always-open backbone.
  {
    name: 'Wikipedia',
    type: 'encyclopedic',
    entry: 'wikipedia.org',
    extraction_path: 'direct_html',
    access: 'direct_open',
    trust: 'primary',
    feeds: ['brands'],
    cadence: 'manual',
    notes: 'always-open backbone',
  },
  {
    name: 'Wikidata',
    type: 'encyclopedic',
    entry: 'wikidata.org',
    extraction_path: 'direct_html',
    access: 'direct_open',
    trust: 'primary',
    feeds: ['brands'],
    cadence: 'manual',
    notes: 'always-open backbone',
  },

  // Snippet-only corroboration — recorded for corroboration, never a primary feed.
  {
    name: 'Reuters',
    type: 'trade_press_open',
    entry: 'reuters.com',
    extraction_path: 'search',
    access: 'snippet_first',
    trust: 'tertiary',
    feeds: ['signals', 'market_reports'],
    cadence: 'weekly',
    notes: 'corroboration only, never primary feed',
  },
  {
    name: 'Vogue Business',
    type: 'trade_press_open',
    entry: 'voguebusiness.com',
    extraction_path: 'search',
    access: 'snippet_first',
    trust: 'tertiary',
    feeds: ['signals', 'market_reports'],
    cadence: 'weekly',
    notes: 'corroboration only, never primary feed',
  },
  {
    name: 'Financial Times (FT)',
    type: 'trade_press_open',
    entry: 'ft.com',
    extraction_path: 'search',
    access: 'snippet_first',
    trust: 'tertiary',
    feeds: ['signals', 'market_reports'],
    cadence: 'weekly',
    notes: 'corroboration only, never primary feed',
  },
  {
    name: 'Bloomberg',
    type: 'trade_press_open',
    entry: 'bloomberg.com',
    extraction_path: 'search',
    access: 'snippet_first',
    trust: 'tertiary',
    feeds: ['signals', 'market_reports'],
    cadence: 'weekly',
    notes: 'corroboration only, never primary feed',
  },
];

// --- Query patterns (spec §4) -----------------------------------------------
// Declarative templates only. Not executed here — the V1-C runner fills the
// placeholders and dispatches them.

export const QUERY_PATTERN = '{brand} {year} {signal_intent}';

export const SIGNAL_INTENTS = {
  executive_moves: '{brand} {year} executive appointment OR CEO OR creative director',
  events_expansion: '{brand} {year} opening OR show OR event OR expansion',
  market_financial: '{brand} {year} results OR sales OR revenue',
};

// Newsroom-scoped variant for parent_newsroom / brand_official (spec §4).
export const NEWSROOM_SCOPED = 'site:{newsroom_domain} {brand} {signal_intent}';
