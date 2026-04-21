import type {
  User,
  Trade,
  LeaderboardEntry,
  ChallengePlan,
  ChallengeHistory,
  Payout,
  TradingMetrics,
  EquityDataPoint,
  Notification,
} from "@/types";
import { PLAN_A_COLUMNS } from "@/lib/plan-a-pricing";

export const mockUser: User = {
  id: "usr_001",
  name: "",
  email: "",
  avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=axon-account",
  balance: 125430,
  equity: 132890,
  dailyDrawdown: -2.3,
  profitTargetProgress: 67,
  tradingStatus: "active",
  challengePhase: 1,
  riskScore: 82,
  kycStatus: "verified",
  joinDate: "2024-01-15",
  country: "",
};

export const mockTrades: Trade[] = [
  {
    id: "t001",
    date: new Date("2024-03-15T09:30:00"),
    pair: "EUR/USD",
    type: "buy",
    lots: 0.5,
    openPrice: 1.0845,
    closePrice: 1.0892,
    profit: 235.0,
    pips: 47,
  },
  {
    id: "t002",
    date: new Date("2024-03-15T11:15:00"),
    pair: "GBP/USD",
    type: "sell",
    lots: 0.3,
    openPrice: 1.2734,
    closePrice: 1.2698,
    profit: 108.0,
    pips: 36,
  },
  {
    id: "t003",
    date: new Date("2024-03-14T14:22:00"),
    pair: "USD/JPY",
    type: "buy",
    lots: 1.0,
    openPrice: 149.82,
    closePrice: 149.54,
    profit: -280.0,
    pips: -28,
  },
  {
    id: "t004",
    date: new Date("2024-03-14T16:45:00"),
    pair: "XAU/USD",
    type: "buy",
    lots: 0.2,
    openPrice: 2045.3,
    closePrice: 2062.8,
    profit: 350.0,
    pips: 175,
  },
  {
    id: "t005",
    date: new Date("2024-03-13T10:10:00"),
    pair: "EUR/GBP",
    type: "sell",
    lots: 0.8,
    openPrice: 0.8567,
    closePrice: 0.8534,
    profit: 264.0,
    pips: 33,
  },
  {
    id: "t006",
    date: new Date("2024-03-13T13:30:00"),
    pair: "USD/CAD",
    type: "buy",
    lots: 0.5,
    openPrice: 1.3542,
    closePrice: 1.3521,
    profit: -105.0,
    pips: -21,
  },
  {
    id: "t007",
    date: new Date("2024-03-12T09:00:00"),
    pair: "AUD/USD",
    type: "sell",
    lots: 1.0,
    openPrice: 0.6534,
    closePrice: 0.6498,
    profit: 360.0,
    pips: 36,
  },
  {
    id: "t008",
    date: new Date("2024-03-12T15:20:00"),
    pair: "NZD/USD",
    type: "buy",
    lots: 0.4,
    openPrice: 0.6123,
    closePrice: 0.6156,
    profit: 132.0,
    pips: 33,
  },
];

export const mockEquityData: EquityDataPoint[] = [
  { date: "Mar 1", equity: 100000, balance: 100000, drawdown: 0 },
  { date: "Mar 2", equity: 101250, balance: 101000, drawdown: -0.5 },
  { date: "Mar 3", equity: 100800, balance: 100800, drawdown: -1.2 },
  { date: "Mar 4", equity: 102400, balance: 102200, drawdown: -0.3 },
  { date: "Mar 5", equity: 103100, balance: 103000, drawdown: -0.2 },
  { date: "Mar 6", equity: 102500, balance: 102400, drawdown: -1.5 },
  { date: "Mar 7", equity: 104200, balance: 104000, drawdown: -0.1 },
  { date: "Mar 8", equity: 105800, balance: 105500, drawdown: -0.3 },
  { date: "Mar 9", equity: 105200, balance: 105100, drawdown: -1.8 },
  { date: "Mar 10", equity: 107300, balance: 107000, drawdown: -0.2 },
  { date: "Mar 11", equity: 108900, balance: 108700, drawdown: -0.4 },
  { date: "Mar 12", equity: 110200, balance: 110000, drawdown: -0.6 },
  { date: "Mar 13", equity: 111800, balance: 111500, drawdown: -0.2 },
  { date: "Mar 14", equity: 112400, balance: 112200, drawdown: -2.3 },
  { date: "Mar 15", equity: 132890, balance: 125430, drawdown: -2.3 },
];

