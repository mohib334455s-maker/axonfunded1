import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getAffiliateSettings, listAffiliatePayoutRequestsAdmin, loadPlatformStore, reviewAffiliatePayoutRequest } from "@/lib/server/platform-store";
import { getTrader } from "@/lib/server/trader-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const s = loadPlatformStore();
  const referrers = Object.entries(s.affiliateByTraderId).map(([traderId, p]) => {
    const t = getTrader(traderId);
    return {
      traderId,
      email: t?.email ?? null,
      name: t?.name ?? null,
      referralCode: p.referralCode,
      balanceUsd: p.balanceUsd,
      referralCount: p.referralTraderIds.length,
      referralTraderIds: p.referralTraderIds,
    };
  });
  return NextResponse.json({
    settings: getAffiliateSettings(),
    withdrawalRequests: listAffiliatePayoutRequestsAdmin(),
    referrers,
  });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await request.json()) as { id?: string; status?: "approved" | "rejected"; adminNote?: string };
  if (!body.id || !body.status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
  const r = reviewAffiliatePayoutRequest(body.id, { status: body.status, adminNote: body.adminNote });
  if (!r) return NextResponse.json({ error: "not_found_or_not_pending" }, { status: 400 });
  return NextResponse.json({ data: r });
}
