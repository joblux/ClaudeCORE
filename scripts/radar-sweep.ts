// ---------------------------------------------------------------------------
// Radar Sweep — LuxAI Signals discovery cadence (ledger b5c3f03c)
//
// Wires the proven chain AS-IS, zero logic re-implementation:
//   runDiscovery (recent-first) -> triageDiscoveries (Haiku 4.5 single-call)
//   -> writeTriageToQueue (content_queue DRAFT rows, 30-day admission).
// Discovery-radar ONLY: no publish, no auto-approve, no synthesis — Mo review
// in the content-queue cockpit remains the gate.
//
// Run (Coolify Scheduled Task, env native):  npx tsx scripts/radar-sweep.ts
// Run (local): same — dotenv loads .env.local below (repo seed-script
// convention; node --env-file=.env.local also works, no new dependency).
//
// Reports to luxai_sweep_runs — reporting only, never a decision source.
// ---------------------------------------------------------------------------

import { config } from 'dotenv'
config({ path: '.env.local' }) // no-op when absent (Coolify: env is native)

import { createClient } from '@supabase/supabase-js'
import { SOURCE_REGISTRY, SIGNAL_INTENTS } from '../lib/luxai/source-registry'
import { runDiscovery } from '../lib/luxai/discovery-runner'
import { ApifyProvider } from '../lib/luxai/providers/apify-provider'
import { triageDiscoveries } from '../lib/luxai/triage'

// --- Operational cost-cap config per ledger b5c3f03c ------------------------
// Re-evaluate frequency / coverage / noise / cost / yield after 3-4 real
// sweeps. Hard V1 caps: max 5 brands per sweep, max 15 queries per brand.

const PILOT_BRANDS = ['Cartier', 'Rolex', 'Louis Vuitton', 'Gucci', 'Hermès']
const MAX_BRANDS = 5
const MAX_QUERIES_PER_BRAND = 15

// Source scoping 4+1 (Mo+GPT locked): 4 global editorial sources for every
// brand + 1 parent-newsroom slot IF that exact name exists in the registry.
// REUTERS GUARD: Reuters is approved for discovery/queue-only — it is NOT an
// auto-publishable source (registry: tertiary, corroboration only); Mo review
// in content_queue remains the gate.
const GLOBAL_SOURCES = [
  'Business of Fashion (BoF)',
  'FashionNetwork',
  'GlobeNewswire',
  'Reuters',
]

// Parent-newsroom slot per brand — EXACT registry names, resolved (not
// invented) against SOURCE_REGISTRY at startup. Hermès deliberately has no
// newsroom entry (ledger b5c3f03c) -> falls back to the 4 globals.
const PARENT_NEWSROOM: Record<string, string> = {
  Cartier: 'Richemont Newsroom',
  'Louis Vuitton': 'LVMH Newsroom',
  Gucci: 'Kering Newsroom',
  Rolex: 'Rolex Newsroom',
}

// -----------------------------------------------------------------------------

type SweepError = { brand: string; step: string; message: string }

const REQUIRED_ENV = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

