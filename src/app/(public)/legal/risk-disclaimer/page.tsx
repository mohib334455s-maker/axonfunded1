import type { Metadata } from "next";
import { LegalDocumentClient } from "@/components/legal/LegalDocumentClient";

export const metadata: Metadata = {
  title: "Risk Disclaimer",
  description: "Important risk disclosure for Axon Funded traders. Understand the risks associated with prop trading before participating.",
};

export default function RiskDisclaimerPage() {
  return <LegalDocumentClient page="risk" />;
}
