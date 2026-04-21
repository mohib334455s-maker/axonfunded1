"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from "recharts";
import type { EquityDataPoint } from "@/types";

function TooltipBox({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (active && payload?.length) {
    return (
      <div className="rounded-md border border-white/12 bg-[#0c0e12] px-3 py-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-sm font-mono font-semibold tabular-nums text-[#f5d978]">
            ${p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function FintechEquityAreaChart({ data, height = 320 }: { data: EquityDataPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ftEqArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD700" stopOpacity={0.22} />
            <stop offset="55%" stopColor="#FFD700" stopOpacity={0.06} />
            <stop offset="100%" stopColor="#FFD700" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="ftBalArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} dy={6} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={44}
        />
        <Tooltip content={<TooltipBox />} cursor={{ stroke: "rgba(255,215,0,0.25)", strokeWidth: 1 }} />
        <Area type="monotone" dataKey="balance" stroke="#64748b" strokeWidth={1.2} strokeDasharray="5 4" fill="url(#ftBalArea)" name="Balance" />
        <Area type="monotone" dataKey="equity" stroke="#e8c547" strokeWidth={2} fill="url(#ftEqArea)" name="Equity" />
        <Brush dataKey="date" height={22} stroke="rgba(255,215,0,0.35)" fill="rgba(255,215,0,0.06)" travellerWidth={8} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
