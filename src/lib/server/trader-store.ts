import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { DashboardCertificate, DashboardPayout } from "@/lib/types/trader-dashboard";
import { PLAN_A_COLUMNS, type PlanAColumn } from "@/lib/plan-a-pricing";
import {
  attachReferralOnSignup,
  ensureAffiliateProfile,
  resolveReferrerIdByCode,
} from "@/lib/server/platform-store";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "trader-store.json");

export type TraderRecord = {
  id: string;
  email?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
  /** Set once at signup when a valid affiliate referral code was used. */
  referredByTraderId?: string;
  /** Compliance: payouts blocked until approved in admin. */
  kycStatus?: "none" | "submitted" | "approved" | "rejected";
  /** Funded-phase calendar days on file (ops); §11 first payout gate. */
  fundedTradingDays?: number;
};

export type OrderRecord = {
  id: string;
  traderId: string;
  planSlug: string;
  tierName: string;
  accountSizeUsd: number;
  amountUsd: number;
  currency: string;
  paymentMethod: string;
  status: "paid" | "pending_payment";
  receiptId: string;
  paidAt: string;
  createdAt: string;
  paymentChannel: "demo_simulated" | "stripe" | "usdt_manual";
  stripeSessionId?: string;
  usdtTxHash?: string;
};

export type TradingAccountRecord = {
  id: string;
  traderId: string;
  orderId: string;
  tierName: string;
  accountSizeUsd: number;
  phase: 1 | 2;
  server: string;
  login: string;
  password: string;
  status: "awaiting_credentials" | "active" | "breached";
  credentialsEtaNote: string;
  updatedAt: string;
};

export type TicketRecord = {
  id: string;
  traderId: string;
  subject: string;
  preview?: string;
  status: "open" | "awaiting_mt" | "resolved" | "closed";
  createdAt: string;
  messages: number;
};

/** Owner audit trail (credential issuance, payout decisions). */
export type AuditLogEntry = {
  id: string;
  at: string;
  action: string;
  entityType: string;
  entityId: string;
  traderId?: string;
  actor: string;
  detail?: string;
};

type StoreShape = {
  version: 1;
  tradersById: Record<string, TraderRecord>;
  emailIndex: Record<string, string>;
  orders: OrderRecord[];
  tradingAccounts: TradingAccountRecord[];
  payoutsByTrader: Record<string, DashboardPayout[]>;
  certificatesByTrader: Record<string, DashboardCertificate[]>;
  ticketsByTrader: Record<string, TicketRecord[]>;
  auditLog: AuditLogEntry[];
};

let traderStoreCache: { mtimeMs: number; data: StoreShape } | null = null;

function emptyStore(): StoreShape {
  return {
    version: 1,
    tradersById: {},
    emailIndex: {},
    orders: [],
    tradingAccounts: [],
    payoutsByTrader: {},
    certificatesByTrader: {},
    ticketsByTrader: {},
    auditLog: [],
  };
}

function loadStore(): StoreShape {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      traderStoreCache = null;
      return emptyStore();
    }
    const st = fs.statSync(STORE_FILE);
    if (traderStoreCache && traderStoreCache.mtimeMs === st.mtimeMs) {
      return traderStoreCache.data;
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const j = JSON.parse(raw) as Partial<StoreShape> & { version?: number };
    if (!j || j.version !== 1) {
      traderStoreCache = null;
      return emptyStore();
    }
    const auditLog = Array.isArray(j.auditLog) ? j.auditLog : [];
    const merged: StoreShape = {
      ...emptyStore(),
      ...j,
      tradersById: j.tradersById ?? {},
      emailIndex: j.emailIndex ?? {},
      orders: Array.isArray(j.orders) ? j.orders : [],
      tradingAccounts: Array.isArray(j.tradingAccounts) ? j.tradingAccounts : [],
      payoutsByTrader: j.payoutsByTrader ?? {},
      certificatesByTrader: j.certificatesByTrader ?? {},
      ticketsByTrader: j.ticketsByTrader ?? {},
      auditLog,
    };
    traderStoreCache = { mtimeMs: st.mtimeMs, data: merged };
    return merged;
  } catch {
    traderStoreCache = null;
    return emptyStore();
  }
}

