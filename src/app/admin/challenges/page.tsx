"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { mockLeaderboard } from "@/lib/mock-data";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPrimitives";

const challenges = mockLeaderboard.map((t, i) => ({
  id: `ch_${t.traderId}`,
  trader: t.traderName,
  email: `${t.traderName.toLowerCase().replace(" ", ".")}@email.com`,
  accountSize: t.accountSize,
  phase: i < 3 ? "funded" : i < 7 ? "phase2" : i < 12 ? "phase1" : "failed",
  progress: i < 3 ? 100 : i < 7 ? Math.round(60 + Math.random() * 35) : Math.round(20 + Math.random() * 70),
  profit: t.profit,
  winRate: t.winRate,
  trades: t.trades,
  started: `Jan ${5 + i}, 2024`,
  profitFactor: t.profitFactor,
}));

const phaseStyle: Record<string, string> = {
  funded: "text-gold-500 bg-gold-500/10 border-gold-500/20",
  phase2: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  phase1: "text-warning bg-warning/10 border-warning/20",
  failed: "text-danger bg-danger/10 border-danger/20",
};

const phaseLabel: Record<string, string> = {
  funded: "Funded", phase2: "Phase 2", phase1: "Phase 1", failed: "Failed",
};

export default function AdminChallengesPage() {
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");

  const filtered = challenges.filter((c) => {
    const matchSearch = c.trader.toLowerCase().includes(search.toLowerCase());
    const matchPhase = phaseFilter === "all" || c.phase === phaseFilter;
    return matchSearch && matchPhase;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Challenges"
        description={`${challenges.length} active evaluation accounts`}
        actions={
          <div className="flex gap-2 flex-wrap">
            {["all", "phase1", "phase2", "funded", "failed"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPhaseFilter(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
                  phaseFilter === p
                    ? "bg-[rgba(255,215,0,0.12)] text-[#e8c547] border-[rgba(255,215,0,0.28)]"
                    : "text-[#8f8a82] border-[rgba(255,255,255,0.08)] hover:border-[rgba(212,175,55,0.2)]"
                }`}
              >
                {p === "all" ? "All" : phaseLabel[p]}
              </button>
            ))}
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Phase 1", count: challenges.filter((c) => c.phase === "phase1").length, color: "text-warning" },
          { label: "Phase 2", count: challenges.filter((c) => c.phase === "phase2").length, color: "text-blue-400" },
          { label: "Funded", count: challenges.filter((c) => c.phase === "funded").length, color: "text-gold-500" },
          { label: "Failed", count: challenges.filter((c) => c.phase === "failed").length, color: "text-danger" },
        ].map((s) => (
          <div key={s.label} className="admin-panel rounded-xl p-4 text-center">
            <p className={`text-2xl font-black font-mono ${s.color}`}>{s.count}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search trader..."
          className="w-full bg-surface border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40" />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="admin-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left">
                {["Trader", "Phase", "Account", "Progress", "Profit", "Win Rate", "Trades", "Started", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/1 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xs font-bold text-gold-500 flex-shrink-0">
                        {c.trader.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{c.trader}</p>
                        <p className="text-[11px] text-neutral-600">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${phaseStyle[c.phase]}`}>
                      {c.phase === "funded" ? <CheckCircle2 className="w-3 h-3" /> :
                       c.phase === "failed" ? <XCircle className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      {phaseLabel[c.phase]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-white font-mono">${(c.accountSize/1000).toFixed(0)}K</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 min-w-24">
                      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${
                          c.progress >= 100 ? "bg-gold-500" : c.progress >= 60 ? "bg-success" : c.progress >= 30 ? "bg-warning" : "bg-danger"
                        }`} style={{ width: `${c.progress}%` }} />
                      </div>
                      <span className="text-xs text-neutral-500 font-mono w-8">{c.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-sm font-bold font-mono ${c.profit > 0 ? "text-success" : "text-danger"}`}>
                      {c.profit > 0 ? "+" : ""}${c.profit.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-success" />
                      <span className="text-sm text-white">{c.winRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-neutral-400">{c.trades}</td>
                  <td className="px-4 py-3.5 text-xs text-neutral-500">{c.started}</td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => toast.info(`Viewing ${c.trader}'s challenge`)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-neutral-400 hover:text-white hover:bg-white/8 transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-white/5">
          <span className="text-xs text-neutral-600">Showing {filtered.length} of {challenges.length} challenges</span>
        </div>
      </motion.div>
    </div>
  );
}
