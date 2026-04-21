"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, AlertTriangle, TrendingUp, Globe, Clock, ChevronDown } from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  flag: string;
  title: string;
  impact: "high" | "medium" | "low";
  forecast: string;
  previous: string;
  actual?: string;
  currency: string;
}

const today = new Date();
const formatDate = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

const events: Record<string, EconomicEvent[]> = {
  today: [
    { id: "1", time: "08:30", country: "USD", flag: "🇺🇸", title: "Initial Jobless Claims", impact: "medium", forecast: "218K", previous: "220K", actual: "215K", currency: "USD" },
    { id: "2", time: "10:00", country: "USD", flag: "🇺🇸", title: "ISM Manufacturing PMI", impact: "high", forecast: "48.5", previous: "47.8", actual: "49.2", currency: "USD" },
    { id: "3", time: "12:30", country: "EUR", flag: "🇪🇺", title: "ECB Interest Rate Decision", impact: "high", forecast: "4.50%", previous: "4.50%", currency: "EUR" },
    { id: "4", time: "13:30", country: "EUR", flag: "🇪🇺", title: "ECB Press Conference", impact: "high", forecast: "", previous: "", currency: "EUR" },
    { id: "5", time: "15:30", country: "GBP", flag: "🇬🇧", title: "UK Construction PMI", impact: "low", forecast: "50.2", previous: "49.7", currency: "GBP" },
    { id: "6", time: "23:50", country: "JPY", flag: "🇯🇵", title: "Japan GDP q/q", impact: "medium", forecast: "0.3%", previous: "-0.1%", currency: "JPY" },
  ],
  tomorrow: [
    { id: "7", time: "08:30", country: "USD", flag: "🇺🇸", title: "Non-Farm Payrolls", impact: "high", forecast: "185K", previous: "199K", currency: "USD" },
    { id: "8", time: "08:30", country: "USD", flag: "🇺🇸", title: "Unemployment Rate", impact: "high", forecast: "3.7%", previous: "3.7%", currency: "USD" },
    { id: "9", time: "08:30", country: "USD", flag: "🇺🇸", title: "Average Hourly Earnings m/m", impact: "high", forecast: "0.3%", previous: "0.4%", currency: "USD" },
    { id: "10", time: "10:00", country: "CAD", flag: "🇨🇦", title: "Ivey PMI", impact: "medium", forecast: "55.0", previous: "56.8", currency: "CAD" },
    { id: "11", time: "14:00", country: "USD", flag: "🇺🇸", title: "Fed Chair Powell Speaks", impact: "high", forecast: "", previous: "", currency: "USD" },
  ],
  "2days": [
    { id: "12", time: "02:00", country: "CNY", flag: "🇨🇳", title: "CPI y/y", impact: "medium", forecast: "0.5%", previous: "0.7%", currency: "CNY" },
    { id: "13", time: "09:30", country: "EUR", flag: "🇪🇺", title: "German Industrial Production m/m", impact: "medium", forecast: "-0.3%", previous: "0.6%", currency: "EUR" },
    { id: "14", time: "10:00", country: "GBP", flag: "🇬🇧", title: "BoE Governor Bailey Speaks", impact: "high", forecast: "", previous: "", currency: "GBP" },
    { id: "15", time: "15:00", country: "USD", flag: "🇺🇸", title: "Consumer Credit m/m", impact: "low", forecast: "15.0B", previous: "1.9B", currency: "USD" },
  ],
};

const impactConfig = {
  high: { color: "text-danger", bg: "bg-danger/15", border: "border-danger/20", dot: "bg-danger", label: "High Impact" },
  medium: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", dot: "bg-warning", label: "Medium" },
  low: { color: "text-neutral-500", bg: "bg-white/5", border: "border-white/8", dot: "bg-neutral-600", label: "Low" },
};

const currencyColors: Record<string, string> = {
  USD: "text-blue-400", EUR: "text-yellow-400", GBP: "text-purple-400",
  JPY: "text-red-400", AUD: "text-green-400", CAD: "text-orange-400", CNY: "text-pink-400",
};

