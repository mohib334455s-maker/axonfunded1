import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  deletePayoutCategory,
  deletePayoutProof,
  listPayoutProofsAdmin,
  loadPlatformStore,
  upsertPayoutCategory,
  upsertPayoutProof,
} from "@/lib/server/platform-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const s = loadPlatformStore();
  return NextResponse.json({ data: listPayoutProofsAdmin(), categories: s.payoutProofCategories });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await request.json()) as Record<string, unknown>;
  if (body.action === "category") {
    upsertPayoutCategory({ slug: String(body.slug ?? ""), name: String(body.name ?? "") });
    return NextResponse.json({ ok: true });
  }
  const row = upsertPayoutProof({
    id: typeof body.id === "string" ? body.id : undefined,
    amountUsd: Number(body.amountUsd),
    paidAt: String(body.paidAt ?? ""),
    txUrl: String(body.txUrl ?? ""),
    txId: String(body.txId ?? ""),
    categorySlug: String(body.categorySlug ?? "default"),
    receiptMediaId: typeof body.receiptMediaId === "string" ? body.receiptMediaId : null,
    published: Boolean(body.published),
  });
  return NextResponse.json({ data: row });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = request.nextUrl.searchParams.get("id");
  const cat = request.nextUrl.searchParams.get("category");
  if (cat) {
    deletePayoutCategory(cat);
    return NextResponse.json({ ok: true });
  }
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  deletePayoutProof(id);
  return NextResponse.json({ ok: true });
}