function saveStore(s: StoreShape) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${STORE_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(s, null, 0), "utf8");
    fs.renameSync(tmp, STORE_FILE);
    const st = fs.statSync(STORE_FILE);
    traderStoreCache = { mtimeMs: st.mtimeMs, data: s };
  } catch (e) {
    console.error("[trader-store] save failed", e);
  }
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

function appendAudit(store: StoreShape, e: Omit<AuditLogEntry, "id" | "at"> & Partial<Pick<AuditLogEntry, "at">>) {
  if (!Array.isArray(store.auditLog)) store.auditLog = [];
  const row: AuditLogEntry = {
    id: newId("aud"),
    at: e.at ?? new Date().toISOString(),
    action: e.action,
    entityType: e.entityType,
    entityId: e.entityId,
    traderId: e.traderId,
    actor: e.actor || "system",
    detail: e.detail,
  };
  store.auditLog.unshift(row);
  if (store.auditLog.length > 800) store.auditLog = store.auditLog.slice(0, 800);
}

function maxConcurrentChallenges(): number {
  const n = parseInt(process.env.MAX_CONCURRENT_CHALLENGES_PER_TRADER || "3", 10);
  return Number.isFinite(n) && n >= 1 ? n : 3;
}

function receiptId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `RCP-${y}${m}${day}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export function findPlanBySlug(slug: string): PlanAColumn | undefined {
  return PLAN_A_COLUMNS.find((c) => c.checkoutSlug.toLowerCase() === slug.toLowerCase());
}

export function getOrCreateTraderByEmail(email: string, name?: string, referralCode?: string): TraderRecord {
  const store = loadStore();
  const key = email.trim().toLowerCase();
  if (!key) throw new Error("email required");
  let id = store.emailIndex[key];
  if (id && store.tradersById[id]) {
    const t = store.tradersById[id];
    if (name && name !== t.name) {
      t.name = name;
      t.updatedAt = new Date().toISOString();
      saveStore(store);
    }
    return t;
  }
  id = newId("tr");
  const now = new Date().toISOString();
  const t: TraderRecord = { id, email: key, name: name?.trim(), createdAt: now, updatedAt: now, kycStatus: "none" };
  const ref = referralCode?.trim().toUpperCase();
  const parentId = ref ? resolveReferrerIdByCode(ref) : null;
  if (parentId) {
    t.referredByTraderId = parentId;
  }
  store.tradersById[id] = t;
  store.emailIndex[key] = id;
  saveStore(store);
  if (parentId && ref) {
    attachReferralOnSignup(id, ref);
  }
  ensureAffiliateProfile(id);
  return t;
}

export function getOrderOpsCounts() {
  const s = loadStore();
  return {
    pendingUsdtOrders: s.orders.filter((o) => o.status === "pending_payment").length,
    awaitingMtCredentials: s.tradingAccounts.filter((a) => a.status === "awaiting_credentials").length,
  };
}

export function getTrader(traderId: string): TraderRecord | undefined {
  return loadStore().tradersById[traderId];
}

export function ensureAnonymousTrader(traderId?: string | null): TraderRecord {
  const store = loadStore();
  if (traderId && store.tradersById[traderId]) return store.tradersById[traderId];
  const id = newId("tr");
  const now = new Date().toISOString();
  const t: TraderRecord = { id, createdAt: now, updatedAt: now };
  store.tradersById[id] = t;
  saveStore(store);
  return t;
}

export function attachEmailToTrader(traderId: string, email: string, name?: string): TraderRecord | null {
  const store = loadStore();
  const t = store.tradersById[traderId];
  if (!t) return null;
  const key = email.trim().toLowerCase();
  const existingId = store.emailIndex[key];
  if (existingId && existingId !== traderId) {
    return store.tradersById[existingId] ?? null;
  }
  store.emailIndex[key] = traderId;
  t.email = key;
  if (name) t.name = name.trim();
  t.updatedAt = new Date().toISOString();
  saveStore(store);
  return t;
}

export function createPaidOrder(input: {
  traderId: string;
  planSlug: string;
  paymentMethod: string;
  paymentChannel: OrderRecord["paymentChannel"];
  stripeSessionId?: string;
  usdtTxHash?: string;
}): { order: OrderRecord; account: TradingAccountRecord; certificate: DashboardCertificate } {
  const store = loadStore();
  const plan = findPlanBySlug(input.planSlug);
  if (!plan) throw new Error("invalid_plan");

  const maxC = maxConcurrentChallenges();
  const concurrent = store.tradingAccounts.filter(
    (a) =>
      a.traderId === input.traderId && (a.status === "awaiting_credentials" || a.status === "active")
  ).length;
  if (concurrent >= maxC) {
    throw new Error("concurrent_challenge_cap");
  }

  const now = new Date().toISOString();
  const order: OrderRecord = {
    id: newId("ord"),
    traderId: input.traderId,
    planSlug: plan.checkoutSlug,
    tierName: plan.tierName,
    accountSizeUsd: plan.accountSize,
    amountUsd: plan.price,
    currency: "USD",
    paymentMethod: input.paymentMethod,
    status: "paid",
    receiptId: receiptId(),
    paidAt: now,
    createdAt: now,
    paymentChannel: input.paymentChannel,
    stripeSessionId: input.stripeSessionId,
    usdtTxHash: input.usdtTxHash?.trim() || undefined,
  };
  store.orders.push(order);

  const account: TradingAccountRecord = {
    id: newId("acc"),
    traderId: input.traderId,
    orderId: order.id,
    tierName: plan.tierName,
    accountSizeUsd: plan.accountSize,
    phase: 1,
    server: "Broker assignment queue — credentials typically within 24h (business days)",
    login: "Pending — check email & tickets",
    password: "•••••••• (issued with MT email)",
    status: "awaiting_credentials",
    credentialsEtaNote:
      "Open a support ticket if nothing arrives after 24h. Do not trade until you receive official MT credentials.",
    updatedAt: now,
  };
  store.tradingAccounts.push(account);

  const cert: DashboardCertificate = {
    id: newId("cert"),
    userId: input.traderId,
    accountId: account.id,
    accountSize: plan.headerLabel,
    type: "evaluation",
    issuedAt: order.paidAt,
    verificationId: `AXN-EVAL-${order.receiptId.slice(-10).toUpperCase()}`,
    status: "active",
  };
  const certs = store.certificatesByTrader[input.traderId] ?? [];
  certs.push(cert);
  store.certificatesByTrader[input.traderId] = certs;

  appendAudit(store, {
    action: "order_recorded",
    entityType: "order",
    entityId: order.id,
    traderId: input.traderId,
    actor: "checkout",
    detail: JSON.stringify({
      channel: order.paymentChannel,
      receiptId: order.receiptId,
      stripeSessionId: order.stripeSessionId,
      usdtTxHash: order.usdtTxHash,
    }),
  });

  saveStore(store);
  return { order, account, certificate: cert };
}

export function listOrdersForTrader(traderId: string): OrderRecord[] {
  return loadStore().orders.filter((o) => o.traderId === traderId).sort((a, b) => b.paidAt.localeCompare(a.paidAt));
}

export function listTradingAccountsForTrader(traderId: string): TradingAccountRecord[] {
  return loadStore()
    .tradingAccounts.filter((a) => a.traderId === traderId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** One `loadStore()` for dashboard summary API (fewer redundant reads). */
export function getDashboardSummaryForTrader(traderId: string) {
  const store = loadStore();
  const orders = store.orders
    .filter((o) => o.traderId === traderId)
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  const accounts = store.tradingAccounts
    .filter((a) => a.traderId === traderId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const paid = orders.filter((o) => o.status === "paid");
  return {
    traderId,
    hasPaidChallenge: paid.length > 0,
    awaitingCredentials: accounts.some((a) => a.status === "awaiting_credentials"),
    accountCount: accounts.length,
    orderCount: paid.length,
    latestOrder: paid[0] ?? null,
    primaryAccount: accounts[0] ?? null,
  };
}

export function listPayoutsForTrader(traderId: string): DashboardPayout[] {
  return loadStore().payoutsByTrader[traderId] ?? [];
}

export function listCertificatesForTrader(traderId: string): DashboardCertificate[] {
  return loadStore().certificatesByTrader[traderId] ?? [];
}

function walletSummaryForTrader(traderId: string) {
  const rows = listPayoutsForTrader(traderId);
  const pending = rows.filter((r) => r.status === "pending" || r.status === "processing").length;
  const paidOrders = listOrdersForTrader(traderId).filter((o) => o.status === "paid").length;
  /** Simulated profit wallet for demo UI — not MT equity; real product would sync from broker. */
  const availableBalance = paidOrders > 0 ? Math.max(0, 2400 - pending * 200) : 0;
  return {
    availableBalance,
    minPayout: 100,
    pendingCount: pending,
  };
}

/** Static checks shown on payout page (KYC / §11 days). Open-position rule is enforced on submit. */
export function getPayoutComplianceHints(traderId: string): string[] {
  if (process.env.PAYOUT_COMPLIANCE_RELAXED === "1") return [];
  const t = getTrader(traderId);
  const reasons: string[] = [];
  const kyc = t?.kycStatus ?? "none";
  if (kyc !== "approved") reasons.push("KYC must be approved by ops before any payout (AML).");
  const days = t?.fundedTradingDays ?? 0;
  if (days < 10) reasons.push("§11: first payout requires 10 funded trading days on file (ops sets this after verification).");
  return reasons;
}

export function getPayoutSummaryForTrader(traderId: string) {
  const w = walletSummaryForTrader(traderId);
  return {
    ...w,
    payoutComplianceHints: getPayoutComplianceHints(traderId),
    complianceRelaxed: process.env.PAYOUT_COMPLIANCE_RELAXED === "1",
  };
}

export type PayoutCreateResult =
  | { ok: true; payout: DashboardPayout }
  | {
      ok: false;
      code: "payout_compliance" | "below_min" | "exceeds_balance";
      reasons?: string[];
      minPayout?: number;
      availableBalance?: number;
    };

export function tryAddPayoutRequest(
  traderId: string,
  amount: number,
  method: string,
  opts: { declaresNoOpenPositions: boolean }
): PayoutCreateResult {
  const relax = process.env.PAYOUT_COMPLIANCE_RELAXED === "1";
  if (!relax) {
    const hints = getPayoutComplianceHints(traderId);
    if (hints.length) return { ok: false, code: "payout_compliance", reasons: hints };
    if (!opts.declaresNoOpenPositions) {
      return {
        ok: false,
        code: "payout_compliance",
        reasons: [
          "Confirm no open positions and no new trades until payout completes (Trading Rules §11). Tick the checkbox on the form.",
        ],
      };
    }
  }

  const w = walletSummaryForTrader(traderId);
  if (!Number.isFinite(amount) || amount < w.minPayout) {
    return { ok: false, code: "below_min", minPayout: w.minPayout };
  }
  if (amount > w.availableBalance) {
    return { ok: false, code: "exceeds_balance", availableBalance: w.availableBalance };
  }

  const store = loadStore();
  const list = store.payoutsByTrader[traderId] ?? [];
  const acc = listTradingAccountsForTrader(traderId)[0];
  const p: DashboardPayout = {
    id: newId("payout"),
    userId: traderId,
    accountId: acc?.id ?? "none",
    amount,
    currency: "USD",
    status: "pending",
    requestedAt: new Date().toISOString(),
    method,
  };
  list.unshift(p);
  store.payoutsByTrader[traderId] = list;
  appendAudit(store, {
    action: "payout_requested",
    entityType: "payout",
    entityId: p.id,
    traderId,
    actor: "trader",
    detail: JSON.stringify({ amount, method }),
  });
  saveStore(store);
  return { ok: true, payout: p };
}

export function listTicketsForTrader(traderId: string): TicketRecord[] {
  return (loadStore().ticketsByTrader[traderId] ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addTicket(traderId: string, subject: string, message?: string): TicketRecord {
  const store = loadStore();
  const list = store.ticketsByTrader[traderId] ?? [];
  const t: TicketRecord = {
    id: `TK-${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
    traderId,
    subject: subject.trim().slice(0, 200),
    preview: message?.replace(/\s+/g, " ").trim().slice(0, 220),
    status: "open",
    createdAt: new Date().toISOString(),
    messages: 1,
  };
  list.unshift(t);
  store.ticketsByTrader[traderId] = list;
  saveStore(store);
  return t;
}

