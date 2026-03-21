import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"
import { BRANDS, Brand } from "@/lib/wikilux-brands"
import { buildRichPrompt } from "@/lib/wikilux-prompt"

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const RICH_CONTENT_KEYS = ["history", "founder", "signature_products", "creative_directors", "brand_dna", "careers"]

function hasRichContent(content: Record<string, unknown> | null): boolean {
  if (!content) return false
  return RICH_CONTENT_KEYS.every((key) => {
    const val = content[key]
    return typeof val === "string" && val.length > 50
  })
}

async function generateBrand(brand: Brand): Promise<{ success: boolean; error?: string }> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000,
      messages: [{ role: "user", content: buildRichPrompt(brand) }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    let content
    try {
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim()
      content = JSON.parse(cleaned)
    } catch {
      console.error(`[wikilux/seed] JSON parse error for ${brand.slug}`)
      return { success: false, error: `${brand.slug}: Failed to parse AI response` }
    }

    const now = new Date().toISOString()
    const { data: upsertData, error: upsertError } = await supabase
      .from("wikilux_content")
      .upsert(
        { slug: brand.slug, brand_name: brand.name, content, updated_at: now },
        { onConflict: "slug" }
      )
      .select("slug")

    if (upsertError) {
      console.error(`[wikilux/seed] UPSERT FAILED for ${brand.slug}:`, JSON.stringify(upsertError))
      return { success: false, error: `${brand.slug}: ${upsertError.message}` }
    }
    console.log(`[wikilux/seed] UPSERT SUCCESS for ${brand.slug}:`, JSON.stringify(upsertData))

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: `${brand.slug}: ${message}` }
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if ((session?.user as Record<string, unknown>)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get optional params: offset and limit for resumable seeding
  const body = await req.json().catch(() => ({}))
  const offset = body.offset || 0
  const limit = body.limit || BRANDS.length

  // Check which brands already have rich content
  const { data: existing } = await supabase
    .from("wikilux_content")
    .select("slug, content")

  const richSlugs = new Set(
    (existing || [])
      .filter((row) => hasRichContent(row.content as Record<string, unknown>))
      .map((row) => row.slug)
  )

  const brandsToSeed = BRANDS
    .filter((b) => !richSlugs.has(b.slug))
    .slice(offset, offset + limit)

  const totalBrands = BRANDS.length
  const alreadySeeded = richSlugs.size
  let newlyGenerated = 0
  const errors: string[] = []

  // Process in batches of 3 with 2s delay
  const batchSize = 3
  for (let i = 0; i < brandsToSeed.length; i += batchSize) {
    const batch = brandsToSeed.slice(i, i + batchSize)
    const results = await Promise.all(batch.map((brand) => generateBrand(brand)))

    for (const result of results) {
      if (result.success) {
        newlyGenerated++
      } else if (result.error) {
        errors.push(result.error)
      }
    }

    // Delay between batches
    if (i + batchSize < brandsToSeed.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  return NextResponse.json({
    total_brands: totalBrands,
    already_seeded: alreadySeeded,
    newly_generated: newlyGenerated,
    remaining: totalBrands - alreadySeeded - newlyGenerated,
    errors,
  })
}
