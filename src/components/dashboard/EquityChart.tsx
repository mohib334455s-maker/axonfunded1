"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { EquityDataPoint } from "@/types";
import { emptyEquitySeries } from "@/lib/dashboard-empty";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-gold-500/20 rounded-xl p-3 shadow-card">
        <p className="text-xs text-neutral-500 mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-sm font-mono font-semibold text-gold-500">
            ${p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function EquityChart({ data }: { data?: EquityDataPoint[] }) {
  const series = data && data.length > 0 ? data : emptyEquitySeries();

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={series}
        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FFD700" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#DAA520" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#DAA520" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#525252", fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#525252", fontSize: 10 }}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#DAA520"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="url(#balanceGradient)"
          name="Balance"
        />
        <Area
          type="monotone"
          dataKey="equity"
          stroke="#FFD700"
          strokeWidth={2}
          fill="url(#equityGradient)"
          name="Equity"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
