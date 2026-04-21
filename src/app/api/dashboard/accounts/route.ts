import { NextRequest, NextResponse } from "next/server";
import { listOrdersForTrader, listTradingAccountsForTrader } from "@/lib/server/trader-store";
import { getTraderIdFromRequest } from "@/lib/server/trader-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const traderId = getTraderIdFromRequest(req);
  if (!traderId) {
    return NextResponse.json({ accounts: [], orders: [], linked: false });
  }
  return NextResponse.json({
    accounts: listTradingAccountsForTrader(traderId),
    orders: listOrdersForTrader(traderId),
    linked: true,
  });
}
