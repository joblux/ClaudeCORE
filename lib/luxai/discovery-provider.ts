// ---------------------------------------------------------------------------
// LuxAI Acquisition — Discovery Provider boundary (V1-C2)
//
// Neutral retrieval contract. A DiscoveryProvider takes a PlannedQuery (built by
// the runner from the V1-B registry) and returns a flat list of neutral hits.
// This file is provider-agnostic: ZERO vendor imports, ZERO secrets. Concrete
// providers under lib/luxai/providers/ implement this seam and are the ONLY
// place a vendor SDK / token may appear. The boundary only ever emits
// ProviderHit[] — no vendor type crosses it.
// ---------------------------------------------------------------------------

import type { PlannedQuery } from './discovery-runner';

// Neutral hit shape — the single currency that crosses the provider boundary.
export type ProviderHit = {
  title: string;
  url: string;
  date: string | null;
  snippet?: string;
};

export interface DiscoveryProvider {
  name: string;
  search(q: PlannedQuery): Promise<ProviderHit[]>;
}
