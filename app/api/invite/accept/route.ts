import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { refCode, newMemberEmail } = await req.json();

  if (!refCode || !newMemberEmail) {
    return NextResponse.json({ error: "refCode and newMemberEmail are required" }, { status: 400 });
  }

  // Find referring member
  const { data: referrer, error: refError } = await supabaseAdmin
    .from("members")
    .select("id")
    .eq("referral_code", refCode)
    .single();

  if (refError || !referrer) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  }

  // Update the new member's record
  const { error: updateError } = await supabaseAdmin
    .from("members")
    .update({ referred_by: referrer.id })
    .eq("email", newMemberEmail);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
