"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart2,
  Zap,
  Award,
  Target,
} from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

/** No seeded P&L — calendar stays empty until real data is wired. */
function generateMonthData(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days: { day: number; pnl: number | null; trades: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, pnl: null, trades: 0 });
  }
  return { days, firstDay };
}

function getPnlColor(pnl: number | null): string {
  if (pnl === null) return "transparent";
  if (pnl > 600) return "rgba(0,200,83,0.9)";
  if (pnl > 300) return "rgba(0,200,83,0.65)";
  if (pnl > 100) return "rgba(0,200,83,0.35)";
  if (pnl > 0) return "rgba(0,200,83,0.18)";
  if (pnl > -100) return "rgba(255,23,68,0.18)";
  if (pnl > -250) return "rgba(255,23,68,0.35)";
  return "rgba(255,23,68,0.75)";
}

function getPnlTextColor(pnl: number | null): string {
  if (pnl === null) return "#525252";
  return pnl >= 0 ? "#00C853" : "#FF1744";
}

interface DayData {
  day: number;
  pnl: number | null;
  trades: number;
}
interface DayDetail {
  day: number;
  pnl: number;
  trades: number;
}

export function AnalyticsTradingView() {
  const { dict } = useDashboardPagesDict();
  const a = dict.analytics;
  const MONTHS = a.months;
  const DAYS_ABBR = a.days;

  const now = new Date();
  const [viewDate, setViewDate] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDay, setSelectedDay] = useState<DayDetail | null>(null);

  const { days, firstDay } = generateMonthData(viewDate.year, viewDate.month);

  const tradingDays = days.filter((d) => d.pnl !== null);
  const winDays = tradingDays.filter((d) => d.pnl! > 0);
  const lossDays = tradingDays.filter((d) => d.pnl! < 0);
  const totalPnl = tradingDays.reduce((s, d) => s + d.pnl!, 0);
  const grossWin = winDays.reduce((s, d) => s + d.pnl!, 0);
  const grossLoss = Math.abs(lossDays.reduce((s, d) => s + d.pnl!, 0));
  const profitFactor = grossLoss > 0 ? (grossWin / grossLoss).toFixed(2) : "∞";
  const winRate = tradingDays.length > 0 ? Math.round((winDays.length / tradingDays.length) * 100) : 0;
  const bestDay = tradingDays.length > 0 ? Math.max(...tradingDays.map((d) => d.pnl!)) : 0;
  const worstDay = tradingDays.length > 0 ? Math.min(...tradingDays.map((d) => d.pnl!)) : 0;

  let streak = 0;
  const reversedTrading = [...tradingDays].reverse();
  if ((reversedTrading[0]?.pnl ?? 0) > 0) {
    for (const d of reversedTrading) {
      if (d.pnl! > 0) streak++;
      else break;
    }
  }

  const prevMonth = () => {
    setViewDate((p) => {
      if (p.month === 0) return { year: p.year - 1, month: 11 };
      return { year: p.year, month: p.month - 1 };
    });
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setViewDate((p) => {
      if (p.month === 11) return { year: p.year + 1, month: 0 };
      return { year: p.year, month: p.month + 1 };
    });
    setSelectedDay(null);
  };

  const calendarCells: (DayData | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  days.forEach((d) => calendarCells.push(d));
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10">
            <Calendar className="h-4.5 w-4.5 text-gold-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">{a.title}</h1>
        </div>
        <p className="ml-12 text-sm text-neutral-500">{a.heatmapHint}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        {[
          {
            label: a.statNetPnl,
            value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(0)}`,
            color: totalPnl >= 0 ? "text-success" : "text-danger",
            icon: TrendingUp,
          },
          { label: a.statWinRate, value: `${winRate}%`, color: "text-gold-500", icon: Target },
          { label: a.statPf, value: profitFactor, color: "text-gold-500", icon: BarChart2 },
          { label: a.statBestDay, value: `+$${bestDay.toFixed(0)}`, color: "text-success", icon: Zap },
          { label: a.statWorstDay, value: `$${worstDay.toFixed(0)}`, color: "text-danger", icon: TrendingDown },
          {
            label: a.statStreak,
            value: a.streakDays.replace("{n}", String(streak)),
            color: streak > 0 ? "text-gold-500" : "text-neutral-500",
            icon: Award,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/8 bg-surface px-4 py-3">
            <p className="mb-1 text-xs text-neutral-500">{stat.label}</p>
            <p className={`font-mono text-lg font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/8 bg-surface p-4 sm:p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 text-neutral-400 transition-all hover:border-gold-500/30 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-bold text-white">
            {MONTHS[viewDate.month]} {viewDate.year}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 text-neutral-400 transition-all hover:border-gold-500/30 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7">
          {DAYS_ABBR.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-neutral-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarCells.map((cell, idx) => {
            if (!cell) return <div key={idx} />;
            const isSelected = selectedDay?.day === cell.day;
            const hasTrades = cell.pnl !== null;

            return (
              <motion.button
                key={idx}
                type="button"
                whileHover={hasTrades ? { scale: 1.05 } : {}}
                whileTap={hasTrades ? { scale: 0.97 } : {}}
                onClick={() =>
                  hasTrades &&
                  setSelectedDay(
                    selectedDay?.day === cell.day ? null : { day: cell.day, pnl: cell.pnl!, trades: cell.trades }
                  )
                }
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl transition-all duration-200 ${
                  hasTrades ? "cursor-pointer" : "cursor-default opacity-30"
                } ${isSelected ? "ring-2 ring-gold-500/60 ring-offset-1 ring-offset-surface" : ""}`}
                style={{
                  background: hasTrades ? getPnlColor(cell.pnl) : "rgba(255,255,255,0.03)",
                  border: isSelected ? "1px solid rgba(255,215,0,0.4)" : "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span className="text-[10px] font-bold sm:text-xs" style={{ color: getPnlTextColor(cell.pnl) }}>
                  {cell.day}
                </span>
                {hasTrades && (
                  <span
                    className="font-mono text-[9px] font-semibold leading-tight sm:text-[10px]"
                    style={{ color: getPnlTextColor(cell.pnl) }}
                  >
                    {cell.pnl! >= 0 ? "+" : ""}${Math.abs(cell.pnl!).toFixed(0)}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/5 pt-4">
          <span className="text-xs font-medium text-neutral-600">{a.legend}</span>
          {[
            { color: "rgba(0,200,83,0.18)", label: a.legSmallWin },
            { color: "rgba(0,200,83,0.65)", label: a.legBigWin },
            { color: "rgba(255,23,68,0.18)", label: a.legSmallLoss },
            { color: "rgba(255,23,68,0.75)", label: a.legBigLoss },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="h-3.5 w-3.5 rounded-sm"
                style={{ background: item.color, border: "1px solid rgba(255,255,255,0.08)" }}
              />
              <span className="text-xs text-neutral-500">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div
              className="h-3.5 w-3.5 rounded-sm"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}
            />
            <span className="text-xs text-neutral-600">{a.legWeekend}</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-gold-500/25 bg-gradient-to-b from-gold-500/5 to-surface p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="mb-0.5 text-xs text-neutral-500">
                  {a.dayTitle
                    .replace("{month}", MONTHS[viewDate.month] ?? "")
                    .replace("{day}", String(selectedDay.day))
                    .replace("{year}", String(viewDate.year))}
                </p>
                <h3
                  className={`font-mono text-2xl font-black ${selectedDay.pnl >= 0 ? "text-success" : "text-danger"}`}
                >
                  {selectedDay.pnl >= 0 ? "+" : ""}${selectedDay.pnl.toFixed(2)}
                </h3>
              </div>
              <div
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  selectedDay.pnl >= 0
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-danger/20 bg-danger/10 text-danger"
                }`}
              >
                {selectedDay.pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {selectedDay.pnl >= 0 ? a.detailProfitable : a.detailLoss}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Trades", value: selectedDay.trades },
                { label: "Avg per Trade", value: `$${(selectedDay.pnl / selectedDay.trades).toFixed(0)}` },
                { label: "Day Result", value: selectedDay.pnl >= 0 ? "✓ Win" : "✗ Loss" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/5 bg-black/20 p-3 text-center">
                  <p className="mb-1 text-xs text-neutral-500">{s.label}</p>
                  <p className="font-mono font-bold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/8 bg-surface p-5"
      >
        <h3 className="mb-5 text-base font-semibold text-white">{a.barsTitle}</h3>
        <div className="flex h-28 items-end gap-1">
          {days
            .filter((day) => day.pnl !== null)
            .map((day) => {
              const maxAbs = Math.max(...days.filter((x) => x.pnl !== null).map((x) => Math.abs(x.pnl!)), 1);
              const heightPct = (Math.abs(day.pnl!) / maxAbs) * 100;
              const isPos = day.pnl! >= 0;
              return (
                <motion.div
                  key={day.day}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3 + day.day * 0.015 }}
                  style={{ transformOrigin: "bottom" }}
                  className="flex flex-1 flex-col items-center justify-end gap-0.5"
                  title={`Day ${day.day}: ${day.pnl! >= 0 ? "+" : ""}$${day.pnl!}`}
                >
                  <div
                    className="w-full rounded-t-sm transition-all hover:opacity-80"
                    style={{
                      height: `${Math.max(heightPct, 4)}%`,
                      background: isPos ? "rgba(0,200,83,0.7)" : "rgba(255,23,68,0.7)",
                    }}
                  />
                  <span className="text-[9px] text-neutral-700">{day.day}</span>
                </motion.div>
              );
            })}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-600">
          <span>{a.winDaysCount.replace("{n}", String(winDays.length))}</span>
          <span>{a.lossDaysCount.replace("{n}", String(lossDays.length))}</span>
        </div>
      </motion.div>
    </div>
  );
}
