import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await req.json();
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  // Check for existing application
  const { data: existing } = await supabaseAdmin
    .from("applications")
    .select("id")
    .eq("mandate_id", jobId)
    .eq("candidate_id", session.user.memberId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "You have already expressed interest in this position" }, { status: 409 });
  }

  const { error } = await supabaseAdmin
    .from("applications")
    .insert({
      mandate_id: jobId,
      candidate_id: session.user.memberId,
      status: "applied",
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
