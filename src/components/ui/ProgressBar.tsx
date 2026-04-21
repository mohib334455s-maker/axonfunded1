"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "gold" | "danger" | "success";
  showLabel?: boolean;
  label?: string;
  height?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  color = "gold",
  showLabel = false,
  label,
  height = "md",
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    gold: "bg-gradient-to-r from-gold-500 to-gold-600",
    danger: "bg-gradient-to-r from-danger to-red-500",
    success: "bg-gradient-to-r from-success to-green-400",
  };

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-xs text-neutral-400 font-medium">{label}</span>
          )}
          {showLabel && (
            <span className="text-xs font-mono text-gold-500 font-semibold">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`progress-bar ${heightClasses[height]}`}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className={`progress-fill ${colorClasses[color]} ${heightClasses[height]}`}
        />
      </div>
    </div>
  );
}
