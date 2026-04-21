import { NextRequest, NextResponse } from "next/server";
import { readMtTelemetryStore, setAlertAcknowledged } from "@/lib/mt-telemetry-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get("axon_admin")?.value === "true";
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const store = readMtTelemetryStore();
  const limit = Math.min(500, Math.max(20, Number(request.nextUrl.searchParams.get("limit")) || 200));
  const events = store.events.slice(-limit).reverse();
  return NextResponse.json({
    ok: true,
    events,
    alerts: store.alerts,
    totals: {
      events: store.events.length,
      alerts: store.alerts.length,
      unacked: store.alerts.filter((a) => !a.acknowledged).length,
    },
  });
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  let body: { alertId?: string; acknowledged?: boolean };
  try {
    body = (await request.json()) as { alertId?: string; acknowledged?: boolean };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.alertId || typeof body.alertId !== "string") {
    return NextResponse.json({ ok: false, error: "alertId required" }, { status: 400 });
  }
  const ack = body.acknowledged !== false;
  const r = setAlertAcknowledged(body.alertId, ack);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
