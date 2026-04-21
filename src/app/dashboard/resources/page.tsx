"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, BookOpen, Video, FileText, ExternalLink, Search } from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

const CAT_KEYS = ["all", "basics", "rules", "payouts", "technical"] as const;

type ResourceItem = {
  id: string | number;
  category: string;
  type: string;
  title: string;
  duration: string;
};

function itemIcon(category: string, type: string) {
  if (type === "video") return Video;
  if (category === "rules" || category === "payouts") return FileText;
  return BookOpen;
}

export default function ResourcesPage() {
  const { dict } = useDashboardPagesDict();
  const d = dict.resources;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CAT_KEYS)[number]>("all");

  const items = d.items as ResourceItem[];
  const filtered = items.filter(
    (r) => (cat === "all" || r.category === cat) && r.title.toLowerCase().includes(q.toLowerCase())
  );

  const catLabel = (k: (typeof CAT_KEYS)[number]) => d.cats[k];

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-gold-400" />
          {d.title}
        </h1>
        <p className="text-sm text-neutral-400 mt-1">{d.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 items-center"
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/30 border border-gold-500/15 flex-1 min-w-[160px] max-w-xs">
          <Search className="w-4 h-4 text-gold-500/60 flex-shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={d.searchPh}
            className="bg-transparent text-sm text-neutral-200 placeholder-neutral-600 outline-none w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CAT_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setCat(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                cat === k
                  ? "bg-gold-500/15 border-gold-500/40 text-gold-300"
                  : "border-white/10 text-neutral-400 hover:text-white"
              }`}
            >
              {catLabel(k)}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((r, i) => {
          const Icon = itemIcon(r.category, r.type);
          const categoryLabel = d.cats[r.category as keyof typeof d.cats] ?? r.category;
          const typeLabel = r.type === "video" ? d.types.video : d.types.guide;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="group rounded-2xl border border-gold-500/15 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] p-4 flex flex-col gap-3 hover:border-gold-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/15 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gold-400" />
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-700 group-hover:text-gold-400 transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white leading-snug">{r.title}</p>
                <p className="text-[11px] text-neutral-500 mt-1">{r.duration}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gold-500/8 border border-gold-500/15 text-gold-400/70">
                  {categoryLabel}
                </span>
                <span className={`text-[11px] ${r.type === "video" ? "text-blue-400" : "text-neutral-500"}`}>
                  {typeLabel}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">{d.empty.replace("{q}", q)}</p>
        </div>
      )}
    </div>
  );
}