export function assignTradingAccountCredentials(opts: {
  accountId: string;
  server: string;
  login: string;
  password: string;
  actor?: string;
}): TradingAccountRecord | null {
  const store = loadStore();
  const idx = store.tradingAccounts.findIndex((a) => a.id === opts.accountId);
  if (idx < 0) return null;
  const a = store.tradingAccounts[idx];
  a.server = opts.server.trim();
  a.login = opts.login.trim();
  a.password = opts.password;
  a.status = "active";
  a.credentialsEtaNote =
    "Credentials issued — use the official MT5 build for this server. Change password after first login if your broker requires it.";
  a.updatedAt = new Date().toISOString();
  appendAudit(store, {
    action: "mt_credentials_assigned",
    entityType: "trading_account",
    entityId: a.id,
    traderId: a.traderId,
    actor: opts.actor?.trim() || "ops",
    detail: JSON.stringify({ server: a.server, login: a.login }),
  });
  saveStore(store);
  return a;
}

export function listProvisioningQueue(): Array<TradingAccountRecord & { traderEmail?: string }> {
  const s = loadStore();
  return s.tradingAccounts
    .filter((a) => a.status === "awaiting_credentials")
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
    .map((a) => ({
      ...a,
      traderEmail: s.tradersById[a.traderId]?.email,
    }));
}

