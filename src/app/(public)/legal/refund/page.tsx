import type { Metadata } from "next";
import { LegalDocumentClient } from "@/components/legal/LegalDocumentClient";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Axon Funded refund policy aligned with Trading Rules: challenge fee reimbursement on first funded withdrawal after eligibility, plus operational refunds for duplicate charges and activation failures.",
};

export default function RefundPage() {
  return <LegalDocumentClient page="refund" />;
}
