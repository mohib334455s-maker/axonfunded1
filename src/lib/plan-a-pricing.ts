/** Plan A — official 7-tier luxury specification: single source for pricing grid & checkout. */

export const PLAN_A_TITLE = "OFFICIAL PROP TRADING SPECIFICATIONS - 7 TIER LUXURY MODEL";

export const PLAN_A_SUBTITLE =
  "News and EA trading permitted on all tiers · Minimum trading days apply separately for evaluation and funded phases";

export const PLAN_A_FOOTER = "AXON CAPITAL ENGINE ACTIVATED";

export type PlanAColumn = {
  checkoutSlug: string;
  /** Column header tier name (e.g. Professional). */
  tierName: string;
  /** Account size label (e.g. $10,000). */
  headerLabel: string;
  accountSize: number;
  /** One-time registration fee (USD). */
  price: number;
  /** Performance reward (20%) — USD amount shown in grid. */
  performanceRewardFromChallengeUsd: number;
  maxDrawdownPct: number;
  maxDrawdownUsd: number;
  dailyDrawdownPct: number;
  dailyDrawdownUsd: number;
};

export const PLAN_A_COLUMNS: PlanAColumn[] = [
  {
    checkoutSlug: "professional",
    tierName: "Professional",
    headerLabel: "$10,000",
    accountSize: 10_000,
    price: 115,
    performanceRewardFromChallengeUsd: 240,
    maxDrawdownPct: 12,
    maxDrawdownUsd: 1200,
    dailyDrawdownPct: 5,
    dailyDrawdownUsd: 500,
  },
  {
    checkoutSlug: "elite",
    tierName: "Elite",
    headerLabel: "$25,000",
    accountSize: 25_000,
    price: 219,
    performanceRewardFromChallengeUsd: 600,
    maxDrawdownPct: 12,
    maxDrawdownUsd: 3000,
    dailyDrawdownPct: 5,
    dailyDrawdownUsd: 1250,
  },
  {
    checkoutSlug: "master",
    tierName: "Master",
    headerLabel: "$50,000",
    accountSize: 50_000,
    price: 329,
    performanceRewardFromChallengeUsd: 1200,
    maxDrawdownPct: 12,
    maxDrawdownUsd: 6000,
    dailyDrawdownPct: 5,
    dailyDrawdownUsd: 2500,
  },
  {
    checkoutSlug: "legendary",
    tierName: "Legendary",
    headerLabel: "$100,000",
    accountSize: 100_000,
    price: 589,
    performanceRewardFromChallengeUsd: 2400,
    maxDrawdownPct: 12,
    maxDrawdownUsd: 12_000,
    dailyDrawdownPct: 5,
    dailyDrawdownUsd: 5000,
  },
  {
    checkoutSlug: "whale",
    tierName: "Whale",
    headerLabel: "$200,000",
    accountSize: 200_000,
    price: 1149,
    performanceRewardFromChallengeUsd: 4800,
    maxDrawdownPct: 12,
    maxDrawdownUsd: 24_000,
    dailyDrawdownPct: 5,
    dailyDrawdownUsd: 10_000,
  },
  {
    checkoutSlug: "institutional",
    tierName: "Institutional",
    headerLabel: "$500,000",
    accountSize: 500_000,
    price: 2499,
    performanceRewardFromChallengeUsd: 12_000,
    maxDrawdownPct: 12,
    maxDrawdownUsd: 60_000,
    dailyDrawdownPct: 5,
    dailyDrawdownUsd: 25_000,
  },
  {
    checkoutSlug: "founders-club",
    tierName: "Founder's Club",
    headerLabel: "$1,000,000",
    accountSize: 1_000_000,
    price: 4500,
    performanceRewardFromChallengeUsd: 24_000,
    maxDrawdownPct: 12,
    maxDrawdownUsd: 120_000,
    dailyDrawdownPct: 5,
    dailyDrawdownUsd: 50_000,
  },
];

/** Shared cell values (all columns). */
export const PLAN_A_SHARED_ROWS = {
  phase1ProfitTarget: "8%",
  phase2ProfitTarget: "4%",
  profitSplitDisplay: "90%",
  minimumTradingDaysChallenge: "5 Days",
  minimumTradingDaysFunded: "10 Days",
  payoutType: "Daily",
  newsTrading: "Allowed",
  eaTrading: "Allowed",
  refundableFee: "Yes",
  /** Legacy key name kept for any string interpolation; value is 20% row in USD per column. */
  performanceRewardPercent: "20%",
} as const;

export const PLAN_A_ROW_LABELS = {
  performanceRewardChallenge: "Performance Reward (20%)",
  phase1: "Phase 1 Target",
  phase2: "Phase 2 Target",
  maxDd: "Total Drawdown",
  dailyDd: "Daily Drawdown",
  news: "News Trading",
  ea: "EA Trading (Robots)",
  performanceReward: "Profit Split",
  minDaysChallenge: "Min Trading Days (Challenge)",
  minDaysFunded: "Min Trading Days (Funded)",
  payoutType: "Payout Type",
  refundable: "Refundable Fee",
  registrationFee: "Registration Fee",
  accountSize: "Account Size",
} as const;

export function formatPlanFeeUsd(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPerformanceRewardUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
