import type { Metadata } from "next";
import { Suspense } from "react";
import AffiliateProgramView from "@/components/affiliate/AffiliateProgramView";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description:
    "Official Strategic Partnership (IB) program: 20% cash commission on challenge purchases via your referral link, withdrawable rewards, and tracking tools per Axon Trading Rules §18.",
};

export default function AffiliatePage() {
  return (
    <Suspense fallback={null}>
      <AffiliateProgramView />
    </Suspense>
  );
}
