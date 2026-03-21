import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"
import { BRANDS, Brand } from "@/lib/wikilux-brands"
import { buildRichPrompt } from "@/lib/wikilux-prompt"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

async function regenerateBrand(brand: Brand): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete existing cache
    await supabase.from("wikilux_content").delete().eq("slug", brand.slug)

    // Generate with Claude using the rich prompt
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000,
      messages: [{ role: "user", content: buildRichPrompt(brand) }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""

    let content
    try {
      content = JSON.parse(text)
    } catch {
      content = { error: "Failed to parse", raw: text }
    }

    // Upsert into wikilux_content with tracking
    const now = new Date().toISOString()
    await supabase.from("wikilux_content").upsert({
      slug: brand.slug,
      brand_name: brand.name,
      content,
      generated_at: now,
      updated_at: now,
      last_regenerated_at: now,
    })

    return { success: true }
  } catch (err: any) {
    return { success: false, error: `${brand.slug}: ${err.message}` }
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { slug, all } = body

  if (!slug && !all) {
    return NextResponse.json(
      { error: "Provide either { slug } or { all: true }" },
      { status: 400 }
    )
  }

  let regenerated = 0
  const errors: string[] = []

  if (all) {
    // Process all brands in batches of 5
    const batchSize = 5
    for (let i = 0; i < BRANDS.length; i += batchSize) {
      const batch = BRANDS.slice(i, i + batchSize)
      const results = await Promise.all(batch.map((brand) => regenerateBrand(brand)))

      for (const result of results) {
        if (result.success) {
          regenerated++
        } else if (result.error) {
          errors.push(result.error)
        }
      }

      // Small delay between batches to avoid rate limits
      if (i + batchSize < BRANDS.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  } else {
    const brand = BRANDS.find((b) => b.slug === slug)
    if (!brand) {
      return NextResponse.json({ error: `Brand not found: ${slug}` }, { status: 404 })
    }

    const result = await regenerateBrand(brand)
    if (result.success) {
      regenerated++
    } else if (result.error) {
      errors.push(result.error)
    }
  }

  return NextResponse.json({ regenerated, errors })
}
