import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  deleteLeaderboardEntry,
  exportLeaderboardCsv,
  listLeaderboardAdmin,
  setLeaderboardApproved,
  upsertLeaderboardEntry,
} from "@/lib/server/platform-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const fmt = request.nextUrl.searchParams.get("format");
  if (fmt === "csv") {
    const csv = exportLeaderboardCsv();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="leaderboard.csv"',
      },
    });
  }
  const minGain = request.nextUrl.searchParams.get("minGain");
  let rows = listLeaderboardAdmin();
  if (minGain != null && minGain !== "") {
    const n = parseFloat(minGain);
    if (Number.isFinite(n)) rows = rows.filter((r) => r.gainPct >= n);
  }
  return NextResponse.json({ data: rows });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await request.json()) as Record<string, unknown>;
  const row = upsertLeaderboardEntry({
    id: typeof body.id === "string" ? body.id : undefined,
    pseudonym: String(body.pseudonym ?? ""),
    gainPct: Number(body.gainPct),
    favoritePairs: String(body.favoritePairs ?? ""),
    accountStatus: String(body.accountStatus ?? ""),
    approved: Boolean(body.approved),
  });
  return NextResponse.json({ data: row });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await request.json()) as { id?: string; approved?: boolean };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const r = setLeaderboardApproved(body.id, Boolean(body.approved));
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ data: r });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  deleteLeaderboardEntry(id);
  return NextResponse.json({ ok: true });
}
