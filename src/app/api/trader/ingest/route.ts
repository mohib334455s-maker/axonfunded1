import { NextRequest, NextResponse } from "next/server";
import { bearerMatchesSecret, isValidIngestAccountId } from "@/lib/trader-ingest-auth";
import { upsertTraderIngestRecord } from "@/lib/trader-ingest-store";
import type { TraderIngestMetrics } from "@/lib/trader-ingest-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 256_000;

function normalizeMetrics(body: Record<string, unknown>): TraderIngestMetrics {
  const raw = body.metrics;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const out: TraderIngestMetrics = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof k !== "string" || k.length > 64) continue;
      if (v === null) out[k] = null;
      else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") out[k] = v;
    }
    return out;
  }
  const out: TraderIngestMetrics = {};
  const keys = ["balance", "equity", "margin", "freeMargin", "profit", "openPositions"] as const;
  for (const k of keys) {
    const v = body[k];
    if (v === null) out[k] = null;
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "string" && v.length <= 64) out[k] = v;
  }
  return out;
}

function normalizeMeta(body: Record<string, unknown>): Record<string, unknown> | undefined {
  const m = body.meta;
  if (!m || typeof m !== "object" || Array.isArray(m)) return undefined;
  const out: Record<string, unknown> = {};
  let n = 0;
  for (const [k, v] of Object.entries(m)) {
    if (n >= 32) break;
    if (typeof k !== "string" || k.length > 48) continue;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
      n++;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export async function POST(request: NextRequest) {
  const secret = process.env.TRADER_INGEST_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "TRADER_INGEST_SECRET is not set on the server." },
      { status: 503 }
    );
  }

  if (!bearerMatchesSecret(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const cl = request.headers.get("content-length");
  if (cl != null && Number(cl) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const accountId = body.accountId;
  if (!isValidIngestAccountId(accountId)) {
    return NextResponse.json(
      { ok: false, error: "accountId must match /^[a-zA-Z0-9_.-]{1,64}$/" },
      { status: 400 }
    );
  }

  const metrics = normalizeMetrics(body);
  const meta = normalizeMeta(body);

  const result = upsertTraderIngestRecord({ accountId, metrics, meta });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, hint: "Ensure the server has a writable .data/ directory (e.g. bind a volume when using Docker)." },
      { status: 507 }
    );
  }

  return NextResponse.json({ ok: true, accountId: result.record.accountId, updatedAt: result.record.updatedAt });
}
