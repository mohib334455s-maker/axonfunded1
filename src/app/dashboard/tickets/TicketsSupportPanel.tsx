"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Plus, X, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

type TicketRow = {
  id: string;
  subject: string;
  status: "open" | "awaiting_mt" | "resolved" | "closed";
  createdAt: string;
  messages: number;
};

const STATUS_COLOR: Record<string, string> = {
  open: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  awaiting_mt: "bg-sky-500/10 border-sky-500/25 text-sky-300",
  resolved: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  closed: "bg-neutral-500/10 border-neutral-500/20 text-neutral-400",
};

export function TicketsSupportPanel({ embedded = false }: { embedded?: boolean } = {}) {
  const { dict } = useDashboardPagesDict();
  const t = dict.tickets;
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/dashboard/tickets", { credentials: "include", cache: "no-store" });
      const payload = (await res.json()) as { data?: TicketRow[] };
      setTickets(Array.isArray(payload.data) ? payload.data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/tickets", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      const body = (await res.json()) as { data?: TicketRow; error?: string };
      if (!res.ok) {
        toast.error(body.error === "unauthorized" ? "Log in to open a ticket." : "Could not create ticket.");
        return;
      }
      if (body.data) setTickets((prev) => [body.data!, ...prev]);
      setSubject("");
      setMessage("");
      setShowForm(false);
      toast.success("Ticket saved — our team will see it on this profile.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toISOString().split("T")[0];
    } catch {
      return iso;
    }
  };

  return (
    <div className={`space-y-6 ${embedded ? "" : "dashboard-page"}`}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        {!embedded ? (
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Ticket className="w-6 h-6 text-gold-400" />
              {t.title}
            </h1>
            <p className="text-sm text-neutral-400 mt-1">{t.helpLine}</p>
          </div>
        ) : (
          <p className="text-sm text-neutral-400 flex-1 min-w-0">{t.helpLine}</p>
        )}
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-semibold text-sm transition-all shadow-[0_4px_14px_rgba(255,215,0,0.25)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-gold-500/25 bg-gradient-to-br from-[#18140c] to-[#0d0d0f] p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Open a New Ticket</h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-500 mb-1.5 block uppercase tracking-wider">Subject</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-gold-500/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1.5 block uppercase tracking-wider">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Describe your issue in detail…"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-gold-500/40 transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => void submit()}
                disabled={!subject.trim() || !message.trim() || submitting}
                className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Ticket
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading && <p className="text-sm text-neutral-500 py-8 text-center">Loading tickets…</p>}
        {!loading &&
          tickets.map((tk, i) => (
            <motion.div
              key={tk.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-gold-500/15 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] hover:border-gold-500/25 transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{tk.subject}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5 font-mono">
                  {tk.id} · {formatDate(tk.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] text-neutral-600 hidden sm:block">
                  {tk.messages} msg{tk.messages !== 1 ? "s" : ""}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLOR[tk.status] ?? STATUS_COLOR.closed}`}
                >
                  {tk.status}
                </span>
              </div>
            </motion.div>
          ))}
      </div>

      {!loading && tickets.length === 0 && (
        <div className="text-center py-12">
          <Ticket className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">No tickets yet. Open one if you need help.</p>
        </div>
      )}
    </div>
  );
}
