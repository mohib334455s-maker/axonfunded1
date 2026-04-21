/** MetaTrader ↔ site anti-abuse telemetry (device / IP / VPN hints). */

export type MtTelemetryEventType = "heartbeat" | "connect" | "disconnect" | "login";

export type IpIntelSnapshot = {
  country?: string;
  region?: string;
  isp?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  /** Raw provider response id for audit */
  source?: string;
};

export type MtTelemetryEvent = {
  id: string;
  ts: string;
  /** Stable id from your CRM / dashboard user (EA input). */
  traderRef: string;
  mtLogin: string;
  server: string;
  fingerprint: string;
  event: MtTelemetryEventType;
  ip: string;
  ipIntel?: IpIntelSnapshot;
  terminalBuild?: number;
  accountMode?: "demo" | "live" | "unknown";
  userAgent?: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type MtRiskAlertType = "SHARED_FINGERPRINT" | "SHARED_IP" | "VPN_OR_HOSTING";

export type MtRiskAlert = {
  id: string;
  severity: "high" | "medium";
  type: MtRiskAlertType;
  title: string;
  detail: string;
  traderRefs: string[];
  evidence: string[];
  createdAt: string;
  acknowledged: boolean;
};

export type MtTelemetryStoreFile = {
  version: 1;
  events: MtTelemetryEvent[];
  alerts: MtRiskAlert[];
};
