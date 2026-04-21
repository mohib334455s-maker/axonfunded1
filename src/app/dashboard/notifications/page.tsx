"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, TrendingUp } from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

const INITIAL: {
  id: number;
  type: string;
  icon: typeof TrendingUp;
  title: string;
  body: string;
  time: string;
  read: boolean;
}[] = [];

const TYPE_STYLE: Record<string, string> = {
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  gift: "bg-gold-500/10 border-gold-500/20 text-gold-400",
  info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
};

export default function NotificationsPage() {
  const { dict } = useDashboardPagesDict();
  const n = dict.notifications;
  const [items, setItems] = useState(INITIAL);

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id: number) => setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            {n.title}
            {unread > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">{n.subtitle}</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gold-500/25 bg-gold-500/8 text-gold-300 text-xs font-medium hover:bg-gold-500/15 transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </motion.div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {items.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => markOne(n.id)}
              className={`relative flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                n.read
                  ? "border-white/8 bg-gradient-to-br from-[#111] to-[#0d0d0f] opacity-60"
                  : "border-gold-500/20 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] hover:border-gold-500/35"
              }`}
            >
              {!n.read && (
                <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gold-400 shadow-[0_0_6px_rgba(255,215,0,0.6)]" />
              )}
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${TYPE_STYLE[n.type]}`}>
                <n.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${n.read ? "text-neutral-400" : "text-white"}`}>{n.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{n.body}</p>
              </div>
              <span className="text-[11px] text-neutral-600 flex-shrink-0">{n.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {unread === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
          <Bell className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-sm text-neutral-400 font-medium">All caught up!</p>
          <p className="text-xs text-neutral-600 mt-1">No unread notifications.</p>
        </motion.div>
      )}
    </div>
  );
}
