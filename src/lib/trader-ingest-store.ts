import fs from "fs";
import path from "path";
import type { TraderIngestRecord, TraderIngestStoreFile } from "./trader-ingest-types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "trader-ingest.json");

function emptyStore(): TraderIngestStoreFile {
  return { version: 1, accounts: {} };
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readTraderIngestStore(): TraderIngestStoreFile {
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as TraderIngestStoreFile;
    if (parsed?.version !== 1 || typeof parsed.accounts !== "object" || parsed.accounts === null) {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

export function upsertTraderIngestRecord(record: {
  accountId: string;
  metrics: TraderIngestRecord["metrics"];
  meta?: TraderIngestRecord["meta"];
}): { ok: true; record: TraderIngestRecord } | { ok: false; error: string } {
  try {
    ensureDataDir();
    const store = readTraderIngestStore();
    const rec: TraderIngestRecord = {
      accountId: record.accountId,
      updatedAt: new Date().toISOString(),
      metrics: record.metrics ?? {},
      meta: record.meta,
    };
    store.accounts[record.accountId] = rec;
    fs.writeFileSync(STORE_FILE, JSON.stringify(store), "utf8");
    return { ok: true, record: rec };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "write failed";
    return { ok: false, error: msg };
  }
}

export function getTraderIngestAccount(accountId: string): TraderIngestRecord | null {
  return readTraderIngestStore().accounts[accountId] ?? null;
}

export function listTraderIngestAccounts(): TraderIngestRecord[] {
  return Object.values(readTraderIngestStore().accounts);
}
