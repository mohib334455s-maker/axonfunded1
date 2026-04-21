"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Trophy,
  Banknote,
  FileCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Activity,
  Radar,
  Database,
  Plug,
  Settings,
  Bell,
} from "lucide-react";
import { PLATFORM_STATS } from "@/lib/platform-stats";
import { mockLeaderboard } from "@/lib/mock-data";
import { AdminPageHeader, AdminPanelHeader } from "@/components/admin/AdminPrimitives";

type Snapshot = {
  ok?: boolean;
  mtTelemetry?: { events: number; alerts: number; alertsUnacked: number };
  traderIngest?: { accounts: number; lastUpdates?: { accountId: string; updatedAt: string }[] };
  integrations?: { traderIngestSecret: boolean; mtTelemetrySecret: boolean; openai: boolean };
};

const recentActivity = [
  { id: 1, type: "kyc", user: "Elena Vasquez", action: "KYC documents submitted", time: "2 min ago", status: "pending" },
  { id: 2, type: "payout", user: "Marcus Chen", action: "Payout request $4,800", time: "15 min ago", status: "pending" },
  { id: 3, type: "challenge", user: "Yuki Tanaka", action: "Passed Phase 2 ($100K)", time: "1 hour ago", status: "success" },
  { id: 4, type: "challenge", user: "Diego Martinez", action: "Failed Phase 1 (daily DD)", time: "2 hours ago", status: "danger" },
  { id: 5, type: "payout", user: "Sarah Williams", action: "Payout $3,200 approved", time: "3 hours ago", status: "success" },
  { id: 6, type: "user", user: "James Park", action: "New registration", time: "4 hours ago", status: "info" },
  { id: 7, type: "kyc", user: "Amara Osei", action: "KYC approved", time: "5 hours ago", status: "success" },
  { id: 8, type: "challenge", user: "Lior Ben-David", action: "Started $50K challenge", time: "6 hours ago", status: "info" },
];

const topTraders = mockLeaderboard.slice(0, 5);

const statusColors: Record<string, string> = {
  pending: "text-warning bg-warning/10 border-warning/20",
  success: "text-success bg-success/10 border-success/20",
  danger: "text-danger bg-danger/10 border-danger/20",
  info: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  success: CheckCircle2,
  danger: XCircle,
  info: ArrowUpRight,
};

const quickLinks = [
  { href: "/admin/mt-monitor", label: "MT monitor", icon: Radar, desc: "Telemetry & alerts" },
  { href: "/admin/trader-data", label: "Trader sync", icon: Database, desc: "Bot snapshots" },
  { href: "/admin/integrations", label: "Integrations", icon: Plug, desc: "Secrets & ops" },
  { href: "/admin/users", label: "Users", icon: Users, desc: "Accounts" },
  { href: "/admin/challenges", label: "Challenges", icon: Trophy, desc: "Programmes" },
  { href: "/admin/payouts", label: "Payouts", icon: Banknote, desc: "Requests" },
  { href: "/admin/kyc", label: "KYC", icon: FileCheck, desc: "Review queue" },
  { href: "/admin/announcements", label: "Announcements", icon: Bell, desc: "Broadcast" },
  { href: "/admin/settings", label: "Settings", icon: Settings, desc: "Admin prefs" },
];

