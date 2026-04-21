"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Clock, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import InstagramGlyph from "@/components/icons/InstagramGlyph";

const INSTAGRAM_URL = "https://www.instagram.com/axonfunded";
const SUPPORT_EMAIL = "support@axonfunded.com";

const faqQuick = [
  {
    q: "How do I reset or retake after a failure?",
    a: "Official Trading Rules §12: a 20% discount on a new challenge may be available if you purchase within 24 hours of deactivation — contact support for the code. Any separate promotional reset offers appear only in your product/checkout communications.",
  },
  {
    q: "When will my payout be processed?",
    a: "Funded payout timing and conditions are defined in /rules §11 (including the first withdrawal after 10 funded trading days, then on-demand rules, no open positions, and full-profit withdrawals). Reviews are typically completed within about 24 hours once submitted.",
  },
  {
    q: "Why was my account closed?",
    a: "Most closures are automatic when the 5% daily or 12% static maximum drawdown is touched, or when prohibited technical abuse or password rules are breached — see /rules §2, §5, §14–§15.",
  },
  {
    q: "How long does KYC take?",
    a: "KYC is required after passing evaluation phases before a funded account is issued (/rules §9). Reviews are often completed within about 24–48 business hours depending on queue load.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 200));
    setSending(false);
    setSent(true);
    toast.success("Message sent! We'll respond within a few hours.");
  };

  return (
    <div className="mx-auto min-h-screen w-full min-w-0 max-w-full overflow-x-clip pt-20">
      <section className="border-b border-white/5 bg-black px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/5 px-4 py-2">
            <MessageSquare className="h-3.5 w-3.5 text-gold-500" strokeWidth={1.25} />
            <span className="text-sm font-medium text-gold-500">Contact & support</span>
          </div>
          <h1 className="mb-4 text-4xl font-black text-white md:text-5xl">How can we help?</h1>
          <p className="text-neutral-400">Reach us by email or Instagram — we read every message.</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {!sent ? (
              <>
                <h2 className="mb-6 text-xl font-bold text-white">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-wider text-neutral-500">
                        Your name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-white placeholder-neutral-700 transition-all focus:border-gold-500/40 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-wider text-neutral-500">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="trader@email.com"
                        className="w-full rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-white placeholder-neutral-700 transition-all focus:border-gold-500/40 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-neutral-500">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Describe your question or issue in detail..."
                      className="w-full resize-none rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-sm text-white placeholder-neutral-700 transition-all focus:border-gold-500/40 focus:outline-none"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileHover={{ scale: sending ? 1 : 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" strokeWidth={1.25} />
                        Send message
                      </>
                    )}
                  </motion.button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-success/25 bg-success/5 p-10 text-center"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-success/20 bg-success/10">
                  <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.25} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Message received</h3>
                <p className="mb-6 text-sm text-neutral-400">
                  We&apos;ll get back to you at <strong className="text-white">{form.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", message: "" });
                  }}
                  className="btn-outline rounded-xl px-5 py-2.5 text-sm font-semibold"
                >
                  Send another
                </button>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            <div>
              <h2 className="mb-5 text-xl font-bold text-white">Contact</h2>
              <p className="mb-6 text-sm text-neutral-500">
                We do not offer Telegram or WhatsApp support. Please use email or Instagram only.
              </p>
              <div className="space-y-4">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-surface p-5 transition-colors hover:border-gold-500/25"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10">
                      <Mail className="h-5 w-5 text-gold-500" strokeWidth={1.25} />
                    </div>
                    <div className="text-start">
                      <p className="text-sm font-semibold text-white">Email</p>
                      <p className="text-xs text-neutral-400">{SUPPORT_EMAIL}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-neutral-500">
                    <Clock className="h-3 w-3" strokeWidth={1.25} />
                    &lt; 4h
                  </span>
                </a>
                <Link
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-surface p-5 transition-colors hover:border-gold-500/25"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-pink-500/20 bg-pink-500/10 text-pink-300">
                      <InstagramGlyph className="h-5 w-5" />
                    </div>
                    <div className="text-start">
                      <p className="text-sm font-semibold text-white">Instagram</p>
                      <p className="text-xs text-neutral-400">@axonfunded</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gold-500">Open →</span>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-base font-bold text-white">Common questions</h3>
              <div className="space-y-3">
                {faqQuick.map((item) => (
                  <details key={item.q} className="group rounded-xl border border-white/8 bg-surface">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5">
                      <span className="text-sm font-medium text-white">{item.q}</span>
                      <span className="text-lg text-neutral-500 transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="px-4 pb-4 text-sm leading-relaxed text-neutral-400">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
