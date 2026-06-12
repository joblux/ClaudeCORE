// Shared brand slugifier — diacritics-safe (NFD strip), unlike the naive
// toLowerCase().replace() pattern it replaces (which turned "Hermès" into
// "herm-s" because è is not in [a-z0-9]).
export function slugifyBrand(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80)
    .replace(/-+$/g, '')
}