export default function AdminDashboardPage() {
  const [snap, setSnap] = useState<Snapshot | null>(null);

  const loadSnap = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/snapshot", { credentials: "include" });
      const j = (await res.json()) as Snapshot;
      if (res.ok) setSnap(j);
    } catch {
      setSnap(null);
    }
  }, []);

  useEffect(() => {
    loadSnap();
  }, [loadSnap]);

  const stats = useMemo(() => {
    const mt = snap?.mtTelemetry;
    const ti = snap?.traderIngest;
    const integ = snap?.integrations;
    const secretsOk =
      integ != null ? [integ.traderIngestSecret, integ.mtTelemetrySecret].filter(Boolean).length : null;

    return [
      { label: "Total Users", value: PLATFORM_STATS.fundedTraders.toLocaleString(), icon: Users, change: "+124 this week", up: true },
      { label: "Active Challenges", value: "1,284", icon: Trophy, change: "+38 today", up: true },
      { label: "Pending Payouts", value: "47", icon: Banknote, change: "$84,200 total", up: false },
      {
        label: "MT telemetry events",
        value: mt != null ? mt.events.toLocaleString() : "—",
        icon: Radar,
        change: mt != null ? `${mt.alertsUnacked} unacked alerts` : "Live (sign in)",
        up: mt == null ? true : mt.alertsUnacked === 0,
      },
      {
        label: "Trader ingest accounts",
        value: ti != null ? ti.accounts.toLocaleString() : "—",
        icon: Database,
        change: ti != null && ti.accounts > 0 ? "Synced from bot" : "Run trader bot",
        up: ti != null && ti.accounts > 0,
      },
      {
        label: "Core API secrets",
        value: secretsOk != null ? `${secretsOk}/2` : "—",
        icon: Plug,
        change: secretsOk === 2 ? "Ingest + MT set" : "Check integrations",
        up: secretsOk === 2,
      },
      { label: "Total Payouts", value: `$${PLATFORM_STATS.totalPayoutsM}M`, icon: TrendingUp, change: "+$42K this week", up: true },
      { label: "Pass Rate", value: `${PLATFORM_STATS.challengePassRate}%`, icon: Activity, change: "All-time average", up: true },
    ];
  }, [snap]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Admin dashboard"
        description="Platform overview, live MT/trader stores, and shortcuts to every admin screen."
        actions={
          <button
            type="button"
            onClick={() => loadSnap()}
            className="rounded-lg border border-[rgba(212,175,55,0.25)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[#ebe6dc] hover:bg-[rgba(255,255,255,0.07)]"
          >
            Refresh live data
          </button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-panel rounded-2xl p-5"
      >
        <AdminPanelHeader title="Quick access" aside={<span className="text-xs admin-page-desc">All admin areas</span>} />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map((q) => (
            <Link
              key={q.href + q.label}
              href={q.href}
              className="flex flex-col gap-1 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-3 py-3 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#faf6ef]">
                <q.icon className="w-4 h-4 text-gold-500 shrink-0" />
                {q.label}
              </div>
              <span className="text-[11px] text-[#8f8a82]">{q.desc}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="admin-panel rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-gold-500" />
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${s.up ? "text-success bg-success/10" : "text-neutral-500 bg-white/5"}`}>
                {s.up ? "↑" : "·"} {s.change}
              </span>
            </div>
            <p className="text-xl font-black text-[#faf6ef] font-mono">{s.value}</p>
            <p className="text-xs admin-page-desc mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 admin-panel rounded-2xl overflow-hidden">
          <AdminPanelHeader title="Recent activity" aside={<span className="text-xs admin-page-desc">Illustrative</span>} />
          <div className="divide-y divide-[rgba(255,255,255,0.06)]">
            {recentActivity.map((item) => {
              const StatusIcon = statusIcons[item.status];
              return (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${statusColors[item.status]}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{item.user}</p>
                    <p className="text-xs text-neutral-500 truncate">{item.action}</p>
                  </div>
                  <span className="text-[11px] text-[#6d6860] flex-shrink-0">{item.time}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Traders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="admin-panel rounded-2xl overflow-hidden">
          <AdminPanelHeader
            title="Top traders"
            aside={
              <a href="/admin/users" className="text-xs text-[#d4af37] hover:text-[#e8c547] hover:underline transition-colors">
                View all
              </a>
            }
          />
          <div className="p-4 space-y-3">
            {topTraders.map((trader, i) => (
              <div key={trader.traderId} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  i === 0 ? "bg-gold-500 text-black" : i === 1 ? "bg-neutral-500 text-white" : i === 2 ? "bg-amber-700 text-white" : "bg-white/5 text-neutral-400"
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{trader.traderName}</p>
                  <p className="text-[10px] admin-page-desc">{trader.winRate}% win rate</p>
                </div>
                <span className="text-xs font-bold text-success font-mono">+${trader.profit.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
