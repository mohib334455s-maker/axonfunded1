"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Plus, Trash2, Send, Info, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPrimitives";

const typeOptions = [
  { value: "info", label: "Info", icon: Info, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { value: "warning", label: "Warning", icon: AlertTriangle, color: "text-warning bg-warning/10 border-warning/20" },
  { value: "success", label: "Success", icon: CheckCircle2, color: "text-success bg-success/10 border-success/20" },
];

const initialAnnouncements = [
  { id: 1, title: "Platform Maintenance", body: "Scheduled maintenance on March 20 from 2–4 AM UTC. Trading will be temporarily unavailable.", type: "warning", audience: "all", sent: "Mar 14, 2024", active: true },
  { id: 2, title: "New Feature: Economic Calendar", body: "We've added a real-time economic calendar to your dashboard. Plan your trades around high-impact events.", type: "info", audience: "funded", sent: "Mar 10, 2024", active: true },
  { id: 3, title: "Payout Processing Update", body: "Crypto payouts are now processed within 2 hours. Bank transfers remain 1–3 business days.", type: "success", audience: "all", sent: "Mar 5, 2024", active: false },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", type: "info", audience: "all" });

  const handleSend = () => {
    if (!form.title || !form.body) { toast.error("Please fill in all fields"); return; }
    setAnnouncements((prev) => [{
      id: Date.now(), title: form.title, body: form.body,
      type: form.type, audience: form.audience,
      sent: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      active: true,
    }, ...prev]);
    setForm({ title: "", body: "", type: "info", audience: "all" });
    setShowForm(false);
    toast.success("Announcement sent to all users!");
  };

  const remove = (id: number) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success("Announcement removed");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Announcements"
        description="Send platform-wide notifications to traders"
        actions={
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> New announcement
          </button>
        }
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="admin-panel rounded-2xl p-5 space-y-4 ring-1 ring-[rgba(255,215,0,0.12)] bg-[linear-gradient(165deg,rgba(255,215,0,0.06),transparent_45%)]">
          <div className="flex items-center justify-between">
            <h3 className="admin-section-title text-base text-[#ebe6dc] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#d4af37]" /> New announcement
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="p-1 rounded-lg text-[#6d6860] hover:text-[#ebe6dc]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Announcement title..."
            className="w-full bg-black/30 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-gold-500/40" />
          <textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            rows={3} placeholder="Announcement body..."
            className="w-full bg-black/30 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-gold-500/40 resize-none" />
          <div className="flex gap-3 flex-wrap">
            <div className="flex gap-2">
              {typeOptions.map((t) => (
                <button key={t.value} onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    form.type === t.value ? t.color : "text-neutral-500 border-white/8"
                  }`}>
                  <t.icon className="w-3 h-3" />{t.label}
                </button>
              ))}
            </div>
            <select value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
              className="bg-black/30 border border-white/8 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none appearance-none">
              <option value="all">All Users</option>
              <option value="funded">Funded Traders Only</option>
              <option value="evaluation">Evaluation Traders Only</option>
            </select>
            <button onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl btn-gold text-sm font-semibold ml-auto">
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {announcements.map((ann, i) => {
          const typeOpt = typeOptions.find((t) => t.value === ann.type) || typeOptions[0];
          return (
            <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="admin-panel rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${typeOpt.color}`}>
                    <typeOpt.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-white">{ann.title}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeOpt.color}`}>{typeOpt.label}</span>
                      <span className="text-[10px] text-neutral-600 bg-white/5 px-2 py-0.5 rounded-full capitalize">{ann.audience}</span>
                    </div>
                    <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{ann.body}</p>
                    <p className="text-xs text-neutral-600 mt-2">Sent {ann.sent}</p>
                  </div>
                </div>
                <button onClick={() => remove(ann.id)}
                  className="p-1.5 rounded-lg text-neutral-700 hover:text-danger hover:bg-danger/10 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
