"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2, Radio, Server, Shield } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPrimitives";
import type { MtRiskAlert, MtTelemetryEvent } from "@/lib/mt-telemetry-types";
import { toast } from "sonner";

type Totals = { events: number; alerts: number; unacked: number };

export default function AdminMtMonitorPage() {
  const [events, setEvents] = useState<MtTelemetryEvent[]>([]);
  const [alerts, setAlerts] = useState<MtRiskAlert[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mt-telemetry?limit=250", { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || res.statusText);
      setEvents(j.events ?? []);
      setAlerts(j.alerts ?? []);
      setTotals(j.totals ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const acknowledge = async (alertId: string) => {
    try {
      const res = await fetch("/api/admin/mt-telemetry", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, acknowledged: true }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      toast.success("Alert acknowledged");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="MT monitor & anti-abuse"
        description="Telemetry from MetaTrader EAs: shared device, shared IP, and VPN/datacenter hints. Configure MT_TELEMETRY_SECRET and deploy EA from tools/mt5/."
        actions={
          <button
            type="button"
            onClick={() => load()}
            className="rounded-lg border border-[rgba(212,175,55,0.25)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[#ebe6dc] hover:bg-[rgba(255,255,255,0.07)]"
          >
            Refresh
          </button>
        }
      />

      {loading ? (
        <p className="text-sm text-[#8f8a82]">Loading...</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Events stored", value: totals?.events ?? 0, icon: Activity },
              { label: "Active alerts", value: totals?.unacked ?? 0, icon: AlertTriangle },
              { label: "Alert rules fired", value: totals?.alerts ?? 0, icon: Shield },
            ].map((c) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[rgba(0,0,0,0.25)] p-4"
              >
                <div className="flex items-center gap-2 text-[#b8a88a]">
                  <c.icon className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wide">{c.label}</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-[#faf6ef] tabular-nums">{c.value}</p>
              </motion.div>
            ))}
          </div>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#ebe6dc]">
              <Radio className="h-4 w-4 text-amber-400/90" />
              Risk alerts
            </h2>
            {alerts.length === 0 ? (
              <p className="text-sm text-[#8f8a82]">No alerts yet. Telemetry must show overlapping fingerprints or IPs across traderRef values.</p>
            ) : (
              <ul className="space-y-3">
                {alerts.map((a) => (
                  <li
                    key={a.id}
                    className={`rounded-xl border p-4 ${
                      a.severity === "high"
                        ? "border-danger/35 bg-danger/[0.06]"
                        : "border-amber-500/25 bg-amber-500/[0.05]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#b8a88a]">{a.type}</p>
                        <p className="mt-1 text-base font-semibold text-[#faf6ef]">{a.title}</p>
                        <p className="mt-1 text-sm text-[#c4bdae]">{a.detail}</p>
                        <p className="mt-2 text-xs text-[#8f8a82]">
                          Traders: <span className="font-mono text-[#ebe6dc]">{a.traderRefs.join(", ")}</span>
                        </p>
                        <ul className="mt-2 list-inside list-disc text-xs text-[#8f8a82]">
                          {a.evidence.map((e) => (
                            <li key={e} className="font-mono">
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {a.acknowledged ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-1 text-xs text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Acknowledged
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => acknowledge(a.id)}
                            className="rounded-lg bg-[rgba(212,175,55,0.15)] px-3 py-1.5 text-xs font-semibold text-gold-200 hover:bg-[rgba(212,175,55,0.25)]"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#ebe6dc]">
              <Server className="h-4 w-4 text-sky-400/90" />
              Recent telemetry
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[rgba(212,175,55,0.12)]">
              <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[rgba(212,175,55,0.1)] bg-[rgba(0,0,0,0.35)] text-[#b8a88a]">
                    <th className="px-3 py-2 font-semibold">Time</th>
                    <th className="px-3 py-2 font-semibold">Trader</th>
                    <th className="px-3 py-2 font-semibold">MT login</th>
                    <th className="px-3 py-2 font-semibold">IP</th>
                    <th className="px-3 py-2 font-semibold">Flags</th>
                    <th className="px-3 py-2 font-semibold">Fingerprint</th>
                    <th className="px-3 py-2 font-semibold">Event</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => {
                    const intel = e.ipIntel;
                    const flags = [
                      intel?.proxy ? "proxy" : null,
                      intel?.hosting ? "hosting" : null,
                      intel?.mobile ? "mobile" : null,
                    ]
                      .filter(Boolean)
                      .join(", ");
                    return (
                      <tr key={e.id} className="border-b border-[rgba(255,255,255,0.04)] text-[#d8d0c4]">
                        <td className="px-3 py-2 font-mono text-[10px] text-[#a39a8c]">{e.ts}</td>
                        <td className="px-3 py-2 font-mono">{e.traderRef}</td>
                        <td className="px-3 py-2 font-mono">{e.mtLogin}</td>
                        <td className="px-3 py-2 font-mono">{e.ip}</td>
                        <td className="px-3 py-2 text-[10px]">{flags || "-"}</td>
                        <td className="max-w-[180px] truncate px-3 py-2 font-mono text-[10px]" title={e.fingerprint}>
                          {e.fingerprint.slice(0, 20)}...
                        </td>
                        <td className="px-3 py-2">{e.event}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
