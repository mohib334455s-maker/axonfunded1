/** Snapshot pushed by the external sync bot (broker / MT bridge, etc.). */

export type TraderIngestMetrics = Record<string, string | number | boolean | null>;

export type TraderIngestRecord = {
  accountId: string;
  updatedAt: string;
  metrics: TraderIngestMetrics;
  /** Optional: platform, server, comment — never put broker passwords here. */
  meta?: Record<string, unknown>;
};

export type TraderIngestStoreFile = {
  version: 1;
  accounts: Record<string, TraderIngestRecord>;
};
