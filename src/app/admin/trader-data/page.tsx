"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Database, RefreshCw } from "lucide-react";
import { AdminPageHeader, AdminPanelHeader } from "@/components/admin/AdminPrimitives";
import { toast } from "sonner";

type Row = {
  accountId: string;
  updatedAt: string;
  metrics: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

export default function AdminTraderDataPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trader-ingest", { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || res.statusText);
      setRows(j.accounts ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Trader sync data"
        description="Latest snapshots written by the trader bot to POST /api/trader/ingest (.data/trader-ingest.json). Read-only."
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

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="admin-panel rounded-2xl overflow-hidden">
        <AdminPanelHeader title={`Accounts (${rows.length})`} aside={<Database className="w-4 h-4 text-gold-500" />} />
        {loading ? (
          <p className="p-5 text-sm text-[#8f8a82]">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-[#8f8a82]">No ingested accounts yet. Run scripts/trader-bot.mjs with TRADER_INGEST_SECRET set.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)] text-xs uppercase tracking-wide text-[#8f8a82]">
                  <th className="px-5 py-3 font-semibold">Account</th>
                  <th className="px-5 py-3 font-semibold">Updated</th>
                  <th className="px-5 py-3 font-semibold">Metrics (JSON)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
                {rows.map((r) => (
                  <tr key={r.accountId} className="hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="px-5 py-3 font-mono text-xs text-[#faf6ef] whitespace-nowrap">{r.accountId}</td>
                    <td className="px-5 py-3 text-xs text-[#b8a88a] whitespace-nowrap">{r.updatedAt}</td>
                    <td className="px-5 py-3 text-xs text-[#ebe6dc] font-mono max-w-md truncate" title={JSON.stringify(r.metrics)}>
                      {JSON.stringify(r.metrics)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
