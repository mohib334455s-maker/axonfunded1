import { NextRequest, NextResponse } from "next/server";
import { getDashboardSummaryForTrader } from "@/lib/server/trader-store";
import { getTraderIdFromRequest } from "@/lib/server/trader-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const traderId = getTraderIdFromRequest(req);
  if (!traderId) {
    return NextResponse.json({
      traderId: null,
      hasPaidChallenge: false,
      awaitingCredentials: false,
      accountCount: 0,
      orderCount: 0,
    });
  }
  return NextResponse.json(getDashboardSummaryForTrader(traderId));
}
