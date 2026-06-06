import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Gone",
      detail: "wikilux/generate retired (P0-3): live Sonnet write neutralised. Use the source-grounded LuxAI pipeline.",
    },
    { status: 410 }
  );
}
