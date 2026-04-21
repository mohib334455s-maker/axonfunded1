import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listTradersForAdmin, patchTraderCompliance } from "@/lib/server/trader-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ data: listTradersForAdmin() });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    traderId?: string;
    kycStatus?: "none" | "submitted" | "approved" | "rejected";
    fundedTradingDays?: number;
  };
  const traderId = typeof body.traderId === "string" ? body.traderId.trim() : "";
  if (!traderId) return NextResponse.json({ error: "traderId_required" }, { status: 400 });
  if (body.kycStatus === undefined && body.fundedTradingDays === undefined) {
    return NextResponse.json({ error: "nothing_to_patch" }, { status: 400 });
  }
  const t = patchTraderCompliance(traderId, {
    kycStatus: body.kycStatus,
    fundedTradingDays: body.fundedTradingDays,
  });
  if (!t) return NextResponse.json({ error: "trader_not_found" }, { status: 404 });
  return NextResponse.json({ data: t });
}
