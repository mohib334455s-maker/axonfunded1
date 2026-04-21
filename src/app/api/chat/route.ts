import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getLocalChatReply } from "@/lib/axon-chat-local";
import { rulesMarkdownFromSections } from "@/lib/rules-markdown";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_RULES_FILE_CHARS = 400;

function loadRulesText(): string {
  const filePath = path.join(process.cwd(), "rules.md");
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const stripped = raw.replace(/<!--[\s\S]*?-->/g, "").trim();
    if (stripped.length >= MIN_RULES_FILE_CHARS) {
      return stripped;
    }
  } catch {
    /* missing rules.md */
  }
  return rulesMarkdownFromSections();
}

type ChatRole = "user" | "assistant" | "system";

function buildSystemPrompt(rulesMarkdown: string): string {
  return `You are **Axon AI**, the official assistant for **Axon Funded** (proprietary trading / prop firm).

## Language
- Detect the user's language (**English** or **Persian / Farsi**).
- **Reply in the same language** as the user's latest message. Use clear, natural Persian when they write in Persian.
- If the message is mixed, follow the dominant language.

## Style
- Professional, concise, helpful. Light **markdown**: **bold** for critical numbers and policy terms; short bullet lists for procedures.
- Never be dismissive. If a question is **not** covered by the rulebook (e.g. small talk, "where are you from"), answer **naturally** as a capable AI — do **not** reply with only "I'm not sure". Briefly state your role (Axon AI, focused on Axon rules & support), then answer in a grounded, professional way.

## Authority — Trading Rules (read for EVERY answer)
The markdown below is the **sole in-chat authority** for Axon-specific trading, payouts, KYC, evaluations, and compliance. **Ground** every factual claim about Axon policies in this text. If the rules are silent, say so and avoid inventing firm-specific terms.

When users ask about **payouts, withdrawals, profit payment timing, dashboard payout flow**, synthesize **Section 11 — Profit Withdrawal & Payout Rules** (timing, conditions, processing) and, when relevant, **Section 9 — KYC** and **Section 10 — fee refund** — only as stated in the text.

If public marketing or other pages might disagree, **this rulebook wins** for the purposes of your answer.

## Links (mention when useful)
- Full rules on the site: \`/rules\`
- Human support: \`/contact\`

---

# Rulebook (markdown)

${rulesMarkdown}

---

End of rulebook.`;
}

async function callOpenAI(
  messages: { role: ChatRole; content: string }[]
): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured");

  const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.35,
      max_tokens: 1800,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(raw || `OpenAI error ${res.status}`);
  }
  const data = JSON.parse(raw) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty OpenAI response");
  return text;
}

async function callAnthropic(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured");

  const model =
    process.env.ANTHROPIC_CHAT_MODEL ?? "claude-3-5-haiku-20241022";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      system,
      messages,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(raw || `Anthropic error ${res.status}`);
  }
  const data = JSON.parse(raw) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = data.content?.find((b) => b.type === "text")?.text?.trim();
  if (!text) throw new Error("Empty Anthropic response");
  return text;
}

/** Drop leading assistant turns so Claude starts with user. */
function normalizeAnthropicMessages(
  msgs: { role: ChatRole; content: string }[]
): { role: "user" | "assistant"; content: string }[] {
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of msgs) {
    if (m.role === "system") continue;
    const role = m.role === "assistant" ? "assistant" : "user";
    const content = m.content.slice(0, 12000);
    if (!content.trim()) continue;
    out.push({ role, content });
  }
  while (out.length && out[0].role === "assistant") {
    out.shift();
  }
  if (!out.length) {
    return [{ role: "user", content: "Hello." }];
  }
  return out;
}

export async function GET() {
  const openai = Boolean(process.env.OPENAI_API_KEY);
  const anthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  return NextResponse.json({
    aiConfigured: openai || anthropic,
    provider: openai ? "openai" : anthropic ? "anthropic" : null,
    demoSite: process.env.NEXT_PUBLIC_DEMO_SITE === "true",
    openaiModel: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
    anthropicModel: process.env.ANTHROPIC_CHAT_MODEL ?? "claude-3-5-haiku-20241022",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      message?: string;
      history?: Array<{ role?: string; content?: string }>;
    };

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const history = Array.isArray(body.history) ? body.history : [];

    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);

    if (!hasOpenAI && !hasAnthropic) {
      return NextResponse.json({
        reply: getLocalChatReply(message, history),
        mode: "knowledge" as const,
      });
    }

    const rules = loadRulesText();
    const system = buildSystemPrompt(rules);
    const prior: { role: ChatRole; content: string }[] = [];

    for (const h of history.slice(-16)) {
      const role = h.role === "assistant" ? "assistant" : "user";
      const content = typeof h.content === "string" ? h.content : "";
      if (!content.trim()) continue;
      prior.push({ role, content: content.slice(0, 12000) });
    }

    const openaiMessages: { role: ChatRole; content: string }[] = [
      { role: "system", content: system },
      ...prior,
      { role: "user", content: message.slice(0, 12000) },
    ];

    let reply: string;

    if (process.env.OPENAI_API_KEY) {
      reply = await callOpenAI(openaiMessages);
    } else if (process.env.ANTHROPIC_API_KEY) {
      const withoutSystem = openaiMessages.filter((m) => m.role !== "system");
      reply = await callAnthropic(system, normalizeAnthropicMessages(withoutSystem));
    } else {
      reply = getLocalChatReply(message, history);
      return NextResponse.json({ reply, mode: "knowledge" as const });
    }

    return NextResponse.json({ reply, mode: "ai" as const });
  } catch (e) {
    console.error("[api/chat]", e);
    const msg = e instanceof Error ? e.message : "Chat failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
