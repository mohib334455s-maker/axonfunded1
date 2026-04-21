import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading Rules — Official Reference",
  description:
    "Official Axon rules: 5% daily drawdown (vs day-start balance), 12% static max drawdown, min 5 trading days per phase, no evaluation time limit, 30-day inactivity rule, KYC, payouts, IB terms, copy trading, EAs, and more.",
};

export default function RulesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
