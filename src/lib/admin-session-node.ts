import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "axon_admin";
const DEFAULT_TTL_MS = 86_400_000; // 24h

/** HMAC-SHA256 hex; must match Edge verifier in `admin-session-edge.ts`. */
export function signAdminSessionToken(secret: string, ttlMs = DEFAULT_TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const payload = String(exp);
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(secret: string, token: string | undefined): boolean {
  if (!secret || secret.length < 16 || !token) return false;
  const last = token.lastIndexOf(".");
  if (last <= 0) return false;
  const payload = token.slice(0, last);
  const sig = token.slice(last + 1);
  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

export function adminSessionCookieName() {
  return COOKIE_NAME;
}

export { DEFAULT_TTL_MS as ADMIN_SESSION_TTL_MS };
