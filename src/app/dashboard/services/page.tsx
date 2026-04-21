"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutGrid, Calculator, BarChart2, LineChart } from "lucide-react";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

const links: { href: string; label: string; icon: typeof Calculator }[] = [
  { href: "/dashboard/calculator", label: "Risk calculator", icon: Calculator },
  { href: "/dashboard?tab=analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard?tab=metrics", label: "Metrics", icon: LineChart },
];

export default function ServicesPage() {
  const { dict: pages } = useDashboardPagesDict();
  const d = pages.services;

  return (
    <div className="space-y-8 dashboard-page">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/25 flex items-center justify-center shrink-0">
          <LayoutGrid className="w-5 h-5 text-gold-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{d.title}</h1>
          <p className="text-sm text-neutral-400 mt-1">{d.subtitle}</p>
          <p className="text-sm text-neutral-500 mt-3 max-w-2xl leading-relaxed">{d.intro}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map(({ href, label, icon: Icon }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={href}
              className="flex items-center gap-3 rounded-xl border border-gold-500/15 bg-gradient-to-br from-[#12100a] to-[#0a0a0c] px-4 py-3.5 hover:border-gold-500/35 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-gold-400" />
              </div>
              <span className="text-sm font-medium text-white">{label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
