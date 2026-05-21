import {
  PROFILUX_SENIORITY_OPTIONS,
  PROFILUX_SKILL_OPTIONS,
  PROFILUX_DEPARTMENT_OPTIONS,
  PROFILUX_CONTRACT_TYPE_OPTIONS,
  PROFILUX_SECTOR_OPTIONS,
  PROFILUX_PRODUCT_CATEGORY_OPTIONS,
  PROFILUX_EXPERTISE_TAG_OPTIONS,
} from '@/lib/profilux/vocabulary'

export type ProfiLuxAvailability = 'active' | 'open' | 'passive' | 'unavailable' | null

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

export function availabilityLabel(value: ProfiLuxAvailability): string | null {
  switch (value) {
    case 'active': return 'Actively looking'
    case 'open': return 'Quietly considering'
    case 'passive': return 'Passively exploring'
    case 'unavailable': return 'Not available'
    default: return null
  }
}
