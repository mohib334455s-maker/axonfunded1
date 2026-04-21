"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, AlertCircle, TrendingUp, TrendingDown, Target, DollarSign, Info } from "lucide-react";
import { toast } from "sonner";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

const PAIRS: Record<string, { pip: number; base: string; quote: string }> = {
  "EUR/USD": { pip: 0.0001, base: "EUR", quote: "USD" },
  "GBP/USD": { pip: 0.0001, base: "GBP", quote: "USD" },
  "USD/JPY": { pip: 0.01, base: "USD", quote: "JPY" },
  "USD/CHF": { pip: 0.0001, base: "USD", quote: "CHF" },
  "AUD/USD": { pip: 0.0001, base: "AUD", quote: "USD" },
  "NZD/USD": { pip: 0.0001, base: "NZD", quote: "USD" },
  "USD/CAD": { pip: 0.0001, base: "USD", quote: "CAD" },
  "EUR/GBP": { pip: 0.0001, base: "EUR", quote: "GBP" },
  "EUR/JPY": { pip: 0.01, base: "EUR", quote: "JPY" },
  "GBP/JPY": { pip: 0.01, base: "GBP", quote: "JPY" },
  "XAU/USD": { pip: 0.01, base: "XAU", quote: "USD" },
  "XAG/USD": { pip: 0.001, base: "XAG", quote: "USD" },
  "US30": { pip: 1, base: "US30", quote: "USD" },
  "NAS100": { pip: 0.01, base: "NAS100", quote: "USD" },
  "US500": { pip: 0.01, base: "US500", quote: "USD" },
};

