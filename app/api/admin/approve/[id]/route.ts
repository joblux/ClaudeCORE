import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/ses";
import { welcomeApprovalEmail } from "@/lib/email-templates";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data: member, error: fetchError } = await supabaseAdmin
    .from("members")
    .select("email, first_name, role")
    .eq("id", params.id)
    .single();

  if (fetchError || !member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("members")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send welcome email
  try {
    const { html, text } = welcomeApprovalEmail({
      firstName: member.first_name,
      tier: member.role || "member",
    });
    await sendEmail({
      to: member.email,
      subject: "Welcome to JOBLUX",
      body: text,
      bodyHtml: html,
    });
  } catch (emailError) {
    console.error("Failed to send approval email:", emailError);
  }

  return NextResponse.redirect(new URL("/admin", req.url));
}
