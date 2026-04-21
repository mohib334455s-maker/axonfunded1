import { NextResponse } from "next/server";
import { adminSessionCookieName } from "@/lib/admin-session-node";

export async function POST(req: Request) {
  const secure = process.env.NODE_ENV === "production" || req.headers.get("x-forwarded-proto") === "https";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminSessionCookieName(), "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
