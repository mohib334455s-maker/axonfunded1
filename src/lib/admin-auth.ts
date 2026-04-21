import type { NextRequest } from "next/server";
import { getAxonAdminSecret } from "@/lib/admin-env";
import { verifyAdminSessionToken } from "@/lib/admin-session-node";

export { getAxonAdminSecret } from "@/lib/admin-env";

export function isAdminRequest(request: NextRequest): boolean {
  const token = request.cookies.get("axon_admin")?.value;
  const secret = getAxonAdminSecret();
  if (!secret) return false;
  return verifyAdminSessionToken(secret, token);
}
