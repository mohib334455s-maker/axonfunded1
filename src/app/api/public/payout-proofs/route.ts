import { NextResponse } from "next/server";
import { listPayoutProofsPublic, loadPlatformStore } from "@/lib/server/platform-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = loadPlatformStore();
  return NextResponse.json({
    data: listPayoutProofsPublic(),
    categories: s.payoutProofCategories,
    trustpilotBusinessUnitId: s.trustpilotBusinessUnitId,
  });
}
