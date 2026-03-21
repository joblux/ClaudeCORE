import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"
import { buildTranslationPrompt, SUPPORTED_LANGUAGES } from "@/lib/wikilux-prompt"

export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.WIKILUX_API_KEY!,
})

export async function POST(req: Request) {
  const { slug, language_code } = await req.json()

  if (!slug || !language_code) {
    return NextResponse.json({ error: "slug and language_code are required" }, { status: 400 })
  }

  if (language_code === "en") {
    return NextResponse.json({ error: "English is the source language" }, { status: 400 })
  }

  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === language_code)
  if (!lang) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 })
  }

  // Get English content
  const { data: row } = await supabase
    .from("wikilux_content")
    .select("content, translations")
    .eq("slug", slug)
    .maybeSingle()

  if (!row?.content) {
    return NextResponse.json({ error: "No English content found" }, { status: 404 })
  }

  // Check if translation already cached
  const existing = row.translations as Record<string, unknown> | null
  if (existing?.[language_code]) {
    return NextResponse.json({ translation: existing[language_code], cached: true })
  }

  // Generate translation with Claude
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 5000,
    messages: [{ role: "user", content: buildTranslationPrompt(lang.name, row.content as Record<string, unknown>) }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""

  let translation
  try {
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim()
    translation = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: "Failed to parse translation" }, { status: 500 })
  }

  // Store translation
  const translations = existing || {}
  translations[language_code] = translation

  await supabase
    .from("wikilux_content")
    .update({ translations })
    .eq("slug", slug)

  return NextResponse.json({ translation, cached: false })
}
