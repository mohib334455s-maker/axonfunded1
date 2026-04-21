import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getScalingPlan, updateScalingPlan, type ScalingStage } from "@/lib/server/platform-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ data: getScalingPlan() });
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await request.json()) as { introHtml?: string; stages?: ScalingStage[] };
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid" }, { status: 400 });
  const plan = updateScalingPlan({
    introHtml: String(body.introHtml ?? ""),
    stages: Array.isArray(body.stages) ? body.stages : [],
  });
  return NextResponse.json({ data: plan });
}
