"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ClipboardCheck, LineChart, Landmark, ArrowRight } from "lucide-react";
import { useLandingDict } from "@/hooks/useLandingDict";

export default function HowItWorksSection() {
  const { t } = useLandingDict();
  const reduceMotion = useReducedMotion();

  const steps = [
    {
      icon: ClipboardCheck,
      number: "01",
      title: t("howItWorks.s1Title"),
      description: t("howItWorks.s1Desc"),
      iconClass: "text-gold-400",
      ring: "from-gold-500/20 via-transparent to-transparent border-gold-500/20",
    },
    {
      icon: LineChart,
      number: "02",
      title: t("howItWorks.s2Title"),
      description: t("howItWorks.s2Desc"),
      iconClass: "text-gold-300/90",
      ring: "from-gold-500/15 via-transparent to-transparent border-gold-500/18",
    },
    {
      icon: Landmark,
      number: "03",
      title: t("howItWorks.s3Title"),
      description: t("howItWorks.s3Desc"),
      iconClass: "text-neutral-200",
      ring: "from-white/10 via-transparent to-transparent border-white/12",
    },
  ];

  return (
    <section className="pt-16 md:pt-20 pb-24 px-4 sm:px-6 bg-background">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-white mb-4">{t("howItWorks.title")}</h2>
          <p className="section-subtitle max-w-lg mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 relative">
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px border-t border-dashed border-gold-500/15 z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.35,
                delay: reduceMotion ? 0 : i * 0.06,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="relative z-10 text-center"
            >
              <div className="flex flex-col items-center mb-6">
                <div
                  className={`relative w-[72px] h-[72px] rounded-2xl bg-gradient-to-b ${step.ring} border flex items-center justify-center`}
                >
                  <step.icon className={`w-8 h-8 ${step.iconClass}`} strokeWidth={1.5} />
                  <span className="absolute -top-2 -end-2 w-7 h-7 rounded-full bg-gradient-to-br from-[#FFD700] to-[#8A6A00] text-black text-[11px] font-black flex items-center justify-center shadow-[0_0_12px_rgba(255,215,0,0.35)]">
                    {i + 1}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>

              {i < steps.length - 1 && (
                <div className="flex justify-center mt-6 md:hidden">
                  <ArrowRight className="w-6 h-6 text-gold-500/40 rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
