"use client";

import { motion } from "framer-motion";
import { Layers3, Star, TrendingUp, Gift, ChevronRight } from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

const REWARD_ICONS = {
  retake: Gift,
  reset: Star,
  priority: TrendingUp,
  vip: Layers3,
} as const;

const TOTAL = 0;
const NEXT_TIER = 1000;

type PointsHistoryRow = { date: string; action: string; pts: string };

export default function InfinityPointsPage() {
  const { dict } = useDashboardPagesDict();
  const d = dict.infinityPoints;
  const historyRows = d.history as PointsHistoryRow[];

  return (
    <div className="space-y-8 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Layers3 className="w-6 h-6 text-gold-400" />
          {d.title}
        </h1>
        <p className="text-sm text-neutral-400 mt-1">{d.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gold-500/30 bg-gradient-to-br from-[#1f1700] via-[#15120a] to-[#0d0d0f] p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gold-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{d.available}</p>
        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-200">
          {TOTAL.toLocaleString()}
          <span className="text-base font-semibold text-gold-500/60 ml-2">{d.pts}</span>
        </p>

        <div className="mt-5">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-neutral-500">{d.progressGold}</span>
            <span className="text-gold-300">
              {TOTAL} / {NEXT_TIER}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(TOTAL / NEXT_TIER) * 100}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300"
            />
          </div>
          <p className="text-[11px] text-neutral-600 mt-1.5">
            {d.untilGold.replace("{n}", String(NEXT_TIER - TOTAL))}
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gold-500/15 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/8">
            <h2 className="text-sm font-semibold text-white">{d.historyTitle}</h2>
          </div>
          <div className="divide-y divide-white/5">
            {historyRows.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-neutral-500">{d.historyEmpty}</p>
            ) : (
              historyRows.map((h, i) => (
                <motion.div
                  key={`${h.date}-${h.action}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm text-white/90">{h.action}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{h.date}</p>
                  </div>
                  <span
                    className={`font-mono font-bold text-sm ${h.pts.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {h.pts}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gold-500/15 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/8">
            <h2 className="text-sm font-semibold text-white">{d.rewardsStoreTitle}</h2>
          </div>
          <div className="divide-y divide-white/5">
            {d.rewards.map((r, i) => {
              const Icon = REWARD_ICONS[r.id as keyof typeof REWARD_ICONS] ?? Gift;
              const canRedeem = TOTAL >= r.pts;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gold-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 truncate">{r.label}</p>
                    <p className="text-[11px] text-gold-400/70 mt-0.5">{d.ptsRequired.replace("{pts}", String(r.pts))}</p>
                  </div>
                  <button
                    type="button"
                    disabled={!canRedeem}
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      canRedeem
                        ? "bg-gold-500/15 border border-gold-500/30 text-gold-300 hover:bg-gold-500/25"
                        : "bg-white/5 border border-white/10 text-neutral-600 cursor-not-allowed"
                    }`}
                  >
                    {canRedeem ? d.redeem : d.locked}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
