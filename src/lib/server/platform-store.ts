import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), ".data");
const PLATFORM_FILE = path.join(DATA_DIR, "platform-store.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export type LeaderboardEntry = {
  id: string;
  pseudonym: string;
  gainPct: number;
  favoritePairs: string;
  accountStatus: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PayoutProof = {
  id: string;
  amountUsd: number;
  paidAt: string;
  txUrl: string;
  txId: string;
  categorySlug: string;
  receiptMediaId: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScalingStage = {
  id: string;
  order: number;
  title: string;
  percentGrowth: number;
  periodMonths: number | null;
  conditionText: string;
  /** Example balance after stage (USD) — admin-set, shown on front-end */
  exampleBalanceUsd: number | null;
};

export type ScalingPlanConfig = {
  introHtml: string;
  stages: ScalingStage[];
  updatedAt: string;
};

export type EducationCategory = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type EducationPost = {
  id: string;
  slug: string;
  categoryId: string;
  type: "article" | "video";
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  bodyHtml: string;
  videoMediaId: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AffiliateProfile = {
  traderId: string;
  referralCode: string;
  balanceUsd: number;
  referralTraderIds: string[];
  updatedAt: string;
};

export type AffiliatePayoutRequest = {
  id: string;
  traderId: string;
  amountUsd: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt: string | null;
  adminNote: string | null;
};

export type PlatformStoreV1 = {
  version: 1;
  leaderboard: LeaderboardEntry[];
  payoutProofs: PayoutProof[];
  payoutProofCategories: { slug: string; name: string }[];
  scalingPlan: ScalingPlanConfig;
  educationCategories: EducationCategory[];
  educationPosts: EducationPost[];
  affiliateSettings: { commissionPercent: number; termsHtml: string; updatedAt: string };
  referralCodeIndex: Record<string, string>;
  affiliateByTraderId: Record<string, AffiliateProfile>;
  affiliatePayoutRequests: AffiliatePayoutRequest[];
  trustpilotBusinessUnitId: string;
};

let platformStoreCache: { mtimeMs: number; data: PlatformStoreV1 } | null = null;

function emptyScaling(): ScalingPlanConfig {
  const now = new Date().toISOString();
  return { introHtml: "", stages: [], updatedAt: now };
}

function emptyStore(): PlatformStoreV1 {
  const now = new Date().toISOString();
  return {
    version: 1,
    leaderboard: [],
    payoutProofs: [],
    payoutProofCategories: [],
    scalingPlan: emptyScaling(),
    educationCategories: [],
    educationPosts: [],
    affiliateSettings: { commissionPercent: 20, termsHtml: "", updatedAt: now },
    referralCodeIndex: {},
    affiliateByTraderId: {},
    affiliatePayoutRequests: [],
    trustpilotBusinessUnitId: "",
  };
}

export function loadPlatformStore(): PlatformStoreV1 {
  try {
    if (!fs.existsSync(PLATFORM_FILE)) {
      platformStoreCache = null;
      return emptyStore();
    }
    const st = fs.statSync(PLATFORM_FILE);
    if (platformStoreCache && platformStoreCache.mtimeMs === st.mtimeMs) {
      return platformStoreCache.data;
    }
    const raw = fs.readFileSync(PLATFORM_FILE, "utf8");
    const j = JSON.parse(raw) as Partial<PlatformStoreV1>;
    if (!j || j.version !== 1) {
      platformStoreCache = null;
      return emptyStore();
    }
    const merged: PlatformStoreV1 = {
      ...emptyStore(),
      ...j,
      leaderboard: Array.isArray(j.leaderboard) ? j.leaderboard : [],
      payoutProofs: Array.isArray(j.payoutProofs) ? j.payoutProofs : [],
      payoutProofCategories: Array.isArray(j.payoutProofCategories) ? j.payoutProofCategories : [],
      scalingPlan: j.scalingPlan && typeof j.scalingPlan === "object" ? { ...emptyScaling(), ...j.scalingPlan, stages: Array.isArray(j.scalingPlan.stages) ? j.scalingPlan.stages : [] } : emptyScaling(),
      educationCategories: Array.isArray(j.educationCategories) ? j.educationCategories : [],
      educationPosts: Array.isArray(j.educationPosts) ? j.educationPosts : [],
      affiliateSettings: j.affiliateSettings && typeof j.affiliateSettings === "object"
        ? {
            commissionPercent: Number(j.affiliateSettings.commissionPercent) || 0,
            termsHtml: String(j.affiliateSettings.termsHtml ?? ""),
            updatedAt: String(j.affiliateSettings.updatedAt ?? new Date().toISOString()),
          }
        : emptyStore().affiliateSettings,
      referralCodeIndex: j.referralCodeIndex && typeof j.referralCodeIndex === "object" ? j.referralCodeIndex : {},
      affiliateByTraderId: j.affiliateByTraderId && typeof j.affiliateByTraderId === "object" ? j.affiliateByTraderId : {},
      affiliatePayoutRequests: Array.isArray(j.affiliatePayoutRequests) ? j.affiliatePayoutRequests : [],
      trustpilotBusinessUnitId: typeof j.trustpilotBusinessUnitId === "string" ? j.trustpilotBusinessUnitId : "",
    };
    platformStoreCache = { mtimeMs: st.mtimeMs, data: merged };
    return merged;
  } catch {
    platformStoreCache = null;
    return emptyStore();
  }
}

export function savePlatformStore(s: PlatformStoreV1) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${PLATFORM_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(s, null, 0), "utf8");
    fs.renameSync(tmp, PLATFORM_FILE);
    const st = fs.statSync(PLATFORM_FILE);
    platformStoreCache = { mtimeMs: st.mtimeMs, data: s };
  } catch (e) {
    console.error("[platform-store] save failed", e);
  }
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

function randomReferralCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export function listLeaderboardPublic(): LeaderboardEntry[] {
  const s = loadPlatformStore();
  return s.leaderboard
    .filter((r) => r.approved)
    .slice()
    .sort((a, b) => b.gainPct - a.gainPct);
}

export function listLeaderboardAdmin(): LeaderboardEntry[] {
  return loadPlatformStore().leaderboard.slice().sort((a, b) => b.gainPct - a.gainPct);
}

export function exportLeaderboardCsv(): string {
  const rows = listLeaderboardAdmin();
  const header = "rank,pseudonym,gainPct,favoritePairs,accountStatus,approved,updatedAt\n";
  const body = rows
    .map((r, i) =>
      [
        i + 1,
        csvEscape(r.pseudonym),
        r.gainPct,
        csvEscape(r.favoritePairs),
        csvEscape(r.accountStatus),
        r.approved ? "yes" : "no",
        r.updatedAt,
      ].join(",")
    )
    .join("\n");
  return header + body;
}

function csvEscape(v: string) {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function upsertLeaderboardEntry(input: Partial<LeaderboardEntry> & { pseudonym: string; gainPct: number }) {
  const s = loadPlatformStore();
  const now = new Date().toISOString();
  const id = input.id ?? newId("lb");
  const idx = s.leaderboard.findIndex((x) => x.id === id);
  const row: LeaderboardEntry = {
    id,
    pseudonym: input.pseudonym.trim(),
    gainPct: Number(input.gainPct),
    favoritePairs: (input.favoritePairs ?? "").trim(),
    accountStatus: (input.accountStatus ?? "").trim() || "—",
    approved: Boolean(input.approved),
    createdAt: idx >= 0 ? s.leaderboard[idx]!.createdAt : now,
    updatedAt: now,
  };
  if (idx >= 0) s.leaderboard[idx] = row;
  else s.leaderboard.push(row);
  savePlatformStore(s);
  return row;
}

export function deleteLeaderboardEntry(id: string) {
  const s = loadPlatformStore();
  s.leaderboard = s.leaderboard.filter((x) => x.id !== id);
  savePlatformStore(s);
}

export function setLeaderboardApproved(id: string, approved: boolean) {
  const s = loadPlatformStore();
  const r = s.leaderboard.find((x) => x.id === id);
  if (!r) return null;
  r.approved = approved;
  r.updatedAt = new Date().toISOString();
  savePlatformStore(s);
  return r;
}

export function listPayoutProofsPublic(): PayoutProof[] {
  return loadPlatformStore()
    .payoutProofs.filter((p) => p.published)
    .slice()
    .sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));
}

export function listPayoutProofsAdmin(): PayoutProof[] {
  return loadPlatformStore()
    .payoutProofs.slice()
    .sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1));
}

