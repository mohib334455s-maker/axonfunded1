/** Shared dashboard API types (server + client). */

export interface DashboardCertificate {
  id: string;
  userId: string;
  accountId: string;
  accountSize: string;
  type: "evaluation" | "funded";
  issuedAt: Date | string;
  verificationId: string;
  status: "active" | "revoked";
}

export interface DashboardPayout {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "rejected";
  requestedAt: Date | string;
  processedAt?: Date | string;
  method: string;
  transactionId?: string;
  /** Set when ops rejects a payout (AML / rules). */
  rejectionReason?: string;
}
