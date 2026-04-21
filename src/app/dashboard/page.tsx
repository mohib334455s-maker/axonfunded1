"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Wallet,
  Brain,
  ArrowRight,
  Zap,
  Calculator,
  BarChart3,
  Flame,
} from "lucide-react";
import GoldButton from "@/components/ui/GoldButton";
import Link from "next/link";
import { getClientCookie, TRADER_COOKIES, TRIAL_PLAN_ID } from "@/lib/trader-access";
import { emptyDashboardUser, emptyEquitySeries } from "@/lib/dashboard-empty";
import type { Trade } from "@/types";
import CircularGauge from "@/components/dashboard/fintech/CircularGauge";
import LinearThresholdBar from "@/components/dashboard/fintech/LinearThresholdBar";
import FintechEquityAreaChart from "@/components/dashboard/fintech/FintechEquityAreaChart";
import SvgCandlestickChart from "@/components/dashboard/fintech/SvgCandlestickChart";
import DrawdownChart from "@/components/dashboard/DrawdownChart";
import { useDashboardDict } from "@/hooks/useDashboardDict";
import { useTheme } from "@/contexts/ThemeContext";
import { AccountsTradingView } from "@/app/dashboard/accounts/page";
import { AnalyticsTradingView } from "@/app/dashboard/analytics/page";
import { MetricsTradingView } from "@/app/dashboard/metrics/page";

type DashboardSummary = {
  hasPaidChallenge: boolean;
  awaitingCredentials: boolean;
  accountCount: number;
  orderCount: number;
  latestOrder: { receiptId: string; planSlug: string; tierName: string } | null;
  primaryAccount: { status: string; credentialsEtaNote?: string } | null;
};

const PHASE1_TARGET_PCT = 8;
const DAILY_DD_LIMIT = -5;
const MAX_DD_LIMIT = -10;

function chartHeightsForWidth(w: number) {
  return {
    equity: w >= 1024 ? 360 : w >= 640 ? 320 : 280,
    lower: w >= 640 ? 260 : 220,
  };
}

function EntitlementStrip() {
  const { dict } = useDashboardDict();
  const [entitlement, setEntitlement] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    setEntitlement(getClientCookie(TRADER_COOKIES.entitlement));
    setPlan(getClientCookie(TRADER_COOKIES.activePlan));
  }, []);

  if (entitlement === "trial" && plan === TRIAL_PLAN_ID) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.06] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <p className="text-sm text-cyan-100/90">{dict.home.trialBanner}</p>
        <Link
          href="/challenge"
          className="text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 px-4 py-2 rounded-xl text-center shrink-0 transition-colors"
        >
          {dict.home.upgradeChallenge}
        </Link>
      </motion.div>
    );
  }

  if (entitlement === "paid" && plan) {
    const m = plan.match(/^(\d+)k$/i);
    const label = m ? `$${m[1]}K` : plan;
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gold-500/20 bg-gold-500/[0.06] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <p className="text-sm text-neutral-200">
          <span className="text-gold-400 font-semibold">{dict.home.paidBanner}</span>{" "}
          <span className="font-mono text-white">{label}</span> — {dict.home.paidMock}
        </p>
        <Link href="/challenge" className="text-xs text-gold-500 hover:underline font-medium shrink-0">
          {dict.home.addPlan}
        </Link>
      </motion.div>
    );
  }

  return null;
}

