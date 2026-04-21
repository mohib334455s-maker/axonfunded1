import { NextRequest, NextResponse } from "next/server";
import { getTraderIdFromRequest } from "@/lib/server/trader-request";
import {
  createAffiliatePayoutRequest,
  ensureAffiliateProfile,
  getAffiliateSettings,
  loadPlatformStore,
} from "@/lib/server/platform-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const traderId = getTraderIdFromRequest(req);
  if (!traderId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const profile = ensureAffiliateProfile(traderId);
  const settings = getAffiliateSettings();
  const mine = loadPlatformStore().affiliatePayoutRequests.filter((r) => r.traderId === traderId);
  return NextResponse.json({
    profile,
    settings: { commissionPercent: settings.commissionPercent, termsHtml: settings.termsHtml },
    withdrawalRequests: mine,
  });
}

export async function POST(req: NextRequest) {
  const traderId = getTraderIdFromRequest(req);
  if (!traderId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as { amountUsd?: number };
  const amt = Number(body.amountUsd);
  if (!Number.isFinite(amt) || amt <= 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }
  try {
    const row = createAffiliatePayoutRequest(traderId, amt);
    return NextResponse.json({ data: row });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
