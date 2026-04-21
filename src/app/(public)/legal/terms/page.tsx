import type { Metadata } from "next";
import { LegalDocumentClient } from "@/components/legal/LegalDocumentClient";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Axon Funded Terms of Service. Read our complete terms and conditions for using our prop trading evaluation platform.",
};

export default function TermsPage() {
  return <LegalDocumentClient page="terms" />;
}
