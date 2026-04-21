"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

const ALL_TX: {
  id: string;
  type: string;
  desc: string;
  amount: string;
  date: string;
  status: string;
}[] = [];

const STATUS_COLOR: Record<string, string> = {
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  rejected: "text-red-400 bg-red-400/10 border-red-400/20",
};

const FILTERS = ["all", "deposit", "withdrawal", "pending", "rejected"] as const;

export default function TransactionsPage() {
  const { dict } = useDashboardPagesDict();
  const d = dict.transactions;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const rows = ALL_TX.filter(
    (t) =>
      (filter === "all" || t.type === filter || t.status === filter) &&
      (t.desc.toLowerCase().includes(q.toLowerCase()) || t.id.includes(q))
  );

  const statusLabel = (s: string) => {
    if (s === "completed") return d.statusCompleted;
    if (s === "pending") return d.statusPending;
    if (s === "rejected") return d.statusRejected;
    return s;
  };

  const filterLabel = (f: (typeof FILTERS)[number]) => d.filters[f];

  const headers = [d.thId, d.thDesc, d.thAmount, d.thDate, d.thStatus];

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">{d.title}</h1>
        <p className="text-sm text-neutral-400 mt-1">{d.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/30 border border-gold-500/15 flex-1 min-w-[180px] max-w-xs">
          <Search className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={d.searchPh}
            className="bg-transparent text-sm text-neutral-200 placeholder-neutral-600 outline-none w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filter === f
                  ? "bg-gold-500/15 border-gold-500/40 text-gold-300"
                  : "border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
              }`}
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-gold-500/15 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {headers.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-neutral-500 font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-neutral-500 text-sm">
                    {d.emptyRows}
                  </td>
                </tr>
              ) : (
                rows.map((tx, i) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-neutral-400">{tx.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            tx.type === "deposit" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {tx.type === "deposit" ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span className="text-white/90 text-sm">{tx.desc}</span>
                      </div>
                    </td>
                    <td
                      className={`px-4 py-3.5 font-mono font-semibold ${
                        tx.type === "deposit" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {tx.amount}
                    </td>
                    <td className="px-4 py-3.5 text-neutral-400 text-xs">{tx.date}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_COLOR[tx.status] ?? ""}`}
                      >
                        {statusLabel(tx.status)}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-neutral-500">{d.footerCount.replace("{n}", String(rows.length))}</p>
          <div className="flex items-center gap-1">
            <ArrowLeftRight className="w-3.5 h-3.5 text-gold-500/50" />
            <span className="text-xs text-neutral-500">{d.footerHint}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
