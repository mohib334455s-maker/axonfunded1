import { NextRequest, NextResponse } from "next/server";
import { listCertificates } from "@/lib/server/dashboard-memory";
import { getTraderIdFromRequest } from "@/lib/server/trader-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const traderId = getTraderIdFromRequest(req);
  if (!traderId) {
    return NextResponse.json({ data: [] });
  }
  const data = listCertificates(traderId);
  return NextResponse.json({ data });
}
