"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle2, Zap, TrendingUp, DollarSign } from "lucide-react";
import GoldButton from "@/components/ui/GoldButton";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

const STEP_ICONS = [Zap, CheckCircle2, Shield, TrendingUp, DollarSign] as const;

export default function FundedAccountsPage() {
  const { dict } = useDashboardPagesDict();
  const d = dict.funded;

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">{d.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">{d.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl border border-gold-500/20 bg-gradient-to-b from-gold-500/5 to-surface p-10 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-5">
          <Shield className="w-8 h-8 text-gold-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{d.emptyTitle}</h2>
        <p className="text-neutral-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">{d.emptyBody}</p>
        <GoldButton href="/challenge" size="lg">
          {d.startEval} <ArrowRight className="w-5 h-5" />
        </GoldButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/5 bg-surface p-6"
      >
        <h2 className="text-base font-semibold text-white mb-6">{d.pathTitle}</h2>
        <div className="space-y-4">
          {d.steps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? Zap;
            return (
              <div key={step.title} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-neutral-500" />
                  </div>
                  {i < d.steps.length - 1 && <div className="w-px h-6 bg-white/5 mt-1" />}
                </div>
                <div className="pt-1 pb-4">
                  <p className="text-sm font-semibold text-neutral-300">{step.title}</p>
                  <p className="text-xs text-neutral-600 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: d.statBalance, value: "—" },
          { label: d.statEquity, value: "—" },
          { label: d.statSplit, value: "80%" },
          { label: d.statPayout, value: d.statPayoutVal },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/5 bg-surface px-4 py-3 text-center">
            <p className="text-xs text-neutral-600 mb-1">{s.label}</p>
            <p className="font-mono font-bold text-neutral-500">{s.value}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
