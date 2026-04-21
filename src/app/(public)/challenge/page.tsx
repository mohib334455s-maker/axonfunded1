"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Star,
  Shield,
  Clock,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import SupremePlanAPricing from "@/components/pricing/SupremePlanAPricing";
import ChallengeRisingLines from "@/components/page-ambient/ChallengeRisingLines";
import { AnimatePresence } from "framer-motion";

const challengeFaqs = [
  {
    question: "Is there a time limit on the challenge?",
    answer:
      "No time limit! You can take as long as you need. You only need to complete a minimum of 5 trading days per phase.",
  },
  {
    question: "Can I use Expert Advisors (EAs)?",
    answer:
      "Yes — EAs are allowed. After passing evaluations you must provide EA source code to the technical team (/rules §17). Latency arbitrage, bug exploitation, and harmful algos are prohibited (/rules §14).",
  },
  {
    question: "What happens if I fail?",
    answer:
      "You can purchase a new challenge at any time. After a breach, a 20% retake discount may apply if you repurchase within 24 hours — contact Live Support (/rules §12).",
  },
  {
    question: "How quickly will I be funded after passing?",
    answer:
      "Once you pass Phase 2, your funded account is activated within 24 hours and you can start trading immediately.",
  },
];

export default function ChallengePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-black pt-20">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 text-center bg-black">
        <ChallengeRisingLines />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/30 bg-gold-500/5 mb-6">
            <Shield className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-sm text-gold-500 font-medium">
              Choose Your Challenge
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Two Phases to{" "}
            <span className="text-gold-gradient">Funded Capital</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Seven luxury tiers from $10,000 to $1,000,000 — two-phase evaluation, then funded access. See the official specification table below for fees and risk limits.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href="/trial"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200 border border-cyan-500/35 rounded-full px-5 py-2.5 bg-cyan-500/[0.07] transition-colors"
            >
              Free practice trial
              <span className="text-[10px] font-mono text-cyan-500/80 uppercase tracking-wide">sandbox</span>
            </Link>
          </div>
        </motion.div>
      </section>

      <SupremePlanAPricing />

      {/* Rules Summary */}
      <section className="bg-black py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Challenge Rules
            </h2>
            <p className="text-neutral-400">
              Simple, fair rules designed for serious traders
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                icon: TrendingUp,
                label: "Daily Loss Limit",
                value: "5%",
                color: "text-danger",
              },
              {
                icon: Shield,
                label: "Max Drawdown",
                value: "12%",
                color: "text-warning",
              },
              {
                icon: Star,
                label: "Phase 1 Target",
                value: "8%",
                color: "text-success",
              },
              {
                icon: Star,
                label: "Phase 2 Target",
                value: "4%",
                color: "text-success",
              },
              {
                icon: Clock,
                label: "Min Trading Days",
                value: "5 days (challenge)",
                color: "text-gold-500",
              },
              {
                icon: Clock,
                label: "Min days (funded)",
                value: "10 days",
                color: "text-gold-500",
              },
              {
                icon: CheckCircle2,
                label: "Performance reward",
                value: "90% split · daily payouts",
                color: "text-success",
              },
              {
                icon: CheckCircle2,
                label: "Leverage",
                value: "1:100",
                color: "text-gold-500",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 text-center"
              >
                <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-3`} />
                <div className={`text-2xl font-black font-mono ${item.color} mb-1`}>
                  {item.value}
                </div>
                <div className="text-xs text-neutral-500">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-black py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Challenge FAQ
            </h2>
          </motion.div>
          <div className="space-y-3">
            {challengeFaqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  openFaq === i
                    ? "border-gold-500/30 bg-gold-500/[0.06]"
                    : "border-white/10 bg-black"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span
                    className={`font-medium text-sm md:text-base ${
                      openFaq === i ? "text-gold-500" : "text-white"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown
                      className={`w-5 h-5 ${
                        openFaq === i ? "text-gold-500" : "text-neutral-500"
                      }`}
                    />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-6 pb-5 text-sm text-neutral-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
