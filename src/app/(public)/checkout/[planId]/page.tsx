"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Bitcoin,
  Building2,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Shield,
  Zap,
  Clock,
  ChevronRight,
  AlertCircle,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getClientCookie, setClientCookie, TRADER_COOKIES, type TraderEntitlement } from "@/lib/trader-access";
import { PLAN_A_COLUMNS, formatPlanFeeUsd } from "@/lib/plan-a-pricing";
import { useCheckoutDict } from "@/hooks/useCheckoutDict";

type CheckoutPlan = {
  name: string;
  accountSize: string;
  price: number;
  phase1: string;
  phase2: string;
  dd: string;
  split: string;
  popular?: boolean;
};

const PLANS: Record<string, CheckoutPlan> = Object.fromEntries(
  PLAN_A_COLUMNS.map((c) => [
    c.checkoutSlug,
    {
      name: `${c.tierName}`,
      accountSize: `$${c.accountSize.toLocaleString("en-US")}`,
      price: c.price,
      phase1: "8%",
      phase2: "4%",
      dd: "12%",
      split: "90%",
      popular: c.checkoutSlug === "legendary",
    },
  ])
) as Record<string, CheckoutPlan>;

type Props = { params: { planId: string } };

function interpolate(template: string, vars: Record<string, string>) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, v);
  }
  return out;
}

