"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Users, DollarSign, Link2, Check } from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

const REF_CODE = "AXON-REF-7X2K";
const REF_LINK = "https://axonfunded.com/ref/7X2K";

const REFERRALS = [
  { name: "Ahmad R.", date: "2026-04-08", status: "purchased", reward: "$24.25" },
  { name: "Sara M.", date: "2026-03-29", status: "registered", reward: "Pending" },
  { name: "Omar K.", date: "2026-03-20", status: "purchased", reward: "$48.50" },
  { name: "Lena V.", date: "2026-03-10", status: "purchased", reward: "$24.25" },
];

export default function ReferEarnPage() {
  const { dict } = useDashboardPagesDict();
  const r = dict.referEarn;
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copy = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text).catch(() => {});
    if (type === "code") {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } else {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 dashboard-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Gift className="w-6 h-6 text-gold-400" />
          {r.title}
        </h1>
        <p className="text-sm text-neutral-400 mt-1">{r.subtitle}</p>
        <p className="text-sm text-neutral-500 mt-2">{r.commissionLine}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Referred", value: "4", icon: Users },
          { label: "Conversions", value: "3", icon: Check },
          { label: "Total Earned", value: "$97.00", icon: DollarSign },
          { label: "Pending", value: "$24.25", icon: Gift },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-gold-500/15 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
              <s.icon className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <p className="text-[11px] text-neutral-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-lg font-bold text-white">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Share section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-gold-500/20 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] p-6 space-y-5"
      >
        <h2 className="text-base font-semibold text-white">Your Referral Details</h2>

        {/* Code */}
        <div>
          <p className="text-xs text-neutral-500 mb-2">Referral Code</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-4 py-3">
              <span className="font-mono text-base font-bold text-gold-300 tracking-wider">{REF_CODE}</span>
            </div>
            <button
              onClick={() => copy(REF_CODE, "code")}
              className="w-11 h-11 rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-300 hover:bg-gold-500/20 flex items-center justify-center transition-all flex-shrink-0"
            >
              {codeCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Link */}
        <div>
          <p className="text-xs text-neutral-500 mb-2">Referral Link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-4 py-3 overflow-hidden">
              <Link2 className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <span className="text-sm text-neutral-300 truncate">{REF_LINK}</span>
            </div>
            <button
              onClick={() => copy(REF_LINK, "link")}
              className="w-11 h-11 rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-300 hover:bg-gold-500/20 flex items-center justify-center transition-all flex-shrink-0"
            >
              {linkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-gold-500/5 border border-gold-500/15 p-4">
          <p className="text-xs text-gold-300/80 leading-relaxed">
            Share your link. When a friend buys a challenge, you earn <strong className="text-gold-400">20% of the purchase price</strong> per official partnership terms (see /rules §18).
          </p>
        </div>
      </motion.div>

      {/* Referrals table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-gold-500/15 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/8">
          <h2 className="text-sm font-semibold text-white">Referral History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Referred", "Date", "Status", "Reward"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REFERRALS.map((r, i) => (
                <motion.tr
                  key={r.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3.5 font-medium text-white">{r.name}</td>
                  <td className="px-4 py-3.5 text-xs text-neutral-400">{r.date}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${
                      r.status === "purchased"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gold-400">{r.reward}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