/** Deterministic 50-trader cohort: top ≈ $12.5k profit, floor ≈ $1.1k, win rates 52–67%. */
function buildLeaderboard50(): LeaderboardEntry[] {
  const first = [
    "Marcus", "Sarah", "Diego", "Yuki", "Emma", "James", "Priya", "Lars", "Ana", "Kwame",
    "Olivia", "Noah", "Sofia", "Lucas", "Mia", "Ethan", "Amir", "Elena", "Jonas", "Zara",
    "Ryan", "Hana", "Leo", "Nina", "Victor", "Aisha", "Tom", "Rosa", "Felix", "Mei",
    "Daniel", "Layla", "Ivan", "Chloe", "Omar", "Julia", "Henrik", "Fatima", "Eric", "Grace",
    "Samir", "Kate", "Bruno", "Yara", "Chris", "Ines", "Paul", "Dina", "Mark", "Lina",
  ];
  const last = [
    "Chen", "Williams", "Martinez", "Tanaka", "Laurent", "O'Brien", "Sharma", "Nielsen", "Popescu", "Asante",
    "Park", "Schmidt", "Silva", "Kowalski", "Novak", "Haddad", "Berg", "Costa", "Rossi", "Khan",
    "Murphy", "Ito", "Varga", "Petrov", "Jensen", "Al-Farsi", "Nguyen", "García", "Nowak", "Sato",
    "Lindberg", "Okonkwo", "Fischer", "Reyes", "Müller", "Santos", "Yilmaz", "Kaur", "Dubois", "Kowalczyk",
    "Hansen", "Patel", "Romano", "Klein", "Sørensen", "Aziz", "Weber", "Lopez", "Cohen", "Farah",
  ];
  const flags = [
    "🇸🇬", "🇬🇧", "🇪🇸", "🇯🇵", "🇫🇷", "🇮🇪", "🇮🇳", "🇩🇰", "🇷🇴", "🇬🇭", "🇦🇺", "🇨🇦", "🇩🇪", "🇧🇷", "🇰🇷",
    "🇿🇦", "🇮🇹", "🇳🇱", "🇵🇹", "🇳🇴", "🇸🇪", "🇵🇱", "🇲🇽", "🇦🇪", "🇳🇬", "🇪🇬", "🇹🇷", "🇮🇩", "🇻🇳", "🇵🇭",
    "🇲🇾", "🇨🇭", "🇦🇹", "🇳🇿", "🇨🇱", "🇨🇴", "🇦🇷", "🇬🇷", "🇨🇿", "🇭🇺", "🇫🇮", "🇸🇰", "🇭🇷", "🇹🇭", "🇵🇰",
    "🇧🇩", "🇰🇪", "🇺🇦", "🇱🇹", "🇪🇪", "🇸🇮",
  ];
  const sizes: number[] = [25000, 50000, 50000, 100000, 100000, 100000, 200000, 200000];
  const rows: LeaderboardEntry[] = [];
  for (let i = 0; i < 50; i++) {
    const t = i / 49;
    const profit = Math.round(12500 - t * (12500 - 1100));
    const winRate = Math.min(67, Math.max(52, Math.round(67 - t * 15 + ((i * 5) % 3) - 1)));
    const profitFactor = Math.round((2.08 - t * 0.92) * 100) / 100;
    rows.push({
      rank: 0,
      traderId: `lb_${String(i + 1).padStart(3, "0")}`,
      traderName: `${first[i]} ${last[(i * 7) % 50]}`,
      country: flags[i],
      profit,
      winRate,
      accountSize: sizes[i % sizes.length],
      profitFactor,
      trades: 52 + ((i * 13) % 218),
    });
  }
  return rows
    .sort((a, b) => b.profit - a.profit)
    .map((e, idx) => ({ ...e, rank: idx + 1 }));
}

