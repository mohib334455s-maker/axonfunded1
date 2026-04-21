import { NextRequest, NextResponse } from "next/server";
import { addTicket, listTicketsForTrader } from "@/lib/server/trader-store";
import { getTraderIdFromRequest } from "@/lib/server/trader-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const traderId = getTraderIdFromRequest(req);
  if (!traderId) {
    return NextResponse.json({ data: [] });
  }
  return NextResponse.json({ data: listTicketsForTrader(traderId) });
}

export async function POST(req: NextRequest) {
  const traderId = getTraderIdFromRequest(req);
  if (!traderId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as { subject?: string; message?: string };
  const subject = typeof body.subject === "string" ? body.subject : "";
  const message = typeof body.message === "string" ? body.message : "";
  if (!subject.trim() || !message.trim()) {
    return NextResponse.json({ error: "subject_and_message_required" }, { status: 400 });
  }
  const t = addTicket(traderId, subject, message);
  return NextResponse.json({ data: t });
}
