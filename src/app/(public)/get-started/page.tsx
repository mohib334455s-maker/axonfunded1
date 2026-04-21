"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CreditCard,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  Shield,
  Sparkles,
} from "lucide-react";
import GoldButton from "@/components/ui/GoldButton";
import PyramidLogo from "@/components/ui/PyramidLogo";

function GetStartedContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  return (
    <div className="pt-20 min-h-screen relative overflow-hidden bg-black">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-8">
            <PyramidLogo size="md" animate={false} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-500/25 bg-gold-500/5 text-gold-500 text-xs font-semibold mb-5">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Trader workspace
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Unlock your <span className="text-gold-gradient">dashboard</span>
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Registration is complete. Choose a funded challenge (paid) or a separate practice trial.
            Paid account sizes are never included in the free trial.
          </p>
          {from && from.startsWith("/dashboard") && (
            <p className="mt-4 text-xs text-amber-500/90 bg-amber-500/10 border border-amber-500/20 rounded-xl py-2 px-4 inline-block">
              Complete a purchase or start the practice trial to open the dashboard.
            </p>
          )}
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass-card p-7 flex flex-col border border-gold-500/20 bg-gradient-to-b from-gold-500/[0.07] to-transparent rounded-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center mb-5 shadow-gold">
              <CreditCard className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Funded challenge</h2>
            <p className="text-sm text-neutral-500 mb-6 flex-1 leading-relaxed">
              $6K–$200K Plan A evaluations, full ruleset, MT5 credentials after payment — the same grid as `/challenge`.
            </p>
            <ul className="text-xs text-neutral-500 space-y-2 mb-6">
              <li className="flex gap-2">
                <Shield className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                Unlocks dashboard with your purchased account tier only.
              </li>
              <li className="flex gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                Checkout is available after sign-in and registration.
              </li>
            </ul>
            <GoldButton href="/challenge" size="lg" fullWidth className="justify-center gap-2">
              View plans &amp; checkout
              <ArrowRight className="w-4 h-4" />
            </GoldButton>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="glass-card p-7 flex flex-col rounded-2xl border border-white/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <FlaskConical className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Free practice trial</h2>
            <p className="text-sm text-neutral-500 mb-6 flex-1 leading-relaxed">
              $10,000 simulated balance, 7 days, simplified rules — for practice only. Does not map to paid Plan A challenge SKUs.
            </p>
            <ul className="text-xs text-neutral-500 space-y-2 mb-6">
              <li className="flex gap-2">
                <span className="text-cyan-400 font-mono text-[10px] uppercase tracking-wider shrink-0">SKU</span>
                <code className="text-neutral-400">trial_practice</code>
              </li>
              <li className="flex gap-2 text-neutral-600">
                No payouts · reset anytime · upgrade via a paid challenge when ready.
              </li>
            </ul>
            <Link
              href="/trial"
              className="w-full py-3.5 rounded-xl text-sm font-bold text-center border border-cyan-500/35 text-cyan-300 hover:bg-cyan-500/10 transition-colors flex items-center justify-center gap-2"
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.article>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mt-14 rounded-2xl border border-white/10 bg-black/30 px-5 py-6 sm:px-8 sm:py-8"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">After you pay — one checklist</h2>
              <p className="text-xs text-neutral-500 mt-0.5">KYC timing and phases are governed by the rules; this is the operational order we recommend.</p>
            </div>
          </div>
          <ol className="space-y-4 text-sm text-neutral-300">
            <li className="flex gap-3">
              <span className="font-mono text-gold-500 text-xs shrink-0 w-6">1</span>
              <div>
                <p className="font-semibold text-white">Trading accounts</p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  Confirm your evaluation row, server placeholder, and MT login status. MT5 credentials are usually issued within{" "}
                  <strong className="text-neutral-400">24 business hours</strong>.
                </p>
                <Link href="/dashboard/accounts" className="inline-block mt-2 text-xs font-semibold text-gold-500 hover:underline">
                  Open Trading accounts →
                </Link>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-gold-500 text-xs shrink-0 w-6">2</span>
              <div>
                <p className="font-semibold text-white">Support ticket (if delayed)</p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  If the row stays on &quot;awaiting credentials&quot; past the SLA, open a ticket so ops can trace your order.
                </p>
                <Link href="/dashboard/support" className="inline-block mt-2 text-xs font-semibold text-gold-500 hover:underline">
                  Open tickets →
                </Link>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-gold-500 text-xs shrink-0 w-6">3</span>
              <div>
                <p className="font-semibold text-white">KYC &amp; programme rules</p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  Complete KYC when your dashboard or email requests it. Phase targets, drawdown, and payout policy live in the rules (including funded phase and §11 payouts).
                </p>
                <Link href="/rules" className="inline-block mt-2 text-xs font-semibold text-gold-500 hover:underline">
                  Read trading rules →
                </Link>
              </div>
            </li>
          </ol>
        </motion.section>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center text-xs text-neutral-600 mt-12"
        >
          Questions? Read the{" "}
          <Link href="/rules" className="text-gold-500 hover:underline">
            trading rules
          </Link>
          .
        </motion.p>
      </div>
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 min-h-screen flex items-center justify-center text-neutral-500 text-sm">
          Loading…
        </div>
      }
    >
      <GetStartedContent />
    </Suspense>
  );
}