function DashboardPageContent() {
  const { dict } = useDashboardDict();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") || "overview") as "overview" | "accounts" | "analytics" | "metrics";
  const tabIds = ["overview", "accounts", "analytics", "metrics"] as const;
  const { language } = useTheme();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [chartHeights, setChartHeights] = useState({ equity: 320, lower: 240 });

  useLayoutEffect(() => {
    const sync = () => setChartHeights(chartHeightsForWidth(window.innerWidth));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/dashboard/summary", { credentials: "include", cache: "no-store" });
        const j = (await res.json()) as DashboardSummary;
        if (!cancelled) setSummary(j);
      } catch {
        if (!cancelled) setSummary(null);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasPurchasedFlow = Boolean(
    summary && (summary.hasPaidChallenge || summary.accountCount > 0)
  );

  const dateLocale = language === "fa" ? "fa-IR" : language === "ar" ? "ar-SA" : "en-US";
  const today = new Date().toLocaleDateString(dateLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const u = emptyDashboardUser;
  const eq = emptyEquitySeries();
  const recentTrades: Trade[] = [];
  const isEmptyAccount = u.equity === 0 && u.balance === 0;

  const sessionPnL = useMemo(() => {
    if (eq.length < 2) return 0;
    return eq[eq.length - 1].equity - eq[eq.length - 2].equity;
  }, [eq]);

  const profitTargetPct = useMemo(() => {
    const start = eq[0]?.equity ?? 0;
    if (start <= 0) return 0;
    const gainPct = ((u.equity - start) / start) * 100;
    return Math.min(100, (gainPct / PHASE1_TARGET_PCT) * 100);
  }, [u.equity, eq]);

  const kpiCards = [
    {
      key: "eq",
      label: dict.home.kpiEquity,
      value: `$${u.equity.toLocaleString()}`,
      sub: dict.home.kpiSubMtm,
      icon: TrendingUp,
      accent: "text-emerald-400",
    },
    {
      key: "bal",
      label: dict.home.kpiBalance,
      value: `$${u.balance.toLocaleString()}`,
      sub: dict.home.kpiSubClosed,
      icon: Wallet,
      accent: "text-slate-200",
    },
    {
      key: "pnl",
      label: dict.home.kpiSession,
      value: `${sessionPnL >= 0 ? "+" : ""}$${Math.round(sessionPnL).toLocaleString()}`,
      sub: dict.home.kpiSubSession,
      icon: sessionPnL >= 0 ? TrendingUp : TrendingDown,
      accent: sessionPnL >= 0 ? "text-emerald-400" : "text-rose-400",
    },
    {
      key: "phase",
      label: dict.home.kpiProgramme,
      value: isEmptyAccount ? dict.home.noProgramme : `${dict.home.phaseActive} ${u.challengePhase}`,
      sub: isEmptyAccount ? "—" : dict.home.planSuffix,
      icon: Shield,
      accent: "text-amber-300",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 dashboard-page w-full max-w-6xl mx-auto">
      <div className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-4">
        {tabIds.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (id === "overview") router.replace("/dashboard");
              else router.replace(`/dashboard?tab=${id}`);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              tab === id
                ? "border-amber-400/50 bg-amber-500/15 text-amber-100"
                : "border-white/[0.08] text-neutral-500 hover:border-white/15 hover:text-neutral-200"
            }`}
          >
            {dict.home.tabs[id]}
          </button>
        ))}
      </div>

      {tab === "accounts" && <AccountsTradingView />}
      {tab === "analytics" && <AnalyticsTradingView />}
      {tab === "metrics" && <MetricsTradingView />}

      {tab === "overview" && (
        <>
          <EntitlementStrip />

      {!summaryLoading && hasPurchasedFlow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3 text-xs text-emerald-100/90 leading-relaxed"
        >
          <strong className="text-emerald-200">Live data note:</strong> equity, candles, and drawdown below are still{" "}
          <span className="text-white/90">illustrative samples</span> until your MT5 evaluation account is connected to this dashboard.
        </motion.div>
      )}

      {!summaryLoading && !hasPurchasedFlow ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="dash-ft-panel overflow-hidden"
        >
          <div className="relative px-5 py-6 sm:px-8 sm:py-8 flex flex-col gap-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent" />
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 border-l-2 border-amber-400/45 pl-5 sm:pl-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#B8860B] flex items-center justify-center shadow-[0_0_28px_rgba(255,215,0,0.2)] shrink-0">
                <Zap className="w-7 h-7 text-black fill-black" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">{dict.home.welcomeTitle}</h2>
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">{dict.home.welcomeBody}</p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <GoldButton href="/challenge" size="lg" className="w-full sm:w-auto justify-center">
                    {dict.home.startChallenge} <ArrowRight className="w-5 h-5" />
                  </GoldButton>
                  <GoldButton href="/rules" variant="outline" size="lg" className="w-full sm:w-auto justify-center">
                    {dict.home.readRules}
                  </GoldButton>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      {!summaryLoading && hasPurchasedFlow ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="dash-ft-panel overflow-hidden border-gold-500/20"
        >
          <div className="relative px-5 py-6 sm:px-8 sm:py-8 flex flex-col gap-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/35 to-transparent" />
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 border-l-2 border-gold-500/40 pl-5 sm:pl-6">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center shrink-0">
                <Shield className="w-7 h-7 text-gold-400" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">After payment — your next 24 hours</h2>
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Your order is on file. Operations typically assigns MT5 server/login within{" "}
                  <strong className="text-gold-200/90">24 business hours</strong>. Watch{" "}
                  <Link href="/dashboard?tab=accounts" className="text-gold-400 hover:underline font-medium">
                    Trading accounts
                  </Link>{" "}
                  for status; open a{" "}
                  <Link href="/dashboard/support" className="text-gold-400 hover:underline font-medium">
                    ticket
                  </Link>{" "}
                  if nothing moves after that. KYC and phase rules are in{" "}
                  <Link href="/rules" className="text-gold-400 hover:underline font-medium">
                    Trading rules
                  </Link>
                  .
                </p>
                {summary?.awaitingCredentials && summary.primaryAccount?.credentialsEtaNote && (
                  <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                    {summary.primaryAccount.credentialsEtaNote}
                  </p>
                )}
                {summary?.latestOrder?.receiptId && (
                  <p className="text-xs text-neutral-500 font-mono">
                    Latest receipt: {summary.latestOrder.receiptId} · {summary.latestOrder.tierName}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
                  <GoldButton href="/dashboard?tab=accounts" size="lg" className="w-full sm:w-auto justify-center">
                    Trading accounts <ArrowRight className="w-5 h-5" />
                  </GoldButton>
                  <GoldButton href="/get-started" variant="outline" size="lg" className="w-full sm:w-auto justify-center">
                    Checklist
                  </GoldButton>
                  <GoldButton href="/dashboard/support" variant="outline" size="lg" className="w-full sm:w-auto justify-center">
                    Support ticket
                  </GoldButton>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{dict.home.cockpit}</p>
          <h1 className="mt-1.5 text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
            {dict.home.dashboard}
          </h1>
          <p className="text-sm text-slate-500 mt-2 tabular-nums">{today}</p>
        </motion.div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-200/90">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            {dict.home.systemsOperational}
          </span>
          {!isEmptyAccount && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1.5 text-xs font-medium text-amber-200/90">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              {dict.home.phaseActive} {u.challengePhase} · {dict.home.active}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="dash-ft-panel p-4 md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="dash-ft-kpi-label">{card.label}</p>
                <p className="dash-ft-kpi-value mt-2 truncate">{card.value}</p>
                <p className="dash-ft-kpi-sub mt-1">{card.sub}</p>
              </div>
              <div className="w-11 h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center shrink-0">
                <card.icon className={`w-5 h-5 ${card.accent}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="xl:col-span-8 dash-ft-panel p-5 md:p-7 min-w-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400/90 shrink-0" />
                {dict.home.equityCurve}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-prose">{dict.home.equitySub}</p>
            </div>
          </div>
          <div className="w-full" style={{ height: chartHeights.equity }}>
            <FintechEquityAreaChart data={eq} height={chartHeights.equity} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="xl:col-span-4 dash-ft-panel p-5 md:p-7 flex flex-col gap-8 min-w-0"
        >
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight mb-5">{dict.home.targetsRisk}</h2>
            <div className="grid grid-cols-2 gap-5 sm:gap-6">
              <CircularGauge
                value={profitTargetPct}
                max={100}
                label={dict.home.phase1}
                sublabel={dict.home.towardTarget.replace("{pct}", String(PHASE1_TARGET_PCT))}
                tone="gold"
                size="md"
              />
              <CircularGauge
                value={u.riskScore}
                max={100}
                label={dict.home.riskScore}
                sublabel={dict.home.riskModel}
                tone="sky"
                size="md"
              />
            </div>
          </div>
          <div className="space-y-5 border-t border-white/[0.07] pt-6">
            <LinearThresholdBar label={dict.home.dailyDd} value={u.dailyDrawdown} limit={DAILY_DD_LIMIT} />
            <LinearThresholdBar label={dict.home.maxDd} value={0} limit={MAX_DD_LIMIT} />
          </div>
          <div className="border-t border-white/[0.07] pt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Brain className="w-4 h-4 text-violet-400/90" />
              {dict.home.behaviouralRisk}
            </div>
            <span className="text-sm font-mono font-semibold text-violet-200 tabular-nums">{u.riskScore}/100</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="lg:col-span-5 dash-ft-panel p-5 md:p-7 min-w-0"
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">{dict.home.syntheticOhlc}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{dict.home.candleSub}</p>
            </div>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>
          <div className="w-full" style={{ height: chartHeights.lower }}>
            <SvgCandlestickChart data={eq} height={chartHeights.lower} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7 dash-ft-panel p-5 md:p-7 min-w-0"
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">{dict.home.ddEnvelope}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{dict.home.ddSub}</p>
            </div>
            <TrendingDown className="w-4 h-4 text-rose-400/80" />
          </div>
          <div className="w-full" style={{ height: chartHeights.lower }}>
            <DrawdownChart height={chartHeights.lower} data={eq} />
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <h2 className="dash-ft-kpi-label mb-3">{dict.home.quickAccess}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {[
            { icon: Calculator, title: dict.home.calcTitle, desc: dict.home.calcDesc, href: "/dashboard/calculator" },
            { icon: BarChart3, title: dict.home.plansTitle, desc: dict.home.plansDesc, href: "/challenge" },
            { icon: TrendingUp, title: dict.home.quickAnalyticsTitle, desc: dict.home.quickAnalyticsDesc, href: "/dashboard?tab=analytics" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group dash-ft-panel flex items-start gap-4 p-4 md:p-5 transition-colors hover:border-amber-400/25"
            >
              <div className="w-11 h-11 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] flex items-center justify-center shrink-0 group-hover:bg-amber-400/10 transition-colors">
                <item.icon className="w-5 h-5 text-amber-300/90" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white tracking-tight group-hover:text-amber-200/95 transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="dash-ft-panel overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white tracking-tight">{dict.home.recentTrades}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left border-b border-white/[0.06]">
                {[dict.home.thPair, dict.home.thSide, dict.home.thLots, dict.home.thPnl, dict.home.thTime].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTrades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                    {dict.home.noTrades}
                  </td>
                </tr>
              ) : (
                recentTrades.slice(0, 6).map((tr) => (
                  <tr key={tr.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-200 tabular-nums">{tr.pair}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md border ${
                          tr.type === "buy"
                            ? "border-emerald-500/25 text-emerald-300 bg-emerald-500/[0.07]"
                            : "border-rose-500/25 text-rose-300 bg-rose-500/[0.07]"
                        }`}
                      >
                        {tr.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-400 tabular-nums">{tr.lots}</td>
                    <td
                      className={`px-5 py-3 font-mono font-semibold tabular-nums ${
                        tr.profit >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {tr.profit >= 0 ? "+" : ""}${tr.profit.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-slate-500 tabular-nums text-xs">
                      {tr.date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="dashboard-page w-full max-w-6xl mx-auto space-y-4 py-8">
          <div className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
          <div className="h-40 rounded-2xl bg-white/[0.03] animate-pulse" />
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