export function upsertPayoutProof(
  input: Partial<PayoutProof> & { amountUsd: number; paidAt: string; txUrl: string; txId: string; categorySlug: string }
) {
  const s = loadPlatformStore();
  const now = new Date().toISOString();
  const id = input.id ?? newId("pp");
  const idx = s.payoutProofs.findIndex((x) => x.id === id);
  const row: PayoutProof = {
    id,
    amountUsd: Number(input.amountUsd),
    paidAt: input.paidAt,
    txUrl: input.txUrl.trim(),
    txId: (input.txId ?? "").trim(),
    categorySlug: input.categorySlug.trim() || "default",
    receiptMediaId: input.receiptMediaId ?? null,
    published: Boolean(input.published),
    createdAt: idx >= 0 ? s.payoutProofs[idx]!.createdAt : now,
    updatedAt: now,
  };
  if (idx >= 0) s.payoutProofs[idx] = row;
  else s.payoutProofs.push(row);
  savePlatformStore(s);
  return row;
}

export function deletePayoutProof(id: string) {
  const s = loadPlatformStore();
  s.payoutProofs = s.payoutProofs.filter((x) => x.id !== id);
  savePlatformStore(s);
}

export function upsertPayoutCategory(input: { slug: string; name: string }) {
  const s = loadPlatformStore();
  const slug = input.slug.trim().toLowerCase().replace(/\s+/g, "-");
  const name = input.name.trim();
  const i = s.payoutProofCategories.findIndex((c) => c.slug === slug);
  if (i >= 0) s.payoutProofCategories[i] = { slug, name };
  else s.payoutProofCategories.push({ slug, name });
  savePlatformStore(s);
}

