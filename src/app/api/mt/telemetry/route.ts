import { NextRequest, NextResponse } from "next/server";
import { enrichIpIntel } from "@/lib/ip-intel";
import { appendMtTelemetryEvent } from "@/lib/mt-telemetry-store";
import type { MtTelemetryEventType } from "@/lib/mt-telemetry-types";
import { mtTelemetryBearerOk } from "@/lib/mt-telemetry-secret";
import { getRequestClientIp } from "@/lib/request-ip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EVENTS: MtTelemetryEventType[] = ["heartbeat", "connect", "disconnect", "login"];

function isTraderRef(v: unknown): v is string {
  return typeof v === "string" && /^[a-zA-Z0-9_.@-]{1,128}$/.test(v);
}

function isFingerprint(v: unknown): v is string {
  return typeof v === "string" && v.length >= 8 && v.length <= 512;
}

function isShortStr(v: unknown, max: number): v is string {
  return typeof v === "string" && v.length >= 1 && v.length <= max;
}

export async function POST(request: NextRequest) {
  const secret = process.env.MT_TELEMETRY_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "MT_TELEMETRY_SECRET is not configured on the server." },
      { status: 503 }
    );
  }

  if (!mtTelemetryBearerOk(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const traderRef = body.traderRef;
  const mtLogin = body.mtLogin;
  const server = body.server;
  const fingerprint = body.fingerprint;
  const eventRaw = body.event;

  if (!isTraderRef(traderRef)) {
    return NextResponse.json(
      { ok: false, error: "traderRef required (1-128 chars: letters, digits, ._@-)" },
      { status: 400 }
    );
  }
  if (!isShortStr(mtLogin, 32)) {
    return NextResponse.json({ ok: false, error: "mtLogin required (max 32 chars)" }, { status: 400 });
  }
  if (!isShortStr(server, 160)) {
    return NextResponse.json({ ok: false, error: "server required (max 160 chars)" }, { status: 400 });
  }
  if (!isFingerprint(fingerprint)) {
    return NextResponse.json(
      { ok: false, error: "fingerprint required (8-512 chars; build from terminal + account in EA)" },
      { status: 400 }
    );
  }

  const event = (typeof eventRaw === "string" && EVENTS.includes(eventRaw as MtTelemetryEventType)
    ? eventRaw
    : "heartbeat") as MtTelemetryEventType;

  const clientIp =
    typeof body.clientIp === "string" && body.clientIp.length <= 64 ? body.clientIp.trim() : getRequestClientIp(request);

  const terminalBuild =
    typeof body.terminalBuild === "number" && Number.isFinite(body.terminalBuild)
      ? Math.floor(body.terminalBuild)
      : undefined;

  let accountMode: "demo" | "live" | "unknown" | undefined;
  if (body.accountMode === "demo" || body.accountMode === "live") accountMode = body.accountMode;
  else if (body.accountMode === "unknown") accountMode = "unknown";

  const meta =
    body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)
      ? (body.meta as Record<string, string | number | boolean | null>)
      : undefined;

  const ipIntel = await enrichIpIntel(clientIp);

  const result = appendMtTelemetryEvent({
    traderRef,
    mtLogin,
    server,
    fingerprint,
    event,
    ip: clientIp,
    ipIntel,
    terminalBuild,
    accountMode,
    userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? undefined,
    meta,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, hint: "Ensure .data/ is writable (volume on Docker / VPS)." },
      { status: 507 }
    );
  }

  return NextResponse.json({
    ok: true,
    id: result.event.id,
    ts: result.event.ts,
    ip: result.event.ip,
    ipIntel: result.event.ipIntel,
  });
}
