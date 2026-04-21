"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Link2, Users, Wallet } from "lucide-react";

type Profile = { referralCode: string; balanceUsd: number; referralTraderIds: string[] };
type Req = { id: string; amountUsd: number; status: string; createdAt: string };

export default function DashboardAffiliatePage() {
  const [tab, setTab] = useState<"program" | "wallet">("program");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [terms, setTerms] = useState("");
  const [pct, setPct] = useState(0);
  const [requests, setRequests] = useState<Req[]>([]);
  const [amount, setAmount] = useState("");
  const [link, setLink] = useState("");
  const load = useCallback(
    () =>
      void fetch("/api/trader/affiliate", { credentials: "include" })
        .then((r) => r.json())
        .then((j) => {
          if (j.error) throw new Error(j.error);
          setProfile(j.profile);
          setTerms(j.settings?.termsHtml ?? "");
          setPct(Number(j.settings?.commissionPercent ?? 0));
          setRequests(Array.isArray(j.withdrawalRequests) ? j.withdrawalRequests : []);
          if (typeof window !== "undefined" && j.profile?.referralCode) {
            setLink(`${window.location.origin}/affiliate?ref=${encodeURIComponent(j.profile.referralCode)}`);
          }
        })
        .catch(() => toast.error("Could not load affiliate data")),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const copy = (text: string, kind: "link" | "code") => {
    void navigator.clipboard.writeText(text).catch(() => {});
    toast.success(kind === "code" ? "Code copied" : "Link copied");
  };

  const submitWithdraw = async () => {
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const res = await fetch("/api/trader/affiliate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amountUsd: n }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(j.error || "Request failed");
      return;
    }
    toast.success("Withdrawal request submitted");
    setAmount("");
    load();
  };

  return (
    <div className="dashboard-page space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Affiliate</h1>
        <p className="mt-1 text-sm text-neutral-500">Referral program and commission wallet — data from your account only.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-3">
        {(
          [
            { id: "program" as const, label: "Program" },
            { id: "wallet" as const, label: "Earnings & withdrawals" },
          ] as const
        ).map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              tab === x.id
                ? "border-amber-400/45 bg-amber-500/15 text-amber-100"
                : "border-white/[0.08] text-neutral-500 hover:text-neutral-200"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {tab === "program" && profile && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-4">
            <p className="text-xs uppercase tracking-wider text-neutral-500">Your referral code</p>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-lg font-mono font-bold text-gold-400">{profile.referralCode}</code>
              <button
                type="button"
                onClick={() => copy(profile.referralCode, "code")}
                className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-neutral-400"
                aria-label="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Share link</p>
              <div className="flex gap-2">
                <input readOnly className="flex-1 min-w-0 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white" value={link} />
                <button
                  type="button"
                  onClick={() => copy(link, "link")}
                  className="shrink-0 p-2 rounded-lg border border-gold-500/30 text-gold-400 hover:bg-gold-500/10"
                  aria-label="Copy link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Users className="w-4 h-4 text-neutral-500" />
              <span>
                Referred traders: <strong className="text-white">{profile.referralTraderIds.length}</strong>
              </span>
            </div>
            <p className="text-xs text-neutral-500">Published commission rate: {pct}%</p>
            {profile.referralTraderIds.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-black/20 p-3 max-h-40 overflow-y-auto">
                <p className="text-[10px] uppercase text-neutral-600 mb-2">Trader IDs (from server)</p>
                <ul className="font-mono text-[11px] text-neutral-400 space-y-1">
                  {profile.referralTraderIds.map((id) => (
                    <li key={id}>{id}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-neutral-400 leading-relaxed">
            <p>
              Share your link on social channels. When someone registers with your code and purchases a challenge, commissions
              accrue to your affiliate wallet (see Earnings tab). No sample leads are shown here.
            </p>
          </div>
        </div>
      )}

      {tab === "program" && !profile && (
        <p className="text-sm text-neutral-500">Loading program data…</p>
      )}

      {tab === "wallet" && profile && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500">
              <Wallet className="w-3.5 h-3.5" />
              Available balance
            </div>
            <p className="mt-1 text-3xl font-black text-gold-500">${profile.balanceUsd.toFixed(2)}</p>
            <p className="mt-2 text-xs text-neutral-500">Balances update when referred traders pay for challenges.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-sm font-semibold text-white">Request withdrawal</p>
            <p className="mt-1 text-xs text-neutral-500">Pending requests are reviewed in admin.</p>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount USD"
              className="mt-4 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            />
            <button
              type="button"
              onClick={() => void submitWithdraw()}
              className="mt-3 w-full rounded-lg bg-gold-500 py-2 text-sm font-semibold text-black"
            >
              Submit request
            </button>
            <ul className="mt-4 space-y-2 text-xs text-neutral-400">
              {requests.map((r) => (
                <li key={r.id} className="flex justify-between gap-2 border-t border-white/5 pt-2">
                  <span>${r.amountUsd}</span>
                  <span className="text-neutral-500">{r.status}</span>
                  <span className="text-neutral-600 font-mono">{new Date(r.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
            {requests.length === 0 && <p className="text-xs text-neutral-600 mt-3">No withdrawal requests yet.</p>}
          </div>
        </div>
      )}

      {tab === "wallet" && !profile && <p className="text-sm text-neutral-500">Loading wallet…</p>}

      {terms ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-neutral-400">
          <div dangerouslySetInnerHTML={{ __html: terms }} />
        </div>
      ) : null}

    </div>
  );
}
