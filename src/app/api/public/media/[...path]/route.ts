import { NextRequest, NextResponse } from "next/server";
import { readUploadFile } from "@/lib/server/platform-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const { path: segs } = params;
  const rel = segs.join("/");
  const file = readUploadFile(rel);
  if (!file) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return new NextResponse(new Uint8Array(file.buf), {
    headers: {
      "Content-Type": file.mime,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