async function main(): Promise<void> {
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      console.error(`[sweep] missing env var: ${key}`)
      process.exitCode = 1
      return
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const brands = PILOT_BRANDS.slice(0, MAX_BRANDS)

  // 1. OPEN — sweep report row (status 'running').
  const { data: run, error: openErr } = await supabase
    .from('luxai_sweep_runs')
    .insert({ status: 'running', brands })
    .select('id')
    .maybeSingle()
  if (openErr || !run) {
    console.error(`[sweep] cannot open sweep run: ${openErr?.message ?? 'no row returned'}`)
    process.exitCode = 1
    return
  }
  console.log(`[sweep] run ${run.id} opened — brands: ${brands.join(', ')}`)

  const errors: SweepError[] = []
  const totals = {
    discovered: 0,
    admitted: 0,
    skipped_stale: 0,
    skipped_undated: 0,
    skipped_existing: 0,
  }
  let succeeded = 0

  try {
    // Source mapping — resolve EXACT registry names; never invent.
    const registryNames = new Set(SOURCE_REGISTRY.map((s) => s.name))
    const unresolvedGlobals = GLOBAL_SOURCES.filter((n) => !registryNames.has(n))
    if (unresolvedGlobals.length > 0) {
      throw new Error(`global source(s) not in registry: ${unresolvedGlobals.join(', ')} — config drift, clean abort`)
    }

    const intentCount = Object.keys(SIGNAL_INTENTS).length
    const sourcesByBrand = new Map<string, string[]>()
    for (const brand of brands) {
      const newsroom = PARENT_NEWSROOM[brand]
      let sources = GLOBAL_SOURCES
      if (newsroom) {
        if (registryNames.has(newsroom)) {
          sources = [...GLOBAL_SOURCES, newsroom]
        } else {
          // Gap is reported, NOT added to the registry.
          console.log(`[sweep] ${brand}: newsroom "${newsroom}" not in registry — falling back to 4 globals`)
        }
      }
      const queries = sources.length * intentCount
      if (queries > MAX_QUERIES_PER_BRAND) {
        throw new Error(`${brand}: ${queries} queries exceeds hard cap ${MAX_QUERIES_PER_BRAND} — clean abort`)
      }
      sourcesByBrand.set(brand, sources)
    }

    // queue-writer builds its Supabase admin client at module scope — import
    // only now, after env is loaded (same reason the /tmp validation scripts
    // imported it dynamically).
    const { writeTriageToQueue } = await import('../lib/luxai/queue-writer')

    const provider = new ApifyProvider() // throws here if APIFY_TOKEN missing
    const year = new Date().getFullYear()

    // 2. PER-BRAND LOOP — failure isolation: an error is recorded and the
    // sweep CONTINUES with the next brand.
    for (const brand of brands) {
      const sources = sourcesByBrand.get(brand)!
      let step = 'discovery'
      try {
        const discoveries = await runDiscovery([brand], year, provider, { sources })
        totals.discovered += discoveries.length

        if (discoveries.length === 0) {
          console.log(`[sweep] ${brand}: 0 discovered (${sources.length} sources) — triage/queue skipped`)
          succeeded++
          continue
        }

        step = 'triage'
        const triage = await triageDiscoveries(brand, discoveries)

        step = 'queue_write'
        const report = await writeTriageToQueue(discoveries, triage)
        totals.admitted += report.inserted
        totals.skipped_stale += report.skipped_stale
        totals.skipped_undated += report.skipped_undated
        totals.skipped_existing += report.skipped_existing

        console.log(
          `[sweep] ${brand}: ${discoveries.length} discovered -> ${report.inserted} admitted ` +
          `(stale ${report.skipped_stale}, undated ${report.skipped_undated}, existing ${report.skipped_existing}) ` +
          `[${sources.length} sources]`
        )
        succeeded++
      } catch (e: any) {
        const message = e?.message ?? String(e)
        errors.push({ brand, step, message })
        console.log(`[sweep] ${brand}: FAILED at ${step} — ${message}`)
      }
    }
  } catch (e: any) {
    // Sweep-level abort (config drift, cap violation, provider construction).
    errors.push({ brand: '*', step: 'sweep', message: e?.message ?? String(e) })
    console.log(`[sweep] ABORT — ${e?.message ?? e}`)
  }

  // 3. CLOSE — completed (0 errors) / partial (>=1 brand error) / failed
  // (0 brands succeeded). Partial report is still written (clean abort rule).
  const status = errors.length === 0 ? 'completed' : succeeded === 0 ? 'failed' : 'partial'
  const { error: closeErr } = await supabase
    .from('luxai_sweep_runs')
    .update({
      finished_at: new Date().toISOString(),
      status,
      ...totals,
      errors,
    })
    .eq('id', run.id)
  if (closeErr) {
    console.error(`[sweep] cannot close sweep run ${run.id}: ${closeErr.message}`)
    process.exitCode = 1
    return
  }

  console.log('--- SWEEP CARD ---')
  console.log(JSON.stringify({ run_id: run.id, status, brands_succeeded: succeeded, ...totals, errors }, null, 2))

  process.exitCode = status === 'failed' ? 1 : 0
}

main().catch((e) => {
  console.error('[sweep] FATAL:', e?.message ?? e)
  process.exitCode = 1
})
