/** Shared env reads for admin auth (Edge-safe — no Node `crypto`). */
export function getAxonAdminSecret(): string {
  const s = process.env.AXON_ADMIN_SECRET?.trim();
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return "axon-dev-admin-secret-please-set-AXON_ADMIN_SECRET";
}
