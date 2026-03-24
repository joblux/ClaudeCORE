import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  // Try bloglux_articles first (actual table name)
  const { data, error } = await supabaseAdmin
    .from("bloglux_articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error && data) {
    // Map to expected shape for admin pages
    const articles = data.map((a: any) => ({
      ...a,
      published: a.status === 'published',
      read_time: a.read_time_minutes,
      hero_image_url: a.cover_image_url,
      content: a.body,
    }));
    return NextResponse.json({ articles });
  }

  // Fallback: try legacy 'articles' table
  const { data: legacy, error: legacyError } = await supabaseAdmin
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (legacyError) return NextResponse.json({ error: legacyError.message }, { status: 500 });
  return NextResponse.json({ articles: legacy });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { title, excerpt, content, category, author_name, cover_image, published, tags,
    hero_image_url, hero_image_alt, hero_image_caption, hero_image_source,
    author_title, author_avatar_url, is_featured, meta_description, og_image_url } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  const slug = slugify(title);
  const read_time = Math.max(1, Math.round(content.split(/\s+/).length / 200));
  const autoMeta = meta_description?.trim() || content.trim().slice(0, 155);

  const { data, error } = await supabaseAdmin
    .from("bloglux_articles")
    .insert({
      title: title.trim(),
      slug,
      subtitle: null,
      excerpt: excerpt?.trim() || null,
      body: content.trim(),
      category: category || "industry-news",
      author_name: author_name?.trim() || "Mohammed M'zaour",
      cover_image_url: cover_image?.trim() || hero_image_url?.trim() || null,
      status: published ? 'published' : 'draft',
      published_at: published ? new Date().toISOString() : null,
      read_time_minutes: read_time,
      tags: tags || [],
      meta_description: autoMeta,
      featured_homepage: !!is_featured,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ article: data });
}
