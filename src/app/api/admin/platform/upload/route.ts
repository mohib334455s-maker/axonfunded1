import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { saveUploadBuffer } from "@/lib/server/platform-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData();
  const file = form.get("file");
  const subdir = String(form.get("subdir") ?? "receipts");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const { mediaId } = saveUploadBuffer(subdir.replace(/\.\./g, ""), file.name || "upload.bin", buf);
  return NextResponse.json({ mediaId, url: `/api/public/media/${mediaId}` });
}
