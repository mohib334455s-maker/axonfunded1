"use client";

import { motion } from "framer-motion";

/** `value` and `limit` should be same sign convention (e.g. both negative for drawdown %). */
export default function LinearThresholdBar({
  label,
  value,
  limit,
  warnAt = 0.6,
  dangerAt = 0.85,
  formatter = (n: number) => `${n.toFixed(1)}%`,
}: {
  label: string;
  value: number;
  limit: number;
  warnAt?: number;
  dangerAt?: number;
  formatter?: (n: number) => string;
}) {
  const used = Math.min(1, Math.abs(value) / Math.abs(limit || 1));
  const tone = used >= dangerAt ? "danger" : used >= warnAt ? "warn" : "ok";
  const fill =
    tone === "danger" ? "#ef4444" : tone === "warn" ? "#f59e0b" : "#10b981";

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
        <span className="text-xs font-mono tabular-nums text-neutral-300">
          {formatter(value)} <span className="text-neutral-600">/ {formatter(limit)}</span>
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-sm border border-white/[0.08] bg-white/[0.05]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-sm"
          style={{ background: fill }}
          initial={{ width: 0 }}
          animate={{ width: `${used * 100}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-white/25 z-[1]"
          style={{ left: `${warnAt * 100}%` }}
          title="Warning zone"
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-white/35 z-[1]"
          style={{ left: `${dangerAt * 100}%` }}
          title="Critical zone"
        />
      </div>
    </div>
  );
}
