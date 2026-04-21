import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { readTraderIngestStore } from "@/lib/trader-ingest-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read-only view of bot-ingested account snapshots (admin only). */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const store = readTraderIngestStore();
  const accounts = Object.values(store.accounts).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return NextResponse.json({
    ok: true,
    accounts: accounts.map((a) => ({
      accountId: a.accountId,
      updatedAt: a.updatedAt,
      metrics: a.metrics,
      meta: a.meta,
    })),
  });
}
