import { TrendingUp, TrendingDown } from "lucide-react";

interface StatBadgeProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  showIcon?: boolean;
}

export default function StatBadge({
  value,
  prefix = "",
  suffix = "%",
  showIcon = true,
}: StatBadgeProps) {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  const isPositive = numValue >= 0;

  return (
    <span
      className={`stat-badge ${isPositive ? "positive" : "negative"}`}
    >
      {showIcon &&
        (isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        ))}
      {prefix}
      {isPositive ? "+" : ""}
      {typeof value === "number" ? value.toFixed(1) : value}
      {suffix}
    </span>
  );
}