export default function CalculatorPage() {
  const { dict } = useDashboardPagesDict();
  const c = dict.calculator;
  const [accountBalance, setAccountBalance] = useState("100000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [pair, setPair] = useState("EUR/USD");
  const [entryPrice, setEntryPrice] = useState("1.0850");
  const [stopLoss, setStopLoss] = useState("1.0800");
  const [takeProfit, setTakeProfit] = useState("1.0950");
  const [direction, setDirection] = useState<"buy" | "sell">("buy");

  const calc = useMemo(() => {
    const balance = parseFloat(accountBalance) || 0;
    const riskPct = parseFloat(riskPercent) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;
    const pairInfo = PAIRS[pair];

    if (!balance || !riskPct || !entry || !sl || !pairInfo) return null;

    const riskAmount = balance * (riskPct / 100);
    const pipValue = pairInfo.pip;

    const slPips = Math.abs(entry - sl) / pipValue;
    const tpPips = tp > 0 ? Math.abs(tp - entry) / pipValue : 0;

    if (slPips === 0) return null;

    // Lot size calculation (standard lot = 100,000 units)
    // For USD-quoted pairs: pip value per standard lot ≈ $10 (for 4-decimal pairs)
    const pipValuePerLot = pair.includes("JPY") ? 1000 : (pair === "XAU/USD" ? 100 : (pair.startsWith("US") ? 1 : 10));
    const lotSize = riskAmount / (slPips * pipValuePerLot);
    const units = lotSize * 100000;
    const potentialProfit = tp > 0 ? tpPips * pipValuePerLot * lotSize : 0;
    const rrRatio = tpPips > 0 ? (tpPips / slPips).toFixed(2) : "—";

    // Daily drawdown check
    const dailyDDRemaining = balance * 0.05;
    const riskOk = riskAmount <= dailyDDRemaining;

    return {
      lotSize: Math.max(0.01, Math.round(lotSize * 100) / 100),
      units: Math.round(units),
      riskAmount: riskAmount.toFixed(2),
      slPips: Math.round(slPips),
      tpPips: Math.round(tpPips),
      potentialProfit: potentialProfit.toFixed(2),
      rrRatio,
      riskOk,
      pipValuePerLot,
    };
  }, [accountBalance, riskPercent, pair, entryPrice, stopLoss, takeProfit]);

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <Calculator className="w-4.5 h-4.5 text-gold-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">{c.title}</h1>
        </div>
        <p className="text-sm text-neutral-500 ml-12">{c.subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/8 bg-surface p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">{c.accountSettings}</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-500 block mb-1.5">{c.accountBalance}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500 font-mono text-sm">$</span>
                <input type="number" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)}
                  className="w-full bg-black/30 border border-white/8 rounded-xl pl-7 pr-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-gold-500/40 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-500 block mb-1.5">{c.riskPerTrade}</label>
              <div className="relative">
                <input type="number" step="0.1" value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-full bg-black/30 border border-white/8 rounded-xl pl-3 pr-7 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-gold-500/40 transition-all" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">%</span>
              </div>
              <div className="flex gap-1 mt-1.5">
                {[0.5, 1, 1.5, 2].map((r) => (
                  <button key={r} onClick={() => setRiskPercent(String(r))}
                    className={`flex-1 py-1 rounded text-[10px] font-medium transition-all ${riskPercent === String(r) ? "bg-gold-500/20 text-gold-500" : "bg-white/5 text-neutral-600 hover:text-neutral-400"}`}>
                    {r}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">{c.tradeSetup}</h2>

          <div>
            <label className="text-xs text-neutral-500 block mb-1.5">{c.instrument}</label>
            <select value={pair} onChange={(e) => setPair(e.target.value)}
              className="w-full bg-black/30 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-gold-500/40 appearance-none">
              {Object.keys(PAIRS).map((p) => (
                <option key={p} value={p} className="bg-surface">{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-neutral-500 block mb-1.5">{c.direction}</label>
            <div className="grid grid-cols-2 gap-2">
              {(["buy", "sell"] as const).map((dirBtn) => (
                <button
                  key={dirBtn}
                  type="button"
                  onClick={() => setDirection(dirBtn)}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    direction === dirBtn
                      ? dirBtn === "buy"
                        ? "bg-success/15 text-success border border-success/30"
                        : "bg-danger/15 text-danger border border-danger/30"
                      : "bg-white/5 text-neutral-500 border border-white/5"
                  }`}
                >
                  {dirBtn === "buy" ? c.buy : c.sell}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: c.entryPrice, value: entryPrice, setter: setEntryPrice },
              { label: c.stopLoss, value: stopLoss, setter: setStopLoss },
              { label: c.takeProfit, value: takeProfit, setter: setTakeProfit },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="text-xs text-neutral-500 block mb-1.5">{label}</label>
                <input type="number" step="0.0001" value={value} onChange={(e) => setter(e.target.value)}
                  className="w-full bg-black/30 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-gold-500/40 transition-all" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
          {calc ? (
            <>
              {/* Main Result */}
              <div className="rounded-2xl border border-gold-500/30 bg-gold-500/5 p-5 text-center">
                <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2">{c.recommendedSize}</p>
                <p className="text-5xl font-black text-gold-500 font-mono mb-1">{calc.lotSize}</p>
                <p className="text-sm text-neutral-500">
                  {c.lots} ({calc.units.toLocaleString()} {c.units})
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: DollarSign,
                    label: c.riskAmount,
                    value: `$${calc.riskAmount}`,
                    color: "text-danger",
                    note: c.noteRiskPct.replace("{pct}", riskPercent),
                  },
                  {
                    icon: Target,
                    label: c.rrRatio,
                    value: `1:${calc.rrRatio}`,
                    color: "text-gold-500",
                    note:
                      calc.rrRatio !== "—"
                        ? parseFloat(calc.rrRatio as string) >= 2
                          ? c.noteGoodRatio
                          : c.noteWidenTp
                        : c.noteSetTp,
                  },
                  {
                    icon: TrendingDown,
                    label: c.slDistance,
                    value: `${calc.slPips} ${c.pips}`,
                    color: "text-danger",
                    note: `${Math.abs(parseFloat(entryPrice) - parseFloat(stopLoss)).toFixed(5)} ${c.notePrice}`,
                  },
                  {
                    icon: TrendingUp,
                    label: c.potentialProfit,
                    value: `$${calc.potentialProfit}`,
                    color: "text-success",
                    note: `${calc.tpPips} ${c.pips}`,
                  },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/8 bg-surface p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                      <span className="text-xs text-neutral-500">{s.label}</span>
                    </div>
                    <p className={`font-mono font-bold text-lg ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-neutral-600 mt-0.5">{s.note}</p>
                  </div>
                ))}
              </div>

              {/* Risk Check */}
              <div className={`rounded-xl border p-4 flex items-start gap-3 ${calc.riskOk ? "border-success/20 bg-success/5" : "border-danger/20 bg-danger/5"}`}>
                <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${calc.riskOk ? "text-success" : "text-danger"}`} />
                <div>
                  <p className={`text-sm font-semibold ${calc.riskOk ? "text-success" : "text-danger"}`}>
                    {calc.riskOk ? c.riskOkTitle : c.riskBadTitle}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">{c.riskDdLine}</p>
                </div>
              </div>

              {/* Copy */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${pair} ${direction.toUpperCase()} | ${calc.lotSize} lots | SL: ${stopLoss} | TP: ${takeProfit} | Risk: $${calc.riskAmount}`
                  );
                  toast.success(c.toastCopied);
                }}
                className="w-full btn-outline py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                {c.copyParams}
              </button>
            </>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-surface p-8 text-center">
              <Calculator className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
              <p className="text-neutral-500 text-sm">{c.emptyCalc}</p>
            </div>
          )}

          {/* Info */}
          <div className="rounded-xl border border-white/5 bg-white/2 p-4 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-600 leading-relaxed">{c.disclaimer}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
