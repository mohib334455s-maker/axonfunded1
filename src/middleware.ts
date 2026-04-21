import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAxonAdminSecret } from "@/lib/admin-env";
import { verifyAdminSessionTokenEdge } from "@/lib/admin-session-edge";
import {
  hasDashboardEntitlement,
  isTraderRegistered,
  isTraderSession,
} from "@/lib/trader-access-server";

const PROTECTED_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];
const ONBOARDING_ROUTES = ["/get-started", "/trial"];
const CHECKOUT_PREFIX = "/checkout";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = isTraderSession(request);
  const isRegistered = isTraderRegistered(request);
  const hasEntitlement = hasDashboardEntitlement(request);
  const adminSecret = getAxonAdminSecret();
  const adminToken = request.cookies.get("axon_admin")?.value;
  const isAdmin = adminSecret ? await verifyAdminSessionTokenEdge(adminSecret, adminToken) : false;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminLogin = pathname === "/admin/login";
  const isOnboarding = ONBOARDING_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isCheckout = pathname.startsWith(CHECKOUT_PREFIX);

  // Admin route protection
  if (isAdminRoute && !isAdminLogin) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  if (isAdminLogin && isAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Checkout: must be signed in and registered (does not grant paid plans until payment succeeds)
  if (isCheckout) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      loginUrl.searchParams.set("reason", "checkout");
      return NextResponse.redirect(loginUrl);
    }
    if (!isRegistered) {
      const regUrl = new URL("/auth/register", request.url);
      regUrl.searchParams.set("from", pathname);
      regUrl.searchParams.set("reason", "checkout");
      return NextResponse.redirect(regUrl);
    }
  }

  // Onboarding hub & trial setup
  if (isOnboarding) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isRegistered) {
      return NextResponse.redirect(new URL("/auth/register", request.url));
    }
    if (hasEntitlement) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Trader dashboard: session + completed registration + purchase or free trial (not the same as paid SKUs)
  if (isProtected) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isRegistered) {
      const regUrl = new URL("/auth/register", request.url);
      regUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(regUrl);
    }
    if (!hasEntitlement) {
      const hub = new URL("/get-started", request.url);
      hub.searchParams.set("from", pathname);
      return NextResponse.redirect(hub);
    }
  }

  // Logged-in users hitting login/register
  if (isAuthRoute && isLoggedIn) {
    if (!isRegistered) {
      if (pathname.startsWith("/auth/register")) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/auth/register", request.url));
    }
    if (!hasEntitlement) {
      return NextResponse.redirect(new URL("/get-started", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/admin/:path*",
    "/get-started",
    "/get-started/:path*",
    "/trial",
    "/trial/:path*",
    "/checkout/:path*",
  ],
};
