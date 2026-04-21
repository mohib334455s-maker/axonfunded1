import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { listAllPayoutsForAdmin, updatePayoutOpsStatus } from "@/lib/server/trader-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ data: listAllPayoutsForAdmin() });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    traderId?: string;
    payoutId?: string;
    action?: "approve" | "reject" | "complete";
    reason?: string;
    actor?: string;
  };
  const traderId = typeof body.traderId === "string" ? body.traderId.trim() : "";
  const payoutId = typeof body.payoutId === "string" ? body.payoutId.trim() : "";
  const action = body.action;
  if (!traderId || !payoutId || !action) {
    return NextResponse.json({ error: "traderId_payoutId_action_required" }, { status: 400 });
  }
  const row = updatePayoutOpsStatus({
    traderId,
    payoutId,
    action,
    reason: body.reason,
    actor: body.actor,
  });
  if (!row) return NextResponse.json({ error: "invalid_transition_or_not_found" }, { status: 400 });
  return NextResponse.json({ data: row });
}
