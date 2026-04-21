import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { assignTradingAccountCredentials, listProvisioningQueue } from "@/lib/server/trader-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ data: listProvisioningQueue() });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as {
    accountId?: string;
    server?: string;
    login?: string;
    password?: string;
    actor?: string;
  };
  const accountId = typeof body.accountId === "string" ? body.accountId.trim() : "";
  const server = typeof body.server === "string" ? body.server.trim() : "";
  const login = typeof body.login === "string" ? body.login.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!accountId || !server || !login || !password) {
    return NextResponse.json({ error: "accountId_server_login_password_required" }, { status: 400 });
  }
  const updated = assignTradingAccountCredentials({
    accountId,
    server,
    login,
    password,
    actor: body.actor,
  });
  if (!updated) return NextResponse.json({ error: "account_not_found" }, { status: 404 });
  return NextResponse.json({ data: updated });
}
