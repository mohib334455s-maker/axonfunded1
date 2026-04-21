"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { CHAT_QUICK_PROMPTS, getChatWelcomeMessage, getLocalChatReply } from "@/lib/axon-chat-local";
import { useIsRTL } from "@/contexts/ThemeContext";

export type ChatStatusPayload = {
  aiConfigured: boolean;
  provider: "openai" | "anthropic" | null;
  demoSite: boolean;
  openaiModel?: string;
  anthropicModel?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Renders **bold** and `backtick` paths as monospace (no raw HTML from user in bot path). */
function formatMessage(text: string) {
  const safe = escapeHtml(text);
  const lines = safe.split("\n");
  return lines.map((line, i) => {
    let html = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/`([^`]+)`/g, "<code class=\"text-amber-200/90 text-[12px] font-mono bg-white/5 px-1 rounded\">$1</code>");
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: html }} />
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
  time: string;
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AiChat() {
  const isRTL = useIsRTL();
  const edgeX = isRTL ? "left-6" : "right-6";
  const badgeEdge = isRTL ? "-left-1" : "-right-1";

  const [meta, setMeta] = useState<ChatStatusPayload | null>(null);
  const [metaExpanded, setMetaExpanded] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      text: getChatWelcomeMessage(false),
      time: nowTime(),
    },
  ]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: ChatStatusPayload) => {
        if (cancelled) return;
        setMeta(j);
        setMessages((prev) => {
          if (prev.length === 1 && prev[0].id === 0 && prev[0].role === "bot") {
            return [
              {
                ...prev[0],
                text: getChatWelcomeMessage(Boolean(j.aiConfigured)),
                time: nowTime(),
              },
            ];
          }
          return prev;
        });
      })
      .catch(() => {
        if (!cancelled) setMeta({ aiConfigured: false, provider: null, demoSite: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, messages]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: Date.now(),
        role: "bot",
        text: getChatWelcomeMessage(meta?.aiConfigured ?? false),
        time: nowTime(),
      },
    ]);
  }, [meta?.aiConfigured]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: trimmed,
      time: nowTime(),
    };

    const historyPayload = messages.slice(1).map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    let botText: string;
    let modeNote = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        error?: string;
        mode?: "ai" | "knowledge";
      };

      if (!res.ok) {
        const err = (data.error || `HTTP ${res.status}`).slice(0, 280);
        botText =
          getLocalChatReply(trimmed, historyPayload) +
          `\n\n*(Server error: ${err}. Showing **built-in engine** answer.)*`;
      } else if (typeof data.reply === "string" && data.reply.trim()) {
        botText = data.reply.trim();
        if (data.mode === "knowledge") {
          modeNote =
            "\n\n*(**Knowledge mode** — no LLM on server; answer from built-in `/rules` + pricing. Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` for AI-drafted replies.)*";
        }
        botText += modeNote;
      } else {
        throw new Error("Empty reply");
      }
    } catch {
      botText =
        getLocalChatReply(trimmed, historyPayload) +
        "\n\n*(Could not reach **`/api/chat`**. Answers from the **built-in engine** only — check your network or dev server.)*";
    }

    const botMsg: Message = {
      id: Date.now() + 1,
      role: "bot",
      text: botText,
      time: nowTime(),
    };
    setMessages((prev) => [...prev, botMsg]);
    setTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const llmLabel =
    meta?.aiConfigured ?
      `On · ${meta.provider ?? "llm"} (${meta.provider === "openai" ? meta.openaiModel : meta.anthropicModel})`
    : "Off (no API keys — knowledge engine only)";

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            className={`btn-gold fixed bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl shadow-gold-500/20 group ${edgeX}`}
            aria-label="Open Axon AI chat"
          >
            <MessageCircle className="h-6 w-6 text-black" strokeWidth={1.5} />
            <span
              className={`absolute -top-1 ${badgeEdge} h-3 w-3 rounded-full border-2 border-background bg-success`}
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed bottom-6 z-50 flex max-h-[min(640px,92vh)] w-[360px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/60 sm:w-[420px] ${edgeX}`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className="flex flex-shrink-0 items-center gap-3 border-b border-white/8 bg-black/40 px-4 py-3.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gold-gradient">
                <Bot className="h-4 w-4 text-black" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">Axon AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                  <span className="truncate text-[11px] text-neutral-500">Rules assistant</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:text-gold-400"
                  title="Clear conversation"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:text-white"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMetaExpanded((e) => !e)}
              className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-black/55 px-3 py-2 text-start hover:bg-black/70"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                Demo &amp; data sources
              </span>
              {metaExpanded ?
                <ChevronUp className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
              : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-600" />}
            </button>
            <AnimatePresence initial={false}>
              {metaExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-white/5 bg-black/50"
                >
                  <div className="space-y-1.5 px-3 py-2.5 text-[10px] leading-relaxed text-neutral-500">
                    <p>
                      <span className="font-semibold text-neutral-400">Built-in engine:</span> official rule sections
                      from <code className="text-[9px] text-amber-200/80">/rules</code> +{" "}
                      <span className="text-neutral-400">Plan A</span> fee table from{" "}
                      <code className="text-[9px] text-amber-200/80">/challenge</code> — always available. Uses the{" "}
                      <span className="text-neutral-400">last 6 messages</span> (~3 turns) for short follow-ups.
                    </p>
                    <p>
                      <span className="font-semibold text-neutral-400">LLM layer:</span> {meta ? llmLabel : "Checking…"}
                    </p>
                    <p>
                      <span className="font-semibold text-neutral-400">Human support:</span>{" "}
                      <code className="text-[9px] text-amber-200/80">/contact</code> — email{" "}
                      <span className="text-neutral-400">support@axonfunded.com</span>, Instagram{" "}
                      <span className="text-neutral-400">@axonfunded</span>.
                    </p>
                    {meta?.demoSite ?
                      <p className="rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-amber-200/95">
                        <span className="font-semibold">Demo site</span> —{" "}
                        <code className="text-[9px]">NEXT_PUBLIC_DEMO_SITE=true</code>: checkout and some dashboards may
                        use mock data; always confirm numbers on live docs.
                      </p>
                    : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                      msg.role === "bot" ?
                        "border border-gold-500/20 bg-gold-500/15"
                      : "border border-white/10 bg-white/8"
                    }`}
                  >
                    {msg.role === "bot" ?
                      <Bot className="h-3.5 w-3.5 text-gold-500" strokeWidth={1.5} />
                    : <User className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />}
                  </div>
                  <div className={`flex max-w-[80%] flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "bot" ?
                          "rounded-tl-sm border border-white/8 bg-white/5 text-neutral-200"
                        : "rounded-tr-sm border border-gold-500/25 bg-gold-500/15 text-white"
                      }`}
                    >
                      {formatMessage(msg.text)}
                    </div>
                    <span className="px-1 text-[10px] text-neutral-700">{msg.time}</span>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/15">
                    <Bot className="h-3.5 w-3.5 text-gold-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/8 bg-white/5 px-3.5 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-shrink-0 flex-wrap gap-1.5 px-4 pb-2">
                {CHAT_QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-xs text-neutral-300 transition-all hover:border-gold-500/30 hover:text-gold-400"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex flex-shrink-0 items-center gap-2 border-t border-white/8 bg-black/20 px-4 py-3.5"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about rules, payouts, KYC, prices…"
                className="flex-1 rounded-xl border border-white/8 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 transition-all focus:border-gold-500/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="btn-gold flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5 text-black" strokeWidth={1.5} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
