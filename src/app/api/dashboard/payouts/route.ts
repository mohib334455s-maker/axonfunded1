import { NextRequest, NextResponse } from "next/server";
import { createPayoutRequest, getPayoutSummary, listPayouts } from "@/lib/server/dashboard-memory";
import { getTraderIdFromRequest } from "@/lib/server/trader-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const traderId = getTraderIdFromRequest(req);
  if (!traderId) {
    return NextResponse.json({
      data: [],
      summary: {
        availableBalance: 0,
        minPayout: 100,
        payoutComplianceHints: [] as string[],
        complianceRelaxed: false,
      },
    });
  }
  const data = listPayouts(traderId);
  const summary = getPayoutSummary(traderId);
  return NextResponse.json({
    data,
    summary: {
      availableBalance: summary.availableBalance,
      minPayout: summary.minPayout,
      payoutComplianceHints: summary.payoutComplianceHints,
      complianceRelaxed: summary.complianceRelaxed,
    },
  });
}

export async function POST(req: NextRequest) {
  const traderId = getTraderIdFromRequest(req);
  if (!traderId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as { amount?: number; method?: string; declaresNoOpenPositions?: boolean };
  const amount = typeof body.amount === "number" ? body.amount : parseFloat(String(body.amount ?? ""));
  const method = typeof body.method === "string" ? body.method : "crypto_usdt";
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }
  const result = createPayoutRequest(traderId, amount, method, {
    declaresNoOpenPositions: body.declaresNoOpenPositions === true,
  });
  if (!result.ok) {
    if (result.code === "payout_compliance") {
      return NextResponse.json({ error: result.code, reasons: result.reasons }, { status: 403 });
    }
    if (result.code === "below_min") {
      return NextResponse.json({ error: result.code, minPayout: result.minPayout }, { status: 400 });
    }
    return NextResponse.json(
      { error: result.code, availableBalance: result.availableBalance },
      { status: 400 }
    );
  }
  return NextResponse.json({ data: result.payout });
}