export function deletePayoutCategory(slug: string) {
  const s = loadPlatformStore();
  s.payoutProofCategories = s.payoutProofCategories.filter((c) => c.slug !== slug);
  savePlatformStore(s);
}

export function getScalingPlan(): ScalingPlanConfig {
  return loadPlatformStore().scalingPlan;
}

export function updateScalingPlan(plan: Pick<ScalingPlanConfig, "introHtml" | "stages">) {
  const s = loadPlatformStore();
  s.scalingPlan = {
    introHtml: plan.introHtml ?? "",
    stages: (plan.stages ?? []).map((st) => ({ ...st })).sort((a, b) => a.order - b.order),
    updatedAt: new Date().toISOString(),
  };
  savePlatformStore(s);
  return s.scalingPlan;
}

export function listEducationCategories(): EducationCategory[] {
  return loadPlatformStore().educationCategories.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function upsertEducationCategory(c: EducationCategory) {
  const s = loadPlatformStore();
  const i = s.educationCategories.findIndex((x) => x.id === c.id);
  if (i >= 0) s.educationCategories[i] = c;
  else s.educationCategories.push(c);
  savePlatformStore(s);
  return c;
}

export function deleteEducationCategory(id: string) {
  const s = loadPlatformStore();
  s.educationCategories = s.educationCategories.filter((x) => x.id !== id);
  s.educationPosts = s.educationPosts.filter((p) => p.categoryId !== id);
  savePlatformStore(s);
}

export function listEducationPostsAdmin(): EducationPost[] {
  return loadPlatformStore().educationPosts.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function listEducationPostsPublic(q?: { categorySlug?: string; search?: string }): EducationPost[] {
  const s = loadPlatformStore();
  const catSlug = q?.categorySlug?.trim().toLowerCase();
  const cat = catSlug ? s.educationCategories.find((c) => c.slug === catSlug) : undefined;
  if (catSlug && !cat) return [];
  const search = q?.search?.trim().toLowerCase();
  return s.educationPosts
    .filter((p) => p.published)
    .filter((p) => !cat || p.categoryId === cat.id)
    .filter(
      (p) =>
        !search ||
        p.title.toLowerCase().includes(search) ||
        p.excerpt.toLowerCase().includes(search) ||
        p.bodyHtml.toLowerCase().includes(search)
    )
    .sort((a, b) => String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? "")));
}

