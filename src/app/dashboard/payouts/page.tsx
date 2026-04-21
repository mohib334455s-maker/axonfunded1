"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  Bitcoin,
  CreditCard,
  Building2,
  Clock,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import type { DashboardPayout } from "@/lib/server/dashboard-memory";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

type OrderRow = {
  id: string;
  planSlug: string;
  receiptId: string;
  status: string;
  paidAt: string;
};

const payoutMethods = [
  { id: "crypto_usdt", label: "USDT (TRC-20)", icon: Wallet, fee: "No fee", time: "< 1 hour" },
  { id: "crypto_btc", label: "Bitcoin", icon: Bitcoin, fee: "No fee", time: "< 2 hours" },
  { id: "bank_transfer", label: "Bank Transfer", icon: Building2, fee: "No fee", time: "1–3 days" },
  { id: "wise", label: "Wise", icon: CreditCard, fee: "No fee", time: "< 24 hours" },
];

export default function PayoutsPage() {
  const { dict } = useDashboardPagesDict();
  const h = dict.payouts;
  const [rows, setRows] = useState<DashboardPayout[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [minPayout, setMinPayout] = useState(100);
  const [payoutHints, setPayoutHints] = useState<string[]>([]);
  const [complianceRelaxed, setComplianceRelaxed] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("crypto_usdt");
  const [amount, setAmount] = useState("");
  const [declaresNoOpenPositions, setDeclaresNoOpenPositions] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/accounts", { credentials: "include", cache: "no-store" });
      const payload = (await res.json()) as { orders?: OrderRow[] };
      setOrders(Array.isArray(payload.orders) ? payload.orders : []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const load = async () => {
    const res = await fetch("/api/dashboard/payouts", { credentials: "include", cache: "no-store" });
    if (!res.ok) return;
    const payload = (await res.json()) as {
      data: DashboardPayout[];
      summary: {
        availableBalance: number;
        minPayout: number;
        payoutComplianceHints?: string[];
        complianceRelaxed?: boolean;
      };
    };
    setRows(payload.data || []);
    setAvailableBalance(payload.summary?.availableBalance ?? 0);
    setMinPayout(payload.summary?.minPayout ?? 100);
    setPayoutHints(payload.summary?.payoutComplianceHints ?? []);
    setComplianceRelaxed(Boolean(payload.summary?.complianceRelaxed));
  };

  useEffect(() => {
    void load();
  }, []);

  const pendingAmount = useMemo(
    () =>
      rows
        .filter((x) => x.status === "pending")
        .reduce((sum, x) => sum + x.amount, 0),
    [rows]
  );

  const handleRequest = async () => {
    const val = parseFloat(amount);
    if (!val || val < minPayout) { toast.error(`Minimum payout amount is $${minPayout}`); return; }
    if (val > availableBalance) { toast.error("Amount exceeds available balance"); return; }
    const res = await fetch("/api/dashboard/payouts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: val,
        method: selectedMethod,
        declaresNoOpenPositions,
      }),
    });
    const body = (await res.json()) as { error?: string; reasons?: string[] };
    if (!res.ok) {
      if (Array.isArray(body.reasons) && body.reasons.length) {
        toast.error(body.reasons.join(" "));
      } else {
        toast.error(body.error === "exceeds_balance" ? "Amount exceeds available balance" : "Could not submit payout request.");
      }
      return;
    }
    toast.success("Payout request submitted — ops will review (AML / §11).");
    setAmount("");
    setDeclaresNoOpenPositions(false);
    await load();
  };

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">{h.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">{h.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-neutral-400 leading-relaxed"
      >
        Payouts follow the{" "}
        <Link href="/rules#payout" className="text-gold-500 font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
          official Trading Rules §11
        </Link>
        : first withdrawal after <strong className="text-neutral-300">10 funded trading days</strong>, then on-demand when profit
        reaches <strong className="text-neutral-300">≥ 1%</strong> of initial balance; <strong className="text-neutral-300">no open positions</strong>;{" "}
        <strong className="text-neutral-300">no new trades</strong> until processing completes; <strong className="text-neutral-300">full profit only</strong> (no partial withdrawals).
        <span className="block mt-2 text-amber-200/90">
          This dashboard <strong className="text-amber-100">enforces KYC + 10 funded days + your confirmation</strong> before a request is accepted (unless the server runs in relaxed mode for demos).
        </span>
      </motion.div>

      {complianceRelaxed && (
        <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.06] px-4 py-3 text-xs text-cyan-100/90">
          <strong>Demo / relaxed mode:</strong> <code className="text-cyan-200">PAYOUT_COMPLIANCE_RELAXED=1</code> is set — payout gates are not enforced here. Production should leave this unset.
        </div>
      )}

      {!complianceRelaxed && payoutHints.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] px-4 py-3 text-xs text-amber-100/95 space-y-1">
          <p className="font-semibold text-amber-200">You cannot request a payout until:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {payoutHints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gold-500/30 bg-gradient-to-b from-gold-500/8 to-surface p-6">
        <p className="text-sm text-neutral-400 mb-1">Available for Withdrawal</p>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-black font-mono text-gold-500">${availableBalance.toLocaleString()}</span>
          <span className="text-sm text-neutral-500">USDT equivalent</span>
        </div>
        <p className="text-xs text-neutral-500">
          Pending requests: ${pendingAmount.toLocaleString()} · Minimum: ${minPayout}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/8 bg-surface p-6">
        <h2 className="text-base font-semibold text-white mb-6">Request Payout</h2>
        <div className="mb-5">
          <label className="block text-sm text-neutral-400 mb-2">Amount (min. ${minPayout})</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500 font-mono font-bold">$</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00" min={minPayout} max={availableBalance}
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-8 pr-20 py-3.5 text-white font-mono text-lg focus:outline-none focus:border-gold-500/50 transition-colors" />
            <button onClick={() => setAmount(String(availableBalance))}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gold-500 hover:underline font-semibold">MAX</button>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm text-neutral-400 mb-3">Payment Method</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {payoutMethods.map((method) => (
              <button key={method.id} onClick={() => setSelectedMethod(method.id)}
                className={`rounded-xl border p-3 text-left transition-all ${selectedMethod === method.id ? "border-gold-500/50 bg-gold-500/8" : "border-white/8 hover:border-white/15"}`}>
                <method.icon className={`w-5 h-5 mb-2 ${selectedMethod === method.id ? "text-gold-500" : "text-neutral-500"}`} />
                <p className="text-xs font-semibold text-white">{method.label}</p>
                <p className="text-[10px] text-success mt-0.5">{method.fee}</p>
                <p className="text-[10px] text-neutral-600">{method.time}</p>
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-start gap-3 mb-5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={declaresNoOpenPositions}
            onChange={(e) => setDeclaresNoOpenPositions(e.target.checked)}
            className="mt-1 rounded border-white/20 bg-black/40"
          />
          <span className="text-xs text-neutral-400 leading-relaxed">
            I confirm I have <strong className="text-neutral-300">no open positions</strong> and I will not place{" "}
            <strong className="text-neutral-300">new trades</strong> until this payout request is fully processed, as required by §11.
          </span>
        </label>
        <button onClick={() => void handleRequest()}
          className="w-full btn-gold py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
          <Wallet className="w-4 h-4" /> Request Payout
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-white/8 bg-surface p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-4 h-4 text-gold-500/80" />
          <h2 className="text-base font-semibold text-white">Challenge orders</h2>
        </div>
        <p className="text-xs text-neutral-500 mb-4">Order history from your trader profile (same source as Accounts).</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left border-b border-white/8">
                {["Receipt", "Plan", "Status", "Paid"].map((h) => (
                  <th key={h} className="py-2.5 px-2 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!ordersLoading &&
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-2 py-3 font-mono text-xs text-neutral-300">{o.receiptId}</td>
                    <td className="px-2 py-3 text-neutral-200">{o.planSlug}</td>
                    <td className="px-2 py-3 text-xs capitalize text-neutral-400">{o.status}</td>
                    <td className="px-2 py-3 text-xs text-neutral-500">
                      {o.paidAt ? new Date(o.paidAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!ordersLoading && orders.length === 0 && (
          <p className="text-center text-sm text-neutral-600 py-8">No orders on file for this profile.</p>
        )}
        {ordersLoading && <p className="text-sm text-neutral-500 py-6">Loading orders…</p>}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/5 bg-surface p-6">
        <h2 className="text-base font-semibold text-white mb-5">Payout History</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="text-left border-b border-white/8">
                {["Date", "Amount", "Method", "Status", "ID"].map((h) => (
                  <th key={h} className="py-2.5 px-2 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02]">
                  <td className="px-2 py-3 text-xs text-neutral-400">{new Date(row.requestedAt).toLocaleDateString()}</td>
                  <td className="px-2 py-3 text-sm text-white font-semibold">${row.amount.toLocaleString()}</td>
                  <td className="px-2 py-3 text-xs text-neutral-300">{row.method}</td>
                  <td className="px-2 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border font-semibold ${
                      row.status === "completed"
                        ? "text-success border-success/20 bg-success/10"
                        : row.status === "pending"
                          ? "text-warning border-warning/20 bg-warning/10"
                          : row.status === "processing"
                            ? "text-info border-info/20 bg-info/10"
                            : "text-error border-error/20 bg-error/10"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-xs text-neutral-500 font-mono">{row.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-10 h-10 text-neutral-800 mx-auto mb-3" />
            <p className="text-neutral-600 text-sm">No payout history</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