export const mockLeaderboard: LeaderboardEntry[] = buildLeaderboard50();

export const mockChallengePlans: ChallengePlan[] = PLAN_A_COLUMNS.map((c) => ({
  id: `plan_${c.checkoutSlug}`,
  name: `${c.tierName} ${c.headerLabel}`,
  accountSize: c.accountSize,
  price: c.price,
  profitTargetPhase1: 8,
  profitTargetPhase2: 4,
  maxDrawdown: 12,
  dailyDrawdown: 5,
  minTradingDays: 5,
  leverage: "1:100",
  popular: c.checkoutSlug === "legendary",
}));

export const mockChallengeHistory: ChallengeHistory[] = [
  {
    id: "ch_003",
    plan: "Professional",
    accountSize: 100000,
    startDate: "2024-03-01",
    status: "active",
    phase: 1,
    profitTarget: 8000,
    currentProfit: 5430,
  },
  {
    id: "ch_002",
    plan: "Standard",
    accountSize: 50000,
    startDate: "2024-01-15",
    endDate: "2024-02-28",
    status: "passed",
    phase: "funded",
    profitTarget: 4000,
    currentProfit: 4280,
  },
  {
    id: "ch_001",
    plan: "Starter",
    accountSize: 25000,
    startDate: "2023-11-10",
    endDate: "2023-12-20",
    status: "failed",
    phase: 1,
    profitTarget: 2000,
    currentProfit: -2800,
  },
];

export const mockPayouts: Payout[] = [
  {
    id: "pay_006",
    date: "2024-03-10",
    amount: 1850,
    method: "crypto_usdt",
    status: "completed",
    txHash: "0x4a7b...3f2d",
  },
  {
    id: "pay_005",
    date: "2024-02-15",
    amount: 2400,
    method: "wise",
    status: "completed",
  },
  {
    id: "pay_004",
    date: "2024-01-28",
    amount: 980,
    method: "crypto_btc",
    status: "completed",
    txHash: "bc1q...8x2k",
  },
  {
    id: "pay_003",
    date: "2023-12-20",
    amount: 3200,
    method: "bank_transfer",
    status: "completed",
  },
  {
    id: "pay_002",
    date: "2023-11-15",
    amount: 1500,
    method: "crypto_usdt",
    status: "completed",
    txHash: "0x8c2a...1e4b",
  },
];

export const mockMetrics: TradingMetrics = {
  winRate: 68,
  riskRewardRatio: 2.5,
  avgWin: 450,
  avgLoss: 180,
  maxDrawdown: 7.2,
  profitFactor: 1.85,
  totalTrades: 847,
  tradingFrequency: 12,
  bestDay: 1240,
  worstDay: -580,
};

export const mockWeeklyTrades = [
  { day: "Mon", trades: 8, profit: 420 },
  { day: "Tue", trades: 12, profit: 780 },
  { day: "Wed", trades: 6, profit: -180 },
  { day: "Thu", trades: 15, profit: 1240 },
  { day: "Fri", trades: 10, profit: 580 },
  { day: "Sat", trades: 0, profit: 0 },
  { day: "Sun", trades: 0, profit: 0 },
];

export const mockSessionHeatmap = [
  { session: "Asian", winRate: 58, trades: 142, profit: 3240 },
  { session: "London", winRate: 72, trades: 385, profit: 18500 },
  { session: "New York", winRate: 65, trades: 298, profit: 12800 },
  { session: "Overlap", winRate: 69, trades: 22, profit: 2100 },
];

export const mockNotifications: Notification[] = [
  {
    id: "n001",
    type: "success",
    title: "Profit Target Progress",
    message: "You've reached 67% of your Phase 1 profit target!",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n002",
    type: "warning",
    title: "Daily Drawdown Alert",
    message: "Your daily drawdown is at -2.3%. Limit is -5%.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "n003",
    type: "info",
    title: "Payout Processed",
    message: "Your payout of $1,850 has been sent via USDT.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "n004",
    type: "success",
    title: "KYC Verified",
    message: "Your identity has been successfully verified.",
    time: "5 days ago",
    read: true,
  },
];

