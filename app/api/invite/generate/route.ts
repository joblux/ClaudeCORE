import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 8);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: member, error: fetchError } = await supabaseAdmin
    .from("members")
    .select("id, referral_code")
    .eq("email", session.user.email)
    .single();

  if (fetchError || !member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  let code = member.referral_code;

  if (!code) {
    code = generateCode();
    const { error: updateError } = await supabaseAdmin
      .from("members")
      .update({ referral_code: code })
      .eq("id", member.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    inviteUrl: `https://joblux.com/join?ref=${code}`,
  });
}