export default function EconomicCalendarPage() {
  const { dict } = useDashboardPagesDict();
  const cal = dict.calendar;
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [expandedDay, setExpandedDay] = useState<string>("today");

  const DAYS = [
    { key: "today", label: "Today", date: formatDate(0) },
    { key: "tomorrow", label: "Tomorrow", date: formatDate(1) },
    { key: "2days", label: formatDate(2).split(",")[0], date: formatDate(2) },
  ];

  const getFiltered = (dayKey: string) =>
    (events[dayKey] || []).filter((e) => filter === "all" || e.impact === filter);

  const highImpactCount = Object.values(events).flat().filter((e) => e.impact === "high").length;

  return (
    <div className="space-y-6 dashboard-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <CalendarDays className="w-4.5 h-4.5 text-gold-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">{cal.title}</h1>
        </div>
        <p className="text-sm text-neutral-500 ml-12">{cal.subtitle}</p>
      </motion.div>

      {/* Alert Banner */}
      {getFiltered("today").filter((e) => e.impact === "high" && !e.actual).length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl border border-danger/25 bg-danger/5">
          <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-danger">High-Impact Events Today</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {getFiltered("today").filter((e) => e.impact === "high" && !e.actual).length} upcoming high-impact events. Manage your positions accordingly and consider widening stops.
            </p>
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3">
        {[
          { label: "High Impact Events", value: highImpactCount, color: "text-danger", icon: AlertTriangle },
          { label: "Today's Events", value: events.today.length, color: "text-gold-500", icon: CalendarDays },
          { label: "NFP This Week", value: "Fri 08:30", color: "text-success", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/8 bg-surface px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              <p className="text-xs text-neutral-500">{s.label}</p>
            </div>
            <p className={`font-black font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "all", label: "All Events" },
          { id: "high", label: "🔴 High Impact" },
          { id: "medium", label: "🟡 Medium" },
          { id: "low", label: "⚪ Low" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === f.id ? "bg-gold-500/15 text-gold-500 border border-gold-500/30" : "text-neutral-400 border border-white/5 hover:border-white/15"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Events by Day */}
      {DAYS.map((day, di) => {
        const dayEvents = getFiltered(day.key);
        const isExpanded = expandedDay === day.key;
        return (
          <motion.div key={day.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.08 }}
            className="rounded-2xl border border-white/8 bg-surface overflow-hidden">
            {/* Day Header */}
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/2 transition-colors"
              onClick={() => setExpandedDay(isExpanded ? "" : day.key)}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${day.key === "today" ? "bg-gold-500 animate-pulse" : "bg-neutral-600"}`} />
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{day.label}</p>
                  <p className="text-xs text-neutral-500">{day.date}</p>
                </div>
                <div className="flex gap-1.5">
                  {["high", "medium", "low"].map((imp) => {
                    const count = (events[day.key] || []).filter((e) => e.impact === imp).length;
                    if (!count) return null;
                    return (
                      <span key={imp} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${impactConfig[imp as keyof typeof impactConfig].bg} ${impactConfig[imp as keyof typeof impactConfig].color}`}>
                        {count} {imp}
                      </span>
                    );
                  })}
                </div>
              </div>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </motion.div>
            </button>

            {/* Events List */}
            {isExpanded && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="overflow-hidden">
                <div className="border-t border-white/5">
                  {dayEvents.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-neutral-600 text-center">No events match filter</p>
                  ) : (
                    dayEvents.map((event, i) => {
                      const impact = impactConfig[event.impact];
                      return (
                        <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                          className="px-5 py-4 border-b border-white/3 last:border-0 hover:bg-white/1 transition-colors">
                          <div className="flex items-start gap-4">
                            {/* Time */}
                            <div className="w-16 flex-shrink-0">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-neutral-600" />
                                <span className="font-mono text-xs text-neutral-400">{event.time}</span>
                              </div>
                            </div>

                            {/* Impact */}
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${impact.dot}`} />

                            {/* Event Info */}
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                                <span className="text-sm font-medium text-white">{event.title}</span>
                                <span className={`text-xs font-semibold ${currencyColors[event.currency] || "text-neutral-400"}`}>
                                  {event.flag} {event.currency}
                                </span>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${impact.bg} ${impact.color} border ${impact.border}`}>
                                  {impact.label}
                                </span>
                              </div>
                              <div className="flex gap-4 text-xs">
                                {event.forecast && (
                                  <span className="text-neutral-500">Forecast: <span className="text-neutral-300 font-mono">{event.forecast}</span></span>
                                )}
                                <span className="text-neutral-500">Prev: <span className="text-neutral-300 font-mono">{event.previous || "—"}</span></span>
                                {event.actual && (
                                  <span className="text-neutral-500">Actual: <span className={`font-mono font-bold ${parseFloat(event.actual) >= parseFloat(event.forecast || "0") ? "text-success" : "text-danger"}`}>{event.actual}</span></span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Disclaimer */}
      <p className="text-xs text-neutral-700 text-center">
        <Globe className="w-3 h-3 inline mr-1" />
        Times shown in UTC. Data is for informational purposes only.
      </p>
    </div>
  );
}
