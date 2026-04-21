import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Challenge Plans",
  description:
    "Plan A — 7-tier luxury model: $10K–$1M accounts, 8%/4% phase targets, 12% max drawdown, 90% profit split, daily payouts. Registration from $115.",
  openGraph: {
    title: "Challenge Plans – Axon Funded",
    description: "Seven tiers (Professional → Founder's Club), official specification table, transparent fees.",
  },
};

export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
