import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { BRANDS } from "@/lib/wikilux-brands";
import { buildRichPrompt } from "@/lib/wikilux-prompt";

export const maxDuration = 60;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { slug, brandName, sector, founded, country, group } = await req.json();

    if (!slug || !brandName) {
      return NextResponse.json({ error: "slug and brandName are required" }, { status: 400 });
    }

    // Check cache first
    const { data: cached, error: cacheError } = await supabaseAdmin
      .from("wikilux_content")
      .select("content, translations, updated_at, editorial_notes")
      .eq("slug", slug)
      .single();

    if (cacheError && cacheError.code !== "PGRST116") {
      console.error("[wikilux/generate] Cache lookup error:", JSON.stringify(cacheError));
    }

    if (cached?.content) {
      return NextResponse.json({ content: cached.content, translations: cached.translations, cached: true, updated_at: cached.updated_at, editorial_notes: cached.editorial_notes });
    }

    // Find the full brand object from BRANDS list, or construct one
    const brand = BRANDS.find((b) => b.slug === slug) || {
      slug, name: brandName, sector: sector || "Luxury", founded: founded || 0,
      country: country || "", group: group || "Independent",
      headquarters: country || "", description: "", hiring_profile: "", known_for: "",
    };

    // Generate with Claude using the rich prompt
    console.log(`[wikilux/generate] Generating content for ${brandName} (${slug})...`);
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000,
      messages: [{ role: "user", content: buildRichPrompt(brand) }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    console.log(`[wikilux/generate] Claude returned ${text.length} chars for ${slug}`);

    let parsedContent: Record<string, unknown>;
    try {
      // Strip markdown code fences if Claude wraps the JSON
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      parsedContent = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("[wikilux/generate] JSON parse error:", parseErr, "Raw (first 500):", text.substring(0, 500));
      return NextResponse.json({ content: { error: "Content is being generated. Please refresh in a moment." }, cached: false });
    }

    // Verify we got a real object, not a string or array
    if (typeof parsedContent !== "object" || parsedContent === null || Array.isArray(parsedContent)) {
      console.error("[wikilux/generate] Parsed content is not an object:", typeof parsedContent);
      return NextResponse.json({ content: { error: "Content is being generated. Please refresh in a moment." }, cached: false });
    }

    console.log(`[wikilux/generate] Parsed OK for ${brandName}. Keys: ${Object.keys(parsedContent).join(", ")}`);

    // Cache in Supabase — use onConflict on slug (the unique column)
    const now = new Date().toISOString();
    const row = { slug, brand_name: brandName, content: parsedContent, updated_at: now };
    console.log(`[wikilux/generate] Upserting to wikilux_content: slug=${slug}, brand_name=${brandName}, content_keys=${Object.keys(parsedContent).length}`);

    const { data: upsertData, error: upsertError } = await supabaseAdmin
      .from("wikilux_content")
      .upsert(row, { onConflict: "slug" })
      .select("slug");

    if (upsertError) {
      console.error("[wikilux/generate] UPSERT FAILED:", JSON.stringify(upsertError));
    } else {
      console.log(`[wikilux/generate] UPSERT SUCCESS for ${slug}:`, JSON.stringify(upsertData));
    }

    return NextResponse.json({ content: parsedContent, cached: false, updated_at: now });
  } catch (err) {
    console.error("[wikilux/generate] Unhandled error:", err instanceof Error ? `${err.message}\n${err.stack}` : err);
    return NextResponse.json(
      { content: { error: "Content generation failed. Please refresh to try again." }, cached: false },
      { status: 200 }
    );
  }
}
