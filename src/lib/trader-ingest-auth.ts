import { timingSafeEqual } from "crypto";

export function bearerMatchesSecret(headerValue: string | null, secret: string): boolean {
  if (!headerValue || !secret) return false;
  const prefix = "Bearer ";
  if (!headerValue.startsWith(prefix)) return false;
  const token = headerValue.slice(prefix.length).trim();
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

/** External account id: letters, digits, dot, underscore, hyphen. */
export function isValidIngestAccountId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  return /^[a-zA-Z0-9_.-]{1,64}$/.test(id);
}