export default function CheckoutPage({ params }: Props) {
  const { t } = useCheckoutDict();
  const planId = (params.planId ?? "").toLowerCase();
  const router = useRouter();
  const plan = PLANS[planId];

  const [step, setStep] = useState<"method" | "details" | "confirm" | "success">("method");
  const [method, setMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "", name: "", zip: "" });
  const [copied, setCopied] = useState(false);
  /** Purchases attach to your email-backed profile (not anonymous browser-only id). */
  const [sessionReady, setSessionReady] = useState<{
    traderId: string | null;
    email: string | null;
  } | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [emailDelivery, setEmailDelivery] = useState<
    "sent" | "skipped_no_address" | "failed" | "not_configured" | null
  >(null);
  const [legalAccepted, setLegalAccepted] = useState(false);

  const canCompletePurchase =
    Boolean(sessionReady?.traderId) && Boolean((sessionReady?.email ?? "").trim());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch("/api/trader/session", { credentials: "include", cache: "no-store" });
        const j = (await r.json()) as { traderId?: string | null; email?: string | null };
        if (!cancelled) {
          const tid = (j.traderId || getClientCookie(TRADER_COOKIES.traderId) || null) as string | null;
          const em = (j.email || getClientCookie(TRADER_COOKIES.traderEmail) || null) as string | null;
          setSessionReady({ traderId: tid, email: em?.trim() ? em : null });
        }
      } catch {
        if (!cancelled) {
          const tid = getClientCookie(TRADER_COOKIES.traderId);
          const em = getClientCookie(TRADER_COOKIES.traderEmail);
          setSessionReady({ traderId: tid, email: em?.trim() ? em : null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const paymentMethods = useMemo(
    () =>
      [
        { id: "card" as const, icon: CreditCard, label: t("methods.card.label"), desc: t("methods.card.desc") },
        { id: "crypto" as const, icon: Bitcoin, label: t("methods.crypto.label"), desc: t("methods.crypto.desc") },
        { id: "bank" as const, icon: Building2, label: t("methods.bank.label"), desc: t("methods.bank.desc") },
      ] as const,
    [t]
  );

  const cardDigits = useMemo(() => cardForm.number.replace(/\D/g, ""), [cardForm.number]);
  const cardBrandLabel = useMemo(() => {
    if (!cardDigits) return "";
    if (/^4/.test(cardDigits)) return "Visa";
    if (/^5[1-5]/.test(cardDigits)) return "Mastercard";
    if (/^3[47]/.test(cardDigits)) return "Amex";
    return "";
  }, [cardDigits]);

  if (!plan) {
    return (
      <div className="pt-32 text-center min-h-screen px-4">
        <p className="text-neutral-400">{t("planNotFound")}</p>
        <Link href="/challenge" className="text-gold-500 mt-4 inline-block hover:underline">
          {t("viewPlans")} →
        </Link>
      </div>
    );
  }

  const handlePay = async () => {
    if (!canCompletePurchase) {
      toast.error("Register or log in with your email first — purchases are saved to your profile, not only this browser.");
      return;
    }
    if (!legalAccepted) {
      toast.error(t("legalAcceptRequired"));
      return;
    }
    setProcessing(true);
    setReceiptId(null);
    setOrderId(null);
    setEmailDelivery(null);
    try {
      const res = await fetch("/api/orders/complete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug: planId,
          paymentMethod: method || "card",
        }),
      });
      const data = (await res.json()) as {
        receiptId?: string;
        order?: { id: string };
        error?: string;
        hint?: string;
        emailStatus?: "sent" | "skipped_no_address" | "failed" | "not_configured";
      };
      if (!res.ok) {
        toast.error(data.hint || data.error || `Checkout failed (${res.status})`);
        return;
      }
      if (data.receiptId) setReceiptId(data.receiptId);
      if (data.order?.id) setOrderId(data.order.id);
      if (data.emailStatus) setEmailDelivery(data.emailStatus);
      const paid: TraderEntitlement = "paid";
      setClientCookie(TRADER_COOKIES.entitlement, paid);
      setClientCookie(TRADER_COOKIES.activePlan, planId);
      setStep("success");
      toast.success("Order recorded — check Trading accounts for MT status.");
      if (data.emailStatus === "sent") {
        toast.message("Email sent", { description: "Check your inbox (and spam) for the receipt." });
      } else if (data.emailStatus === "not_configured") {
        toast.message("Email not configured", {
          description: "Order is saved. Set RESEND_API_KEY or SMTP_* on the server to send receipts.",
        });
      } else if (data.emailStatus === "failed") {
        toast.message("Email delivery failed", {
          description: "Your order is still valid — use Trading accounts and tickets if you need the receipt resent.",
        });
      }
    } catch {
      toast.error("Network error — could not complete checkout.");
    } finally {
      setProcessing(false);
    }
  };

  const formatCard = (val: string) => val.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (val: string) => val.replace(/\D/g, "").replace(/^(.{2})(.*)/, "$1/$2").slice(0, 5);

  const segmentLabel = (id: "card" | "crypto" | "bank") =>
    id === "card" ? t("segmentCard") : id === "crypto" ? t("segmentCrypto") : t("segmentBank");

  const copyAddress = (addr: string) => {
    void navigator.clipboard.writeText(addr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    toast.success(t("copied"));
  };

  const amountStr = formatPlanFeeUsd(plan.price);
  const activatedPlanLabel = `${plan.name} ${plan.accountSize}`;

  return (
    <div className="pt-20 min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {step !== "success" && (
          <Link
            href="/challenge"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-gold-500 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> {t("backToPlans")}
          </Link>
        )}

        {step !== "success" && sessionReady && !canCompletePurchase && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-100/95 leading-relaxed">
            <span className="font-semibold text-amber-200">Sign in required.</span>{" "}
            Your challenge purchase is tied to the email on your Axon profile (not just this device).{" "}
            <Link href="/auth/register" className="text-gold-400 font-semibold hover:underline">
              Register
            </Link>{" "}
            or{" "}
            <Link href="/auth/login" className="text-gold-400 font-semibold hover:underline">
              Log in
            </Link>{" "}
            before paying.
          </div>
        )}

        <AnimatePresence>
          {step === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto text-center py-16"
            >
              <div className="w-20 h-20 rounded-3xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-3xl font-black text-white mb-3">{t("paymentConfirmed")}</h1>
              <p className="text-neutral-400 mb-2">
                {interpolate(t("activatedLine"), { plan: activatedPlanLabel })}
              </p>
              <p className="text-sm text-neutral-500 mb-4">{t("credentialsLine")}</p>
              {(receiptId || orderId) && (
                <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-left text-xs text-neutral-400 max-w-md mx-auto mb-4 space-y-1.5">
                  {orderId && (
                    <p>
                      <span className="text-neutral-500">Order</span>{" "}
                      <span className="font-mono text-gold-300">{orderId}</span>
                    </p>
                  )}
                  {receiptId && (
                    <p>
                      <span className="text-neutral-500">Receipt</span>{" "}
                      <span className="font-mono text-white">{receiptId}</span>
                    </p>
                  )}
                </div>
              )}
              {emailDelivery === "sent" && (
                <p className="text-sm text-emerald-400/95 max-w-md mx-auto mb-3">
                  A confirmation email was sent to your registered address (check spam).
                </p>
              )}
              {emailDelivery === "not_configured" && (
                <p className="text-sm text-amber-400/95 max-w-md mx-auto mb-3">
                  Outbound email is not configured on the server yet — no email was sent, but your order is saved.
                </p>
              )}
              {emailDelivery === "failed" && (
                <p className="text-sm text-amber-400/95 max-w-md mx-auto mb-3">
                  Email could not be delivered — your order is still valid; use Tickets if you need a copy.
                </p>
              )}
              <p className="text-[11px] text-neutral-600 max-w-md mx-auto mb-6 leading-relaxed">
                This build saves your order to your profile and shows MT status under Trading accounts. There is no real card charge here — production will use Stripe for cards.
              </p>
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/accounts")}
                  className="btn-gold py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Trading accounts
                </button>
                <Link
                  href="/dashboard/support"
                  className="btn-outline py-3 rounded-xl text-sm font-semibold text-center border border-gold-500/25"
                >
                  Open a ticket (24h SLA)
                </Link>
                <button
                  type="button"
                  onClick={() => router.push("/get-started")}
                  className="btn-outline py-3 rounded-xl text-sm font-semibold text-center"
                >
                  Next steps checklist
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="text-xs text-neutral-500 hover:text-gold-500 py-1"
                >
                  {t("goDashboard")}
                </button>
                <Link href="/challenge" className="btn-outline py-3 rounded-xl text-sm font-semibold text-center">
                  {t("buyAnother")}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== "success" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                {(
                  [
                    ["method", t("stepMethod")],
                    ["details", t("stepDetails")],
                    ["confirm", t("stepConfirm")],
                  ] as const
                ).map(([s, label], i) => {
                  const steps = ["method", "details", "confirm"] as const;
                  const current = steps.indexOf(step);
                  const thisStep = steps.indexOf(s);
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          current === thisStep
                            ? "bg-gold-500/15 text-gold-500 border border-gold-500/30"
                            : current > thisStep
                              ? "bg-success/10 text-success border border-success/20"
                              : "bg-white/5 text-neutral-600 border border-white/5"
                        }`}
                      >
                        {current > thisStep ? <CheckCircle2 className="w-3 h-3" /> : <span>{i + 1}</span>}
                        {label}
                      </div>
                      {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-neutral-700" />}
                    </div>
                  );
                })}
              </div>

              {step === "method" && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="rounded-2xl border border-gold-500/15 bg-gradient-to-br from-gold-500/[0.07] via-black/40 to-black/60 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gold-gradient flex items-center justify-center shadow-[0_0_24px_rgba(255,215,0,0.25)]">
                        <Shield className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{t("secureTitle")}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{t("secureSubtitle")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-300/90">
                      <Lock className="w-3.5 h-3.5" />
                      TLS
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white mb-3">{t("chooseMethod")}</h2>
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-1.5 shadow-inner">
                      <div className="relative flex gap-1">
                        {paymentMethods.map((m) => {
                          const active = method === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setMethod(m.id)}
                              className={`relative flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-center transition-colors z-10 ${
                                active ? "text-black" : "text-neutral-400 hover:text-neutral-200"
                              }`}
                            >
                              {active && (
                                <motion.div
                                  layoutId="checkout-method-pill"
                                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FFE57F] via-[#FFD700] to-[#C9A227] shadow-[0_8px_28px_rgba(255,215,0,0.25)]"
                                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                                />
                              )}
                              <m.icon className="relative z-10 w-5 h-5" />
                              <span className="relative z-10 text-[11px] sm:text-xs font-bold uppercase tracking-wide">
                                {segmentLabel(m.id)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {method ? (
                      <motion.div
                        key={method}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-2xl border border-white/[0.08] bg-surface/80 backdrop-blur-sm p-5"
                      >
                        {paymentMethods
                          .filter((x) => x.id === method)
                          .map((m) => (
                            <div key={m.id} className="flex gap-4">
                              <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center shrink-0">
                                <m.icon className="w-5 h-5 text-gold-400" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{m.label}</p>
                                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{m.desc}</p>
                              </div>
                            </div>
                          ))}
                      </motion.div>
                    ) : (
                      <p className="text-xs text-neutral-600 px-1">{t("selectMethodToast")}</p>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={() => {
                      if (!method) {
                        toast.error(t("selectMethodToast"));
                        return;
                      }
                      setStep("details");
                    }}
                    disabled={!method}
                    className="w-full btn-gold py-3.5 rounded-xl text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {t("continue")} <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === "details" && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <h2 className="text-lg font-bold text-white">
                    {method === "card"
                      ? t("cardDetails")
                      : method === "crypto"
                        ? t("cryptoSend")
                        : t("bankDetails")}
                  </h2>

                  {method === "card" && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
                      <div className="lg:col-span-3 space-y-4">
                        <div>
                          <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">
                            {t("cardNumber")}
                          </label>
                          <div className="relative group">
                            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-gold-500/80 transition-colors" />
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-number"
                              placeholder={t("placeholders.card")}
                              maxLength={19}
                              value={cardForm.number}
                              onChange={(e) => setCardForm((p) => ({ ...p, number: formatCard(e.target.value) }))}
                              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-[15px] font-mono tracking-wide placeholder-neutral-700 focus:outline-none focus:border-gold-500/45 focus:ring-1 focus:ring-gold-500/20"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">
                              {t("expiry")}
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-exp"
                              placeholder={t("placeholders.expiry")}
                              maxLength={5}
                              value={cardForm.expiry}
                              onChange={(e) => setCardForm((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-mono placeholder-neutral-700 focus:outline-none focus:border-gold-500/45"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">
                              {t("cvv")}
                            </label>
                            <input
                              type="password"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              placeholder="•••"
                              maxLength={4}
                              value={cardForm.cvv}
                              onChange={(e) =>
                                setCardForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))
                              }
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-mono placeholder-neutral-700 focus:outline-none focus:border-gold-500/45"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">
                            {t("cardholder")}
                          </label>
                          <input
                            type="text"
                            autoComplete="cc-name"
                            placeholder={t("placeholders.nameOnCard")}
                            value={cardForm.name}
                            onChange={(e) => setCardForm((p) => ({ ...p, name: e.target.value }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-neutral-700 focus:outline-none focus:border-gold-500/45"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">
                            {t("billingZip")}
                          </label>
                          <input
                            type="text"
                            autoComplete="postal-code"
                            placeholder="10001"
                            maxLength={12}
                            value={cardForm.zip}
                            onChange={(e) => setCardForm((p) => ({ ...p, zip: e.target.value.slice(0, 12) }))}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-neutral-700 focus:outline-none focus:border-gold-500/45"
                          />
                        </div>
                      </div>
                      <div className="lg:col-span-2 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                          {t("cardPreviewTitle")}
                        </p>
                        <div
                          className="relative aspect-[1.586/1] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(30,28,20,0.98) 0%, rgba(12,10,8,0.99) 40%, rgba(25,22,14,0.98) 100%)",
                          }}
                        >
                          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(255,215,0,0.35),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_35%)]" />
                          <div className="relative h-full flex flex-col justify-between p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-3">
                              <div className="h-9 w-12 rounded-md bg-gradient-to-br from-amber-200/90 to-amber-600/80 border border-white/20 shadow-inner" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gold-300/90">
                                {cardBrandLabel || "CARD"}
                              </span>
                            </div>
                            <div>
                              <p className="font-mono text-lg sm:text-xl tracking-[0.2em] text-white/95 drop-shadow-sm">
                                •••• &nbsp; •••• &nbsp; •••• &nbsp;{" "}
                                <span className="text-gold-200">
                                  {cardDigits.length >= 4 ? cardDigits.slice(-4) : "••••"}
                                </span>
                              </p>
                              <div className="mt-4 flex items-end justify-between gap-3">
                                <div>
                                  <p className="text-[9px] uppercase tracking-wider text-neutral-500">{t("cardholder")}</p>
                                  <p className="text-sm font-medium text-white truncate max-w-[160px]">
                                    {cardForm.name || "—"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] uppercase tracking-wider text-neutral-500">{t("expiresLabel")}</p>
                                  <p className="text-sm font-mono text-white">{cardForm.expiry || "MM/YY"}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-neutral-600 mt-2 leading-relaxed">{t("cardPreviewHint")}</p>
                      </div>
                    </div>
                  )}

                  {method === "crypto" && (
                    <div className="space-y-4">
                      <p className="text-sm text-neutral-400">
                        {interpolate(t("cryptoInstruction"), { amount: amountStr })}
                      </p>
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-gold-500/20 bg-gold-500/5">
                        <code className="flex-1 text-xs text-gold-400 font-mono break-all">
                          TXk9a3mRpQe7b2nKwZ4dL8vYcF6sH1jN
                        </code>
                        <button
                          type="button"
                          onClick={() => copyAddress("TXk9a3mRpQe7b2nKwZ4dL8vYcF6sH1jN")}
                          className="flex-shrink-0 p-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white transition-colors"
                        >
                          {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/8 border border-warning/20">
                        <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-warning/80">{t("cryptoWarning")}</p>
                      </div>
                      <p className="text-xs text-neutral-500">{t("cryptoNote")}</p>
                    </div>
                  )}

                  {method === "bank" && (
                    <div className="space-y-3">
                      {[
                        { label: t("bankFields.beneficiary"), value: "Axon Funded Ltd." },
                        { label: t("bankFields.iban"), value: "GB29 NWBK 6016 1331 9268 19" },
                        { label: t("bankFields.bic"), value: "NWBKGB2L" },
                        {
                          label: t("bankFields.reference"),
                          value: `AXON-${plan.name.toUpperCase()}-${Date.now().toString().slice(-6)}`,
                        },
                        { label: t("bankFields.amount"), value: `${amountStr} USD` },
                      ].map((f) => (
                        <div
                          key={f.label}
                          className="flex items-center justify-between p-3 rounded-xl border border-white/8 bg-surface"
                        >
                          <span className="text-xs text-neutral-500">{f.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-mono">{f.value}</span>
                            <button
                              type="button"
                              onClick={() => copyAddress(f.value)}
                              className="p-1 rounded text-neutral-600 hover:text-gold-500 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-neutral-500 p-3">{t("bankNote")}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep("method")} className="btn-outline px-5 py-3 rounded-xl text-sm font-semibold">
                      {t("back")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("confirm")}
                      className="flex-1 btn-gold py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    >
                      {t("reviewOrder")} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "confirm" && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <h2 className="text-lg font-bold text-white">{t("confirmOrder")}</h2>
                  <div className="rounded-2xl border border-white/8 bg-surface divide-y divide-white/5">
                    {[
                      { label: t("plan"), value: `${plan.name} ${t("challengeWord")}` },
                      { label: t("accountSize"), value: plan.accountSize },
                      { label: t("phase1Target"), value: plan.phase1 },
                      { label: t("maxDd"), value: plan.dd },
                      { label: t("profitSplit"), value: plan.split },
                      {
                        label: t("paymentMethod"),
                        value: paymentMethods.find((m) => m.id === method)?.label ?? "",
                      },
                      { label: t("total"), value: amountStr, bold: true },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between px-5 py-3.5">
                        <span className="text-sm text-neutral-500">{row.label}</span>
                        <span
                          className={`text-sm ${"bold" in row && row.bold ? "font-black text-gold-500 font-mono" : "text-white font-medium"}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20">
                    <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-cyan-100/90 leading-relaxed">
                      <strong className="text-cyan-200">Demo checkout:</strong> your order and evaluation row are saved to your account. This page does not charge a real card — when live, payment runs through Stripe and webhooks finalize the order.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/3 border border-white/5">
                    <Shield className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {t("legalAckBefore")}{" "}
                      <Link href="/legal/terms" target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline">
                        {t("termsLink")}
                      </Link>
                      {t("legalAckMid")}
                      <Link
                        href="/legal/risk-disclaimer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-500 hover:underline"
                      >
                        {t("riskLink")}
                      </Link>
                      {t("legalAckAfter")}
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer select-none rounded-xl border border-gold-500/25 bg-gold-500/[0.06] p-3.5">
                    <input
                      type="checkbox"
                      checked={legalAccepted}
                      onChange={(e) => setLegalAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-black/50 accent-gold-500"
                      required
                    />
                    <span className="text-xs text-neutral-200 leading-relaxed">{t("legalAcceptCheckbox")}</span>
                  </label>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-500 px-0.5">
                    <Link href="/legal/terms" target="_blank" rel="noopener noreferrer" className="text-gold-500/90 hover:underline">
                      {t("termsLink")}
                    </Link>
                    <span className="text-neutral-700">·</span>
                    <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-500/90 hover:underline">
                      {t("privacyLink")}
                    </Link>
                    <span className="text-neutral-700">·</span>
                    <Link href="/legal/refund" target="_blank" rel="noopener noreferrer" className="text-gold-500/90 hover:underline">
                      {t("refundLink")}
                    </Link>
                    <span className="text-neutral-700">·</span>
                    <Link href="/legal/risk-disclaimer" target="_blank" rel="noopener noreferrer" className="text-gold-500/90 hover:underline">
                      {t("riskLink")}
                    </Link>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep("details")} className="btn-outline px-5 py-3 rounded-xl text-sm font-semibold">
                      {t("back")}
                    </button>
                    <motion.button
                      type="button"
                      onClick={() => void handlePay()}
                      disabled={processing || !canCompletePurchase || !legalAccepted}
                      whileHover={{ scale: processing ? 1 : 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 btn-gold py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {processing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                          {t("processing")}
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          {interpolate(t("payActivate"), { amount: amountStr })}
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <div className="rounded-2xl border border-gold-500/20 bg-gold-500/5 p-5 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
                    <Zap className="w-4 h-4 text-black fill-black" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {plan.name} {t("challengeWord")}
                    </p>
                    <p className="text-xs text-gold-500">
                      {plan.accountSize} {t("accountWord")}
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5 mb-4">
                  {[
                    { label: t("phase1Target"), value: plan.phase1 },
                    { label: t("phase2Target"), value: plan.phase2 },
                    { label: t("maxDd"), value: plan.dd },
                    { label: t("dailyDd"), value: "5%" },
                    { label: t("profitSplit"), value: plan.split },
                    { label: t("noTimeLimit"), value: "✓" },
                  ].map((f) => (
                    <div key={f.label} className="flex justify-between text-xs">
                      <span className="text-neutral-500">{f.label}</span>
                      <span className="text-white font-semibold">{f.value}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                  <span className="text-sm text-neutral-400">{t("total")}</span>
                  <span className="text-2xl font-black text-white">{amountStr}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { icon: Lock, text: t("ssl") },
                    { icon: Clock, text: t("instantActivation") },
                    { icon: Shield, text: t("rulesBlurb") },
                  ].map((b) => (
                    <div key={b.text} className="flex items-center gap-2 text-xs text-neutral-500">
                      <b.icon className="w-3.5 h-3.5 text-gold-500/60" />
                      {b.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
