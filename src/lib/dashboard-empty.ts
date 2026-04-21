import type { EquityDataPoint, User } from "@/types";

/** Flat equity series at zero — charts stay valid with no fabricated history. */
export function emptyEquitySeries(): EquityDataPoint[] {
  return [
    { date: "—", equity: 0, balance: 0, drawdown: 0 },
    { date: "—", equity: 0, balance: 0, drawdown: 0 },
  ];
}

/** No linked evaluation — all numeric KPIs at zero. */
export const emptyDashboardUser: User = {
  id: "",
  name: "",
  email: "",
  balance: 0,
  equity: 0,
  dailyDrawdown: 0,
  profitTargetProgress: 0,
  tradingStatus: "pending",
  challengePhase: 1,
  riskScore: 0,
  kycStatus: "pending",
  joinDate: "",
  country: "",
};
