/**
 * computeProfileCompleteness — Matrix v1 §4.4 + §10.
 *
 * Pure function. No DB. No async.
 * Returns 0..100 based on six M6 groups, binary scoring per Mo decision C3.
 *
 * Weights (locked C2): 17 / 17 / 17 / 16 / 17 / 16 = 100.
 *
 * Replaces legacy app/api/members/profile/route.ts calculateProfileCompleteness
 * (incompatible per C1: counted dormant relational tables, read raw rows
 * instead of resolved view, disagreed with M6 on what matters). Legacy route
 * refactor scheduled separately (C5).
 *
 * Coupling: identical group predicates as computeM6Eligible via shared
 * _m6Groups module. Single source of truth — no drift.
 */

import { computeM6Groups } from './_m6Groups'
import type { ProfiLuxResolved } from './types'

export function computeProfileCompleteness(view: ProfiLuxResolved): number {
  const g = computeM6Groups(view)
  let score = 0
  if (g.G1) score += 17
  if (g.G2) score += 17
  if (g.G3) score += 17
  if (g.G4) score += 16
  if (g.G5) score += 17
  if (g.G6) score += 16
  return score
}
