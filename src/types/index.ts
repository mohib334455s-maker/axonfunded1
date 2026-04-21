export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  balance: number;
  equity: number;
  dailyDrawdown: number;
  profitTargetProgress: number;
  tradingStatus: "active" | "pending" | "completed" | "failed";
  challengePhase: 1 | 2 | "funded";
  riskScore: number;
  kycStatus: "pending" | "verified" | "rejected";
  joinDate: string;
  country: string;
}

export interface Trade {
  id: string;
  date: Date;
  pair: string;
  type: "buy" | "sell";
  lots: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  pips: number;
}

export interface LeaderboardEntry {
  rank: number;
  traderId: string;
  traderName: string;
  country: string;
  profit: number;
  winRate: number;
  accountSize: number;
  profitFactor: number;
  trades: number;
}

export interface ChallengePlan {
  id: string;
  name: string;
  accountSize: number;
  price: number;
  profitTargetPhase1: number;
  profitTargetPhase2: number;
  maxDrawdown: number;
  dailyDrawdown: number;
  minTradingDays: number;
  leverage: string;
  popular?: boolean;
}

export interface ChallengeHistory {
  id: string;
  plan: string;
  accountSize: number;
  startDate: string;
  endDate?: string;
  status: "active" | "passed" | "failed";
  phase: 1 | 2 | "funded";
  profitTarget: number;
  currentProfit: number;
}

export interface Payout {
  id: string;
  date: string;
  amount: number;
  method: "crypto_usdt" | "crypto_btc" | "bank_transfer" | "wise";
  status: "pending" | "processing" | "completed" | "rejected";
  txHash?: string;
}

export interface TradingMetrics {
  winRate: number;
  riskRewardRatio: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  profitFactor: number;
  totalTrades: number;
  tradingFrequency: number;
  bestDay: number;
  worstDay: number;
}

export interface EquityDataPoint {
  date: string;
  equity: number;
  balance: number;
  drawdown: number;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
  time: string;
  read: boolean;
}
