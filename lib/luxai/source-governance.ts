// ---------------------------------------------------------------------------
// WikiLux Engine — Source Governance Contract (SLICE A, declarative only)
//
// Per docs/WIKILUX_ENGINE_DESIGN_V2.md and the PROVENANCE DOCTRINE
// (docs/JOBLUX_STATE.md, locked 2026-06-05). This file DEFINES the rules that
// govern which source families may support which brand-page sections, and at
// what confidence. It is a CONTRACT, not an enforcer.
//
// HARD SCOPE (Slice A): declarative taxonomy + maps ONLY.
//   - NO fetch. Future families below are DECLARED, never fetched here.
//   - NO DB write, NO schema, NO persistence.
//   - NO generation, NO validation/enforcement code. Enforcement is a later slice.
// The engine route (app/api/admin/luxai/wikilux-build/route.ts) still derives the
// SAME 3 live families at runtime and is NOT modified by this artifact.
//
// Single .ts module (not JSON + loader): the contract is pure declarative data
// that benefits from `as const` literal types + a typed family taxonomy so tsc
// exhaustively validates the Section -> Families map at compile time. A JSON file
// would forfeit that and still need a hand-written loader + types.
// ---------------------------------------------------------------------------

// --- Source Family taxonomy -------------------------------------------------
// LIVE = a family the engine route already derives + fetches today.
// DECLARED = a family the contract recognises but the engine does NOT fetch yet
//            (future Discovery expansion; no runtime path exists for it now).

export type SourceFamily =
  // live (the 3 families wikilux-build derives today)
  | 'wikidata'
  | 'wikipedia'
  | 'official'
  // declared (future Discovery — NOT fetched in Slice A)
  | 'reuters'
  | 'bof'
  | 'wwd'
  | 'fashionnetwork'
  | 'luxury_daily'
  | 'vogue_business'
  | 'ft'
  | 'bloomberg'
  | 'annual_report'
  | 'exec_interview'
  | 'filing'

export type FamilyStatus = 'live' | 'declared'

// Trust ranking — how authoritative a family is as an origin for brand truth.
//   primary   = the entity itself or a regulated/audited disclosure about it
//   secondary = reputable trade/financial journalism reporting on the entity
//   tertiary  = crowd-sourced / aggregated encyclopedic reference
export type TrustRank = 'primary' | 'secondary' | 'tertiary'

// How a family is allowed to be USED when it is not a section's primary support.
//   context_only = may inform/round out a section, never the sole support
//   support      = may stand as support alongside the section's allowed families
//   none         = no special fallback role declared
export type FallbackUse = 'context_only' | 'support' | 'none'

export interface FamilyContract {
  family: SourceFamily
  status: FamilyStatus
  trust: TrustRank
  // human-readable origin label (provenance source_ref hint, not enforced here)
  label: string
  // how this family behaves when used as a fallback rather than primary support
  fallback_use: FallbackUse
}

export const SOURCE_FAMILIES: Record<SourceFamily, FamilyContract> = {
  // ---- LIVE (derived by wikilux-build today) -------------------------------
  wikidata: {
    family: 'wikidata',
    status: 'live',
    trust: 'tertiary',
    label: 'Wikidata (structured claims)',
    fallback_use: 'support',
  },
  wikipedia: {
    family: 'wikipedia',
    status: 'live',
    trust: 'tertiary',
    label: 'Wikipedia (en)',
    fallback_use: 'context_only',
  },
  official: {
    family: 'official',
    status: 'live',
    trust: 'primary',
    label: 'Official site (P856)',
    fallback_use: 'support',
  },
  // ---- DECLARED (future Discovery — NOT fetched in Slice A) -----------------
  reuters: {
    family: 'reuters',
    status: 'declared',
    trust: 'secondary',
    label: 'Reuters',
    fallback_use: 'support',
  },
  bof: {
    family: 'bof',
    status: 'declared',
    trust: 'secondary',
    label: 'The Business of Fashion',
    fallback_use: 'support',
  },
  wwd: {
    family: 'wwd',
    status: 'declared',
    trust: 'secondary',
    label: "Women's Wear Daily",
    fallback_use: 'support',
  },
  fashionnetwork: {
    family: 'fashionnetwork',
    status: 'declared',
    trust: 'secondary',
    label: 'FashionNetwork',
    fallback_use: 'support',
  },
  luxury_daily: {
    family: 'luxury_daily',
    status: 'declared',
    trust: 'secondary',
    label: 'Luxury Daily',
    fallback_use: 'support',
  },
  vogue_business: {
    family: 'vogue_business',
    status: 'declared',
    trust: 'secondary',
    label: 'Vogue Business',
    fallback_use: 'support',
  },
  ft: {
    family: 'ft',
    status: 'declared',
    trust: 'secondary',
    label: 'Financial Times',
    fallback_use: 'support',
  },
  bloomberg: {
    family: 'bloomberg',
    status: 'declared',
    trust: 'secondary',
    label: 'Bloomberg',
    fallback_use: 'support',
  },
  annual_report: {
    family: 'annual_report',
    status: 'declared',
    trust: 'primary',
    label: 'Annual report',
    fallback_use: 'support',
  },
  exec_interview: {
    family: 'exec_interview',
    status: 'declared',
    trust: 'primary',
    label: 'Executive interview (sourced)',
    fallback_use: 'support',
  },
  filing: {
    family: 'filing',
    status: 'declared',
    trust: 'primary',
    label: 'Regulatory filing',
    fallback_use: 'support',
  },
}

