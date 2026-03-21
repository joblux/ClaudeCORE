import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get("slug")
  const limit = parseInt(searchParams.get("limit") || "10", 10)

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 })
  }

  try {
    const { data, count } = await supabase
      .from("contributions")
      .select(
        `id, is_anonymous, created_at, brand_slug,
        wikilux_insights!inner (id, insight_type, content),
        members!inner (first_name, last_name, access_level)`,
        { count: "exact" }
      )
      .eq("status", "approved")
      .eq("contribution_type", "wikilux_insight")
      .eq("brand_slug", slug)
      .order("created_at", { ascending: false })
      .limit(limit)

    const insights = (data || []).map((row: Record<string, unknown>) => {
      const insight = row.wikilux_insights as Record<string, unknown> | null
      const member = row.members as Record<string, unknown> | null

      return {
        id: insight?.id || row.id,
        insight_type: insight?.insight_type || 'General',
        content: insight?.content || '',
        contributor_name: row.is_anonymous
          ? "Anonymous Member"
          : member ? `${member.first_name} ${(member.last_name as string)?.charAt(0)}.` : 'Member',
        contributor_tier: (member?.access_level as string) || 'basic',
        is_anonymous: row.is_anonymous,
        created_at: row.created_at,
      }
    })

    return NextResponse.json(
      { insights, total: count || 0 },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch {
    // Return empty array instead of 500 — insights are non-critical
    return NextResponse.json({ insights: [], total: 0 })
  }
}
