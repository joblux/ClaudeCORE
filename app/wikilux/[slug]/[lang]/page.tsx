import { notFound, redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { SUPPORTED_LANGUAGES, buildTranslationPrompt } from '@/lib/wikilux-prompt'
import Anthropic from '@anthropic-ai/sdk'
import { TranslatedBrandPage } from './TranslatedBrandPage'

export const revalidate = 3600 // Cache for 1 hour

const VALID_LANGS: string[] = SUPPORTED_LANGUAGES.filter((l) => l.code !== 'en').map((l) => l.code)
const LANG_NAMES: Record<string, string> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.code, l.name])
)

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function generateMetadata({ params }: { params: { slug: string; lang: string } }) {
  if (!VALID_LANGS.includes(params.lang)) return {}

  const supabase = getSupabase()
  const { data: brand } = await supabase
    .from('wikilux_content')
    .select('brand_name')
    .eq('slug', params.slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (!brand) return {}

  const baseUrl = 'https://joblux.com'
  const langName = LANG_NAMES[params.lang] || params.lang

  const alternates: Record<string, string> = { en: `${baseUrl}/wikilux/${params.slug}` }
  for (const code of VALID_LANGS) {
    alternates[code] = `${baseUrl}/wikilux/${params.slug}/${code}`
  }

  return {
    title: `${brand.brand_name} | WikiLux | JOBLUX`,
    description: `${brand.brand_name} luxury career intelligence in ${langName} | history, careers, salary insights, interview tips.`,
    alternates: {
      canonical: `${baseUrl}/wikilux/${params.slug}/${params.lang}`,
      languages: alternates,
    },
  }
}

export default async function TranslatedBrandPageRoute({
  params,
}: {
  params: { slug: string; lang: string }
}) {
  const { slug, lang } = params

  // Validate language
  if (!VALID_LANGS.includes(lang)) {
    redirect(`/wikilux/${slug}`)
  }

  const supabase = getSupabase()

  // Fetch brand metadata + content + translations
  const { data: row } = await supabase
    .from('wikilux_content')
    .select('brand_name, sector, country, founded, group_name, headquarters, known_for, content, translations')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (!row || !row.content) {
    redirect(`/wikilux/${slug}`)
  }

  // Map DB row to shape expected by TranslatedBrandPage
  const brand = {
    slug,
    name: row.brand_name,
    sector: row.sector || '',
    country: row.country || '',
    founded: row.founded || 0,
    group_name: row.group_name || '',
    known_for: row.known_for || '',
  }

  const englishContent = row.content as Record<string, unknown>
  let translations = (row.translations || {}) as Record<string, Record<string, unknown>>
  let translatedContent = translations[lang]

  // If translation doesn't exist, generate it on-demand
  if (!translatedContent) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.WIKILUX_API_KEY! })
      const langName = LANG_NAMES[lang] || lang

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 5000,
        messages: [{ role: 'user', content: buildTranslationPrompt(langName, englishContent) }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      translatedContent = JSON.parse(cleaned)

      // Save translation to Supabase
      translations = { ...translations, [lang]: translatedContent }
      await supabase
        .from('wikilux_content')
        .update({ translations })
        .eq('slug', slug)
        .is('deleted_at', null)
    } catch {
      // Fall back to English if translation fails
      redirect(`/wikilux/${slug}`)
    }
  }

  // Merge: translated text sections over English base (keeps key_facts, stock, etc.)
  const mergedContent = { ...englishContent, ...translatedContent }

  // Related brands: same sector, different slug, published only
  const { data: relatedRows } = await supabase
    .from('wikilux_content')
    .select('slug, brand_name, sector, country, founded')
    .eq('sector', row.sector)
    .neq('slug', slug)
    .eq('is_published', true)
    .is('deleted_at', null)
    .limit(10)

  const related = (relatedRows || [])
    .map(r => ({
      slug: r.slug,
      name: r.brand_name,
      sector: r.sector || '',
      country: r.country || '',
      founded: r.founded || 0,
    }))
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)

  return (
    <TranslatedBrandPage
      brand={brand}
      content={mergedContent}
      lang={lang}
      slug={slug}
      related={related}
    />
  )
}
