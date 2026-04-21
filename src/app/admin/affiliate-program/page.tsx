"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel, AdminPanelHeader } from "@/components/admin/AdminPrimitives";

type Req = { id: string; traderId: string; amountUsd: number; status: string; createdAt: string };
type Ref = { traderId: string; email: string | null; referralCode: string; balanceUsd: number; referralCount: number };

export default function AdminAffiliateProgramPage() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [referrers, setReferrers] = useState<Ref[]>([]);
  const [pct, setPct] = useState(20);

  const load = useCallback(() => {
    void fetch("/api/admin/platform/affiliate", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        setRequests(Array.isArray(j.withdrawalRequests) ? j.withdrawalRequests : []);
        setReferrers(Array.isArray(j.referrers) ? j.referrers : []);
        setPct(Number(j.settings?.commissionPercent ?? 20));
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id: string, status: "approved" | "rejected") => {
    const res = await fetch("/api/admin/platform/affiliate", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) toast.error("Update failed");
    else {
      toast.success("Updated");
      load();
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Affiliate program" description="Global commission %, withdrawal approvals, referrers." />
      <AdminPanel>
        <AdminPanelHeader title={`Commission: ${pct}%`} />
        <p className="px-5 pb-5 text-xs text-[#8f8a82]">Edit commission in Platform settings page.</p>
      </AdminPanel>
      <AdminPanel>
        <AdminPanelHeader title="Withdrawal requests" />
        <ul className="divide-y divide-white/5 p-5 text-sm text-[#ebe6dc]">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                {r.traderId} · ${r.amountUsd} · <span className="text-neutral-500">{r.status}</span>
              </span>
              {r.status === "pending" ? (
                <span className="space-x-2">
                  <button type="button" className="text-xs text-emerald-300" onClick={() => void review(r.id, "approved")}>
                    Approve
                  </button>
                  <button type="button" className="text-xs text-red-300" onClick={() => void review(r.id, "rejected")}>
                    Reject
                  </button>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </AdminPanel>
      <AdminPanel>
        <AdminPanelHeader title="Referrers" />
        <div className="overflow-x-auto p-5">
          <table className="w-full text-left text-sm text-[#ebe6dc]">
            <thead className="text-xs uppercase text-[#8f8a82]">
              <tr>
                <th className="py-2">Trader</th>
                <th className="py-2">Code</th>
                <th className="py-2">Balance</th>
                <th className="py-2">Refs</th>
              </tr>
            </thead>
            <tbody>
              {referrers.map((r) => (
                <tr key={r.traderId} className="border-t border-white/5">
                  <td className="py-2">{r.email ?? r.traderId}</td>
                  <td className="py-2 font-mono text-xs">{r.referralCode}</td>
                  <td className="py-2">${r.balanceUsd.toFixed(2)}</td>
                  <td className="py-2">{r.referralCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
