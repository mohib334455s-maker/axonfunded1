"use client";

import { motion } from "framer-motion";

type Tone = "gold" | "emerald" | "rose" | "sky";

const toneMap: Record<Tone, { track: string; stroke: string }> = {
  gold: { track: "rgba(255,215,0,0.14)", stroke: "#d4a012" },
  emerald: { track: "rgba(0,200,130,0.14)", stroke: "#10b981" },
  rose: { track: "rgba(255,82,82,0.14)", stroke: "#ef4444" },
  sky: { track: "rgba(56,189,248,0.14)", stroke: "#0ea5e9" },
};

export default function CircularGauge({
  value,
  max = 100,
  label,
  sublabel,
  tone = "gold",
  size = "lg",
}: {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  tone?: Tone;
  size?: "md" | "lg";
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = size === "lg" ? 52 : 42;
  const stroke = size === "lg" ? 7 : 6;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const t = toneMap[tone];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: r * 2 + stroke * 2, height: r * 2 + stroke * 2 }}>
        <svg width={r * 2 + stroke * 2} height={r * 2 + stroke * 2}>
          <g transform={`translate(${stroke + r}, ${stroke + r})`}>
            <circle r={r} fill="none" stroke={t.track} strokeWidth={stroke} />
            <motion.circle
              r={r}
              fill="none"
              stroke={t.stroke}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`}
              transform="rotate(-90)"
              initial={{ strokeDasharray: `0 ${c}` }}
              animate={{ strokeDasharray: `${dash} ${c}` }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
          <span className="text-xl font-bold tabular-nums tracking-tight text-white sm:text-2xl">
            {pct.toFixed(0)}%
          </span>
          {sublabel ? <span className="mt-0.5 max-w-[7rem] text-[10px] leading-tight text-neutral-500">{sublabel}</span> : null}
        </div>
      </div>
    </div>
  );
}
