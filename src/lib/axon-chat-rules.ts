import { AXON_RULES_SECTIONS, type AxonRulesSection } from "@/lib/axon-rules-content";

/** Map published section numbers (document skips §6) to section ids. */
const SECTION_NUMBER_TO_ID: Record<number, string> = {
  1: "trading-days",
  2: "drawdown",
  3: "days-after-target",
  4: "post-phase",
  5: "violations",
  7: "weekend",
  8: "news",
  9: "kyc",
  10: "refund",
  11: "payout",
  12: "retake",
  13: "allocation",
  14: "slippage",
  15: "password",
  16: "copy",
  17: "ea",
  18: "ib",
};

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "what", "when", "where", "which", "who", "whom", "whose", "why", "how",
  "does", "did", "do", "can", "could", "would", "should", "may", "might", "must",
  "about", "tell", "please", "thanks", "thank", "hello", "hi", "hey",
  "for", "with", "from", "into", "onto", "this", "that", "these", "those",
  "any", "have", "has", "had", "having", "get", "got", "give", "gave",
  "and", "or", "but", "not", "only", "just", "also", "very", "too",
  "some", "such", "same", "other", "another", "each", "every", "all",
  "will", "shall", "there", "here", "then", "than", "them", "they", "their",
  "you", "your", "yours", "our", "out", "its", "his", "her", "she", "him",
  "me", "my", "mine", "we", "us", "i", "am", "on", "in", "at", "to", "of",
  "by", "as", "if", "so", "no", "yes", "axon", "site", "page",
]);

/** Regex boosts: extra score when query matches (English + common Farsi fragments). */
const QUERY_BOOSTS: { re: RegExp; ids: string[]; weight: number }[] = [
  { re: /challenge|چالش|ارزیابی|evaluation|verification/i, ids: ["trading-days", "drawdown"], weight: 6 },
  { re: /weekend|overnight|saturday|sunday|monday gap|hold overnight/i, ids: ["weekend"], weight: 10 },
  { re: /crypto.*weekend|weekend.*crypto|btc|eth|bitcoin|ethereum/i, ids: ["weekend"], weight: 8 },
  { re: /news trad|economic news|nfp|fomc|high.?impact/i, ids: ["news"], weight: 10 },
  { re: /slippage|spread|rollover|latency|arbitrage|bug exploit/i, ids: ["slippage"], weight: 10 },
  { re: /merge|merging|600|600k|capital cap|allocation|multiple account/i, ids: ["allocation"], weight: 12 },
  { re: /password|investor password|master password|mt4|mt5 credential/i, ids: ["password"], weight: 12 },
  { re: /copy trad|signal|mentor|mirror|group trad/i, ids: ["copy"], weight: 10 },
  { re: /\bea\b|expert advisor|robot|bot|source code/i, ids: ["ea"], weight: 10 },
  { re: /affiliate|referral|ib\b|commission.*20|partner program/i, ids: ["ib"], weight: 12 },
  { re: /retake|discount.*20|24 hour|24h.*deactiv/i, ids: ["retake"], weight: 10 },
  { re: /fee refund|registration fee|reimburs|challenge fee.*refund/i, ids: ["refund"], weight: 12 },
  { re: /payout|withdraw|withdrawal|profit.*withdraw|on.?demand|partial withdraw/i, ids: ["payout"], weight: 10 },
  { re: /kyc|passport|selfie|identity|aml|verify.*account/i, ids: ["kyc"], weight: 10 },
  { re: /ticket|support ticket|after phase|next phase credential/i, ids: ["post-phase"], weight: 8 },
  { re: /min.*trad.*day|trading day|five.?5.*day|0\.01 lot|after.*target/i, ids: ["days-after-target", "trading-days"], weight: 8 },
  { re: /inactive|30.?day|forfeit|no trad.*30/i, ids: ["trading-days"], weight: 10 },
  { re: /breach|violation|liable|deactivat.*account|touch.*limit/i, ids: ["violations"], weight: 10 },
  { re: /official|authority|prevail|discrepancy|written rule|trading rules|complete rules|قوانین|قانون/i, ids: ["intro"], weight: 8 },
  // Farsi (common trader questions)
  { re: /برداشت|پرداخت|واریز سود|برداشت سود/i, ids: ["payout", "refund"], weight: 12 },
  { re: /کشیدگی|درادون|حد ضرر|روزانه|حداکثر ضرر/i, ids: ["drawdown"], weight: 12 },
  { re: /احراز|هویت|پاسپورت|سلفی|مدرک/i, ids: ["kyc"], weight: 12 },
  { re: /اخبار|نیوز|فارکس نیوز/i, ids: ["news"], weight: 10 },
  { re: /کپی ترید|سیگنال|منتور/i, ids: ["copy"], weight: 10 },
  { re: /ربات|اکسپرت|ای\s*ای/i, ids: ["ea"], weight: 8 },
  { re: /رفاند|استرداد|فی چالش/i, ids: ["refund"], weight: 10 },
  { re: /معرف|افیلیت|کمیسیون/i, ids: ["ib"], weight: 10 },
];

