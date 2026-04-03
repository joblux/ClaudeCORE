import { notFound, redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { BRANDS } from '@/lib/wikilux-brands'
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
  const brand = BRANDS.find((b) => b.slug === params.slug)
  if (!brand || !VALID_LANGS.includes(params.lang)) return {}

  const baseUrl = 'https://joblux.com'
  const langName = LANG_NAMES[params.lang] || params.lang

  const alternates: Record<string, string> = { en: `${baseUrl}/wikilux/${params.slug}` }
  for (const code of VALID_LANGS) {
    alternates[code] = `${baseUrl}/wikilux/${params.slug}/${code}`
  }

  return {
    title: `${brand.name} | WikiLux | JOBLUX`,
    description: `${brand.name} luxury career intelligence in ${langName} | history, careers, salary insights, interview tips.`,
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

  // Find brand
  const brand = BRANDS.find((b) => b.slug === slug)
  if (!brand) notFound()

  // Fetch content + translations from Supabase
  const supabase = getSupabase()
  const { data: row } = await supabase
    .from('wikilux_content')
    .select('content, translations')
    .eq('slug', slug)
    .maybeSingle()

  if (!row?.content) {
    redirect(`/wikilux/${slug}`)
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
    } catch {
      // Fall back to English if translation fails
      redirect(`/wikilux/${slug}`)
    }
  }

  // Merge: translated text sections over English base (keeps key_facts, stock, etc.)
  const mergedContent = { ...englishContent, ...translatedContent }

  return (
    <TranslatedBrandPage
      brand={brand}
      content={mergedContent}
      lang={lang}
      slug={slug}
    />
  )
}
