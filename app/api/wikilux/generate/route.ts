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

    let content;
    try {
      // Strip markdown code fences if Claude wraps the JSON
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      content = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("[wikilux/generate] JSON parse error:", parseErr, "Raw (first 500):", text.substring(0, 500));
      return NextResponse.json({ content: { error: "Content is being generated. Please refresh in a moment." }, cached: false });
    }

    console.log(`[wikilux/generate] Parsed OK for ${brandName}, saving to Supabase...`);

    // Cache in Supabase — use onConflict on slug (the unique column)
    const now = new Date().toISOString();
    const { error: upsertError } = await supabaseAdmin
      .from("wikilux_content")
      .upsert(
        { slug, brand_name: brandName, content, updated_at: now },
        { onConflict: "slug" }
      );

    if (upsertError) {
      console.error("[wikilux/generate] Supabase upsert FAILED:", JSON.stringify(upsertError));
    } else {
      console.log(`[wikilux/generate] Saved to Supabase for ${brandName}`);
    }

    return NextResponse.json({ content, cached: false, updated_at: now });
  } catch (err) {
    console.error("[wikilux/generate] Unhandled error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { content: { error: "Content generation failed. Please refresh to try again." }, cached: false },
      { status: 200 }
    );
  }
}
