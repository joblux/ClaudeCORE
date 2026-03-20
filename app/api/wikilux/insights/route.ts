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

  // Query contributions joined with wikilux_insights and members
  const { data, error, count } = await supabase
    .from("contributions")
    .select(
      `
      id,
      is_anonymous,
      created_at,
      brand_slug,
      wikilux_insights!inner (
        id,
        insight_type,
        content
      ),
      members!inner (
        first_name,
        last_name,
        access_level
      )
    `,
      { count: "exact" }
    )
    .eq("status", "approved")
    .eq("brand_slug", slug)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const insights = (data || []).map((row: any) => {
    const insight = row.wikilux_insights
    const member = row.members

    const contributorName = row.is_anonymous
      ? "Anonymous Member"
      : `${member.first_name} ${member.last_name?.charAt(0)}.`

    return {
      id: insight.id,
      insight_type: insight.insight_type,
      content: insight.content,
      contributor_name: contributorName,
      contributor_tier: member.access_level,
      is_anonymous: row.is_anonymous,
      created_at: row.created_at,
    }
  })

  return NextResponse.json({ insights, total: count || 0 })
}
