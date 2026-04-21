"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import OfficialLuxurySpecTable from "@/components/pricing/OfficialLuxurySpecTable";
import { useLandingDict } from "@/hooks/useLandingDict";

export default function SupremePlanAPricing() {
  const { t } = useLandingDict();

  return (
    <section className="bg-black py-16 px-3 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center sm:mb-10"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/25 bg-[#0f0f0f] px-3 py-1.5">
            <Zap className="h-3.5 w-3.5 text-gold-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold-500/90">{t("planAPricing.eyebrow")}</span>
          </div>
          <h2 className="mx-auto mb-3 max-w-5xl text-lg font-black leading-snug tracking-tight text-white sm:text-2xl md:text-3xl">
            {t("planAPricing.title")}
          </h2>
          <p className="mx-auto max-w-4xl text-[10px] font-semibold uppercase leading-relaxed text-gold-500/85 sm:text-xs md:text-sm">
            {t("planAPricing.subtitle")}
          </p>
        </motion.div>

        <div className="mt-10 sm:mt-12">
          <OfficialLuxurySpecTable />
        </div>

        <p className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.22em] text-gold-500/80 sm:text-xs">
          {t("planAPricing.footer")}
        </p>

        <ul className="mx-auto mt-6 max-w-3xl list-none space-y-2 px-2 text-center text-[11px] leading-relaxed text-neutral-500 sm:text-xs">
          <li>{t("planAPricing.note1")}</li>
          <li>{t("planAPricing.note2")}</li>
          <li>{t("planAPricing.note3")}</li>
        </ul>
      </div>
    </section>
  );
}
