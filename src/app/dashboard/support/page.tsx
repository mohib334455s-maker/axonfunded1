"use client";

import { motion } from "framer-motion";
import { Headphones } from "lucide-react";
import { TicketsSupportPanel } from "@/app/dashboard/tickets/page";
import { FaqSupportPanel } from "@/app/dashboard/faq/page";

export default function SupportPage() {
  return (
    <div className="space-y-10 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Support</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Tickets and help center — all data from your account.</p>
          </div>
        </div>
      </motion.div>

      <section id="tickets" className="scroll-mt-24">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">Tickets</h2>
        <TicketsSupportPanel embedded />
      </section>

      <section id="help" className="scroll-mt-24 border-t border-white/[0.06] pt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">Help center</h2>
        <FaqSupportPanel embedded />
      </section>
    </div>
  );
}
