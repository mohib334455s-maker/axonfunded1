"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal, Clock, Users, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

type CompRow = {
  id: number;
  title: string;
  prize: string;
  prizePool: number;
  participants: number;
  endsIn: string;
  status: string;
  joined: boolean;
  myRank: number | null;
  myPnl: string | null;
};

const COMPETITIONS: CompRow[] = [];

const LEADERBOARD: {
  rank: number;
  name: string;
  country: string;
  pnl: string;
  pct: string;
  isMe?: boolean;
}[] = [];

export default function CompetitionsPage() {
  const { dict } = useDashboardPagesDict();
  const labels = dict.competitions;
  const [comps, setComps] = useState(COMPETITIONS);
  const [expanded, setExpanded] = useState<number | null>(null);

  const join = (id: number) => {
    setComps((prev) => prev.map((c) => (c.id === id ? { ...c, joined: true, participants: c.participants + 1 } : c)));
  };

  return (
    <div className="space-y-8 dashboard-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-gold-400" />
          {labels.title}
        </h1>
        <p className="text-sm text-neutral-400 mt-1">{labels.subtitle}</p>
        <p className="text-sm text-neutral-500 mt-2">{labels.tagline}</p>
      </motion.div>

      {/* Competition Cards */}
      <div className="space-y-4">
        {comps.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 py-14 text-center text-sm text-neutral-500">
            {labels.emptyState}
          </div>
        )}
        {comps.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-gold-500/20 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] overflow-hidden"
          >
            {/* Card header */}
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">{c.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <Users className="w-3 h-3" /> {c.participants.toLocaleString()} traders
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <Clock className="w-3 h-3" /> {c.endsIn}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      c.status === "live"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    }`}>
                      {c.status === "live" ? "● Live" : "Upcoming"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-neutral-500">Prize Pool</p>
                  <p className="text-base font-bold text-gold-400">{c.prize}</p>
                </div>
                {expanded === c.id ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence initial={false}>
              {expanded === c.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-1 space-y-5 border-t border-white/5">
                    {/* Your position */}
                    {c.joined && c.myRank && (
                      <div className="rounded-xl bg-gold-500/8 border border-gold-500/20 p-4 flex items-center gap-4">
                        <TrendingUp className="w-5 h-5 text-gold-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white">Your Position: #{c.myRank}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">Current P&L: <span className="text-emerald-400 font-medium">{c.myPnl}</span></p>
                        </div>
                      </div>
                    )}

                    {/* Leaderboard */}
                    {c.id === 1 && (
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Top Traders</p>
                        <div className="space-y-2">
                          {LEADERBOARD.map((entry) => (
                            <div
                              key={entry.rank}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                                entry.isMe
                                  ? "bg-gold-500/10 border border-gold-500/25"
                                  : "bg-black/20 border border-white/5"
                              }`}
                            >
                              <span className="w-7 text-center font-mono text-sm font-bold">
                                {entry.rank === 1 ? <Crown className="w-4 h-4 text-gold-400 mx-auto" />
                                  : entry.rank === 2 ? <Medal className="w-4 h-4 text-neutral-300 mx-auto" />
                                  : entry.rank === 3 ? <Medal className="w-4 h-4 text-amber-600 mx-auto" />
                                  : <span className={entry.isMe ? "text-gold-300" : "text-neutral-500"}>#{entry.rank}</span>}
                              </span>
                              <span className="text-sm">{entry.country}</span>
                              <span className={`flex-1 text-sm font-medium ${entry.isMe ? "text-gold-300" : "text-white"}`}>
                                {entry.name}
                              </span>
                              <span className="text-sm font-semibold text-emerald-400">{entry.pnl}</span>
                              <span className="text-xs text-neutral-500 hidden sm:block">{entry.pct}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    {!c.joined ? (
                      <button
                        onClick={() => join(c.id)}
                        disabled={c.status === "upcoming"}
                        className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm transition-all shadow-[0_4px_14px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {c.status === "upcoming" ? "Coming Soon" : "Join Competition"}
                      </button>
                    ) : (
                      <div className="text-center py-2">
                        <span className="text-sm text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                          <Trophy className="w-4 h-4" /> Enrolled — trade to improve your competition rank.
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
