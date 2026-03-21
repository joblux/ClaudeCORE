import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { BRANDS } from '../lib/wikilux-brands'
import { buildTranslationPrompt, SUPPORTED_LANGUAGES } from '../lib/wikilux-prompt'

// Verify env
const required = ['ANTHROPIC_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
for (const key of required) {
  if (!process.env[key]) { console.error(`Missing env var: ${key}`); process.exit(1) }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const TARGET_LANGS = SUPPORTED_LANGUAGES.filter((l) => l.code !== 'en')

async function main() {
  console.log('WikiLux Translation Seeding')
  console.log('===========================')
  console.log(`Brands: ${BRANDS.length} | Languages: ${TARGET_LANGS.length} | Total: ${BRANDS.length * TARGET_LANGS.length}`)
  console.log('')

  // Fetch all content with translations
  const { data: allContent } = await supabase
    .from('wikilux_content')
    .select('slug, content, translations')

  const contentMap = new Map(
    (allContent || []).map((r) => [r.slug, { content: r.content, translations: r.translations || {} }])
  )

  // Build list of missing translations
  const tasks: { slug: string; brandName: string; langCode: string; langName: string }[] = []
  for (const brand of BRANDS) {
    const row = contentMap.get(brand.slug)
    if (!row?.content) continue // No English content — skip

    for (const lang of TARGET_LANGS) {
      const existing = row.translations as Record<string, unknown>
      if (existing?.[lang.code]) continue // Already translated
      tasks.push({ slug: brand.slug, brandName: brand.name, langCode: lang.code, langName: lang.name })
    }
  }

  console.log(`Translations needed: ${tasks.length}`)
  console.log(`Already cached: ${BRANDS.length * TARGET_LANGS.length - tasks.length}`)
  console.log('')

  if (tasks.length === 0) {
    console.log('All translations already cached!')
    return
  }

  let success = 0
  const failed: string[] = []

  // Process in batches of 3
  for (let i = 0; i < tasks.length; i += 3) {
    const batch = tasks.slice(i, i + 3)

    await Promise.all(batch.map(async (task, batchIdx) => {
      const idx = i + batchIdx + 1
      const label = `[${idx}/${tasks.length}]`
      try {
        process.stdout.write(`${label} ${task.brandName} → ${task.langCode.toUpperCase()}... `)

        const row = contentMap.get(task.slug)!
        const englishContent = row.content as Record<string, unknown>

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 5000,
          messages: [{ role: 'user', content: buildTranslationPrompt(task.langName, englishContent) }],
        })

        const text = message.content[0].type === 'text' ? message.content[0].text : ''
        const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
        const translation = JSON.parse(cleaned)

        // Update translations in Supabase
        const currentTranslations = (row.translations || {}) as Record<string, unknown>
        currentTranslations[task.langCode] = translation
        row.translations = currentTranslations

        const { error } = await supabase
          .from('wikilux_content')
          .update({ translations: currentTranslations })
          .eq('slug', task.slug)

        if (error) throw new Error(error.message)

        console.log('saved')
        success++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.log(`FAILED: ${msg}`)
        failed.push(`${task.brandName}/${task.langCode}`)
      }
    }))

    if (i + 3 < tasks.length) {
      await new Promise((r) => setTimeout(r, 3000))
    }
  }

  console.log('')
  console.log('Translation Seeding Complete')
  console.log('============================')
  console.log(`${success} translated, ${failed.length} failed`)
  if (failed.length > 0) {
    console.log(`Failed: ${failed.slice(0, 20).join(', ')}${failed.length > 20 ? ` (+${failed.length - 20} more)` : ''}`)
  }
}

main().catch((err) => { console.error('Fatal error:', err); process.exit(1) })