export const LIVE_FAMILIES: SourceFamily[] = (
  Object.values(SOURCE_FAMILIES) as FamilyContract[]
)
  .filter(f => f.status === 'live')
  .map(f => f.family)

// --- Section confidence model (DECLARATIVE labels only) ---------------------
// These describe how strongly a section is EXPECTED to be supported. They are
// labels the later enforcement slice will read; nothing computes them here.
//   primary_support      = needs a primary-trust source to stand
//   multi_source_support = stronger when corroborated across families
//   fallback_only        = only fillable from a fallback/context family
//   context_only         = colour/round-out, never load-bearing on its own
//   unsupported          = no family may currently support this section
export type SectionConfidence =
  | 'primary_support'
  | 'multi_source_support'
  | 'fallback_only'
  | 'context_only'
  | 'unsupported'

// The 16 BRAND-PAGE-V1 sections — identical set + order to SECTION_KEYS in
// app/api/admin/luxai/wikilux-build/route.ts (lines 118-135). Kept in sync by
// hand; the route is the source of truth for the schema shape.
export type SectionKey =
  | 'tagline'
  | 'brand_dna'
  | 'history'
  | 'founder_name'
  | 'founder'
  | 'founder_facts'
  | 'key_facts'
  | 'key_executives'
  | 'creative_directors'
  | 'careers'
  | 'hiring_intelligence'
  | 'quote'
  | 'market_position'
  | 'presence'
  | 'facts'
  | 'stock'

export interface SectionFallbackRule {
  family: SourceFamily
  fallback_use: FallbackUse
}

export interface SectionRule {
  section: SectionKey
  // families permitted to support this section (ordered by preference)
  allowed_families: SourceFamily[]
  confidence: SectionConfidence
  // when true, a primary-trust family is REQUIRED — no tertiary/crowd-sourced
  // family may be the sole support (e.g. named real people, financials, quotes).
  primary_only: boolean
  // declared fallback families + how they may be used for THIS section
  fallback: SectionFallbackRule[]
}

// Section -> Allowed Families map. ALL 16 sections present.
// Live families (wikidata/wikipedia/official) appear wherever they can
// legitimately support a section today; declared families are listed where they
// WILL be allowed once Discovery fetches them (declaration, not activation).
export const SECTION_GOVERNANCE: Record<SectionKey, SectionRule> = {
  tagline: {
    section: 'tagline',
    allowed_families: ['official', 'wikipedia', 'bof', 'vogue_business'],
    confidence: 'primary_support',
    primary_only: false,
    fallback: [{ family: 'wikipedia', fallback_use: 'context_only' }],
  },
  brand_dna: {
    section: 'brand_dna',
    allowed_families: ['official', 'bof', 'wwd', 'vogue_business', 'wikipedia'],
    confidence: 'multi_source_support',
    primary_only: false,
    fallback: [{ family: 'wikipedia', fallback_use: 'context_only' }],
  },
  history: {
    section: 'history',
    allowed_families: ['wikidata', 'wikipedia', 'official', 'annual_report'],
    confidence: 'multi_source_support',
    primary_only: false,
    fallback: [{ family: 'wikipedia', fallback_use: 'support' }],
  },
  founder_name: {
    section: 'founder_name',
    allowed_families: ['wikidata', 'wikipedia', 'official'],
    confidence: 'primary_support',
    primary_only: false,
    fallback: [{ family: 'wikipedia', fallback_use: 'support' }],
  },
  founder: {
    section: 'founder',
    allowed_families: ['wikipedia', 'official', 'exec_interview'],
    confidence: 'multi_source_support',
    primary_only: false,
    fallback: [{ family: 'wikipedia', fallback_use: 'support' }],
  },
  founder_facts: {
    section: 'founder_facts',
    allowed_families: ['wikidata', 'wikipedia', 'official'],
    confidence: 'multi_source_support',
    primary_only: false,
    fallback: [{ family: 'wikipedia', fallback_use: 'context_only' }],
  },
  key_facts: {
    section: 'key_facts',
    allowed_families: ['wikidata', 'official', 'filing', 'annual_report'],
    confidence: 'primary_support',
    primary_only: false,
    fallback: [{ family: 'wikipedia', fallback_use: 'context_only' }],
  },
  key_executives: {
    section: 'key_executives',
    allowed_families: [
      'official',
      'annual_report',
      'filing',
      'exec_interview',
      'reuters',
      'bloomberg',
    ],
    confidence: 'primary_support',
    primary_only: true,
    fallback: [{ family: 'wikipedia', fallback_use: 'context_only' }],
  },
  creative_directors: {
    section: 'creative_directors',
    allowed_families: ['official', 'wwd', 'bof', 'vogue_business', 'wikipedia'],
    confidence: 'multi_source_support',
    primary_only: false,
    fallback: [{ family: 'wikipedia', fallback_use: 'context_only' }],
  },
  careers: {
    section: 'careers',
    allowed_families: ['official'],
    confidence: 'primary_support',
    primary_only: false,
    fallback: [],
  },
  hiring_intelligence: {
    section: 'hiring_intelligence',
    allowed_families: ['official', 'exec_interview', 'bof'],
    confidence: 'multi_source_support',
    primary_only: false,
    fallback: [],
  },
  quote: {
    section: 'quote',
    allowed_families: [
      'exec_interview',
      'official',
      'reuters',
      'ft',
      'bloomberg',
      'bof',
      'wwd',
    ],
    confidence: 'primary_support',
    primary_only: true,
    fallback: [],
  },
  market_position: {
    section: 'market_position',
    allowed_families: [
      'bof',
      'wwd',
      'vogue_business',
      'ft',
      'bloomberg',
      'reuters',
      'annual_report',
    ],
    confidence: 'multi_source_support',
    primary_only: false,
    fallback: [{ family: 'wikipedia', fallback_use: 'context_only' }],
  },
  presence: {
    section: 'presence',
    allowed_families: ['official', 'wikidata', 'annual_report', 'filing'],
    confidence: 'multi_source_support',
    primary_only: false,
    fallback: [{ family: 'wikipedia', fallback_use: 'context_only' }],
  },
  facts: {
    section: 'facts',
    allowed_families: ['wikipedia', 'wikidata', 'official'],
    confidence: 'multi_source_support',
    primary_only: false,
    fallback: [{ family: 'wikipedia', fallback_use: 'context_only' }],
  },
  stock: {
    section: 'stock',
    allowed_families: [
      'filing',
      'annual_report',
      'bloomberg',
      'ft',
      'reuters',
      'wikidata',
    ],
    confidence: 'primary_support',
    primary_only: true,
    fallback: [{ family: 'wikidata', fallback_use: 'context_only' }],
  },
}

