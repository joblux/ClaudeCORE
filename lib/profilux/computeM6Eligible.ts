/**
 * computeM6Eligible — Matrix v1 §8.1, §8.2.
 *
 * Pure function. No DB. No async.
 * Boolean: are all six M6 groups satisfied?
 *
 * Distinct from m6_confirmed_at (§8.3): eligibility is computed on demand;
 * confirmation is a user action that sets the timestamp.
 */

import { computeM6Groups } from './_m6Groups'
import type { ProfiLuxResolved } from './types'

export function computeM6Eligible(view: ProfiLuxResolved): boolean {
  const g = computeM6Groups(view)
  return g.G1 && g.G2 && g.G3 && g.G4 && g.G5 && g.G6
}
