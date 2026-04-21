import { timingSafeEqual } from "crypto";

export function mtTelemetryBearerOk(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false;
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  const token = header.slice(prefix.length).trim();
  if (!token) return false;
  try {
    const a = Buffer.from(token, "utf8");
    const b = Buffer.from(secret, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
