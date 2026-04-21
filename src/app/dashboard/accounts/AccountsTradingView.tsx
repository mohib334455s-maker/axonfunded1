"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Copy, RefreshCw, Server } from "lucide-react";
import { toast } from "sonner";
import GoldButton from "@/components/ui/GoldButton";
import Link from "next/link";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

type ApiOrder = {
  id: string;
  planSlug: string;
  receiptId: string;
  status: string;
  paidAt: string;
};

type ApiAccount = {
  id: string;
  orderId: string;
  tierName: string;
  accountSizeUsd: number;
  phase: 1 | 2;
  server: string;
  login: string;
  password: string;
  status: "awaiting_credentials" | "active" | "breached";
  credentialsEtaNote: string;
  updatedAt: string;
};

async function fetchAccountsPayload(): Promise<{
  accounts: ApiAccount[];
  orders: ApiOrder[];
  linked: boolean;
}> {
  const res = await fetch("/api/dashboard/accounts", { credentials: "include", cache: "no-store" });
  if (!res.ok) return { accounts: [], orders: [], linked: false };
  const j = (await res.json()) as {
    accounts?: ApiAccount[];
    orders?: ApiOrder[];
    linked?: boolean;
  };
  return {
    accounts: Array.isArray(j.accounts) ? j.accounts : [],
    orders: Array.isArray(j.orders) ? j.orders : [],
    linked: Boolean(j.linked),
  };
}

export function AccountsTradingView() {
  const { dict } = useDashboardPagesDict();
  const d = dict.accounts;
  const mt = d.mt;
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [linked, setLinked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { accounts: a, orders: o, linked: l } = await fetchAccountsPayload();
    setAccounts(a);
    setOrders(o);
    setLinked(l);
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label}: ${mt.copied}`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const statusBadge = (status: ApiAccount["status"]) => {
    if (status === "awaiting_credentials")
      return (
        <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200/90">
          {mt.badgeProvisioning}
        </span>
      );
    if (status === "breached")
      return (
        <span className="rounded-full border border-red-500/35 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-200/90">
          {mt.badgeError}
        </span>
      );
    return (
      <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200/90">
        {mt.badgeReady}
      </span>
    );
  };

  const hasCredentials = (a: ApiAccount) =>
    a.status === "active" && Boolean(a.server?.trim() && a.login?.trim() && a.password?.trim());

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10">
              <Briefcase className="h-4 w-4 text-gold-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">{d.title}</h1>
          </div>
          <p className="text-sm text-neutral-500 sm:ml-12">{d.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:border-gold-500/30 hover:bg-white/[0.07] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {mt.refresh}
          </button>
          <GoldButton href="/challenge" size="sm">
            {d.newChallenge}
          </GoldButton>
        </div>
      </motion.div>

      {loading ? (
        <div className="rounded-2xl border border-white/8 bg-surface p-10 text-center text-sm text-neutral-500">Loading…</div>
      ) : !linked ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/8 bg-surface p-8 text-center text-sm text-neutral-400"
        >
          Sign in to see your trading accounts.
        </motion.div>
      ) : accounts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gold-500/20 bg-gradient-to-b from-gold-500/5 to-surface p-10 text-center"
        >
          <p className="mx-auto max-w-md text-sm text-neutral-400">{d.emptyList}</p>
          {orders.length > 0 && (
            <p className="mx-auto mt-4 max-w-lg text-xs text-neutral-500">{mt.emptyPaidNoRow}</p>
          )}
          <GoldButton href="/challenge" size="lg" className="mt-8">
            {d.newChallenge}
          </GoldButton>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {accounts.map((a, i) => (
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="overflow-hidden rounded-2xl border border-white/10 bg-surface"
            >
              <div className="flex flex-col gap-3 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-500/80">{a.tierName}</p>
                  <p className="mt-1 text-lg font-bold text-white">
                    ${a.accountSizeUsd.toLocaleString()} · {a.phase === 1 ? d.types.p1 : d.types.p2}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-neutral-500">
                    {mt.orderRef}: {a.orderId.slice(0, 8)}…
                  </p>
                </div>
                {statusBadge(a.status)}
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{mt.sectionTitle}</p>
                  <p className="mt-1 text-sm text-neutral-400">{mt.sectionSubtitle}</p>
                </div>

                {a.status === "awaiting_credentials" && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
                    <p className="text-sm font-semibold text-amber-100/90">{mt.phaseProvisioningTitle}</p>
                    <p className="mt-2 text-xs leading-relaxed text-amber-100/75">{mt.phaseProvisioningBody}</p>
                    {a.credentialsEtaNote ? (
                      <p className="mt-3 text-xs text-amber-200/80">{a.credentialsEtaNote}</p>
                    ) : null}
                  </div>
                )}

                {a.status === "breached" && (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-4">
                    <p className="text-sm font-semibold text-red-100/90">{mt.phaseErrorTitle}</p>
                    <p className="mt-2 text-xs text-red-100/75">{mt.phaseErrorBody}</p>
                    <Link href="/dashboard/support" className="mt-3 inline-block text-xs font-semibold text-gold-400 hover:underline">
                      Support
                    </Link>
                  </div>
                )}

                {hasCredentials(a) ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                    <p className="text-sm font-semibold text-emerald-100/90">{mt.phaseReadyTitle}</p>
                    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        { k: mt.server, v: a.server },
                        { k: mt.login, v: a.login },
                        { k: mt.masterPassword, v: a.password },
                      ].map((row) => (
                        <div key={row.k} className="rounded-lg border border-white/8 bg-black/30 p-3">
                          <dt className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">{row.k}</dt>
                          <dd className="mt-1 flex items-center justify-between gap-2">
                            <span className="break-all font-mono text-xs text-white/90">{row.v}</span>
                            <button
                              type="button"
                              onClick={() => void copyText(row.k, row.v)}
                              className="shrink-0 rounded-lg border border-white/10 p-1.5 text-neutral-400 hover:border-gold-500/30 hover:text-gold-300"
                              aria-label={`${mt.copy} ${row.k}`}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-4 flex items-start gap-2 text-[11px] text-neutral-500">
                      <Server className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" />
                      {mt.securityWarning}
                    </p>
                  </div>
                ) : a.status === "active" && !hasCredentials(a) ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-neutral-400">{mt.emptyPaidNoRow}</div>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
