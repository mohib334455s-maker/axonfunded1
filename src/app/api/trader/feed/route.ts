import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isTraderDashboardUserFromCookieJar } from "@/lib/trader-access-server";
import { bearerMatchesSecret, isValidIngestAccountId } from "@/lib/trader-ingest-auth";
import { getTraderIngestAccount, listTraderIngestAccounts } from "@/lib/trader-ingest-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Latest ingested snapshots for the dashboard UI.
 * - Browser: must be logged in with dashboard cookies.
 * - Or: Authorization: Bearer TRADER_INGEST_SECRET (same as ingest) for scripts / monitoring.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.TRADER_INGEST_SECRET?.trim();
  const jar = cookies();
  const viaBearer = secret && bearerMatchesSecret(request.headers.get("authorization"), secret);
  const viaSession = await isTraderDashboardUserFromCookieJar(jar);

  if (!viaBearer && !viaSession) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("accountId");
  if (id) {
    if (!isValidIngestAccountId(id)) {
      return NextResponse.json({ ok: false, error: "Invalid accountId" }, { status: 400 });
    }
    const record = getTraderIngestAccount(id);
    return NextResponse.json({ ok: true, record });
  }

  return NextResponse.json({ ok: true, accounts: listTraderIngestAccounts() });
}
