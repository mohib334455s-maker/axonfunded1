"use client";

import { motion } from "framer-motion";
import { Shield, Plus, ArrowRight, Zap, CheckCircle2, Clock } from "lucide-react";
import GoldButton from "@/components/ui/GoldButton";
import Link from "next/link";
import { PLAN_A_COLUMNS, formatPlanFeeUsd } from "@/lib/plan-a-pricing";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

const PLANS = PLAN_A_COLUMNS.map((c) => ({
  slug: c.checkoutSlug,
  size: c.headerLabel,
  price: formatPlanFeeUsd(c.price),
  phase1: "8%",
  dd: "12%",
  split: "90%",
  popular: c.checkoutSlug === "legendary",
}));

const PHASE_ICONS = [Zap, CheckCircle2, Shield] as const;
const PHASE_STYLE = [
  { color: "text-gold-500", bg: "bg-gold-500/10 border-gold-500/20" },
  { color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { color: "text-success", bg: "bg-success/10 border-success/20" },
] as const;

export default function ChallengesPage() {
  const { dict } = useDashboardPagesDict();
  const d = dict.challenges;

  const phases = d.phases.map((p, i) => ({
    ...p,
    icon: PHASE_ICONS[i] ?? Zap,
    color: PHASE_STYLE[i]?.color ?? "text-gold-500",
    bg: PHASE_STYLE[i]?.bg ?? "bg-gold-500/10 border-gold-500/20",
  }));

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{d.title}</h1>
          <p className="text-sm text-neutral-500 mt-1">{d.subtitle}</p>
        </div>
        <GoldButton href="/challenge">
          <Plus className="w-4 h-4" />
          {d.newChallenge}
        </GoldButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl border border-gold-500/20 bg-gradient-to-b from-gold-500/5 to-surface p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-5">
          <Shield className="w-8 h-8 text-gold-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{d.emptyTitle}</h2>
        <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">{d.emptyBody}</p>
        <GoldButton href="/challenge" size="lg">
          {d.browsePlans} <ArrowRight className="w-4 h-4" />
        </GoldButton>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-base font-semibold text-white mb-4">{d.choosePlan}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.03 }}
              className={`relative flex min-h-[300px] flex-col rounded-2xl border border-gold-500/25 bg-gradient-to-b from-[#0c0c0c] via-black to-[#050505] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] ring-1 ring-gold-500/10 ${
                plan.popular ? "ring-amber-400/35 border-amber-400/40" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 z-[1] -translate-x-1/2 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-200 via-gold-400 to-amber-300 px-3 py-0.5 text-[10px] font-black uppercase tracking-wide text-black">
                  {d.popular}
                </span>
              )}
              <div className="flex flex-1 flex-col text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-500/70">{plan.size}</p>
                <p className="mt-1 text-xs text-neutral-500">{d.oneTime}</p>
                <p className="mt-1 text-3xl font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#fff8dc] via-[#ffd700] to-[#daa520]">
                  {plan.price}
                </p>
                <div className="mt-4 space-y-2 border-t border-gold-500/10 pt-4 text-left text-[11px] text-neutral-400">
                  <div className="flex justify-between gap-2">
                    <span>{d.profitTarget}</span>
                    <span className="font-mono text-gold-200/90">{plan.phase1}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>{d.maxDd}</span>
                    <span className="font-mono text-white/90">{plan.dd}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>{d.profitSplit}</span>
                    <span className="font-mono text-emerald-400/90">{plan.split}</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 border-t border-gold-500/15 pt-4">
                <Link
                  href={`/checkout/${plan.slug}`}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ffe566] via-[#ffd700] to-[#c9a008] px-4 py-3 text-center text-sm font-black text-black shadow-[0_6px_24px_rgba(255,215,0,0.28)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {d.startCta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/5 bg-surface p-6"
      >
        <h2 className="text-base font-semibold text-white mb-5">{d.historyTitle}</h2>
        <div className="text-center py-10">
          <Clock className="w-10 h-10 text-neutral-800 mx-auto mb-3" />
          <p className="text-neutral-600 text-sm">{d.historyEmpty}</p>
          <p className="text-xs text-neutral-700 mt-1">{d.historyHint}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-white/5 bg-surface p-6"
      >
        <h2 className="text-base font-semibold text-white mb-5">{d.howTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {phases.map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${s.bg}`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <div>
                <span className={`text-xs font-bold ${s.color}`}>{s.step}</span>
                <p className="text-sm font-semibold text-white">{s.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
