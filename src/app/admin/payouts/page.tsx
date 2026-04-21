"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Search, Banknote, AlertTriangle, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPrimitives";
import type { DashboardPayout } from "@/lib/types/trader-dashboard";

type Row = DashboardPayout & { traderId: string; traderEmail?: string };

const methodIcons: Record<string, string> = {
  crypto_usdt: "₮",
  crypto_btc: "₿",
  bank_transfer: "🏦",
  wise: "W",
};

export default function AdminPayoutsPage() {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("pending");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ops/payouts", { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        toast.error("Could not load payouts");
        return;
      }
      const j = (await res.json()) as { data?: Row[] };
      setData(Array.isArray(j.data) ? j.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (row: Row, action: "approve" | "reject" | "complete") => {
    const key = `${row.traderId}:${row.id}:${action}`;
    setBusy(key);
    try {
      const body: { traderId: string; payoutId: string; action: typeof action; reason?: string } = {
        traderId: row.traderId,
        payoutId: row.id,
        action,
      };
      if (action === "reject") {
        const reason = window.prompt("Rejection reason (AML / rules / other):") || "Rejected by operations";
        body.reason = reason;
      }
      const res = await fetch("/api/admin/ops/payouts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        toast.error("Invalid state transition or not found");
        return;
      }
      toast.success(action === "approve" ? "Marked for treasury (processing)" : action === "complete" ? "Marked completed" : "Rejected");
      await load();
    } finally {
      setBusy(null);
    }
  };

  const filtered = data.filter((p) => {
    const matchSearch =
      (p.traderEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
      p.traderId.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const pendingTotal = data.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payouts"
        description="AML queue: approve → processing (treasury) → complete, or reject with reason. All actions are audited."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/admin/ops/export?type=payouts"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white hover:border-gold-500/30"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </a>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gold-500/25 text-xs font-semibold text-gold-400"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-warning/25 bg-warning/[0.08]">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <div>
                <p className="text-xs font-bold text-warning">{data.filter((p) => p.status === "pending").length} pending</p>
                <p className="text-[11px] text-warning/75">${pendingTotal.toLocaleString()} awaiting</p>
              </div>
            </div>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trader / email / payout id…"
            className="w-full bg-surface border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-gold-500/40"
          />
        </div>
        <div className="flex bg-surface border border-white/8 rounded-xl overflow-hidden flex-wrap">
          {["pending", "processing", "completed", "rejected", "all"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-xs font-semibold capitalize transition-colors ${
                filter === f ? "bg-gold-500/15 text-gold-500" : "text-neutral-500 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((payout, i) => (
          <motion.div
            key={`${payout.traderId}-${payout.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`admin-panel rounded-2xl p-5 ${
              payout.status === "pending"
                ? "ring-1 ring-warning/15"
                : payout.status === "processing"
                  ? "ring-1 ring-sky-500/15"
                  : payout.status === "completed"
                    ? "ring-1 ring-success/12"
                    : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-lg font-bold text-gold-500 flex-shrink-0">
                  {methodIcons[payout.method] || "$"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white font-mono">{payout.traderId}</p>
                    <span className="text-[10px] text-neutral-500">{payout.id}</span>
                  </div>
                  <p className="text-xs text-neutral-500">{payout.traderEmail ?? "—"}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-[11px] text-neutral-400 font-mono bg-black/20 px-2 py-0.5 rounded">{payout.accountId}</span>
                    <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <Banknote className="w-3 h-3" />
                      {payout.method}
                    </span>
                    <span className="text-[11px] text-neutral-600 tabular-nums">
                      {typeof payout.requestedAt === "string" ? payout.requestedAt : payout.requestedAt.toISOString()}
                    </span>
                  </div>
                  {payout.rejectionReason && (
                    <p className="text-xs text-rose-400/90 mt-2">Reason: {payout.rejectionReason}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-xl font-black text-white font-mono">${payout.amount.toLocaleString()}</p>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${
                    payout.status === "pending"
                      ? "text-warning border-warning/25 bg-warning/10"
                      : payout.status === "processing"
                        ? "text-sky-300 border-sky-500/25 bg-sky-500/10"
                        : payout.status === "completed"
                          ? "text-success border-success/25 bg-success/10"
                          : "text-neutral-400 border-white/10 bg-black/20"
                  }`}
                >
                  {payout.status}
                </span>
                {payout.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => void act(payout, "approve")}
                      className="px-3 py-2 rounded-lg bg-success/15 border border-success/25 text-success text-xs font-bold hover:bg-success/25"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => void act(payout, "reject")}
                      className="px-3 py-2 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-400 text-xs font-bold hover:bg-rose-500/25"
                    >
                      <XCircle className="w-3.5 h-3.5 inline mr-1" />
                      Reject
                    </button>
                  </div>
                )}
                {payout.status === "processing" && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void act(payout, "complete")}
                    className="px-3 py-2 rounded-lg bg-gold-500/20 border border-gold-500/35 text-gold-300 text-xs font-bold hover:bg-gold-500/30"
                  >
                    Mark paid (treasury)
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && data.length === 0 && (
        <div className="text-center py-16 text-neutral-500 text-sm admin-panel rounded-2xl">
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          No payout requests in store.
        </div>
      )}
    </div>
  );
}
