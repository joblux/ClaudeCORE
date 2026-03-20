import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session.user;
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "maintenance_mode")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to fetch setting" }, { status: 500 });
  }

  return NextResponse.json({ maintenance_mode: data.value === "true" });
}

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: current, error: fetchError } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "maintenance_mode")
    .single();

  if (fetchError) {
    return NextResponse.json({ error: "Failed to fetch setting" }, { status: 500 });
  }

  const newValue = current.value === "true" ? "false" : "true";

  const { error: updateError } = await supabase
    .from("site_settings")
    .update({
      value: newValue,
      updated_at: new Date().toISOString(),
      updated_by: admin.email ?? "admin",
    })
    .eq("key", "maintenance_mode");

  if (updateError) {
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }

  return NextResponse.json({ maintenance_mode: newValue === "true" });
}
