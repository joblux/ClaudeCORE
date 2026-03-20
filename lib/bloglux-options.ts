export const BLOGLUX_CATEGORIES = [
  { value: 'industry-news', label: 'Industry News', description: 'Breaking news from the luxury world' },
  { value: 'career-intelligence', label: 'Career Intelligence', description: 'Career advice, growth strategies, industry insights' },
  { value: 'maison-profiles', label: 'Maison Profiles', description: 'Deep dives into luxury brands and houses' },
  { value: 'salary-compensation', label: 'Salary & Compensation', description: 'Pay trends, benchmarks, negotiation' },
  { value: 'interview-insights', label: 'Interview Insights', description: 'Interview tips, processes, experiences' },
  { value: 'market-trends', label: 'Market Trends', description: 'Hiring trends, market analysis, forecasts' },
  { value: 'lifestyle-culture', label: 'Lifestyle & Culture', description: 'Luxury lifestyle, events, culture' },
  { value: 'joblux-view', label: 'The JOBLUX View', description: 'Editorial opinions, platform updates' },
] as const

export type BlogLuxCategory = typeof BLOGLUX_CATEGORIES[number]['value']

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  BLOGLUX_CATEGORIES.map(c => [c.value, c.label])
)

export function getCategoryLabel(value: string): string {
  return CATEGORY_LABELS[value] || value
}