/** Expand spoken terms into tokens that appear in the published English rules text. */
const TOKEN_ALIASES: Record<string, string[]> = {
  challenge: ["evaluation", "verification", "phase"],
  challenges: ["evaluation", "verification", "phase"],
  prop: ["evaluation", "funded"],
  funded: ["funded", "evaluation"],
  evaluation: ["evaluation", "phase"],
  verify: ["verification", "kyc"],
  password: ["password", "meta"],
  weekend: ["weekend", "overnight"],
  crypto: ["crypto", "cryptocurrencies"],
  slip: ["slippage"],
  payout: ["withdrawal", "payout"],
  withdraw: ["withdrawal", "payout"],
  ib: ["commission", "referral"],
  affiliate: ["commission", "referral"],
  retake: ["discount", "deactivation"],
  merge: ["merger", "merging"],
  cap: ["allocation", "600"],
};

function tokenizeQuery(q: string): string[] {
  const rawTokens = q
    .toLowerCase()
    .replace(/[^a-z0-9\s\u0600-\u06ff-]/gi, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));

  const expanded = new Set<string>();
  for (const t of rawTokens) {
    expanded.add(t);
    const al = TOKEN_ALIASES[t];
    if (al) al.forEach((x) => expanded.add(x));
  }
  return Array.from(expanded).filter((t) => t.length >= 3 || t === "ea" || t === "dd" || t === "kyc");
}

function sectionPlainText(sec: AxonRulesSection): string {
  const chunks: string[] = [sec.title];
  sec.paragraphs?.forEach((p) => chunks.push(p));
  sec.subsections?.forEach((sub) => {
    chunks.push(sub.title);
    sub.paragraphs.forEach((p) => chunks.push(p));
  });
  return chunks.join("\n\n");
}

function sectionSearchBlob(sec: AxonRulesSection): string {
  return sectionPlainText(sec).toLowerCase();
}

function matchSectionByNumber(query: string): AxonRulesSection | null {
  const normalized = query.replace(/\u00a7/g, "§");
  const patterns = [
    /(?:§|section|rule)\s*(\d{1,2})/i,
    /\b(?:section|rule)\s*(\d{1,2})\b/i,
    /ماده\s*(\d{1,2})/,
    /بخش\s*(\d{1,2})/,
  ];
  for (const re of patterns) {
    const m = normalized.match(re);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    if (Number.isNaN(n) || n === 6) continue;
    const id = SECTION_NUMBER_TO_ID[n];
    if (!id) continue;
    const sec = AXON_RULES_SECTIONS.find((s) => s.id === id);
    if (sec) return sec;
  }
  return null;
}

function scoreSection(sec: AxonRulesSection, tokens: string[], queryLower: string): number {
  const blob = sectionSearchBlob(sec);
  let score = 0;
  for (const t of tokens) {
    if (blob.includes(t)) score += 1.2;
  }
  // whole phrase in title
  if (queryLower.length > 6 && sec.title.toLowerCase().includes(queryLower.slice(0, 40))) score += 4;
  return score;
}

function applyBoosts(queryLower: string, scores: Map<string, number>) {
  for (const { re, ids, weight } of QUERY_BOOSTS) {
    if (re.test(queryLower)) {
      for (const id of ids) {
        scores.set(id, (scores.get(id) ?? 0) + weight);
      }
    }
  }
}

function pickBestSection(query: string): { section: AxonRulesSection; score: number } | null {
  const queryLower = query.toLowerCase().trim();
  if (queryLower.length < 2) return null;

  const byNumber = matchSectionByNumber(query);
  if (byNumber) return { section: byNumber, score: 1000 };

  const tokens = tokenizeQuery(query);
  const scores = new Map<string, number>();

  for (const sec of AXON_RULES_SECTIONS) {
    const s = scoreSection(sec, tokens, queryLower);
    if (s > 0) scores.set(sec.id, s);
  }

  applyBoosts(queryLower, scores);

  let best: AxonRulesSection | null = null;
  let bestScore = 0;
  for (const sec of AXON_RULES_SECTIONS) {
    const sc = scores.get(sec.id) ?? 0;
    if (sc > bestScore) {
      bestScore = sc;
      best = sec;
    }
  }

  if (best && bestScore >= 2) return { section: best, score: bestScore };
  return null;
}

const MAX_REPLY_CHARS = 1100;

/** Public answer builder: returns null if nothing confident from rules. */
export function answerFromTradingRules(userMessage: string, contextHint?: string): string | null {
  const msg = userMessage.trim();
  const hint = contextHint?.trim();
  const retrievalQuery =
    hint && hint.length > 0 ? `${hint}\n\n---\n\n${msg}`.slice(-4500) : msg;
  const picked = pickBestSection(retrievalQuery);
  if (!picked) return null;

  const { section } = picked;
  const body = sectionPlainText(section);
  const anchor = `/rules#${section.id}`;
  let excerpt = body;
  if (excerpt.length > MAX_REPLY_CHARS) {
    excerpt = excerpt.slice(0, MAX_REPLY_CHARS).trim() + "…";
  }

  return (
    `Here’s what the **official Trading Rules** say (**${section.title}**). The website always wins if anything differs:\n\n` +
    excerpt.replace(/\n\n+/g, "\n\n") +
    `\n\n**Full section:** \`${anchor}\` · All rules: \`/rules\``
  );
}
