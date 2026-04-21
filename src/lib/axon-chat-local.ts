import { answerFromTradingRules } from "@/lib/axon-chat-rules";
import { PLAN_A_COLUMNS, formatPlanFeeUsd } from "@/lib/plan-a-pricing";

/** One turn in the sliding window used for local retrieval. */
export type ChatHistoryTurn = { role: "user" | "assistant"; content: string };

/** Normalise client history to a bounded list (default: last 6 messages ≈ 3 exchanges). */
export function normalizeChatHistory(
  raw?: Array<{ role?: string; content?: string }>,
  maxMessages = 6
): ChatHistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatHistoryTurn[] = [];
  for (const h of raw) {
    const role = h.role === "assistant" ? "assistant" : "user";
    const content = typeof h.content === "string" ? h.content.trim() : "";
    if (!content) continue;
    out.push({ role, content: content.slice(0, 3500) });
  }
  return out.slice(-maxMessages);
}

/** Compact string for scoring (not shown to the user). */
function buildContextHint(history: ChatHistoryTurn[]): string | undefined {
  if (!history.length) return undefined;
  const parts = history.map((h) => {
    const tag = h.role === "user" ? "U" : "A";
    const oneLine = h.content.replace(/\s+/g, " ").trim().slice(0, 320);
    return `${tag}:${oneLine}`;
  });
  const joined = parts.join(" · ");
  return joined.length > 1400 ? joined.slice(-1400) : joined;
}

function buildPlanPricingKbAnswer(): string {
  const lines = PLAN_A_COLUMNS.map(
    (c) =>
      `• **${c.tierName}** (${c.headerLabel}) — **${formatPlanFeeUsd(c.price)}** · Max DD **${c.maxDrawdownPct}%** ($${c.maxDrawdownUsd.toLocaleString("en-US")}) · Daily **${c.dailyDrawdownPct}%** ($${c.dailyDrawdownUsd.toLocaleString("en-US")})`
  );
  return (
    "Plan A — **7-tier luxury model** (see `/challenge`):\n\n" +
    lines.join("\n") +
    "\n\nShared: Phase **8% / 4%**, min **5** trading days (challenge) & **10** (funded), **90%** profit split, news & EA **allowed**, **daily** payout type on the grid, refundable fee **Yes**. Full authority: **`/rules`**."
  );
}

const PLAN_PRICING_KB_ANSWER = buildPlanPricingKbAnswer();

