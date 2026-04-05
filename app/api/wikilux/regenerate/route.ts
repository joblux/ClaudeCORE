import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"
import { buildRichPrompt, type BrandInput } from "@/lib/wikilux-prompt"

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.WIKILUX_API_KEY!,
})

async function regenerateBrand(brand: BrandInput): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase.from("wikilux_content").delete().eq("slug", brand.slug)

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
      content = { error: "Failed to parse" }
    }

    const now = new Date().toISOString()
    const { error: upsertError } = await supabase
      .from("wikilux_content")
      .upsert(
        { slug: brand.slug, brand_name: brand.name, content, updated_at: now, last_regenerated_at: now },
        { onConflict: "slug" }
      )
      .select("slug")

    if (upsertError) {
      return { success: false, error: `${brand.slug}: ${upsertError.message}` }
    }

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: `${brand.slug}: ${msg}` }
  }
}

function dbRowToBrandInput(row: any): BrandInput {
  return {
    slug: row.slug,
    name: row.brand_name,
    sector: row.sector || null,
    country: row.country || null,
    founded: row.founded || null,
    group_name: row.group_name || null,
    headquarters: row.headquarters || null,
    known_for: row.known_for || null,
    description: row.description || null,
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
    const { data: allBrands } = await supabase
      .from("wikilux_content")
      .select("slug, brand_name, sector, country, founded, group_name, headquarters, known_for, description")
      .is("deleted_at", null)
      .order("brand_name")

    const brands = (allBrands || []).map(dbRowToBrandInput)

    const batchSize = 5
    for (let i = 0; i < brands.length; i += batchSize) {
      const batch = brands.slice(i, i + batchSize)
      const results = await Promise.all(batch.map((brand) => regenerateBrand(brand)))

      for (const result of results) {
        if (result.success) {
          regenerated++
        } else if (result.error) {
          errors.push(result.error)
        }
      }

      if (i + batchSize < brands.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  } else {
    const { data: row } = await supabase
      .from("wikilux_content")
      .select("slug, brand_name, sector, country, founded, group_name, headquarters, known_for, description")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle()

    if (!row) {
      return NextResponse.json({ error: `Brand not found: ${slug}` }, { status: 404 })
    }

    const result = await regenerateBrand(dbRowToBrandInput(row))
    if (result.success) {
      regenerated++
    } else if (result.error) {
      errors.push(result.error)
    }
  }

  return NextResponse.json({ regenerated, errors })
}
