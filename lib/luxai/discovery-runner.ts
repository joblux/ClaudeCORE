// ---------------------------------------------------------------------------
// LuxAI Acquisition — Discovery Runner (V1-C1, inert dry-run only)
//
// Per docs/luxai/LUXAI_ACQUISITION_V1A_SPEC.md §3 (runner rules), §4 (query
// patterns), §6 (output contract). Consumes the V1-B Source Registry, builds the
// planned queries a future read-only runner WOULD send, and returns normalized
// Discovery objects in DRY-RUN / MOCK mode. NOTHING here calls the network.
//
// Future flow (fixed, Mo+GPT): Sources -> Discovery -> Review Queue -> Mo Review
// -> Publish. This slice builds only the Discovery step, inert.
//
// HARD SCOPE (V1-C1):
//   - NO Apify call, NO fetch, NO network of any kind. DRY-RUN only.
//   - NO AI, NO Haiku, NO triage, NO importance/relevance scoring.
//     (confidence = the registry source's trust, carried mechanically.)
//   - NO persistence, NO DB, NO queue, NO route, NO scheduler.
// ---------------------------------------------------------------------------

import {
  SOURCE_REGISTRY,
  QUERY_PATTERN,
  SIGNAL_INTENTS,
  NEWSROOM_SCOPED,
  type SourceType,
  type Trust,
  type Cadence,
  type Access,
} from './source-registry';
import type { DiscoveryProvider } from './discovery-provider';

// --- Types ------------------------------------------------------------------

export type SignalIntent = keyof typeof SIGNAL_INTENTS;

export type PlannedQuery = {
  brand: string;
  source: string;
  source_type: SourceType;
  query: string;
  signal_intent: SignalIntent;
  cadence: Cadence;
};

// Normalized Discovery (spec §6 output contract, narrowed to V1-C1 fields).
// confidence carries the registry source's trust mechanically — NOT an AI score.
// category = the signal_intent that produced the query.
// reason   = which registry entry + intent produced this candidate.
export type Discovery = {
  brand: string;
  source: string;
  title: string;
  url: string;
  date: string | null;
  category: SignalIntent;
  confidence: Trust;
  reason: string;
  // access carried mechanically from the registry source (proof-run learning b:
  // premium/walled is a flag the triage step reads, not a runner-side failure).
  access?: Access;
};

// --- Helpers ----------------------------------------------------------------

// Source types whose query gets the newsroom-scoped variant (spec §4).
const NEWSROOM_SCOPED_TYPES: SourceType[] = ['parent_newsroom', 'brand_official'];

// The SIGNAL_INTENTS values embed the '{brand} {year} ' prefix; the abstract
// QUERY_PATTERN / NEWSROOM_SCOPED substitute {signal_intent} with only the
// intent fragment. Strip the prefix so substitution stays mechanical and
// produces exactly the spec §4 strings.
function intentFragment(intent: SignalIntent): string {
  return SIGNAL_INTENTS[intent].replace('{brand} {year} ', '');
}

// --- buildQueries -----------------------------------------------------------
// Pure. For each brand x eligible registry source x signal_intent, build one
// query string. No network, no side effects.
export function buildQueries(brands: string[], year: number): PlannedQuery[] {
  const intents = Object.keys(SIGNAL_INTENTS) as SignalIntent[];

  // DISCOVERY-SOURCE FILTER: only sources that can serve a discovery feed
  // (signals / events / market_reports). Brands-only backbone sources
  // (Wikipedia/Wikidata) exist for enrichment, not discovery acquisition.
  const eligible = SOURCE_REGISTRY.filter((s) =>
    s.feeds.some(
      (f) => f === 'signals' || f === 'events' || f === 'market_reports',
    ),
  );

  const planned: PlannedQuery[] = [];

  for (const brand of brands) {
    for (const source of eligible) {
      for (const intent of intents) {
        const fragment = intentFragment(intent);
        const query = NEWSROOM_SCOPED_TYPES.includes(source.type)
          ? NEWSROOM_SCOPED.replace('{newsroom_domain}', source.entry)
              .replace('{brand}', brand)
              .replace('{signal_intent}', fragment)
          : QUERY_PATTERN.replace('{brand}', brand)
              .replace('{year}', String(year))
              .replace('{signal_intent}', fragment);

        planned.push({
          brand,
          source: source.name,
          source_type: source.type,
          query,
          signal_intent: intent,
          cadence: source.cadence,
        });
      }
    }
  }

  return planned;
}