/** Avoid matching short English keys inside unrelated words (e.g. "time" in "sometimes"). */
function keyMatchesMessage(lower: string, key: string): boolean {
  const k = key.toLowerCase();
  if (/[\u0600-\u06FF]/.test(key)) {
    return lower.includes(k);
  }
  if (k.length <= 4 && /^[a-z]+$/i.test(k)) {
    return new RegExp(`(^|[^a-z0-9])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(
      lower
    );
  }
  return lower.includes(k);
}

const KB: { keys: string[]; answer: string }[] = [
  {
    keys: ["hello", "hi", "hey", "سلام", "درود", "هی"],
    answer:
      "Hello — I'm **Axon AI**, Axon Funded's rules assistant.\n\n" +
      "I pull answers from the **official Trading Rules** (`/rules`) whenever your question maps to a section. " +
      "You can type **§11**, **section 9**, or ask in plain **English** (Persian still works for many trading topics).\n\n" +
      "Try: **drawdown 5%/12%**, **first payout after 10 funded days**, **KYC after evaluations**, **20% IB**.",
  },
  {
    keys: ["challenge", "evaluation", "phase", "pass", "چالنج", "ارزیابی"],
    answer:
      "Official evaluation structure (**see `/rules`**):\n\n• **Phase 1** — **8%** profit target, **5% daily** drawdown (vs balance at day start), **12% static max** drawdown from initial balance, **min 5 trading days** (a day counts when a position is opened), **no time limit**.\n• **Phase 2** — **4%** profit target, same risk rules.\n\nAfter both phases + KYC you can receive a **Funded** account. Profit split is per your agreement. Plans: `/challenge`.",
  },
  {
    keys: ["payout", "profit", "withdrawal", "money", "pay", "پرداخت", "سود", "برداشت"],
    answer:
      "**Official payout rules** (`/rules` §11):\n\n• **First payout** after **10 active trading days** on the funded account.\n• Then **on-demand daily payouts** when profit reaches **≥ 1%** of initial balance.\n• Request via **Client Dashboard**; **no open positions**; **no new trades** until processing completes; **full profit only** (no partial withdrawals).\n• Review/credential rotation within **24h** typical.\n\nExact split % is in your contract.",
  },
  {
    keys: ["drawdown", "loss", "limit", "daily", "ضرر", "محدودیت"],
    answer:
      "**Official drawdown** (`/rules` §2):\n\n• **Daily**: **5%** vs **balance at 00:00 broker time** (limit logic uses day-start balance).\n• **Maximum overall**: **12% static** from **initial** balance — it does **not** trail up with profits.\n\nTouching either limit **breaches** the account immediately, even if the market recovers later.",
  },
  {
    keys: ["price", "cost", "fee", "how much", "plan", "account size", "starter", "standard", "professional", "elite", "قیمت", "هزینه", "اکانت"],
    answer: PLAN_PRICING_KB_ANSWER,
  },
  {
    keys: ["allocation", "merge", "600", "capital cap", "multiple funded", "account merge"],
    answer:
      "**Capital & merging** (`/rules` §13):\n\n• Up to **$600,000** combined across evaluation + funded accounts per trader.\n• **Merging** is only for **funded** accounts and must stay within that cap — open a **support ticket** to request.\n\nFull wording: `/rules#allocation`.",
  },
  {
    keys: ["dashboard", "get-started", "get started", "trial", "access", "sign up flow", "داشبورد", "ثبت نام"],
    answer:
      "**Using the site:** After **register** you must either **buy** a challenge or start the **free practice trial** (`/trial`) before `/dashboard` opens — see **`/get-started`**. The **Trading Rules** at `/rules` are the final authority on trading.",
  },
  {
    keys: ["ticket", "support ticket", "completed phase", "next credentials", "verification team"],
    answer:
      "After you hit the profit target and meet requirements, open a **Support Ticket** in the member dashboard. Risk reviews are typically **24–48 business hours**; then you get the next phase or funded credentials (**`/rules` §4**).",
  },
  {
    keys: ["liable", "compensate", "who pays losses", "live losses", "مسئولیت"],
    answer:
      "**Funded liability** (`/rules` §5B): Axon carries the financial risk on live accounts — traders are **not** asked to reimburse the firm for trading losses. (Rule breaches still forfeit the account.)",
  },
  {
    keys: ["hedge", "hedging", "martingale", "grid"],
    answer:
      "**Strategies:** Copy/group trading is broadly **allowed** (**§16**). **Latency arbitrage**, **bug exploitation**, and **harmful** algos are **prohibited** (**§14B**). EAs are allowed with **source code** handover after evaluations (**§17**). Read **`/rules`** for the exact wording.",
  },
  {
    keys: ["kyc", "verify", "verification", "identity", "document", "تایید", "احراز هویت"],
    answer:
      "**KYC (official `/rules` §9)** is required **after passing the challenge phases** to receive a **Funded** account.\n\n• Age **18+**\n• Valid **ID** scan/photo\n• **Selfie** rules: ID in **left hand** at chest height, **dark clothes**, **plain light background**, **no glasses/filters**, **full face + both shoulders** visible.\n\nUse your **member dashboard** flow when eligible.",
  },
  {
    keys: ["scaling", "grow", "increase", "bigger", "اسکیل", "رشد"],
    answer:
      "Account **growth and profit-split tiers** depend on your **signed agreement** and product version. The chat assistant does **not** replace `/rules` or your contract.\n\nOpen **`/rules`** and your dashboard legal terms for the authoritative scaling model.",
  },
  {
    keys: ["reset", "restart", "failed", "ریست", "شکست"],
    answer:
      "**After a rule violation**, the account closes but you are **not banned** (`/rules` §5C).\n\n**Retake discount:** **20% off** a new challenge if purchased within **24 hours** of deactivation — contact **support** for the code (`/rules` §12).\n\n*(Separately, some products advertise a free reset window before trading — always read your checkout terms.)*",
  },
  {
    keys: ["affiliate", "refer", "commission", "partner", "افیلیت", "کمیسیون"],
    answer:
      "**Official IB program** (`/rules` §18):\n\n• **20% cash commission** on each challenge purchase via your **referral link**\n• Rewards are **withdrawable cash/USDT** with **no** artificial lockups described in the official text\n\nAlso see `/affiliate` for marketing detail.",
  },
  {
    keys: ["instrument", "pair", "forex", "gold", "crypto", "currency", "جفت ارز", "طلا"],
    answer:
      "Supported instruments include:\n\n• **Forex**: EUR/USD, GBP/USD, USD/JPY, AUD/USD, and more\n• **Metals**: Gold (XAU/USD), Silver (XAG/USD)\n• **Indices**: US30, NAS100, SPX500\n• **Commodities**: Oil (WTI, Brent)\n• **Crypto CFDs**: BTC/USD, ETH/USD (limited leverage)",
  },
  {
    keys: ["mt4", "mt5", "platform", "broker", "پلتفرم", "بروکر"],
    answer:
      "Axon Funded supports **MT4/MT5** on the partner broker. **Official rule (`/rules` §15):** you **must not** change the **Master** or **Investor** password — unauthorized changes break monitoring and count as a violation. Credentials are emailed to you; keep them secure.",
  },
  {
    keys: ["discord", "telegram", "whatsapp", "community", "support", "help", "contact", "دیسکورد", "پشتیبانی", "تلگرام"],
    answer:
      "For help with your account or general questions, use the **`/contact`** page.\n\n" +
      "• **Email:** support@axonfunded.com\n" +
      "• **Instagram:** @axonfunded\n\n" +
      "We typically reply within a few hours.",
  },
  {
    keys: ["time limit", "how long", "inactivity", "inactive", "trading days", "زمان", "مدت"],
    answer:
      "**Evaluations:** **No time limit** to hit targets, but **≥5 distinct trading days** per phase (a day counts when a **position is opened**).\n\n**Inactivity:** **30 consecutive days** with **no** trade can forfeit the account (`/rules` §1).\n\n*(“How fast people pass” varies; follow your plan.)*",
  },
  {
    keys: ["refund", "money back", "cancel", "استرداد", "بازگشت پول"],
    answer:
      "**Challenge fee refund (official `/rules` §10):** the registration fee is **fully reimbursed** after you complete evaluations and move to **Funded**, then complete **≥10 trading days** on funded — the **100% fee refund** is paid **together with your first profit withdrawal**.\n\nThis replaces generic “non-refundable” messaging; still read `/legal` pages if linked from checkout.",
  },
  {
    keys: ["rule", "rules", "policy", "policies", "allowed", "prohibited", "scalp", "قانون", "قوانین", "استراتژی"],
    answer:
      "The **Trading Rules** page (`/rules`) is the **final authority** — it overrides chat, marketing blurbs, and AI summaries (**§ intro**).\n\nAsk me a **specific topic** (e.g. **§11 payouts**, **weekend crypto**, **KYC selfie**, **EA source code**) or type your question in Persian; I will pull text from the official sections when I can.",
  },
];

const CHAT_FALLBACK =
  "I’m not sure which **rule section** that refers to yet — I only summarise what’s in **`/rules`**.\n\n" +
  "**Try one of these:**\n" +
  "• A **section**: **§2** drawdown, **§9** KYC, **§11** payouts, **§16** copy trading, **§17** EAs\n" +
  "• One short **English** sentence (e.g. *“Can I hold crypto over the weekend?”*)\n" +
  "• The full rulebook always wins: **`/rules`**\n\n" +
  "For **billing, logins, or your own account**, use **`/contact`** — a human handles that.";

function matchConversationLayer(raw: string, lower: string): string | null {
  const t = raw.trim();
  if (!t) return null;

  if (/^(thanks|thank you|thx|ty|cheers)\b|^merci\b/i.test(t)) {
    return "You’re welcome. If anything else comes up, ask about a **rule topic** or open **`/contact`** for account help.";
  }
  if (/^(bye|goodbye|see you|later|cya)\b/i.test(lower)) {
    return "Goodbye — good trading. Remember **`/rules`** is the source of truth, and **`/contact`** for human support.";
  }

  if (
    /\bhow\s+(are|r)\s+you\b|\bhow\s+do\s+you\s+do\b|\bhow'?s\s+it\s+going\b|\bhow\s+are\s+things\b|\bwhat'?s\s+up\b|\ball\s+good\b|\byou\s+ok\b|\bare\s+you\s+ok\b/i.test(lower) ||
    /چطوری|چطورید|خوبی|حالت|چخبر|خوب هستی/i.test(raw)
  ) {
    return (
      "I’m doing well — thanks for asking.\n\n" +
      "I’m **Axon AI**: a helper that explains **Axon Funded** using the official **`/rules`** page. " +
      "I’m not a person and I can’t see your account — for that, use **`/contact`**.\n\n" +
      "What should we tackle — **drawdown**, **payouts §11**, **KYC §9**, or something else?"
    );
  }

  if (
    /\bwhat\s+(is|'s)\s+axon\b|\bwho\s+are\s+you\b|\bwhat\s+do\s+you\s+do\b|\bwhat\s+are\s+you\b|\btell\s+me\s+about\s+axon\b|\baxon\s+funded\b.*\b(what|who|explain)\b|\b(what|who)\b.*\baxon\s+funded\b/i.test(lower) ||
    /axon\s+چیه|axon\s+چیست|اکسون\s+چی/i.test(raw)
  ) {
    return (
      "**Axon Funded** runs **proprietary trading evaluations**: you purchase a **challenge** (simulated evaluation), follow the **Trading Rules** at **`/rules`**, and if you complete the phases and **KYC**, you may qualify for a **funded** account under your agreement.\n\n" +
      "I summarise those rules here — I don’t replace legal terms or human support. **Account & payments:** **`/contact`**.\n\n" +
      "Pick a topic (e.g. **§2** drawdown, **§11** payouts) or ask in one clear English sentence."
    );
  }

  if (/\b(nice to meet you|pleased to meet you)\b/i.test(lower)) {
    return "Nice to meet you too. Ask me anything from **`/rules`** — **§9** KYC, **§11** payouts, **§2** drawdowns, etc.";
  }

  return null;
}

function isShortGreeting(raw: string): boolean {
  const t = raw.trim();
  if (t.length > 36) return false;
  return /^(hi|hello|hey|good\s+(morning|afternoon|evening)|سلام|درود|هی)\b/i.test(t);
}

function wantsPriceList(raw: string): boolean {
  const l = raw.toLowerCase();
  if (/\$\d|\b(59|119\.?5|199\.?5|299\.?5|549\.?5|949\.?5)\b/.test(raw)) return true;
  if (l.includes("how much") && (l.includes("plan") || l.includes("challenge") || l.includes("cost") || l.includes("fee")))
    return true;
  if ((l.includes("price") || l.includes("cost")) && (l.includes("plan") || l.includes("account") || l.includes("challenge")))
    return true;
  return false;
}

/** Deterministic reply: rules excerpt → keyword KB → fallback. Uses last turns for short follow-ups. */
export function getLocalChatReply(
  input: string,
  history?: Array<{ role?: string; content?: string }>
): string {
  const raw = input.trim();
  if (!raw) return CHAT_FALLBACK;

  const hist = normalizeChatHistory(history, 6);
  const contextHint = buildContextHint(hist);

  const lower = raw.toLowerCase();
  const retrievalLower = [contextHint?.toLowerCase(), lower].filter(Boolean).join(" ");
  const useContextForRetrieval = Boolean(contextHint) && raw.length < 48;

  const chit = matchConversationLayer(raw, lower);
  if (chit) return chit;

  if (isShortGreeting(raw)) {
    return KB[0].answer;
  }

  const priceScan = useContextForRetrieval ? retrievalLower : lower;
  if (wantsPriceList(priceScan)) {
    const priceEntry = KB.find((e) => e.keys.includes("price"));
    if (priceEntry) return priceEntry.answer;
  }

  const fromRules = answerFromTradingRules(raw, contextHint);
  if (fromRules) return fromRules;

  const kbScan = useContextForRetrieval ? retrievalLower : lower;
  for (const entry of KB) {
    if (entry.keys.some((k) => keyMatchesMessage(kbScan, k))) {
      return entry.answer;
    }
  }

  return CHAT_FALLBACK;
}

export function getChatWelcomeMessage(aiConfigured: boolean): string {
  const engine =
    "**Built-in engine:** instant answers from this app’s **Trading Rules** text (`/rules`) + **Plan A** fee table (`/challenge`).";
  const ai =
    aiConfigured ?
      "\n\n**Live AI layer:** ON — the server drafts replies with **OpenAI / Anthropic** using the same rulebook as context."
    : "\n\n**Live AI layer:** OFF (no `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` on server) — you still get full answers from the **built-in engine** above.";

  return (
    "Hi — I’m **Axon AI**.\n\n" +
    engine +
    ai +
    "\n\n**Demo / limits:** I don’t see your balance, orders, or dashboard — for account-specific issues use **`/contact`** (email + Instagram).\n\n" +
    "**Context:** Short follow-ups (e.g. after a long answer) use the **last few messages** so the built-in engine can still match the right **`/rules`** section.\n\n" +
    "**Try:** **§11 payouts**, **drawdown 5%/12%**, **List all challenge prices**, or **Weekend crypto rules**."
  );
}

export const CHAT_QUICK_PROMPTS = [
  "§11 payouts",
  "List all challenge prices",
  "What is Axon Funded?",
  "§9 KYC selfie rules",
  "Weekend & crypto rules",
];

export { CHAT_FALLBACK, KB, PLAN_PRICING_KB_ANSWER };