export function getEducationPostBySlug(slug: string): EducationPost | null {
  const s = loadPlatformStore();
  return s.educationPosts.find((p) => p.slug === slug && p.published) ?? null;
}

export function getEducationPostById(id: string): EducationPost | null {
  return loadPlatformStore().educationPosts.find((p) => p.id === id) ?? null;
}

export function upsertEducationPost(input: Partial<EducationPost> & Pick<EducationPost, "title" | "slug" | "categoryId" | "type">) {
  const s = loadPlatformStore();
  const now = new Date().toISOString();
  const id = input.id ?? newId("edu");
  const idx = s.educationPosts.findIndex((x) => x.id === id);
  const row: EducationPost = {
    id,
    slug: input.slug.trim().toLowerCase().replace(/\s+/g, "-"),
    categoryId: input.categoryId,
    type: input.type,
    title: input.title.trim(),
    excerpt: (input.excerpt ?? "").trim(),
    seoTitle: (input.seoTitle ?? input.title).trim(),
    seoDescription: (input.seoDescription ?? input.excerpt ?? "").trim(),
    bodyHtml: input.bodyHtml ?? "",
    videoMediaId: input.videoMediaId ?? null,
    published: Boolean(input.published),
    publishedAt: input.published ? (input.publishedAt ?? now) : null,
    createdAt: idx >= 0 ? s.educationPosts[idx]!.createdAt : now,
    updatedAt: now,
  };
  if (idx >= 0) s.educationPosts[idx] = row;
  else s.educationPosts.push(row);
  savePlatformStore(s);
  return row;
}

export function deleteEducationPost(id: string) {
  const s = loadPlatformStore();
  s.educationPosts = s.educationPosts.filter((x) => x.id !== id);
  savePlatformStore(s);
}

export function getAffiliateSettings() {
  return loadPlatformStore().affiliateSettings;
}

export function updateAffiliateSettings(patch: Partial<PlatformStoreV1["affiliateSettings"]> & { commissionPercent?: number; termsHtml?: string }) {
  const s = loadPlatformStore();
  if (typeof patch.commissionPercent === "number" && Number.isFinite(patch.commissionPercent)) {
    s.affiliateSettings.commissionPercent = Math.max(0, Math.min(100, patch.commissionPercent));
  }
  if (typeof patch.termsHtml === "string") s.affiliateSettings.termsHtml = patch.termsHtml;
  s.affiliateSettings.updatedAt = new Date().toISOString();
  savePlatformStore(s);
  return s.affiliateSettings;
}

export function updateTrustpilotId(id: string) {
  const s = loadPlatformStore();
  s.trustpilotBusinessUnitId = id.trim();
  savePlatformStore(s);
}

export function getTrustpilotId() {
  return loadPlatformStore().trustpilotBusinessUnitId;
}

export function ensureAffiliateProfile(traderId: string): AffiliateProfile {
  const s = loadPlatformStore();
  let p = s.affiliateByTraderId[traderId];
  if (p) return p;
  let code = randomReferralCode();
  while (s.referralCodeIndex[code]) code = randomReferralCode();
  const now = new Date().toISOString();
  p = { traderId, referralCode: code, balanceUsd: 0, referralTraderIds: [], updatedAt: now };
  s.affiliateByTraderId[traderId] = p;
  s.referralCodeIndex[code] = traderId;
  savePlatformStore(s);
  return p;
}

export function resolveReferrerIdByCode(code: string): string | null {
  if (!code.trim()) return null;
  return loadPlatformStore().referralCodeIndex[code.trim().toUpperCase()] ?? null;
}

