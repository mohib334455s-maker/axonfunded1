import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { MtRiskAlert, MtTelemetryEvent, MtTelemetryStoreFile } from "./mt-telemetry-types";
import { recomputeAlerts, trimEvents } from "./mt-telemetry-analyze";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "mt-telemetry.json");

function empty(): MtTelemetryStoreFile {
  return { version: 1, events: [], alerts: [] };
}

export function readMtTelemetryStore(): MtTelemetryStoreFile {
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const j = JSON.parse(raw) as MtTelemetryStoreFile;
    if (j?.version !== 1 || !Array.isArray(j.events)) return empty();
    if (!Array.isArray(j.alerts)) j.alerts = [];
    return j;
  } catch {
    return empty();
  }
}

function writeStore(store: MtTelemetryStoreFile): { ok: true } | { ok: false; error: string } {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(store), "utf8");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "write failed";
    return { ok: false, error: msg };
  }
}

function mergeAcknowledged(oldAlerts: MtRiskAlert[], fresh: MtRiskAlert[]): MtRiskAlert[] {
  const ackIds = new Set(oldAlerts.filter((a) => a.acknowledged).map((a) => a.id));
  return fresh.map((a) => (ackIds.has(a.id) ? { ...a, acknowledged: true } : a));
}

export function appendMtTelemetryEvent(event: Omit<MtTelemetryEvent, "id" | "ts"> & { id?: string; ts?: string }): {
  ok: true;
  event: MtTelemetryEvent;
} | { ok: false; error: string } {
  const store = readMtTelemetryStore();
  const full: MtTelemetryEvent = {
    id: event.id ?? randomUUID(),
    ts: event.ts ?? new Date().toISOString(),
    traderRef: event.traderRef,
    mtLogin: event.mtLogin,
    server: event.server,
    fingerprint: event.fingerprint,
    event: event.event,
    ip: event.ip,
    ipIntel: event.ipIntel,
    terminalBuild: event.terminalBuild,
    accountMode: event.accountMode,
    userAgent: event.userAgent,
    meta: event.meta,
  };
  store.events = trimEvents([...store.events, full]);
  const freshAlerts = recomputeAlerts(store.events);
  store.alerts = mergeAcknowledged(store.alerts, freshAlerts);
  const w = writeStore(store);
  if (!w.ok) return { ok: false, error: w.error };
  return { ok: true, event: full };
}

export function setAlertAcknowledged(alertId: string, acknowledged: boolean): { ok: true } | { ok: false; error: string } {
  const store = readMtTelemetryStore();
  const idx = store.alerts.findIndex((a) => a.id === alertId);
  if (idx === -1) return { ok: false, error: "Alert not found" };
  store.alerts[idx] = { ...store.alerts[idx], acknowledged };
  const w = writeStore(store);
  if (!w.ok) return { ok: false, error: w.error };
  return { ok: true };
}
