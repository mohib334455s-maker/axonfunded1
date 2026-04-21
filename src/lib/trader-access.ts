/** Client-visible cookies for mock auth / entitlements (no secrets). */

export const TRADER_COOKIES = {
  session: "axon_session",
  registered: "axon_registered",
  entitlement: "axon_entitlement",
  activePlan: "axon_active_plan",
  /** Stable server-side identity for orders, accounts, payouts (set after register/login). */
  traderId: "axon_trader_id",
  /** Optional: email captured at registration for receipts (non-sensitive). */
  traderEmail: "axon_trader_email",
} as const;

export const SESSION_VALUE = "authenticated";
export const REGISTERED_VALUE = "1";
export type TraderEntitlement = "trial" | "paid";

export const TRIAL_PLAN_ID = "trial_practice";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function setClientCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearClientCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function clearTraderAccessCookies() {
  clearClientCookie(TRADER_COOKIES.session);
  clearClientCookie(TRADER_COOKIES.registered);
  clearClientCookie(TRADER_COOKIES.entitlement);
  clearClientCookie(TRADER_COOKIES.activePlan);
}

export function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const p = part.trim();
    if (p.startsWith(prefix)) {
      return decodeURIComponent(p.slice(prefix.length));
    }
  }
  return null;
}
