import type { DashboardCertificate, DashboardPayout } from "@/lib/types/trader-dashboard";
import {
  getPayoutSummaryForTrader,
  listCertificatesForTrader,
  listPayoutsForTrader,
  tryAddPayoutRequest,
  type PayoutCreateResult,
} from "@/lib/server/trader-store";

export type { DashboardCertificate, DashboardPayout } from "@/lib/types/trader-dashboard";

function normCert(c: DashboardCertificate): DashboardCertificate {
  return {
    ...c,
    issuedAt: typeof c.issuedAt === "string" ? new Date(c.issuedAt) : c.issuedAt,
  };
}

function normPayout(p: DashboardPayout): DashboardPayout {
  return {
    ...p,
    requestedAt: typeof p.requestedAt === "string" ? new Date(p.requestedAt) : p.requestedAt,
    processedAt:
      p.processedAt == null ? undefined : typeof p.processedAt === "string" ? new Date(p.processedAt) : p.processedAt,
  };
}

export function listCertificates(traderId: string): DashboardCertificate[] {
  return listCertificatesForTrader(traderId).map(normCert);
}

export function listPayouts(traderId: string): DashboardPayout[] {
  return listPayoutsForTrader(traderId).map(normPayout);
}

export function getPayoutSummary(traderId: string) {
  return getPayoutSummaryForTrader(traderId);
}

export type { PayoutCreateResult };

export function createPayoutRequest(
  traderId: string,
  amount: number,
  method: string,
  opts: { declaresNoOpenPositions: boolean }
): PayoutCreateResult {
  const r = tryAddPayoutRequest(traderId, amount, method, opts);
  if (!r.ok) return r;
  return { ok: true, payout: normPayout(r.payout) };
}
