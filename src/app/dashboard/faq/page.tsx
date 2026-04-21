"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleHelp, ChevronDown, ChevronUp, Search } from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

export function FaqSupportPanel({ embedded = false }: { embedded?: boolean } = {}) {
  const { dict, language } = useDashboardPagesDict();
  const d = dict.faq;
  const [open, setOpen] = useState<string | null>(d.items[0]?.q ?? null);
  const [q, setQ] = useState("");

  useEffect(() => {
    setOpen(d.items[0]?.q ?? null);
    setQ("");
  }, [language, d.items]);

  const filtered = d.items.filter(
    (f) => f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${embedded ? "" : "dashboard-page"}`}>
      {!embedded && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CircleHelp className="w-6 h-6 text-gold-400" />
            {d.title}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">{d.subtitle}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/30 border border-gold-500/15 max-w-md"
      >
        <Search className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={d.searchPh}
          className="bg-transparent text-sm text-neutral-200 placeholder-neutral-600 outline-none flex-1"
        />
      </motion.div>

      <div className="space-y-2">
        {filtered.map((item, i) => (
          <motion.div
            key={item.q}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-gold-500/15 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpen(open === item.q ? null : item.q)}
              className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-medium text-white leading-relaxed flex-1">{item.q}</span>
              {open === item.q ? (
                <ChevronUp className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {open === item.q && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 pt-1 border-t border-white/5">
                    <p className="text-sm text-neutral-400 leading-relaxed">{item.a}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <CircleHelp className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">{d.noResults.replace("{q}", q)}</p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-4"
      >
        <p className="text-sm text-neutral-500">
          {d.footerPrompt}{" "}
          <a href="/dashboard/support" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
            {d.footerCta}
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function FaqPage() {
  return <FaqSupportPanel />;
}
