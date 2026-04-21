import { NextResponse } from "next/server";
import { listLeaderboardPublic } from "@/lib/server/platform-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = listLeaderboardPublic();
  return NextResponse.json({ data: rows });
}
