import {
  PROFILUX_SENIORITY_OPTIONS,
  PROFILUX_SKILL_OPTIONS,
  PROFILUX_DEPARTMENT_OPTIONS,
  PROFILUX_CONTRACT_TYPE_OPTIONS,
  PROFILUX_SECTOR_OPTIONS,
  PROFILUX_PRODUCT_CATEGORY_OPTIONS,
  PROFILUX_EXPERTISE_TAG_OPTIONS,
} from '@/lib/profilux/vocabulary'

export type ProfiLuxAvailability =
  | 'not_specified'
  | 'actively_looking'
  | 'quietly_considering'
  | 'passively_exploring'
  | 'not_available'
  | null

export function seniorityLabel(value: string | null): string | null {
  if (!value) return null
  return PROFILUX_SENIORITY_OPTIONS.find(o => o.value === value)?.label ?? value
}

export function skillLabel(value: string): string {
  return PROFILUX_SKILL_OPTIONS.find(o => o.value === value)?.label ?? value
}

export function departmentLabel(value: string): string {
  return PROFILUX_DEPARTMENT_OPTIONS.find(o => o.value === value)?.label ?? value
}

export function contractTypeLabel(value: string): string {
  return PROFILUX_CONTRACT_TYPE_OPTIONS.find(o => o.value === value)?.label ?? value
}

export function sectorLabel(value: string): string {
  return PROFILUX_SECTOR_OPTIONS.find(o => o.value === value)?.label ?? value
}

export function productCategoryLabel(value: string): string {
  return PROFILUX_PRODUCT_CATEGORY_OPTIONS.find(o => o.value === value)?.label ?? value
}

export function expertiseTagLabel(value: string): string {
  return PROFILUX_EXPERTISE_TAG_OPTIONS.find(o => o.value === value)?.label ?? value
}

export function availabilityLabel(value: string | null | undefined): string | null {
  switch (value) {
    // Canonical
    case 'not_specified':       return '— Not specified —'
    case 'actively_looking':    return 'Actively looking'
    case 'quietly_considering': return 'Quietly considering'
    case 'passively_exploring': return 'Passively exploring'
    case 'not_available':       return 'Not available'
    // LEGACY — remove after DB migration (prompt #2)
    case 'not_actively_looking': return '— Not specified —'
    case 'unavailable':          return 'Not available'
    case 'active':               return 'Actively looking'
    case 'open':                 return '— Not specified —'
    case 'passive':              return 'Passively exploring'
    default:                     return null
  }
}
