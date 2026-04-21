"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, RefreshCw, Server, User } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPrimitives";
import type { TraderRecord, TradingAccountRecord } from "@/lib/server/trader-store";

type QueueRow = TradingAccountRecord & { traderEmail?: string };

export default function AdminProvisioningPage() {
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [traders, setTraders] = useState<TraderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ server: "", login: "", password: "" });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [cTrader, setCTrader] = useState("");
  const [cKyc, setCKyc] = useState<NonNullable<TraderRecord["kycStatus"]>>("none");
  const [cDays, setCDays] = useState("10");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, tRes] = await Promise.all([
        fetch("/api/admin/ops/provisioning", { credentials: "include", cache: "no-store" }),
        fetch("/api/admin/ops/traders", { credentials: "include", cache: "no-store" }),
      ]);
      if (qRes.ok) {
        const j = (await qRes.json()) as { data?: QueueRow[] };
        setQueue(Array.isArray(j.data) ? j.data : []);
      }
      if (tRes.ok) {
        const j = (await tRes.json()) as { data?: TraderRecord[] };
        setTraders(Array.isArray(j.data) ? j.data : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submitAssign = async (accountId: string) => {
    if (!form.server.trim() || !form.login.trim() || !form.password) {
      toast.error("Server, login, and password are required.");
      return;
    }
    setSavingId(accountId);
    try {
      const res = await fetch("/api/admin/ops/provisioning", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          server: form.server,
          login: form.login,
          password: form.password,
          actor: "ops_console",
        }),
      });
      if (!res.ok) {
        toast.error("Assign failed");
        return;
      }
      toast.success("Credentials saved — audit log updated.");
      setExpanded(null);
      setForm({ server: "", login: "", password: "" });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const patchCompliance = async () => {
    const id = cTrader.trim();
    if (!id) {
      toast.error("Enter trader id");
      return;
    }
    const res = await fetch("/api/admin/ops/traders", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        traderId: id,
        kycStatus: cKyc,
        fundedTradingDays: parseInt(cDays, 10) || 0,
      }),
    });
    if (!res.ok) {
      toast.error("Patch failed");
      return;
    }
    toast.success("Trader compliance updated");
    await load();
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="MT provisioning"
        description="Assign real MT5 server / login / password. Every save is written to the audit log for disputes and internal review."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/25 text-sm font-semibold text-gold-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        }
      />

      <div className="admin-panel rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-gold-500" /> Compliance (KYC / §11 funded days)
        </h2>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Payout requests are blocked until <strong className="text-neutral-400">KYC = approved</strong> and{" "}
          <strong className="text-neutral-400">funded trading days ≥ 10</strong> (unless{" "}
          <code className="text-gold-500/90">PAYOUT_COMPLIANCE_RELAXED=1</code> on server).
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-[10px] uppercase text-neutral-500 block mb-1">Trader ID</label>
            <input
              value={cTrader}
              onChange={(e) => setCTrader(e.target.value)}
              placeholder="tr_…"
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono w-56"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-neutral-500 block mb-1">KYC</label>
            <select
              value={cKyc ?? "none"}
              onChange={(e) => setCKyc(e.target.value as NonNullable<TraderRecord["kycStatus"]>)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="none">none</option>
              <option value="submitted">submitted</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase text-neutral-500 block mb-1">Funded days</label>
            <input
              value={cDays}
              onChange={(e) => setCDays(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-24"
            />
          </div>
          <button
            type="button"
            onClick={() => void patchCompliance()}
            className="px-4 py-2 rounded-lg bg-gold-500 text-black text-sm font-bold hover:bg-gold-400"
          >
            Save
          </button>
        </div>
        <p className="text-[11px] text-neutral-600">
          Traders in store: {traders.length}. Pick id from orders or the queue below.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Awaiting credentials</h2>
        {queue.length === 0 && !loading && (
          <p className="text-neutral-600 text-sm py-8 text-center admin-panel rounded-2xl">Queue is empty.</p>
        )}
        {queue.map((row, i) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="admin-panel rounded-2xl p-5 border border-warning/15"
          >
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono text-neutral-500">{row.id}</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {row.tierName} · ${row.accountSizeUsd.toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Trader <span className="font-mono text-neutral-400">{row.traderId}</span>
                  {row.traderEmail ? (
                    <>
                      {" "}
                      · <span className="text-gold-500/90">{row.traderEmail}</span>
                    </>
                  ) : null}
                </p>
                <p className="text-xs text-neutral-600 mt-2 max-w-xl">{row.credentialsEtaNote}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExpanded(expanded === row.id ? null : row.id);
                  setForm({ server: "", login: "", password: "" });
                }}
                className="self-start px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/25"
              >
                {expanded === row.id ? "Close" : "Assign MT5"}
              </button>
            </div>
            {expanded === row.id && (
              <div className="mt-5 pt-5 border-t border-white/10 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-neutral-500 flex items-center gap-1 mb-1">
                    <Server className="w-3 h-3" /> Server
                  </label>
                  <input
                    value={form.server}
                    onChange={(e) => setForm((f) => ({ ...f, server: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                    placeholder="Broker-Demo"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-neutral-500 flex items-center gap-1 mb-1">
                    <KeyRound className="w-3 h-3" /> Login
                  </label>
                  <input
                    value={form.login}
                    onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    placeholder="12345678"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase text-neutral-500 mb-1 block">Password / investor (store encrypted in prod)</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    placeholder="••••••••"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    disabled={savingId === row.id}
                    onClick={() => void submitAssign(row.id)}
                    className="px-5 py-2.5 rounded-xl bg-gold-500 text-black text-sm font-bold hover:bg-gold-400 disabled:opacity-50"
                  >
                    {savingId === row.id ? "Saving…" : "Save & mark active"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
