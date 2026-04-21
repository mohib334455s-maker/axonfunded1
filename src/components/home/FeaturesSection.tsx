"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Wallet, Shield, PieChart, Sparkles, Rocket, BadgePercent, Gift } from "lucide-react";
import { useLandingDict } from "@/hooks/useLandingDict";

export default function FeaturesSection() {
  const { t } = useLandingDict();
  const reduceMotion = useReducedMotion();

  const features = [
    { icon: Wallet, title: t("features.f1t"), description: t("features.f1d"), tone: "gold" as const },
    { icon: Shield, title: t("features.f2t"), description: t("features.f2d"), tone: "silver" as const },
    { icon: PieChart, title: t("features.f3t"), description: t("features.f3d"), tone: "gold" as const },
    { icon: Sparkles, title: t("features.f4t"), description: t("features.f4d"), tone: "silver" as const },
    { icon: Rocket, title: t("features.f5t"), description: t("features.f5d"), tone: "gold" as const },
    { icon: BadgePercent, title: t("features.f6t"), description: t("features.f6d"), tone: "silver" as const },
    { icon: Gift, title: t("features.f7t"), description: t("features.f7d"), tone: "gold" as const },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-white mb-4">
            {t("features.title")}{" "}
            <span className="text-gold-gradient">{t("features.titleBrand")}</span>
          </h2>
          <p className="section-subtitle max-w-lg mx-auto">
            {t("features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={`${feature.title}-${i}`}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.32,
                delay: reduceMotion ? 0 : i * 0.04,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className={`rounded-2xl border border-white/[0.08] bg-elevated p-6 transition-shadow duration-200 hover:border-gold-500/20 hover:shadow-[0_0_20px_rgba(255,215,0,0.05)] ${
                i === 6 ? "lg:col-span-3 lg:max-w-lg lg:mx-auto w-full" : ""
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 border ${
                  feature.tone === "gold"
                    ? "border-amber-400/35 bg-gradient-to-br from-amber-500/20 to-transparent"
                    : "border-slate-400/25 bg-gradient-to-br from-slate-400/15 to-transparent"
                }`}
              >
                <feature.icon
                  className={`w-6 h-6 ${feature.tone === "gold" ? "text-[#E8C866]" : "text-[#C8CCD8]"}`}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