export function attachReferralOnSignup(childTraderId: string, referrerCode: string | undefined): boolean {
  if (!referrerCode?.trim()) return false;
  const parentId = resolveReferrerIdByCode(referrerCode.trim().toUpperCase());
  if (!parentId || parentId === childTraderId) return false;
  const s = loadPlatformStore();
  ensureAffiliateProfile(parentId);
  const parent = s.affiliateByTraderId[parentId]!;
  if (!parent.referralTraderIds.includes(childTraderId)) {
    parent.referralTraderIds.push(childTraderId);
    parent.updatedAt = new Date().toISOString();
    savePlatformStore(s);
  }
  return true;
}

export function creditAffiliateForPaidOrder(buyerTraderId: string, orderAmountUsd: number, referredByTraderId?: string) {
  if (!referredByTraderId || orderAmountUsd <= 0) return;
  const s = loadPlatformStore();
  const pct = s.affiliateSettings.commissionPercent;
  const credit = (orderAmountUsd * pct) / 100;
  if (credit <= 0) return;
  ensureAffiliateProfile(referredByTraderId);
  const p = s.affiliateByTraderId[referredByTraderId]!;
  p.balanceUsd = Math.round((p.balanceUsd + credit) * 100) / 100;
  p.updatedAt = new Date().toISOString();
  savePlatformStore(s);
}

export function listAffiliatePayoutRequestsAdmin() {
  return loadPlatformStore().affiliatePayoutRequests.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createAffiliatePayoutRequest(traderId: string, amountUsd: number) {
  const s = loadPlatformStore();
  ensureAffiliateProfile(traderId);
  const p = s.affiliateByTraderId[traderId]!;
  if (amountUsd <= 0 || amountUsd > p.balanceUsd + 1e-6) throw new Error("invalid_amount");
  const id = newId("apw");
  const now = new Date().toISOString();
  p.balanceUsd = Math.round(Math.max(0, p.balanceUsd - amountUsd) * 100) / 100;
  p.updatedAt = now;
  s.affiliatePayoutRequests.unshift({
    id,
    traderId,
    amountUsd: Math.round(amountUsd * 100) / 100,
    status: "pending",
    createdAt: now,
    reviewedAt: null,
    adminNote: null,
  });
  savePlatformStore(s);
  return s.affiliatePayoutRequests[0]!;
}

export function reviewAffiliatePayoutRequest(
  id: string,
  patch: { status: "approved" | "rejected"; adminNote?: string }
) {
  const s = loadPlatformStore();
  const r = s.affiliatePayoutRequests.find((x) => x.id === id);
  if (!r || r.status !== "pending") return null;
  r.status = patch.status;
  r.reviewedAt = new Date().toISOString();
  r.adminNote = patch.adminNote?.trim() || null;
  if (patch.status === "rejected") {
    const p = s.affiliateByTraderId[r.traderId];
    if (p) {
      p.balanceUsd = Math.round((p.balanceUsd + r.amountUsd) * 100) / 100;
      p.updatedAt = new Date().toISOString();
    }
  }
  savePlatformStore(s);
  return r;
}

export function saveUploadBuffer(subdir: string, originalName: string, buf: Buffer): { mediaId: string; ext: string } {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(originalName).slice(0, 8) || ".bin";
  const mediaId = crypto.randomBytes(16).toString("hex");
  const dir = path.join(UPLOAD_DIR, subdir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${mediaId}${ext}`);
  fs.writeFileSync(fp, buf);
  return { mediaId: `${subdir}/${mediaId}${ext}`, ext };
}

export function readUploadFile(relativePath: string): { buf: Buffer; mime: string } | null {
  const safe = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (safe.includes("..")) return null;
  const fp = path.join(UPLOAD_DIR, safe);
  if (!fp.startsWith(UPLOAD_DIR) || !fs.existsSync(fp)) return null;
  const buf = fs.readFileSync(fp);
  const ext = path.extname(fp).toLowerCase();
  const mime =
    ext === ".png" ? "image/png"
    : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg"
    : ext === ".webp" ? "image/webp"
    : ext === ".gif" ? "image/gif"
    : ext === ".mp4" ? "video/mp4"
    : ext === ".webm" ? "video/webm"
    : "application/octet-stream";
  return { buf, mime };
}
