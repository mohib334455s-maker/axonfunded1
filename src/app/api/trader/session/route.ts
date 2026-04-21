import { NextRequest, NextResponse } from "next/server";
import { TRADER_COOKIES } from "@/lib/trader-access";
import { ensureAnonymousTrader, getOrCreateTraderByEmail, getTrader } from "@/lib/server/trader-store";
import { getTraderIdFromRequest } from "@/lib/server/trader-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Create or resolve trader profile; links email ↔ stable id for purchases. */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      name?: string;
      mode?: "register" | "login";
      referralCode?: string;
    };
    const existing = getTraderIdFromRequest(req);

    if (body.email?.trim()) {
      const ref = body.mode === "register" ? body.referralCode : undefined;
      const t = getOrCreateTraderByEmail(body.email, body.name, ref);

      const res = NextResponse.json({ traderId: t.id, email: t.email, name: t.name });
      res.cookies.set(TRADER_COOKIES.traderId, t.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 400,
        sameSite: "lax",
        httpOnly: false,
      });
      if (t.email) {
        res.cookies.set(TRADER_COOKIES.traderEmail, t.email, {
          path: "/",
          maxAge: 60 * 60 * 24 * 400,
          sameSite: "lax",
          httpOnly: false,
        });
      }
      return res;
    }

    if (existing && getTrader(existing)) {
      return NextResponse.json({ traderId: existing });
    }

    const anon = ensureAnonymousTrader(null);
    const res = NextResponse.json({ traderId: anon.id, anonymous: true });
    res.cookies.set(TRADER_COOKIES.traderId, anon.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      sameSite: "lax",
      httpOnly: false,
    });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "session_error";
    console.error("[trader/session]", msg, e);
    return NextResponse.json({ error: msg, hint: "Check server terminal logs. Ensure the app can write to .data/ (trader-store.json)." }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const id = getTraderIdFromRequest(req);
  if (!id) return NextResponse.json({ traderId: null as string | null });
  const t = getTrader(id);
  return NextResponse.json({
    traderId: id,
    email: t?.email ?? null,
    name: t?.name ?? null,
  });
}
