// ---------------------------------------------------------------------------
// LuxAI Acquisition — Apify Discovery Provider (V1-C2, premier provider)
//
// The ONLY file in the repo that imports apify-client and reads APIFY_TOKEN.
// Implements the neutral DiscoveryProvider seam: one PlannedQuery -> one Apify
// run -> ProviderHit[]. No Apify type leaves this file; the boundary emits only
// ProviderHit[]. Sequential by construction — each search() is a single run, and
// the runner awaits them one at a time (Apify FREE = 8192MB cap, no parallel
// batch, proof-run learning e).
//
// Error policy:
//   - Token absent  -> throw at CONSTRUCTION (fail fast, not mid-run).
//   - Per-query error/timeout -> return [] for that query, NEVER throw the run.
// ---------------------------------------------------------------------------

import { ApifyClient } from 'apify-client';
import type { DiscoveryProvider, ProviderHit } from '../discovery-provider';
import type { PlannedQuery } from '../discovery-runner';

// Apify actor used as the detection sensor: Google search + full-browser scrape.
const ACTOR_ID = 'apify/rag-web-browser';
const MAX_RESULTS_PER_QUERY = 3;

export class ApifyProvider implements DiscoveryProvider {
  readonly name = 'apify';
  private readonly client: ApifyClient;

  constructor() {
    const token = process.env.APIFY_TOKEN;
    if (!token) {
      // Fail at construction, never in the middle of a run.
      throw new Error(
        'ApifyProvider: APIFY_TOKEN is not set — cannot construct the Apify provider.',
      );
    }
    this.client = new ApifyClient({ token });
  }

  async search(q: PlannedQuery): Promise<ProviderHit[]> {
    try {
      const run = await this.client.actor(ACTOR_ID).call({
        query: q.query,
        maxResults: MAX_RESULTS_PER_QUERY,
        outputFormats: ['markdown'],
      });

      const { items } = await this.client
        .dataset(run.defaultDatasetId)
        .listItems();

      return items
        .map(mapHit)
        .filter((h): h is ProviderHit => h !== null);
    } catch {
      // One query failing (error/timeout/walled) must not sink the whole run.
      return [];
    }
  }
}

// --- Single-URL scrape (633d6f8c Slice B2 read ladder, rung 2) ---------------
// Runs rag-web-browser on ONE url (query=url, maxResults 1) and returns the
// scraped markdown text, or null on ANY error (token absent, run failure,
// empty/non-text result). Sequential single run — same FREE-plan constraint
// as search(). CONFINEMENT: apify-client/APIFY_TOKEN stay inside this file;
// callers receive plain text only.
export async function scrapeUrl(url: string): Promise<string | null> {
  try {
    const token = process.env.APIFY_TOKEN;
    if (!token) return null;
    const client = new ApifyClient({ token });

    const run = await client.actor(ACTOR_ID).call({
      query: url,
      maxResults: 1,
      outputFormats: ['markdown'],
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    const it = (items[0] ?? {}) as Record<string, any>;
    const md: unknown = it.markdown ?? it.text;
    return typeof md === 'string' && md.length > 0 ? md : null;
  } catch {
    return null;
  }
}

// --- Internal mapping (vendor shape -> neutral ProviderHit) -----------------
// Typed loosely on purpose: the Apify dataset item shape stays INSIDE this file.

function mapHit(item: unknown): ProviderHit | null {
  const it = (item ?? {}) as Record<string, any>;
  const sr = (it.searchResult ?? {}) as Record<string, any>;
  const md = (it.metadata ?? {}) as Record<string, any>;

  const url: unknown = sr.url ?? md.url ?? it.url;
  if (typeof url !== 'string' || url.length === 0) return null;

  const title: unknown = sr.title ?? md.title;
  const snippetRaw: unknown = sr.description ?? md.description;

  return {
    title: typeof title === 'string' ? title : '',
    url,
    date: extractDate(md),
    snippet: typeof snippetRaw === 'string' && snippetRaw.length > 0 ? snippetRaw : undefined,
  };
}

// Best-effort RESULT date (proof-run learning c — freshness uses the result's
// own date, never the query {year}). Absent/empty -> null (runner keeps nulls).
function extractDate(md: Record<string, any>): string | null {
  const raw: unknown = md.publishedTime ?? md.datePublished ?? md.date ?? md.loadedTime;
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}
