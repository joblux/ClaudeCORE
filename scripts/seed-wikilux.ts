import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { BRANDS } from '../lib/wikilux-brands'
import { buildRichPrompt } from '../lib/wikilux-prompt'

// Verify env
const required = ['ANTHROPIC_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
for (const key of required) {
  if (!process.env[key]) { console.error(`Missing env var: ${key}`); process.exit(1) }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

async function main() {
  console.log('WikiLux Brand Seeding')
  console.log('=====================')
  console.log(`Total brands in registry: ${BRANDS.length}`)

  // Find already-cached brands
  const { data: existing } = await supabase.from('wikilux_content').select('slug')
  const cachedSlugs = new Set((existing || []).map((r) => r.slug))
  const uncached = BRANDS.filter((b) => !cachedSlugs.has(b.slug))

  console.log(`Already cached: ${cachedSlugs.size}`)
  console.log(`To generate: ${uncached.length}`)
  console.log('')

  if (uncached.length === 0) {
    console.log('All brands already cached!')
    return
  }

  let success = 0
  const failed: string[] = []

  // Process in batches of 3
  for (let i = 0; i < uncached.length; i += 3) {
    const batch = uncached.slice(i, i + 3)

    await Promise.all(batch.map(async (brand, batchIdx) => {
      const idx = i + batchIdx + 1
      const label = `[${idx}/${uncached.length}]`
      try {
        process.stdout.write(`${label} Generating: ${brand.name}... `)

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 6000,
          messages: [{ role: 'user', content: buildRichPrompt(brand) }],
        })

        const text = message.content[0].type === 'text' ? message.content[0].text : ''
        const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
        const content = JSON.parse(cleaned)

        const { error } = await supabase
          .from('wikilux_content')
          .upsert({ slug: brand.slug, brand_name: brand.name, content, updated_at: new Date().toISOString() }, { onConflict: 'slug' })

        if (error) throw new Error(error.message)

        console.log('saved')
        success++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.log(`FAILED: ${msg}`)
        failed.push(brand.name)
      }
    }))

    // Delay between batches
    if (i + 3 < uncached.length) {
      await new Promise((r) => setTimeout(r, 3000))
    }
  }

  console.log('')
  console.log('WikiLux Seeding Complete')
  console.log('========================')
  console.log(`${success} generated, ${failed.length} failed`)
  if (failed.length > 0) {
    console.log(`Failed brands: ${failed.join(', ')}`)
  }
}

main().catch((err) => { console.error('Fatal error:', err); process.exit(1) })
