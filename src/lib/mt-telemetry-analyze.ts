import { createHash } from "crypto";
import type { MtRiskAlert, MtTelemetryEvent } from "./mt-telemetry-types";

function stableAlertId(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 32);
}

const MAX_EVENTS = 2500;

export function trimEvents(events: MtTelemetryEvent[]): MtTelemetryEvent[] {
  if (events.length <= MAX_EVENTS) return events;
  return events.slice(events.length - MAX_EVENTS);
}

/**
 * Rebuilds alerts from recent events (deterministic; run after each append).
 * - SHARED_FINGERPRINT: same device fingerprint, different traderRef → multi-device / multi-account risk.
 * - SHARED_IP: same public IP, different traderRef → shared WiFi or same connection.
 * - VPN_OR_HOSTING: latest event per traderRef with proxy/hosting flags.
 */
export function recomputeAlerts(events: MtTelemetryEvent[]): MtRiskAlert[] {
  const alerts: MtRiskAlert[] = [];
  const now = new Date().toISOString();

  const fpToRefs = new Map<string, Set<string>>();
  const ipToRefs = new Map<string, Set<string>>();

  for (const e of events) {
    if (e.fingerprint) {
      if (!fpToRefs.has(e.fingerprint)) fpToRefs.set(e.fingerprint, new Set());
      fpToRefs.get(e.fingerprint)!.add(e.traderRef);
    }
    if (e.ip && e.ip !== "127.0.0.1" && e.ip !== "::1") {
      if (!ipToRefs.has(e.ip)) ipToRefs.set(e.ip, new Set());
      ipToRefs.get(e.ip)!.add(e.traderRef);
    }
  }

  for (const [fp, refs] of Array.from(fpToRefs.entries())) {
    if (refs.size < 2) continue;
    const arr = Array.from(refs).sort();
    alerts.push({
      id: stableAlertId(["SHARED_FINGERPRINT", fp, ...arr]),
      severity: "high",
      type: "SHARED_FINGERPRINT",
      title: "Shared device fingerprint",
      detail: "The same MetaTrader / machine fingerprint was reported for more than one trader reference.",
      traderRefs: arr,
      evidence: [`fingerprint=${fp.slice(0, 24)}...`, `distinct_trader_refs=${refs.size}`],
      createdAt: now,
      acknowledged: false,
    });
  }

  for (const [ip, refs] of Array.from(ipToRefs.entries())) {
    if (refs.size < 2) continue;
    const arr = Array.from(refs).sort();
    alerts.push({
      id: stableAlertId(["SHARED_IP", ip, ...arr]),
      severity: "medium",
      type: "SHARED_IP",
      title: "Shared public IP",
      detail: "Different trader references reported from the same IP (shared network, VPN egress, or multi-accounting).",
      traderRefs: arr,
      evidence: [`ip=${ip}`, `distinct_trader_refs=${refs.size}`],
      createdAt: now,
      acknowledged: false,
    });
  }

  const seenVpnTrader = new Set<string>();
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    const intel = e.ipIntel;
    if (!intel || seenVpnTrader.has(e.traderRef)) continue;
    if (intel.proxy || intel.hosting) {
      seenVpnTrader.add(e.traderRef);
      alerts.push({
        id: stableAlertId(["VPN_OR_HOSTING", e.traderRef, e.ip]),
        severity: "medium",
        type: "VPN_OR_HOSTING",
        title: "VPN / hosting IP",
        detail: `Trader ${e.traderRef} connected from an IP flagged as proxy or hosting/datacenter.`,
        traderRefs: [e.traderRef],
        evidence: [
          `ip=${e.ip}`,
          `proxy=${Boolean(intel.proxy)}`,
          `hosting=${Boolean(intel.hosting)}`,
          `isp=${intel.isp ?? "?"}`,
        ],
        createdAt: now,
        acknowledged: false,
      });
    }
  }

  return alerts;
}
