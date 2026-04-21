"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { BriefcaseBusiness, TrendingUp, TrendingDown, ShieldCheck, Plus, Clock, Server, KeyRound } from "lucide-react";
import Link from "next/link";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

type TradingAccountRow = {
  id: string;
  orderId: string;
  tierName: string;
  accountSizeUsd: number;
  phase: 1 | 2;
  server: string;
  login: string;
  password: string;
  status: "awaiting_credentials" | "active" | "breached";
  credentialsEtaNote: string;
  updatedAt: string;
};

type OrderRow = {
  id: string;
  planSlug: string;
  receiptId: string;
  status: string;
  paidAt: string;
};

const card: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" },
  }),
};

function statusBadgeClass(status: TradingAccountRow["status"]) {
  if (status === "active") return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
  if (status === "breached") return "bg-rose-500/10 border-rose-500/20 text-rose-400";
  return "bg-amber-500/10 border-amber-500/20 text-amber-400";
}

function statusLabel(status: TradingAccountRow["status"]) {
  if (status === "active") return "Active";
  if (status === "breached") return "Breached";
  return "Awaiting MT5";
}

export function AccountsTradingView() {
  const { dict } = useDashboardPagesDict();
  const d = dict.accounts;
  const [accounts, setAccounts] = useState<TradingAccountRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [linked, setLinked] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/dashboard/accounts", { credentials: "include", cache: "no-store" });
        const payload = (await res.json()) as {
          accounts?: TradingAccountRow[];
          orders?: OrderRow[];
          linked?: boolean;
        };
        if (cancelled) return;
        setAccounts(Array.isArray(payload.accounts) ? payload.accounts : []);
        setOrders(Array.isArray(payload.orders) ? payload.orders : []);
        setLinked(payload.linked !== false);
      } catch {
        if (!cancelled) {
          setAccounts([]);
          setOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const total = accounts.length;
    const active = accounts.filter((a) => a.status === "active").length;
    const pending = accounts.filter((a) => a.status === "awaiting_credentials").length;
    return [
      { label: d.summaryTotal, value: String(total), icon: BriefcaseBusiness },
      { label: d.summaryActive, value: String(active), icon: ShieldCheck },
      { label: d.summaryBest, value: pending > 0 ? String(pending) : "—", icon: TrendingUp },
      { label: d.summaryDd, value: total > 0 ? `${orders.filter((o) => o.status === "paid").length} paid` : "—", icon: TrendingDown },
    ];
  }, [accounts, orders, d.summaryTotal, d.summaryActive, d.summaryBest, d.summaryDd]);

  return (
    <div className="dashboard-page lg:grid lg:grid-cols-[minmax(0,220px)_1fr] lg:gap-10 lg:items-start space-y-8 lg:space-y-0">
      <motion.aside
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-5 lg:sticky lg:top-24"
      >
        <div className="rounded-2xl border border-gold-500/15 bg-black/25 p-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-500/50">{d.railLabel}</p>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">{d.title}</h1>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{d.subtitle}</p>
          </div>
          <ol className="space-y-2 text-[11px] text-neutral-600 border-t border-white/5 pt-3">
            <li className="flex gap-2">
              <span className="font-mono text-gold-500/80">01</span>
              <span>{d.railStep1}</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-gold-500/80">02</span>
              <span>{d.railStep2}</span>
            </li>
          </ol>
          <Link
            href="/challenge"
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-semibold text-xs transition-all shadow-[0_4px_14px_rgba(255,215,0,0.25)]"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            {d.newChallenge}
          </Link>
        </div>
      </motion.aside>

      <div className="space-y-8 min-w-0">
        {!linked && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-100/90">
            You are not linked to a saved trader profile on this device.{" "}
            <Link href="/auth/login" className="text-gold-400 font-semibold hover:underline">
              Log in
            </Link>{" "}
            to see accounts tied to your purchases.
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={card}
              initial="hidden"
              animate="show"
              className="rounded-2xl border border-gold-500/15 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] p-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <p className="text-[11px] text-neutral-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-lg font-bold text-white">{loading ? "…" : s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {!loading && accounts.length === 0 && (
            <div className="lg:col-span-2 rounded-2xl border border-dashed border-white/10 bg-black/20 py-16 text-center text-sm text-neutral-500">
              {d.emptyList}
            </div>
          )}
          {accounts.map((acc, i) => {
            const typeLabel = acc.phase === 1 ? d.types.p1 : d.types.p2;
            return (
              <motion.div
                key={acc.id}
                custom={i + 4}
                variants={card}
                initial="hidden"
                animate="show"
                className="rounded-2xl border border-gold-500/15 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-500 font-mono truncate">{acc.id}</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      ${acc.accountSizeUsd.toLocaleString("en-US")} · {acc.tierName}
                    </p>
                    <p className="text-xs text-gold-300/70 mt-0.5">{typeLabel}</p>
                    <p className="text-[10px] text-neutral-600 mt-1 font-mono">Order {acc.orderId}</p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusBadgeClass(acc.status)}`}
                  >
                    {statusLabel(acc.status)}
                  </span>
                </div>

                <div className="space-y-3 rounded-xl bg-black/20 border border-white/5 px-4 py-3 text-xs">
                  <div className="flex gap-2 items-start">
                    <Server className="w-3.5 h-3.5 text-gold-500/80 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Server</p>
                      <p className="text-neutral-200 mt-0.5 leading-relaxed">{acc.server}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <KeyRound className="w-3.5 h-3.5 text-gold-500/80 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Login / password</p>
                      <p className="text-white font-mono text-[11px] mt-0.5 break-all">{acc.login}</p>
                      <p className="text-neutral-500 font-mono text-[11px] mt-0.5">{acc.password}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start border-t border-white/5 pt-3">
                    <Clock className="w-3.5 h-3.5 text-amber-400/90 shrink-0 mt-0.5" />
                    <p className="text-neutral-400 leading-relaxed">{acc.credentialsEtaNote}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/dashboard/support"
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-gold-500/25 text-gold-300 hover:bg-gold-500/10"
                  >
                    Open ticket
                  </Link>
                  <Link href="/rules" className="text-[11px] text-neutral-500 hover:text-neutral-300 py-1.5">
                    KYC &amp; rules →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-dashed border-gold-500/20 p-8 text-center"
        >
          <BriefcaseBusiness className="w-10 h-10 text-gold-500/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-300">{d.scaleTitle}</p>
          <p className="text-xs text-neutral-500 mt-1 mb-4">{d.scaleBody}</p>
          <Link
            href="/challenge"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-sm font-semibold hover:bg-gold-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> {d.browsePlans}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  return <AccountsTradingView />;
}
