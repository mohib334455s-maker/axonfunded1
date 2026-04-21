"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Clock, Tag, CheckCircle2 } from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

const OFFERS = [
  {
    id: 1,
    title: "20% off your next challenge",
    desc: "Exclusive discount for existing traders who have completed Phase 1.",
    code: "AXON20",
    expires: "2026-04-30",
    type: "discount",
    claimed: false,
  },
  {
    id: 2,
    title: "Free Evaluation Reset",
    desc: "Product-specific perk if offered in your checkout — not a substitute for published Trading Rules. Official retake: 20% within 24h via support (§12).",
    code: "RESET1",
    expires: "2026-05-15",
    type: "bonus",
    claimed: false,
  },
  {
    id: 3,
    title: "Infinity Points x2 Boost",
    desc: "Earn double Infinity Points on all trades for the next 7 days.",
    code: "2XPOINTS",
    expires: "2026-04-21",
    type: "boost",
    claimed: true,
  },
];

const TYPE_COLOR: Record<string, string> = {
  discount: "from-gold-500/20 to-gold-600/5 border-gold-500/30",
  bonus: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
  boost: "from-purple-500/20 to-purple-600/5 border-purple-500/30",
};

const BADGE_COLOR: Record<string, string> = {
  discount: "bg-gold-500/15 text-gold-300 border-gold-500/25",
  bonus: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  boost: "bg-purple-500/15 text-purple-300 border-purple-500/25",
};

export default function OffersPage() {
  const { dict } = useDashboardPagesDict();
  const o = dict.offers;
  const [offers, setOffers] = useState(OFFERS);
  const [copied, setCopied] = useState<number | null>(null);

  const copy = (id: number, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const claim = (id: number) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, claimed: true } : o)));
  };

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          {o.title} <Sparkles className="w-5 h-5 text-gold-400" />
        </h1>
        <p className="text-sm text-neutral-400 mt-1">{o.subtitle}</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer, i) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-2xl border bg-gradient-to-br p-5 flex flex-col gap-4 ${TYPE_COLOR[offer.type]} ${offer.claimed ? "opacity-60" : ""}`}
          >
            {offer.claimed && (
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  Claimed
                </div>
              </div>
            )}

            <div className="flex items-start justify-between">
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${BADGE_COLOR[offer.type]}`}>
                {offer.type}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                <Clock className="w-3 h-3" />
                {offer.expires}
              </div>
            </div>

            <div>
              <p className="text-base font-bold text-white leading-snug">{offer.title}</p>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">{offer.desc}</p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-black/30 border border-white/8 px-3 py-2">
              <Tag className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <span className="font-mono text-sm font-bold text-white flex-1">{offer.code}</span>
              <button
                onClick={() => copy(offer.id, offer.code)}
                className="text-[11px] text-gold-300 hover:text-gold-200 font-medium transition-colors"
              >
                {copied === offer.id ? "Copied!" : "Copy"}
              </button>
            </div>

            <button
              onClick={() => claim(offer.id)}
              disabled={offer.claimed}
              className="w-full py-2.5 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-300 text-sm font-semibold hover:bg-gold-500/25 transition-all disabled:cursor-not-allowed"
            >
              Claim Offer
            </button>
          </motion.div>
        ))}
      </div>

      {offers.every((o) => o.claimed) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10"
        >
          <Sparkles className="w-10 h-10 text-gold-500/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-300">All offers claimed!</p>
          <p className="text-xs text-neutral-500 mt-1">New offers are added weekly. Check back soon.</p>
        </motion.div>
      )}
    </div>
  );
}
