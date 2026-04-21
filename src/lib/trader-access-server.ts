import type { NextRequest } from "next/server";
import { REGISTERED_VALUE, SESSION_VALUE, TRADER_COOKIES, type TraderEntitlement } from "./trader-access";

export function isTraderSession(request: NextRequest): boolean {
  return request.cookies.get(TRADER_COOKIES.session)?.value === SESSION_VALUE;
}

export function isTraderRegistered(request: NextRequest): boolean {
  return request.cookies.get(TRADER_COOKIES.registered)?.value === REGISTERED_VALUE;
}

export function getTraderEntitlement(request: NextRequest): TraderEntitlement | null {
  const v = request.cookies.get(TRADER_COOKIES.entitlement)?.value;
  if (v === "trial" || v === "paid") return v;
  return null;
}

export function hasDashboardEntitlement(request: NextRequest): boolean {
  return getTraderEntitlement(request) !== null;
}

/** Same rules as dashboard middleware, for `cookies()` in Route Handlers. */
export function isTraderDashboardUserFromCookieJar(jar: {
  get(name: string): { value: string } | undefined;
}): boolean {
  if (jar.get(TRADER_COOKIES.session)?.value !== SESSION_VALUE) return false;
  if (jar.get(TRADER_COOKIES.registered)?.value !== REGISTERED_VALUE) return false;
  const e = jar.get(TRADER_COOKIES.entitlement)?.value;
  return e === "trial" || e === "paid";
}
