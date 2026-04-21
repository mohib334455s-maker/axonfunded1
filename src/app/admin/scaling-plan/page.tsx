"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel, AdminPanelHeader } from "@/components/admin/AdminPrimitives";

type Stage = {
  id: string;
  order: number;
  title: string;
  percentGrowth: number;
  periodMonths: number | null;
  conditionText: string;
  exampleBalanceUsd: number | null;
};

export default function AdminScalingPlanPage() {
  const [introHtml, setIntroHtml] = useState("");
  const [json, setJson] = useState("[]");

  useEffect(() => {
    void fetch("/api/admin/platform/scaling", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        setIntroHtml(j.data?.introHtml ?? "");
        setJson(JSON.stringify(j.data?.stages ?? [], null, 2));
      });
  }, []);

  const save = async () => {
    let stages: Stage[] = [];
    try {
      stages = JSON.parse(json) as Stage[];
    } catch {
      toast.error("Invalid JSON for stages");
      return;
    }
    const res = await fetch("/api/admin/platform/scaling", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ introHtml, stages }),
    });
    if (!res.ok) toast.error("Save failed");
    else toast.success("Scaling plan saved");
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Scaling plan" description="Edit intro HTML and stages JSON (id, order, title, percentGrowth, periodMonths, conditionText, exampleBalanceUsd)." />
      <AdminPanel>
        <AdminPanelHeader title="Intro HTML" />
        <textarea className="m-5 min-h-[120px] w-[calc(100%-2.5rem)] rounded border border-white/10 bg-black/30 p-3 text-sm text-white" value={introHtml} onChange={(e) => setIntroHtml(e.target.value)} />
      </AdminPanel>
      <AdminPanel>
        <AdminPanelHeader title="Stages (JSON array)" />
        <textarea className="m-5 min-h-[320px] w-[calc(100%-2.5rem)] rounded border border-white/10 bg-black/30 p-3 font-mono text-xs text-white" value={json} onChange={(e) => setJson(e.target.value)} />
        <div className="px-5 pb-5">
          <button type="button" className="rounded bg-[#b8860b] px-4 py-2 text-sm font-semibold text-black" onClick={() => void save()}>
            Save
          </button>
        </div>
      </AdminPanel>
    </div>
  );
}