export function listAllOrdersForAdmin(): OrderRecord[] {
  return loadStore()
    .orders.slice()
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
}

export function listAllPayoutsForAdmin(): Array<DashboardPayout & { traderId: string; traderEmail?: string }> {
  const s = loadStore();
  const out: Array<DashboardPayout & { traderId: string; traderEmail?: string }> = [];
  for (const [tid, rows] of Object.entries(s.payoutsByTrader)) {
    for (const p of rows) {
      out.push({ ...p, traderId: tid, traderEmail: s.tradersById[tid]?.email });
    }
  }
  return out.sort((a, b) => String(b.requestedAt).localeCompare(String(a.requestedAt)));
}

export function updatePayoutOpsStatus(input: {
  traderId: string;
  payoutId: string;
  action: "approve" | "reject" | "complete";
  actor?: string;
  reason?: string;
}): DashboardPayout | null {
  const store = loadStore();
  const list = store.payoutsByTrader[input.traderId];
  if (!list) return null;
  const p = list.find((x) => x.id === input.payoutId);
  if (!p) return null;
  const now = new Date().toISOString();
  if (input.action === "approve") {
    if (p.status !== "pending") return null;
    p.status = "processing";
    appendAudit(store, {
      action: "payout_ops_approved",
      entityType: "payout",
      entityId: p.id,
      traderId: input.traderId,
      actor: input.actor?.trim() || "ops",
    });
  } else if (input.action === "reject") {
    if (p.status === "completed") return null;
    p.status = "rejected";
    p.rejectionReason = input.reason?.trim() || "Rejected by operations";
    p.processedAt = now;
    appendAudit(store, {
      action: "payout_ops_rejected",
      entityType: "payout",
      entityId: p.id,
      traderId: input.traderId,
      actor: input.actor?.trim() || "ops",
      detail: p.rejectionReason,
    });
  } else if (input.action === "complete") {
    if (p.status !== "processing") return null;
    p.status = "completed";
    p.processedAt = now;
    appendAudit(store, {
      action: "payout_treasury_completed",
      entityType: "payout",
      entityId: p.id,
      traderId: input.traderId,
      actor: input.actor?.trim() || "treasury",
    });
  }
  saveStore(store);
  return p;
}

export function patchTraderCompliance(
  traderId: string,
  patch: { kycStatus?: TraderRecord["kycStatus"]; fundedTradingDays?: number }
): TraderRecord | null {
  const store = loadStore();
  const t = store.tradersById[traderId];
  if (!t) return null;
  if (patch.kycStatus !== undefined) t.kycStatus = patch.kycStatus;
  if (patch.fundedTradingDays !== undefined) {
    const n = Math.floor(Number(patch.fundedTradingDays));
    if (Number.isFinite(n) && n >= 0 && n < 100000) t.fundedTradingDays = n;
  }
  t.updatedAt = new Date().toISOString();
  appendAudit(store, {
    action: "trader_compliance_patch",
    entityType: "trader",
    entityId: traderId,
    traderId,
    actor: "ops",
    detail: JSON.stringify(patch),
  });
  saveStore(store);
  return t;
}

export function listAuditLog(limit = 300): AuditLogEntry[] {
  return loadStore().auditLog.slice(0, limit);
}

export function listTradersForAdmin(): TraderRecord[] {
  return Object.values(loadStore().tradersById).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
