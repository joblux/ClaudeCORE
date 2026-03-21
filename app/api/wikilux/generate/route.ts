import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { BRANDS } from "@/lib/wikilux-brands";
import { buildRichPrompt } from "@/lib/wikilux-prompt";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  const { slug, brandName, sector, founded, country, group } = await req.json();

  if (!slug || !brandName) {
    return NextResponse.json({ error: "slug and brandName are required" }, { status: 400 });
  }

  // Check cache first
  const { data: cached } = await supabaseAdmin
    .from("wikilux_content")
    .select("content, translations, updated_at, editorial_notes")
    .eq("slug", slug)
    .single();

  if (cached) return NextResponse.json({ content: cached.content, translations: cached.translations, cached: true, updated_at: cached.updated_at, editorial_notes: cached.editorial_notes });

  // Find the full brand object from BRANDS list, or construct one
  const brand = BRANDS.find((b) => b.slug === slug) || {
    slug, name: brandName, sector: sector || "Luxury", founded: founded || 0,
    country: country || "", group: group || "Independent",
    headquarters: country || "", description: "", hiring_profile: "", known_for: "",
  };

  // Generate with Claude using the rich prompt
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 6000,
    messages: [{ role: "user", content: buildRichPrompt(brand) }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  let content;
  try {
    content = JSON.parse(text);
  } catch {
    content = { error: "Failed to parse", raw: text };
  }

  // Cache in Supabase
  await supabaseAdmin.from("wikilux_content").upsert({
    slug,
    brand_name: brandName,
    content,
    generated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ content, cached: false });
}
