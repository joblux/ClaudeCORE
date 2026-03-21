import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

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
    .select("content, updated_at, editorial_notes")
    .eq("slug", slug)
    .single();

  if (cached) return NextResponse.json({ content: cached.content, cached: true, updated_at: cached.updated_at, editorial_notes: cached.editorial_notes });

  // Generate with Claude
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `You are a luxury industry encyclopedia editor writing for JOBLUX — the luxury talents society for industry professionals. Write a comprehensive encyclopedia entry for ${brandName}.

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
    "headquarters": "${country}",
    "key_markets": ["market 1", "market 2", "market 3", "market 4"],
    "boutiques": "approximate number or description of retail presence"
  },
  "stock": {
    "listed": true or false,
    "exchange": "stock exchange name or null",
    "ticker": "ticker symbol or null",
    "parent_group": "${group}"
  },
  "facts": ["interesting fact 1", "interesting fact 2", "interesting fact 3", "interesting fact 4", "interesting fact 5"]
}

Brand details: ${brandName}, ${sector} sector, founded ${founded}, ${country}, part of ${group}.
Write with genuine expertise. This will be read by luxury industry executives and senior professionals. Be accurate, insightful and authoritative.`
    }]
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
