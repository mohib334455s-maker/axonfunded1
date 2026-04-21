"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
type ScalingStage = {
  id: string;
  order: number;
  title: string;
  percentGrowth: number;
  periodMonths: number | null;
  conditionText: string;
  exampleBalanceUsd: number | null;
};

export default function ScalingPlanPage() {
  const [introHtml, setIntroHtml] = useState("");
  const [stages, setStages] = useState<ScalingStage[]>([]);

  useEffect(() => {
    void fetch("/api/public/scaling-plan")
      .then((r) => r.json())
      .then((j) => {
        const d = j.data;
        if (d?.introHtml != null) setIntroHtml(String(d.introHtml));
        setStages(Array.isArray(d?.stages) ? d.stages : []);
      });
  }, []);

  const chartData = useMemo(() => {
    let bal = 0;
    return stages
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => {
        const next =
          typeof s.exampleBalanceUsd === "number" && Number.isFinite(s.exampleBalanceUsd)
            ? s.exampleBalanceUsd
            : bal * (1 + (s.percentGrowth || 0) / 100);
        bal = next;
        return { name: s.title, balance: Math.round(bal), pct: s.percentGrowth };
      });
  }, [stages]);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-24 sm:px-6">
      <h1 className="mb-2 text-center text-3xl font-black text-white md:text-4xl">Scaling plan</h1>
      <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-neutral-400">
        Growth stages and balance examples are configured in admin — numbers below are live from the server.
      </p>
      {introHtml ? (
        <div
          className="prose prose-invert mx-auto mb-10 max-w-3xl text-sm text-neutral-300 prose-headings:text-white"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      ) : null}

      {stages.length === 0 ? (
        <p className="py-12 text-center text-neutral-500">No scaling stages configured yet.</p>
      ) : (
        <>
          <div className="mb-12 h-72 w-full rounded-2xl border border-white/10 bg-elevated/50 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid rgba(255,215,0,0.2)" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="balance" fill="rgba(255,215,0,0.55)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ol className="space-y-4">
            {stages
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((s) => (
                <li key={s.id} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="font-semibold text-white">{s.title}</p>
                  <p className="mt-1 text-xs text-gold-500/90">
                    +{s.percentGrowth}%
                    {s.periodMonths != null ? ` · every ${s.periodMonths} mo` : ""}
                  </p>
                  <p className="mt-2 text-sm text-neutral-400">{s.conditionText}</p>
                </li>
              ))}
          </ol>
        </>
      )}
    </div>
  );
}
