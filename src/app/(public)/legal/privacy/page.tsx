import type { Metadata } from "next";
import { LegalDocumentClient } from "@/components/legal/LegalDocumentClient";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Axon Funded Privacy Policy. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return <LegalDocumentClient page="privacy" />;
}
