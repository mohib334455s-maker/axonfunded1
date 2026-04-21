/**
 * Edge-compatible admin session verify (middleware). Algorithm must match `admin-session-node.ts`.
 */
export async function verifyAdminSessionTokenEdge(secret: string, token: string | undefined): Promise<boolean> {
  if (!secret || secret.length < 16 || !token) return false;
  const last = token.lastIndexOf(".");
  if (last <= 0) return false;
  const payload = token.slice(0, last);
  const sigHex = token.slice(last + 1);
  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const buf = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const expectedHex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (sigHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < sigHex.length; i++) {
    diff |= sigHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return diff === 0;
}
