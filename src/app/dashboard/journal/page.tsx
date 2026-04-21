"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, TrendingUp, TrendingDown, Star, Trash2, Save, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

interface JournalEntry {
  id: string;
  date: string;
  pair: string;
  type: "buy" | "sell";
  pnl: number;
  setup: string;
  notes: string;
  tags: string[];
  rating: number;
  emotion: "confident" | "neutral" | "anxious" | "greedy";
  screenshot?: string;
}

const TAGS_PRESET = ["#revenge", "#FOMO", "#patience", "#disciplined", "#risky", "#planned", "#impulsive", "#momentum"];

const EMOJI: Record<JournalEntry["emotion"], string> = {
  confident: "😎",
  neutral: "😐",
  anxious: "😰",
  greedy: "🤑",
};

const mockEntries: JournalEntry[] = [];

type ResultFilter = "all" | "win" | "loss";

export default function JournalPage() {
  const { dict, language } = useDashboardPagesDict();
  const j = dict.journal;
  const setups = j.setups;
  const emotions = useMemo(
    () => j.emotions.map((e) => ({ ...e, emoji: EMOJI[e.id as JournalEntry["emotion"]] })),
    [j.emotions]
  );

  const [entries, setEntries] = useState<JournalEntry[]>(mockEntries);
  const [showForm, setShowForm] = useState(false);
  const [filterSetup, setFilterSetup] = useState<string | undefined>(undefined);
  const [filterResult, setFilterResult] = useState<ResultFilter>("all");
  const [form, setForm] = useState({
    pair: "",
    type: "buy" as "buy" | "sell",
    pnl: "",
    setup: "",
    notes: "",
    tags: [] as string[],
    rating: 3,
    emotion: "neutral" as JournalEntry["emotion"],
  });

  const activeSetupFilter = filterSetup ?? j.filterAll;

  useEffect(() => {
    setFilterSetup(undefined);
    setForm((f) => ({ ...f, setup: f.setup && setups.includes(f.setup) ? f.setup : setups[0] ?? "" }));
  }, [language, j.filterAll, setups]);

  const updateForm = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const toggleTag = (tag: string) => {
    setForm((p) => ({ ...p, tags: p.tags.includes(tag) ? p.tags.filter((t) => t !== tag) : [...p.tags, tag] }));
  };

  const submitEntry = () => {
    if (!form.pair || !form.pnl) {
      toast.error(j.toastRequired);
      return;
    }
    const entry: JournalEntry = {
      id: `j${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      pair: form.pair.toUpperCase(),
      type: form.type,
      pnl: parseFloat(form.pnl),
      setup: form.setup,
      notes: form.notes,
      tags: form.tags,
      rating: form.rating,
      emotion: form.emotion,
    };
    setEntries((p) => [entry, ...p]);
    setShowForm(false);
    setForm({
      pair: "",
      type: "buy",
      pnl: "",
      setup: setups[0] ?? "",
      notes: "",
      tags: [],
      rating: 3,
      emotion: "neutral",
    });
    toast.success(j.toastSaved);
  };

  const deleteEntry = (id: string) => {
    setEntries((p) => p.filter((e) => e.id !== id));
    toast.success(j.toastDeleted);
  };

  const filtered = entries.filter((e) => {
    if (activeSetupFilter !== j.filterAll && e.setup !== activeSetupFilter) return false;
    if (filterResult === "win" && e.pnl <= 0) return false;
    if (filterResult === "loss" && e.pnl >= 0) return false;
    return true;
  });

  const totalPnl = entries.reduce((s, e) => s + e.pnl, 0);
  const winRate = entries.length ? Math.round((entries.filter((e) => e.pnl > 0).length / entries.length) * 100) : 0;
  const avgRating = entries.length
    ? (entries.reduce((s, e) => s + e.rating, 0) / entries.length).toFixed(1)
    : "0.0";

  const resultFilters: { id: ResultFilter; label: string }[] = [
    { id: "all", label: j.filterAll },
    { id: "win", label: j.filterWin },
    { id: "loss", label: j.filterLoss },
  ];

  const setupFilterChips = [j.filterAll, ...setups.slice(0, 4)];

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5 text-gold-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{j.title}</h1>
            <p className="text-xs text-neutral-500">{j.subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-gold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 font-semibold"
        >
          <Plus className="w-4 h-4" /> {j.newEntry}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: j.totalPnL, value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl}`, color: totalPnl >= 0 ? "text-success" : "text-danger" },
          { label: j.winRate, value: `${winRate}%`, color: "text-gold-500" },
          { label: j.avgRating, value: `${avgRating}/5 ⭐`, color: "text-gold-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/8 bg-surface px-4 py-3 text-center">
            <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
            <p className={`font-black font-mono text-lg ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-xs text-neutral-500">{j.filterPrompt}</span>
        </div>
        {resultFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterResult(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterResult === f.id
                ? "bg-gold-500/15 text-gold-500 border border-gold-500/30"
                : "text-neutral-500 border border-white/5 hover:border-white/15"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="w-px h-5 bg-white/10 self-center" />
        {setupFilterChips.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterSetup(s === j.filterAll ? undefined : s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSetupFilter === s ? "bg-gold-500/15 text-gold-500 border border-gold-500/30" : "text-neutral-500 border border-white/5 hover:border-white/15"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-white/8 bg-surface p-5 hover:border-white/12 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      entry.pnl >= 0 ? "bg-success/10 border border-success/20" : "bg-danger/10 border border-danger/20"
                    }`}
                  >
                    {entry.pnl >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-danger" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <span className="font-mono font-bold text-white">{entry.pair}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold uppercase ${
                          entry.type === "buy" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                        }`}
                      >
                        {entry.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-neutral-400">{entry.setup}</span>
                      <span className="text-xs text-neutral-500">{entry.date}</span>
                      {emotions.find((e) => e.id === entry.emotion) && (
                        <span className="text-sm">{emotions.find((e) => e.id === entry.emotion)?.emoji}</span>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-neutral-400 leading-relaxed mb-2 line-clamp-2">{entry.notes}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-neutral-500 font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`font-mono font-black text-lg ${entry.pnl >= 0 ? "text-success" : "text-danger"}`}>
                    {entry.pnl >= 0 ? "+" : ""}${entry.pnl}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, si) => (
                      <Star
                        key={si}
                        className={`w-3 h-3 ${si < entry.rating ? "text-gold-500 fill-gold-500" : "text-neutral-700"}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="text-neutral-700 hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-neutral-600">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>{j.emptyList}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-gold-500/25 bg-surface p-6 max-h-[90vh] overflow-y-auto scrollbar-none"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{j.modalTitle}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">{j.pair} *</label>
                    <input
                      type="text"
                      placeholder={j.pairPlaceholder}
                      value={form.pair}
                      onChange={(e) => updateForm("pair", e.target.value)}
                      className="w-full bg-black/30 border border-white/8 rounded-xl px-3.5 py-3 text-white text-sm font-mono placeholder-neutral-700 focus:outline-none focus:border-gold-500/40 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">{j.pnl} *</label>
                    <input
                      type="number"
                      placeholder={j.pnlPlaceholder}
                      value={form.pnl}
                      onChange={(e) => updateForm("pnl", e.target.value)}
                      className="w-full bg-black/30 border border-white/8 rounded-xl px-3.5 py-3 text-white text-sm font-mono placeholder-neutral-700 focus:outline-none focus:border-gold-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">{j.direction}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["buy", "sell"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateForm("type", t)}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          form.type === t
                            ? t === "buy"
                              ? "bg-success/15 text-success border border-success/30"
                              : "bg-danger/15 text-danger border border-danger/30"
                            : "bg-white/5 text-neutral-500 border border-white/5"
                        }`}
                      >
                        {t === "buy" ? j.buy : j.sell}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">{j.setup}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {setups.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateForm("setup", s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          form.setup === s
                            ? "bg-gold-500/15 text-gold-500 border border-gold-500/30"
                            : "bg-white/5 text-neutral-500 border border-white/5 hover:border-white/15"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">{j.emotion}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {emotions.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => updateForm("emotion", e.id)}
                        className={`py-2 rounded-xl text-center transition-all ${
                          form.emotion === e.id ? "bg-gold-500/15 border border-gold-500/30" : "bg-white/5 border border-white/5"
                        }`}
                      >
                        <span className="text-lg">{e.emoji}</span>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{e.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">{j.rating}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} type="button" onClick={() => updateForm("rating", r)} className="p-1">
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            r <= form.rating ? "text-gold-500 fill-gold-500" : "text-neutral-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">{j.tags}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TAGS_PRESET.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all ${
                          form.tags.includes(tag)
                            ? "bg-gold-500/15 text-gold-500 border border-gold-500/30"
                            : "bg-white/5 text-neutral-500 border border-white/5 hover:border-white/15"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">{j.notes}</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                    rows={3}
                    placeholder={j.notesPlaceholder}
                    className="w-full bg-black/30 border border-white/8 rounded-xl px-3.5 py-3 text-white text-sm placeholder-neutral-700 focus:outline-none focus:border-gold-500/40 resize-none transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={submitEntry}
                  className="w-full btn-gold py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> {j.saveEntry}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
