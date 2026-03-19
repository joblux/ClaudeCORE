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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { articles } = await req.json();
  if (!Array.isArray(articles) || articles.length === 0) {
    return NextResponse.json({ error: "articles array is required" }, { status: 400 });
  }

  let imported = 0;
  const errors: string[] = [];

  for (const article of articles) {
    try {
      const title = article.title?.trim();
      const content = article.content?.trim();
      if (!title || !content) {
        errors.push(`Skipped: missing title or content`);
        continue;
      }

      const slug = slugify(title);
      const read_time = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
      const published = !!article.published;

      const { error } = await supabaseAdmin.from("articles").insert({
        title,
        slug,
        excerpt: article.excerpt?.trim()?.slice(0, 280) || null,
        content,
        category: article.category || "bloglux",
        author_name: article.author_name?.trim() || "JOBLUX Editorial",
        cover_image: article.cover_image?.trim() || null,
        published,
        published_at: published ? new Date().toISOString() : null,
        read_time,
        tags: Array.isArray(article.tags) ? article.tags : (article.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
      });

      if (error) {
        errors.push(`"${title}": ${error.message}`);
      } else {
        imported++;
      }
    } catch (err) {
      errors.push(`Error: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return NextResponse.json({ imported, errors });
}
