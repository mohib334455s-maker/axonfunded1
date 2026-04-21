import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  adminSessionCookieName,
  ADMIN_SESSION_TTL_MS,
  signAdminSessionToken,
} from "@/lib/admin-session-node";
import { getAxonAdminSecret } from "@/lib/admin-env";

/** Dev-only fallback if no ADMIN_PASSWORD* in env (bcrypt of `admin123`). */
const DEV_FALLBACK_HASH = "$2a$10$QT5nhcQOycRGurWPUqSBwODUn0daJr03Enrm/dE8hJfHsW8fWznkO";

function adminEmail(): string {
  const e = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (e) return e;
  if (process.env.NODE_ENV !== "production") return "admin@axonfunded.com";
  return "";
}

function verifyAdminPassword(plain: string): boolean {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hash) return bcrypt.compareSync(plain, hash);
  const pw = process.env.ADMIN_PASSWORD;
  if (pw != null && pw !== "") {
    const a = Buffer.from(plain, "utf8");
    const b = Buffer.from(pw, "utf8");
    if (a.length !== b.length) return false;
    try {
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
  if (process.env.NODE_ENV !== "production") {
    return bcrypt.compareSync(plain, DEV_FALLBACK_HASH);
  }
  return false;
}

export async function POST(req: NextRequest) {
  const secret = getAxonAdminSecret();
  if (!secret || secret.length < 16) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 503 });
  }

  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const expectedEmail = adminEmail();

  if (!expectedEmail || email !== expectedEmail || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const token = signAdminSessionToken(secret, ADMIN_SESSION_TTL_MS);
  const secure = process.env.NODE_ENV === "production" || req.headers.get("x-forwarded-proto") === "https";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminSessionCookieName(), token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
  });
  return res;
}
