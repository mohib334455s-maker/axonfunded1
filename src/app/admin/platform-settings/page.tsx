"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel, AdminPanelHeader } from "@/components/admin/AdminPrimitives";

export default function AdminPlatformSettingsPage() {
  const [commissionPercent, setCommissionPercent] = useState(20);
  const [termsHtml, setTermsHtml] = useState("");
  const [tpId, setTpId] = useState("");

  useEffect(() => {
    void fetch("/api/admin/platform/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        setCommissionPercent(Number(j.affiliate?.commissionPercent ?? 20));
        setTermsHtml(String(j.affiliate?.termsHtml ?? ""));
        setTpId(String(j.trustpilotBusinessUnitId ?? ""));
      });
  }, []);

  const save = async () => {
    const res = await fetch("/api/admin/platform/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        commissionPercent,
        termsHtml,
        trustpilotBusinessUnitId: tpId,
      }),
    });
    if (!res.ok) toast.error("Save failed");
    else toast.success("Saved");
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Platform settings" description="Affiliate commission, terms HTML for trader affiliate page, Trustpilot business unit ID." />
      <AdminPanel>
        <AdminPanelHeader title="Affiliate" />
        <div className="grid gap-4 p-5 sm:max-w-md">
          <label className="text-xs text-[#8f8a82]">
            Commission %
            <input
              type="number"
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label className="text-xs text-[#8f8a82]">
            Terms HTML (shown on trader affiliate wallet)
            <textarea
              className="mt-1 min-h-[140px] w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={termsHtml}
              onChange={(e) => setTermsHtml(e.target.value)}
            />
          </label>
        </div>
      </AdminPanel>
      <AdminPanel>
        <AdminPanelHeader title="Trustpilot" />
        <div className="p-5 sm:max-w-md">
          <label className="text-xs text-[#8f8a82]">
            Business unit ID
            <input
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              value={tpId}
              onChange={(e) => setTpId(e.target.value)}
              placeholder="From Trustpilot Business app"
            />
          </label>
        </div>
      </AdminPanel>
      <button type="button" className="rounded bg-[#b8860b] px-6 py-2 text-sm font-semibold text-black" onClick={() => void save()}>
        Save settings
      </button>
    </div>
  );
}
