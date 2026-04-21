"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPrimitives";
import type { OrderRecord } from "@/lib/server/trader-store";

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ops/orders", { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        toast.error("Could not load orders");
        return;
      }
      const j = (await res.json()) as { data?: OrderRecord[] };
      setRows(Array.isArray(j.data) ? j.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders & payments"
        description="Source of truth in .data/trader-store.json — channels show how each row was settled (demo, Stripe, USDT)."
        actions={
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/admin/ops/export?type=orders"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white hover:border-gold-500/30"
            >
              <Download className="w-4 h-4" /> Orders CSV
            </a>
            <a
              href="/api/admin/ops/export?type=audit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-white hover:border-gold-500/30"
            >
              <Download className="w-4 h-4" /> Audit CSV
            </a>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/25 text-sm font-semibold text-gold-400 hover:bg-gold-500/25"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        }
      />

      <div className="admin-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="text-left border-b border-white/10 text-[11px] uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Trader</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Stripe session</th>
                <th className="px-4 py-3">USDT tx</th>
                <th className="px-4 py-3">Paid at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                  className="hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-2.5 font-mono text-gold-400/90 text-xs">{o.receiptId}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-400">{o.id}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-500">{o.traderId}</td>
                  <td className="px-4 py-2.5 text-neutral-200">{o.tierName}</td>
                  <td className="px-4 py-2.5 text-white font-semibold">${o.amountUsd}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] px-2 py-0.5 rounded-md border border-white/10 bg-black/30 text-neutral-300">
                      {o.paymentChannel}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500 max-w-[140px] truncate" title={o.stripeSessionId}>
                    {o.stripeSessionId || "—"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500 max-w-[120px] truncate" title={o.usdtTxHash}>
                    {o.usdtTxHash || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-neutral-500 tabular-nums">{o.paidAt}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && (
          <p className="text-center text-neutral-500 text-sm py-12">No orders in store yet.</p>
        )}
      </div>
    </div>
  );
}
