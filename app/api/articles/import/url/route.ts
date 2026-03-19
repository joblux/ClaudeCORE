import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "JOBLUX-Importer/1.0" },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch: ${res.status}` }, { status: 400 });
    }

    const html = await res.text();

    // Extract title
    let title = "";
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      title = h1Match[1].replace(/<[^>]*>/g, "").trim();
    } else {
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1].replace(/<[^>]*>/g, "").trim();
      }
    }
    title = title.replace(/\s*[\|–—]\s*JOBLUX.*$/i, "").trim();

    // Extract content from semantic containers
    let contentHtml = "";
    const selectors = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
      /class="entry-content"[^>]*>([\s\S]*?)<\/div>/i,
      /class="post-content"[^>]*>([\s\S]*?)<\/div>/i,
      /class="article-content"[^>]*>([\s\S]*?)<\/div>/i,
    ];
    for (const sel of selectors) {
      const match = html.match(sel);
      if (match) {
        contentHtml = match[1];
        break;
      }
    }
    if (!contentHtml) {
      // Fallback: try body
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      contentHtml = bodyMatch ? bodyMatch[1] : html;
    }

    // Convert HTML to plain text with paragraph breaks
    let content = contentHtml
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n\n")
      .replace(/<\/?(h[1-6]|div|section|blockquote)[^>]*>/gi, "\n\n")
      .replace(/<li[^>]*>/gi, "\n- ")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Extract images
    const images: string[] = [];
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(contentHtml)) !== null) {
      const src = imgMatch[1];
      if (!src.includes("data:") && !src.includes("pixel") && !src.includes("tracking")) {
        images.push(src);
      }
    }

    // Extract excerpt
    const excerpt = content.split("\n\n")[0]?.slice(0, 280) || "";

    // Try to extract category from meta tags
    let category = "bloglux";
    const catMatch = html.match(/property="article:section"\s+content="([^"]+)"/i)
      || html.match(/name="category"\s+content="([^"]+)"/i);
    if (catMatch) {
      category = catMatch[1].toLowerCase();
    }

    return NextResponse.json({ title, content, excerpt, category, images });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
