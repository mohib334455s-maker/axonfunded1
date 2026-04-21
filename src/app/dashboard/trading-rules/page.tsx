"use client";

import { motion } from "framer-motion";
import { ScrollText } from "lucide-react";
import { RulesDocumentAccordion } from "@/components/rules/RulesDocument";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

export default function TradingRulesPage() {
  const { dict } = useDashboardPagesDict();
  const d = dict.tradingRules;

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-gold-400" />
          {d.title}
        </h1>
        <p className="text-sm text-neutral-400 mt-1">{d.subtitle}</p>
      </motion.div>

      <RulesDocumentAccordion showOfficialLink />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
      >
        <p className="text-xs text-amber-200/85 leading-relaxed">
          <strong className="text-amber-200">{d.reminder}</strong> {d.reminderBody}
        </p>
      </motion.div>
    </div>
  );
}
