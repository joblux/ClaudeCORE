import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function approvalEmailHtml(firstName?: string): string {
  const greeting = firstName ? `Dear ${firstName},` : "";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;">
        <tr><td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
          <div style="font-family:'Gill Sans','Gill Sans MT',Calibri,sans-serif;font-size:28px;font-weight:600;color:#ffffff;letter-spacing:2px;">JOBLUX</div>
        </td></tr>
        <tr><td style="padding:40px 40px 32px;">
          ${greeting ? `<p style="font-size:14px;color:#888;margin:0 0 24px;">${greeting}</p>` : ""}
          <h1 style="font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;color:#1a1a1a;margin:0 0 20px;line-height:1.3;">Welcome to JOBLUX.</h1>
          <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 32px;">Your membership has been approved. You now have full access to confidential positions, salary intelligence, WikiLux and all member features.</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 32px;">
            <a href="https://www.luxuryrecruiter.com/dashboard" style="display:inline-block;background:#a58e28;color:#1a1a1a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;text-decoration:none;padding:14px 36px;letter-spacing:2px;text-transform:uppercase;">Access Your Dashboard</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #e8e2d8;text-align:center;">
          <p style="font-size:11px;color:#999;margin:0;letter-spacing:0.5px;">JOBLUX &middot; Paris &middot; London &middot; New York &middot; Dubai &middot; Singapore</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Fetch member before updating so we have their email
  const { data: member, error: fetchError } = await supabaseAdmin
    .from("members")
    .select("email, first_name")
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

  // Send approval email
  try {
    await getResend().emails.send({
      from: "JOBLUX <noreply@luxuryrecruiter.com>",
      to: member.email,
      subject: "Your JOBLUX membership has been approved",
      html: approvalEmailHtml(member.first_name),
    });
  } catch (emailError) {
    console.error("Failed to send approval email:", emailError);
    // Member is approved even if email fails — don't block on this
  }

  return NextResponse.redirect(new URL("/admin", req.url));
}
