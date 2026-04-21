"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, ShieldCheck, ExternalLink } from "lucide-react";
import type { DashboardCertificate } from "@/lib/server/dashboard-memory";
import { useDashboardPagesDict } from "@/hooks/useDashboardPagesDict";

export default function CertificatesPage() {
  const { dict } = useDashboardPagesDict();
  const d = dict.certificates;
  const [rows, setRows] = useState<DashboardCertificate[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/dashboard/certificates", { credentials: "include", cache: "no-store" });
      if (!res.ok) return;
      const payload = (await res.json()) as { data: DashboardCertificate[] };
      setRows(payload.data || []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">{d.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">{d.subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rows.map((row) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gold-500/20 bg-gradient-to-br from-[#0f0d09] to-[#0b0b0d] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/30">
                <Award className="w-5 h-5 text-gold-400" />
              </div>
              <span className="px-2.5 py-1 rounded-full border border-gold-500/30 bg-gold-500/10 text-[11px] font-semibold text-gold-300">
                {row.type === "funded" ? d.typeFunded : d.typeEval}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-3">
              {row.accountSize} {d.certificateWord}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {d.accountLabel} <span className="text-gold-300 font-mono">{row.accountId}</span>
            </p>
            <p className="text-xs text-neutral-500 mt-2">
              {d.issued} {new Date(row.issuedAt).toLocaleDateString()}
            </p>
            <div className="mt-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <p className="text-[11px] text-neutral-500">{d.verificationId}</p>
              <p className="text-sm text-gold-300 font-mono">{row.verificationId}</p>
            </div>
            <button type="button" className="mt-4 inline-flex items-center gap-1.5 text-xs text-gold-300 hover:text-gold-200">
              {d.verifyBtn}
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/5 bg-surface p-6"
      >
        <h2 className="text-base font-semibold text-white mb-5">{d.securityTitle}</h2>
        <div className="space-y-3">
          {d.securityLines.map((line) => (
            <div key={line} className="flex items-center gap-2 text-sm text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-gold-500" />
              {line}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
