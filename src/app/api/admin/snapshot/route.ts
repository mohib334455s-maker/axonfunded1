import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { readMtTelemetryStore } from "@/lib/mt-telemetry-store";
import { readTraderIngestStore } from "@/lib/trader-ingest-store";
import { getOrderOpsCounts } from "@/lib/server/trader-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const mt = readMtTelemetryStore();
  const ti = readTraderIngestStore();
  const { pendingUsdtOrders, awaitingMtCredentials } = getOrderOpsCounts();

  return NextResponse.json({
    ok: true,
    pendingUsdtOrders,
    awaitingMtCredentials,
    mtTelemetry: {
      events: mt.events.length,
      alerts: mt.alerts.length,
      alertsUnacked: mt.alerts.filter((a) => !a.acknowledged).length,
    },
    traderIngest: {
      accounts: Object.keys(ti.accounts).length,
      lastUpdates: Object.values(ti.accounts)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .slice(0, 8)
        .map((r) => ({ accountId: r.accountId, updatedAt: r.updatedAt })),
    },
    integrations: {
      traderIngestSecret: Boolean(process.env.TRADER_INGEST_SECRET?.trim()),
      mtTelemetrySecret: Boolean(process.env.MT_TELEMETRY_SECRET?.trim()),
      openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
    },
  });
}