// --- Primary-only sections (convenience view) -------------------------------
// Sections where a primary-trust family is REQUIRED (no crowd-sourced sole
// support). Named real people, verbatim quotes, and financials.
export const PRIMARY_ONLY_SECTIONS: SectionKey[] = (
  Object.values(SECTION_GOVERNANCE) as SectionRule[]
)
  .filter(r => r.primary_only)
  .map(r => r.section)

// --- Blocked sources --------------------------------------------------------
// Families that must NEVER be admitted to the corpus, regardless of section.
// Empty today — the field exists so the enforcement slice has a contract hook.
export const BLOCKED_SOURCES: SourceFamily[] = []

// --- COLD RETAG -------------------------------------------------------------
// Classify the 3 families the engine ALREADY derives against this contract.
// Tagging / metadata ONLY — derived from SOURCE_FAMILIES above. No runtime path
// reads this yet; it records how each live family sits inside the governance
// model so a later slice can attach provenance tags without re-deriving them.
export interface ColdRetag {
  family: SourceFamily
  trust: TrustRank
  status: FamilyStatus
  fallback_use: FallbackUse
  // sections this live family is currently permitted to support
  supports_sections: SectionKey[]
  // sections where it may only round out context, never stand alone
  context_only_in: SectionKey[]
  note: string
}

function retag(family: SourceFamily, note: string): ColdRetag {
  const contract = SOURCE_FAMILIES[family]
  const supports: SectionKey[] = []
  const contextOnly: SectionKey[] = []
  for (const rule of Object.values(SECTION_GOVERNANCE) as SectionRule[]) {
    if (rule.allowed_families.includes(family)) supports.push(rule.section)
    const fb = rule.fallback.find(f => f.family === family)
    if (fb && fb.fallback_use === 'context_only') contextOnly.push(rule.section)
  }
  return {
    family,
    trust: contract.trust,
    status: contract.status,
    fallback_use: contract.fallback_use,
    supports_sections: supports,
    context_only_in: contextOnly,
    note,
  }
}

export const COLD_RETAG: Record<'wikidata' | 'wikipedia' | 'official', ColdRetag> = {
  wikidata: retag(
    'wikidata',
    'Structured claims (P-properties). Tertiary trust, but authoritative for ' +
      'structured facts (founding date, HQ, exchange/ticker, parent). Eligible ' +
      'support — never sole support for a primary_only section.',
  ),
  wikipedia: retag(
    'wikipedia',
    'Crowd-sourced encyclopedia. Tertiary trust, context_only fallback: may ' +
      'round out narrative sections but is never load-bearing for named people, ' +
      'verbatim quotes, or financials.',
  ),
  official: retag(
    'official',
    'Brand-owned site resolved via Wikidata P856. Primary trust — the entity ' +
      'speaking about itself. Strongest live support for tagline, brand_dna, ' +
      'careers, hiring_intelligence and presence.',
  ),
}