// --- runDiscoveryDryRun -----------------------------------------------------
// Pure, deterministic. Maps each PlannedQuery to a MOCK Discovery object,
// proving the Discovery contract shape end-to-end without Apify. No network.
export function runDiscoveryDryRun(brands: string[], year: number): Discovery[] {
  const planned = buildQueries(brands, year);
  const trustBySource = new Map(SOURCE_REGISTRY.map((s) => [s.name, s.trust]));

  return planned.map((p) => ({
    brand: p.brand,
    source: p.source,
    title: `[dry-run] ${p.brand} ${p.signal_intent}`,
    url: `https://dry-run.local/${p.source}`,
    date: null,
    category: p.signal_intent,
    confidence: trustBySource.get(p.source) as Trust,
    reason: `registry:${p.source} intent:${p.signal_intent}`,
  }));
}

// --- Mechanical validation helpers (zero AI) --------------------------------

// Social platforms are noise on brand queries (proof-run learning a). Hosts and
// any subdomain thereof are dropped before mapping.
const SOCIAL_NOISE_HOSTS = [
  'instagram.com',
  'facebook.com',
  'tiktok.com',
  'pinterest.com',
  'youtube.com',
  'x.com',
  'twitter.com',
];

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isSocialNoise(host: string): boolean {
  return SOCIAL_NOISE_HOSTS.some((h) => host === h || host.endsWith('.' + h));
}

// Freshness on the RESULT's own date (proof-run learning c), not the query
// {year}. null or unparseable date = KEPT — the triage step decides, not here.
function isFresh(date: string | null, freshnessDays: number, now: number): boolean {
  if (date === null) return true;
  const t = Date.parse(date);
  if (Number.isNaN(t)) return true;
  return now - t <= freshnessDays * 24 * 60 * 60 * 1000;
}

// Dedup key: lowercase host, drop trailing slash, strip utm_* params, drop hash.
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hostname = u.hostname.toLowerCase();
    for (const k of [...u.searchParams.keys()]) {
      if (k.toLowerCase().startsWith('utm_')) u.searchParams.delete(k);
    }
    let path = u.pathname;
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    const qs = u.searchParams.toString();
    return `${u.protocol}//${u.host}${path}${qs ? '?' + qs : ''}`;
  } catch {
    return url;
  }
}

// --- runDiscovery -----------------------------------------------------------
// LIVE retrieval against an injected provider. buildQueries() (shared with the
// dry-run) -> provider.search() per query, SEQUENTIAL (Apify FREE = no parallel
// run, learning e). Mechanical validation (social-noise -> freshness -> dedup),
// then maps survivors to Discovery with the SAME rules as the dry-run plus the
// registry access flag. NO DB write, NO route, NO Apify import in this file.
export async function runDiscovery(
  brands: string[],
  year: number,
  provider: DiscoveryProvider,
  opts?: { freshnessDays?: number },
): Promise<Discovery[]> {
  const freshnessDays = opts?.freshnessDays ?? 90;
  const now = Date.now();
  const planned = buildQueries(brands, year);
  const sourceByName = new Map(SOURCE_REGISTRY.map((s) => [s.name, s]));

  const seen = new Set<string>();
  const discoveries: Discovery[] = [];

  // SEQUENTIAL — await each query before the next; no parallel Apify runs.
  for (const p of planned) {
    const hits = await provider.search(p);
    const src = sourceByName.get(p.source)!;

    for (const hit of hits) {
      const host = hostnameOf(hit.url);
      if (host === null) continue; // unparseable URL — drop
      if (isSocialNoise(host)) continue; // (a) social-noise filter
      if (!isFresh(hit.date, freshnessDays, now)) continue; // (b) freshness on result date

      const key = normalizeUrl(hit.url); // (c) dedup by normalized URL
      if (seen.has(key)) continue;
      seen.add(key);

      discoveries.push({
        brand: p.brand,
        source: p.source,
        title: hit.title,
        url: hit.url,
        date: hit.date,
        category: p.signal_intent,
        confidence: src.trust,
        reason: `registry:${p.source} intent:${p.signal_intent} provider:${provider.name}`,
        access: src.access,
      });
    }
  }

  return discoveries;
}
