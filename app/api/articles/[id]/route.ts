import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { title, excerpt, content, category, author_name, cover_image, published, tags } = body;

  const read_time = content ? Math.max(1, Math.round(content.split(/\s+/).length / 200)) : undefined;

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) updateData.title = title.trim();
  if (excerpt !== undefined) updateData.excerpt = excerpt?.trim() || null;
  if (content !== undefined) updateData.content = content.trim();
  if (category !== undefined) updateData.category = category;
  if (author_name !== undefined) updateData.author_name = author_name?.trim() || "JOBLUX Editorial";
  if (cover_image !== undefined) updateData.cover_image = cover_image?.trim() || null;
  if (published !== undefined) {
    updateData.published = !!published;
    if (published) updateData.published_at = new Date().toISOString();
  }
  if (tags !== undefined) updateData.tags = tags;
  if (read_time !== undefined) updateData.read_time = read_time;

  const { data, error } = await supabaseAdmin
    .from("articles")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ article: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from("articles")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
