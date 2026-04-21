"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Award,
  Activity,
  Clock,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

function generateAllTrades(): { pnl: number; date: Date }[] {
  return [];
}

export function MetricsTradingView() {
  const { dict } = useDashboardPagesDict();
  const m = dict.metrics;
  const metrics = useMemo(() => {
    const trades = generateAllTrades();
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const avgWin = wins.length > 0 ? grossWin / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
    const pf = grossLoss > 0 ? grossWin / grossLoss : 0;
    const bestTrade = trades.length > 0 ? Math.max(...trades.map((t) => t.pnl)) : 0;
    const worstTrade = trades.length > 0 ? Math.min(...trades.map((t) => t.pnl)) : 0;
    const expectancy = trades.length > 0 ? totalPnl / trades.length : 0;

    const dailyMap = new Map<string, number>();
    trades.forEach((t) => {
      const key = t.date.toDateString();
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + t.pnl);
    });
    const dailyPnls = Array.from(dailyMap.values());
    const meanDaily = dailyPnls.reduce((s, v) => s + v, 0) / (dailyPnls.length || 1);
    const variance = dailyPnls.reduce((s, v) => s + Math.pow(v - meanDaily, 2), 0) / (dailyPnls.length || 1);
    const sharpe = variance > 0 ? (meanDaily / Math.sqrt(variance)) * Math.sqrt(252) : 0;

    return { trades, wins, losses, totalPnl, winRate, pf, avgWin, avgLoss, bestTrade, worstTrade, expectancy, sharpe };
  }, []);

  const statCards = [
    { label: "Total Trades", value: metrics.trades.length.toString(), icon: Activity, color: "text-white", trend: null },
    {
      label: "Win Rate",
      value: `${metrics.winRate.toFixed(1)}%`,
      icon: Target,
      color: metrics.winRate >= 50 ? "text-success" : "text-danger",
      trend: metrics.winRate >= 50,
    },
    {
      label: "Profit Factor",
      value: metrics.pf.toFixed(2),
      icon: TrendingUp,
      color: metrics.pf >= 1 ? "text-success" : "text-danger",
      trend: metrics.pf >= 1,
    },
    {
      label: "Net P&L",
      value: `${metrics.totalPnl >= 0 ? "+" : ""}$${metrics.totalPnl.toFixed(0)}`,
      icon: Zap,
      color: metrics.totalPnl >= 0 ? "text-success" : "text-danger",
      trend: metrics.totalPnl >= 0,
    },
    { label: "Avg Win", value: `+$${metrics.avgWin.toFixed(0)}`, icon: TrendingUp, color: "text-success", trend: true },
    { label: "Avg Loss", value: `-$${metrics.avgLoss.toFixed(0)}`, icon: TrendingDown, color: "text-danger", trend: false },
    { label: "Best Trade", value: `+$${metrics.bestTrade.toFixed(0)}`, icon: Award, color: "text-gold-500", trend: null },
    { label: "Worst Trade", value: `$${metrics.worstTrade.toFixed(0)}`, icon: Shield, color: "text-danger", trend: null },
    {
      label: "Expectancy",
      value: `$${metrics.expectancy.toFixed(1)}/trade`,
      icon: Clock,
      color: metrics.expectancy >= 0 ? "text-success" : "text-danger",
      trend: metrics.expectancy >= 0,
    },
    {
      label: "Sharpe Ratio",
      value: metrics.sharpe.toFixed(2),
      icon: BarChart2,
      color: metrics.sharpe >= 1 ? "text-success" : "text-warning",
      trend: metrics.sharpe >= 1,
    },
  ];

  const riskRewardRatio = metrics.avgLoss > 0 ? metrics.avgWin / metrics.avgLoss : 0;

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10">
            <BarChart2 className="h-4.5 w-4.5 text-gold-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">{m.title}</h1>
        </div>
        <p className="ml-12 text-sm text-neutral-500">{m.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/8 via-surface to-surface p-6"
      >
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: "Total Trades", value: metrics.trades.length, color: "text-white" },
            {
              label: "Win Rate",
              value: `${metrics.winRate.toFixed(1)}%`,
              color: metrics.winRate >= 50 ? "text-success" : "text-danger",
            },
            {
              label: "Profit Factor",
              value: metrics.pf.toFixed(2),
              color: metrics.pf >= 1 ? "text-success" : "text-danger",
            },
            {
              label: "Net P&L",
              value: `${metrics.totalPnl >= 0 ? "+" : ""}$${metrics.totalPnl.toFixed(0)}`,
              color: metrics.totalPnl >= 0 ? "text-success" : "text-danger",
            },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="mb-1 text-xs text-neutral-500">{s.label}</p>
              <p className={`font-mono text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            className="group rounded-xl border border-white/8 bg-surface p-4 transition-all hover:border-gold-500/20"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                <card.icon className="h-4 w-4 text-neutral-500" />
              </div>
              {card.trend !== null && (
                <span className={`text-xs font-semibold ${card.trend ? "text-success" : "text-danger"}`}>
                  {card.trend ? "▲" : "▼"}
                </span>
              )}
            </div>
            <p className="mb-1 text-xs text-neutral-500">{card.label}</p>
            <p className={`font-mono text-lg font-black ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/8 bg-surface p-5"
        >
          <h3 className="mb-4 text-sm font-semibold text-white">Risk / Reward Overview</h3>
          <div className="space-y-4">
            {[
              { label: "Avg Win", val: metrics.avgWin, max: Math.max(metrics.avgWin, metrics.avgLoss, 1), color: "bg-success" },
              { label: "Avg Loss", val: metrics.avgLoss, max: Math.max(metrics.avgWin, metrics.avgLoss, 1), color: "bg-danger" },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="mb-1.5 flex justify-between text-xs text-neutral-500">
                  <span>{bar.label}</span>
                  <span className="font-mono">${bar.val.toFixed(0)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((bar.val / bar.max) * 100, 100)}%` }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className={`h-full rounded-full ${bar.color}`}
                  />
                </div>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between rounded-xl border border-white/5 bg-white/3 p-3">
              <span className="text-xs text-neutral-500">Risk/Reward Ratio</span>
              <span
                className={`font-mono text-sm font-black ${riskRewardRatio >= 1 ? "text-success" : "text-warning"}`}
              >
                1 : {riskRewardRatio.toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-white/8 bg-surface p-5"
        >
          <h3 className="mb-4 text-sm font-semibold text-white">Win / Loss Distribution</h3>
          <div className="mb-3 flex h-28 items-end gap-2">
            {[
              { label: "Wins", count: metrics.wins.length, color: "bg-success" },
              { label: "Losses", count: metrics.losses.length, color: "bg-danger" },
            ].map((bar) => {
              const total = metrics.trades.length || 1;
              const pct = (bar.count / total) * 100;
              return (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="font-mono text-xs text-white">{bar.count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                    className={`w-full rounded-t-lg ${bar.color} opacity-80`}
                    style={{ minHeight: 4 }}
                  />
                  <span className="text-[10px] text-neutral-500">{bar.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-neutral-500">
            <span>{metrics.winRate.toFixed(1)}% win rate</span>
            <span>{metrics.trades.length} total trades (90 days)</span>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Link
          href="/dashboard?tab=analytics"
          className="group flex items-center gap-3 rounded-xl border border-gold-500/15 bg-gold-500/5 p-4 transition-all hover:bg-gold-500/10"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/10">
            <Activity className="h-4.5 w-4.5 text-gold-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white transition-colors group-hover:text-gold-300">
              View P&L Calendar
            </p>
            <p className="text-xs text-neutral-500">Daily heatmap and session breakdown</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-gold-500/50 transition-colors group-hover:text-gold-500" />
        </Link>
      </motion.div>
    </div>
  );
}
