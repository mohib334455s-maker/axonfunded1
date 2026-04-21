"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet, Receipt, CircleDollarSign } from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

export default function WalletPage() {
  const { dict } = useDashboardPagesDict();
  const d = dict.wallet;

  return (
    <div className="space-y-8 dashboard-page max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{d.title}</h1>
            <p className="text-sm text-neutral-400 mt-0.5">{d.subtitle}</p>
          </div>
        </div>
        <p className="mt-5 text-sm text-neutral-500 leading-relaxed">{d.body}</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard/payouts"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gold-500/25 bg-black/30 px-4 py-3 text-sm font-semibold text-gold-200 hover:bg-gold-500/10 transition-colors"
        >
          <Receipt className="w-4 h-4" />
          {d.ctaTxns}
        </Link>
        <Link
          href="/dashboard/payouts"
          className="btn-gold inline-flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-bold"
        >
          <CircleDollarSign className="w-4 h-4" />
          {d.ctaPayouts}
        </Link>
      </div>
    </div>
  );
}
