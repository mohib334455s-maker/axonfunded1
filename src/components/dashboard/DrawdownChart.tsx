"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { EquityDataPoint } from "@/types";
import { emptyEquitySeries } from "@/lib/dashboard-empty";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-danger/20 rounded-xl p-3 shadow-card">
        <p className="text-xs text-neutral-500 mb-1">{label}</p>
        <p className="text-sm font-mono font-semibold text-danger">
          {payload[0].value.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
}

export default function DrawdownChart({
  height = 160,
  data,
}: {
  height?: number;
  data?: EquityDataPoint[];
}) {
  const series = data && data.length > 0 ? data : emptyEquitySeries();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={series}
        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="ddGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF1744" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#FF1744" stopOpacity={0} />
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
          tick={{ fill: "#525252", fontSize: 10 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#525252", fontSize: 10 }}
          tickFormatter={(v) => `${v}%`}
          domain={[-12, 2]}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={-5} stroke="#FF1744" strokeDasharray="4 4" strokeOpacity={0.5} />
        <ReferenceLine y={-10} stroke="#FF1744" strokeDasharray="4 4" strokeOpacity={0.8} />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="#FF1744"
          strokeWidth={2}
          fill="url(#ddGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
