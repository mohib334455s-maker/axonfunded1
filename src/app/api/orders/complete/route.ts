import { NextRequest, NextResponse } from "next/server";
import { TRADER_COOKIES } from "@/lib/trader-access";
import { creditAffiliateForPaidOrder } from "@/lib/server/platform-store";
import { createPaidOrder, getTrader, listOrdersForTrader } from "@/lib/server/trader-store";
import { getTraderIdFromRequest } from "@/lib/server/trader-request";
import { sendOrderReceiptEmail } from "@/lib/server/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Records a paid challenge order + evaluation account row (demo: simulated payment).
 * Production: replace body.paymentIntent with Stripe `checkout.session.completed` webhook.
 */
export async function POST(req: NextRequest) {
  try {
    const traderId = getTraderIdFromRequest(req);
    if (!traderId) {
      return NextResponse.json(
        { error: "missing_trader_session", hint: "Register or log in so purchases attach to your profile." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as {
      planSlug?: string;
      paymentMethod?: string;
      simulateOnly?: boolean;
    };
    const planSlug = typeof body.planSlug === "string" ? body.planSlug.trim().toLowerCase() : "";
    if (!planSlug) {
      return NextResponse.json({ error: "planSlug is required" }, { status: 400 });
    }

    const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod : "unknown";
    const { order, account, certificate } = createPaidOrder({
      traderId,
      planSlug,
      paymentMethod,
      paymentChannel: "demo_simulated",
    });

    const buyer = getTrader(traderId);
    if (buyer?.referredByTraderId && order.amountUsd > 0) {
      creditAffiliateForPaidOrder(traderId, order.amountUsd, buyer.referredByTraderId);
    }

    const trader = getTrader(traderId);
    const traderEmail = trader?.email?.trim();
    let emailSent = false;
    let emailStatus: "sent" | "skipped_no_address" | "failed" | "not_configured" = "skipped_no_address";
    if (traderEmail) {
      const mailResult = await sendOrderReceiptEmail({ to: traderEmail, order, account });
      if (mailResult.ok) {
        emailSent = true;
        emailStatus = "sent";
      } else if (mailResult.error === "not_configured") {
        emailStatus = "not_configured";
      } else {
        emailStatus = "failed";
      }
    }

    const res = NextResponse.json({
      order,
      tradingAccount: account,
      certificate,
      receiptId: order.receiptId,
      emailSent,
      emailStatus,
      message:
        "Order recorded. MT credentials are issued by operations — typically within **24 business hours**. Track status under **Trading accounts** and open a **ticket** if delayed.",
    });
    res.cookies.set(TRADER_COOKIES.entitlement, "paid", { path: "/", maxAge: 60 * 60 * 24 * 400, sameSite: "lax" });
    res.cookies.set(TRADER_COOKIES.activePlan, planSlug, { path: "/", maxAge: 60 * 60 * 24 * 400, sameSite: "lax" });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "order_failed";
    if (msg === "concurrent_challenge_cap") {
      return NextResponse.json(
        {
          error: msg,
          hint: `You already have the maximum number of active or provisioning challenges. Complete or wait for credentials before buying another (see MAX_CONCURRENT_CHALLENGES_PER_TRADER / rules §13).`,
        },
        { status: 409 }
      );
    }
    const status = msg === "invalid_plan" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function GET(req: NextRequest) {
  const traderId = getTraderIdFromRequest(req);
  if (!traderId) return NextResponse.json({ data: [] });
  return NextResponse.json({ data: listOrdersForTrader(traderId) });
}
