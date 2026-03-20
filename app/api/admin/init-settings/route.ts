import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: "maintenance_mode", value: "false" },
      { onConflict: "key" }
    );

  if (error) {
    return NextResponse.json({ error: "Failed to initialize settings" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
