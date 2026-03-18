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
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { memberType, firstName, lastName, phone, city, country, bio, linkedinUrl, currentTitle, currentMaison, companyName, companyRole, instagramHandle, instagramFollowers } = body;
  if (!memberType || !firstName || !lastName || !city || !country || !bio) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const typeDetails: Record<string, unknown> = {};
  if (memberType === "candidate") { typeDetails.current_title = currentTitle; typeDetails.current_maison = currentMaison; }
  else if (memberType === "employer") { typeDetails.company_name = companyName; typeDetails.company_role = companyRole; }
  else if (memberType === "influencer") { typeDetails.instagram_handle = instagramHandle; typeDetails.instagram_followers = instagramFollowers; }
  const { error } = await supabaseAdmin.from("members").update({
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim(),
    phone: phone || null,
    city,
    country,
    bio,
    linkedin_url: linkedinUrl || null,
    role: memberType,
    status: "pending",
    notes: JSON.stringify(typeDetails),
    updated_at: new Date().toISOString(),
  }).eq("email", session.user.email);
  if (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to save registration" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
