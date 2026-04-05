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
  apiKey: process.env.WIKILUX_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { slug, brandName, sector, founded, country, group } = await req.json();

    if (!slug || !brandName) {
      return NextResponse.json({ error: "slug and brandName are required" }, { status: 400 });
    }

    // Check cache
    const { data: cached } = await supabaseAdmin
      .from("wikilux_content")
      .select("content, translations, updated_at, editorial_notes")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (cached?.content) {
      return NextResponse.json(
        { content: cached.content, translations: cached.translations, cached: true, updated_at: cached.updated_at, editorial_notes: cached.editorial_notes },
        { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
      );
    }

    const brand = BRANDS.find((b) => b.slug === slug) || {
      slug, name: brandName, sector: sector || "Luxury", founded: founded || 0,
      country: country || "", group: group || "Independent",
      headquarters: country || "", description: "", hiring_profile: "", known_for: "",
    };

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000,
      messages: [{ role: "user", content: buildRichPrompt(brand) }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    let parsedContent: Record<string, unknown>;
    try {
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      parsedContent = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ content: { error: "Content is being generated. Please refresh in a moment." }, cached: false });
    }

    if (typeof parsedContent !== "object" || parsedContent === null || Array.isArray(parsedContent)) {
      return NextResponse.json({ content: { error: "Content is being generated. Please refresh in a moment." }, cached: false });
    }

    const now = new Date().toISOString();
    const { error: upsertError } = await supabaseAdmin
      .from("wikilux_content")
      .upsert({ slug, brand_name: brandName, content: parsedContent, updated_at: now }, { onConflict: "slug" })
      .select("slug");

    if (upsertError) {
      console.error("[wikilux/generate] upsert error:", upsertError.message);
    }

    return NextResponse.json({ content: parsedContent, cached: false, updated_at: now });
  } catch (err) {
    console.error("[wikilux/generate]", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json(
      { content: { error: "Content generation failed. Please refresh to try again." }, cached: false },
      { status: 200 }
    );
  }
}
