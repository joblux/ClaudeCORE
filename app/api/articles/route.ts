import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { title, excerpt, content, category, author_name, cover_image, published, tags } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  const slug = slugify(title);
  const read_time = Math.max(1, Math.round(content.split(/\s+/).length / 200));

  const { data, error } = await supabaseAdmin
    .from("articles")
    .insert({
      title: title.trim(),
      slug,
      excerpt: excerpt?.trim() || null,
      content: content.trim(),
      category: category || "bloglux",
      author_name: author_name?.trim() || "JOBLUX Editorial",
      cover_image: cover_image?.trim() || null,
      published: !!published,
      published_at: published ? new Date().toISOString() : null,
      read_time,
      tags: tags || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ article: data });
}
