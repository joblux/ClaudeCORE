import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      error: "Gone",
      detail: "wikilux/regenerate retired (P0-4): destructive live Sonnet write neutralised.",
    },
    { status: 410 }
  )
}
