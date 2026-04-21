"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield } from "lucide-react";
import { RulesDocumentFull } from "@/components/rules/RulesDocument";
import RulesGlassShimmer from "@/components/page-ambient/RulesGlassShimmer";
import { useRulesUiDict } from "@/hooks/useRulesUiDict";

const QUICK_IDS = [
  "intro",
  "trading-days",
  "drawdown",
  "days-after-target",
  "post-phase",
  "violations",
  "weekend",
  "news",
  "kyc",
  "refund",
  "payout",
  "retake",
  "allocation",
  "slippage",
  "password",
  "copy",
  "ea",
  "ib",
] as const;

export default function RulesPage() {
  const { dict, t } = useRulesUiDict();

  return (
    <div className="pt-20">
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-black text-center border-b border-white/5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/30 bg-gold-500/5 mb-6">
            <Shield className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-sm text-gold-500 font-medium">{dict.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight">
            {dict.titleBefore} <span className="text-gold-gradient">{dict.titleGradient}</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">{dict.subtitle}</p>
        </motion.div>
      </section>

      <section className="sticky top-16 md:top-20 z-20 border-b border-white/5 bg-[#050505]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-2 font-semibold">{dict.jumpTo}</p>
          <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto md:max-h-none md:overflow-visible">
            {QUICK_IDS.map((id) => (
              <Link
                key={id}
                href={`#${id}`}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 text-neutral-400 hover:text-gold-400 hover:border-gold-500/30 bg-white/[0.02] transition-colors"
              >
                {t(`quickLinks.${id}`)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-12 sm:py-16 px-4 sm:px-6">
        <RulesGlassShimmer />
        <div className="relative z-10">
          <RulesDocumentFull />
        </div>
      </section>
    </div>
  );
}
