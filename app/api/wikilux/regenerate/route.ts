import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"
import { BRANDS, Brand } from "@/lib/wikilux-brands"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

function buildPrompt(brand: Brand) {
  return `You are a luxury industry encyclopedia editor writing for JOBLUX — the premier intelligence platform for luxury professionals. Write a comprehensive encyclopedia entry for ${brand.name}.

Return ONLY a valid JSON object with these exact fields (no markdown, no backticks, just pure JSON):

{
  "tagline": "one elegant sentence capturing the brand essence",
  "history": "4-5 paragraphs covering: founding story, founder background, key historical milestones, evolution of the brand, major turning points. Write with authority and depth like a luxury industry expert.",
  "founder": {
    "name": "founder full name",
    "birth": "birth year and place",
    "portrait": "2-3 sentences describing the founder's background, vision and personality",
    "legacy": "1-2 sentences on their lasting impact"
  },
  "iconic_products": [
    { "name": "product name", "year": "launch year", "description": "2-3 sentences on why this product is iconic and its cultural significance" },
    { "name": "product name", "year": "launch year", "description": "2-3 sentences" },
    { "name": "product name", "year": "launch year", "description": "2-3 sentences" }
  ],
  "brand_dna": "2 paragraphs on what makes this brand unique — its codes, values, aesthetic philosophy, what distinguishes it from competitors",
  "market_position": "2 paragraphs on where this brand sits in the luxury hierarchy, its pricing strategy, target clientele, competitive landscape",
  "current_strategy": "2 paragraphs on current business strategy, recent moves, digital approach, sustainability initiatives, key markets being developed",
  "hiring_intelligence": {
    "culture": "2 paragraphs on the brand's internal culture, values they hire for, what it's really like to work there based on industry knowledge",
    "profiles": "2 paragraphs on the typical candidate profiles they seek — backgrounds, qualities, experience, what gives candidates an edge",
    "process": "1 paragraph on their typical recruitment process and what to expect",
    "tips": ["tip 1 for candidates", "tip 2", "tip 3", "tip 4"]
  },
  "key_executives": [
    { "role": "CEO/President", "note": "brief note on leadership style or recent moves" }
  ],
  "presence": {
    "headquarters": "${brand.country}",
    "key_markets": ["market 1", "market 2", "market 3", "market 4"],
    "boutiques": "approximate number or description of retail presence"
  },
  "stock": {
    "listed": true or false,
    "exchange": "stock exchange name or null",
    "ticker": "ticker symbol or null",
    "parent_group": "${brand.group}"
  },
  "facts": ["interesting fact 1", "interesting fact 2", "interesting fact 3", "interesting fact 4", "interesting fact 5"]
}

Brand details: ${brand.name}, ${brand.sector} sector, founded ${brand.founded}, ${brand.country}, part of ${brand.group}.
Write with genuine expertise. This will be read by luxury industry executives and senior professionals. Be accurate, insightful and authoritative. Include the latest developments and news if relevant.`
}

async function regenerateBrand(brand: Brand): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete existing cache
    await supabase.from("wikilux_content").delete().eq("slug", brand.slug)

    // Generate with Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: buildPrompt(brand) }],
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
