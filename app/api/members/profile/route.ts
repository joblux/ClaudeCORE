import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (email !== session.user.email && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: member, error } = await supabaseAdmin
    .from("members")
    .select("first_name, last_name, title, company, city, country, bio, linkedin_url, phone, email, role, status")
    .eq("email", email)
    .single();

  if (error || !member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json({
    member: {
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      title: member.title || "",
      company: member.company || "",
      city: member.city || "",
      country: member.country || "",
      bio: member.bio || "",
      linkedin_url: member.linkedin_url || "",
      phone: member.phone || "",
      email: member.email,
      role: member.role,
      status: member.status,
    },
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { email, first_name, last_name, title, company, city, country, bio, linkedin_url, phone } = body;

  // Only allow editing own profile unless admin
  if (email !== session.user.email && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate required fields
  if (!first_name?.trim() || !last_name?.trim() || !city?.trim() || !country?.trim()) {
    return NextResponse.json({ error: "first_name, last_name, city and country are required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("members")
    .update({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      title: title?.trim() || null,
      company: company?.trim() || null,
      city: city.trim(),
      country: country.trim(),
      bio: bio?.slice(0, 280).trim() || null,
      linkedin_url: linkedin_url?.trim() || null,
      phone: phone?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
