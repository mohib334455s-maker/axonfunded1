"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Globe, DollarSign, Shield, Bell } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPrimitives";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformName: "Axon Funded",
    supportEmail: "support@axonfunded.com",
    minPayout: "100",
    maxDailyDD: "5",
    maxTotalDD: "10",
    profitSplit: "80",
    kycRequired: true,
    maintenanceMode: false,
    newRegistrations: true,
  });

  const save = () => toast.success("Settings saved successfully");

  return (
    <div className="space-y-6 max-w-2xl">
      <AdminPageHeader
        title="Platform settings"
        description="Configure global platform parameters"
      />

      {[
        {
          title: "General", icon: Globe,
          fields: [
            { key: "platformName", label: "Platform Name", type: "text" },
            { key: "supportEmail", label: "Support Email", type: "email" },
          ],
        },
        {
          title: "Challenge Rules", icon: Shield,
          fields: [
            { key: "maxDailyDD", label: "Max Daily Drawdown (%)", type: "number" },
            { key: "maxTotalDD", label: "Max Total Drawdown (%)", type: "number" },
            { key: "profitSplit", label: "Default Profit Split (%)", type: "number" },
          ],
        },
        {
          title: "Payouts", icon: DollarSign,
          fields: [
            { key: "minPayout", label: "Minimum Payout ($)", type: "number" },
          ],
        },
      ].map((section) => (
        <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="admin-panel rounded-2xl p-5">
          <h2 className="admin-section-title text-base text-[#ebe6dc] flex items-center gap-2 mb-4">
            <section.icon className="w-4 h-4 text-[#d4af37]" />{section.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {section.fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-neutral-500 block mb-1.5">{f.label}</label>
                <input type={f.type} value={settings[f.key as keyof typeof settings] as string}
                  onChange={(e) => setSettings((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-black/30 border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-500/40" />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Toggle settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="admin-panel rounded-2xl p-5">
        <h2 className="admin-section-title text-base text-[#ebe6dc] flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-[#d4af37]" />System controls
        </h2>
        {[
          { key: "kycRequired", label: "KYC Required for Payouts", desc: "Traders must complete KYC before requesting payouts" },
          { key: "newRegistrations", label: "Allow New Registrations", desc: "Enable or disable new user signups" },
          { key: "maintenanceMode", label: "Maintenance Mode", desc: "Show maintenance page to all visitors" },
        ].map((toggle) => (
          <div key={toggle.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div>
              <p className="text-sm font-semibold text-white">{toggle.label}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{toggle.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings((p) => ({ ...p, [toggle.key]: !p[toggle.key as keyof typeof settings] }))}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                settings[toggle.key as keyof typeof settings] ? "bg-gold-500" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 left-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
                  settings[toggle.key as keyof typeof settings] ? "translate-x-[1.125rem]" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </motion.div>

      <button onClick={save} className="flex items-center gap-2 btn-gold px-6 py-3 rounded-xl text-sm font-semibold">
        <Save className="w-4 h-4" /> Save All Settings
      </button>
    </div>
  );
}
