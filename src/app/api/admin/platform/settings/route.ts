import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getAffiliateSettings, getTrustpilotId, updateAffiliateSettings, updateTrustpilotId } from "@/lib/server/platform-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({
    affiliate: getAffiliateSettings(),
    trustpilotBusinessUnitId: getTrustpilotId(),
  });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await request.json()) as {
    commissionPercent?: number;
    termsHtml?: string;
    trustpilotBusinessUnitId?: string;
  };
  if (body.trustpilotBusinessUnitId != null) {
    updateTrustpilotId(String(body.trustpilotBusinessUnitId));
  }
  const affiliate = updateAffiliateSettings({
    commissionPercent: body.commissionPercent,
    termsHtml: body.termsHtml,
  });
  return NextResponse.json({ affiliate, trustpilotBusinessUnitId: getTrustpilotId() });
}
