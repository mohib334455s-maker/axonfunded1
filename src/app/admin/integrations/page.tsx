"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plug, BookOpen, ArrowRight, RefreshCw } from "lucide-react";
import { AdminPageHeader, AdminPanelHeader } from "@/components/admin/AdminPrimitives";
import { toast } from "sonner";

type Snapshot = {
  ok: boolean;
  integrations?: {
    traderIngestSecret: boolean;
    mtTelemetrySecret: boolean;
    openai: boolean;
  };
  mtTelemetry?: { events: number; alerts: number; alertsUnacked: number };
  traderIngest?: { accounts: number };
};

function Flag({ ok }: { ok: boolean }) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
        ok ? "text-success bg-success/10 border-success/25" : "text-warning bg-warning/10 border-warning/25"
      }`}
    >
      {ok ? "Configured" : "Missing"}
    </span>
  );
}

export default function AdminIntegrationsPage() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/snapshot", { credentials: "include" });
      const j = (await res.json()) as Snapshot;
      if (!res.ok) throw new Error((j as { error?: string }).error || res.statusText);
      setSnap(j);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
      setSnap(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const integ = snap?.integrations;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Integrations & ops"
        description="Environment checklist and links to MT5 EA, trader bot, and API secrets. Values are never shown here—only whether they appear set on the server."
        actions={
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(212,175,55,0.25)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[#ebe6dc] hover:bg-[rgba(255,255,255,0.07)]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="admin-panel rounded-2xl overflow-hidden">
          <AdminPanelHeader title="Server secrets" aside={<Plug className="w-4 h-4 text-gold-500" />} />
          <div className="p-5 space-y-4">
            {loading && !integ ? (
              <p className="text-sm text-[#8f8a82]">Loading…</p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#faf6ef]">TRADER_INGEST_SECRET</p>
                    <p className="text-xs admin-page-desc mt-0.5">Protects POST /api/trader/ingest (bot sync).</p>
                  </div>
                  <Flag ok={Boolean(integ?.traderIngestSecret)} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#faf6ef]">MT_TELEMETRY_SECRET</p>
                    <p className="text-xs admin-page-desc mt-0.5">Authenticates EA telemetry to /api/mt/telemetry.</p>
                  </div>
                  <Flag ok={Boolean(integ?.mtTelemetrySecret)} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#faf6ef]">OPENAI_API_KEY</p>
                    <p className="text-xs admin-page-desc mt-0.5">Optional AI features on the site.</p>
                  </div>
                  <Flag ok={Boolean(integ?.openai)} />
                </div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="admin-panel rounded-2xl overflow-hidden"
        >
          <AdminPanelHeader title="Live stores" aside={<span className="text-xs admin-page-desc">From snapshot</span>} />
          <div className="p-5 space-y-3 text-sm">
            <p className="text-[#ebe6dc]">
              MT telemetry events:{" "}
              <span className="font-mono font-bold text-white">{snap?.mtTelemetry?.events ?? "—"}</span>
            </p>
            <p className="text-[#ebe6dc]">
              MT unacked alerts:{" "}
              <span className="font-mono font-bold text-white">{snap?.mtTelemetry?.alertsUnacked ?? "—"}</span>
            </p>
            <p className="text-[#ebe6dc]">
              Trader ingest accounts:{" "}
              <span className="font-mono font-bold text-white">{snap?.traderIngest?.accounts ?? "—"}</span>
            </p>
            <Link
              href="/admin/trader-data"
              className="inline-block text-xs text-[#d4af37] hover:underline mt-2"
            >
              Open trader sync data →
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="admin-panel rounded-2xl overflow-hidden">
        <AdminPanelHeader title="Docs & tools" aside={<BookOpen className="w-4 h-4 text-gold-500" />} />
        <ul className="divide-y divide-[rgba(255,255,255,0.06)]">
          <li className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="text-sm text-[#ebe6dc]">MT5 EA & telemetry</span>
            <Link
              href="/admin/mt-monitor"
              className="text-xs text-[#d4af37] hover:underline inline-flex items-center gap-1"
            >
              MT monitor <ArrowRight className="w-3 h-3 opacity-70" />
            </Link>
          </li>
          <li className="px-5 py-4 text-sm text-[#8f8a82]">
            Repo paths (open in your editor):{" "}
            <code className="text-xs text-[#ebe6dc] bg-black/30 px-1.5 py-0.5 rounded">tools/mt5/README.txt</code>
            , <code className="text-xs text-[#ebe6dc] bg-black/30 px-1.5 py-0.5 rounded">scripts/trader-bot.mjs</code>
            , <code className="text-xs text-[#ebe6dc] bg-black/30 px-1.5 py-0.5 rounded">.env.example</code>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
