"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GoldButton from "@/components/ui/GoldButton";
import HomeSequentialCoins from "@/components/page-ambient/HomeSequentialCoins";
import { useLandingDict } from "@/hooks/useLandingDict";

export default function HeroSection() {
  const { t } = useLandingDict();
  const reduceMotion = useReducedMotion();

  const containerVariants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: reduceMotion ? 0 : 0.11,
          delayChildren: reduceMotion ? 0 : 0.06,
        },
      },
    }),
    [reduceMotion]
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 22 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] as const },
      },
    }),
    [reduceMotion]
  );

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-x-clip overflow-y-visible pt-20 bg-background">
      <div className="absolute inset-0 bg-background" aria-hidden />
      <HomeSequentialCoins />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.45 }}
        className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10"
      >
        <div className="flex min-h-[80vh] flex-col items-center justify-center lg:items-start">
          <motion.div
            className="w-full max-w-3xl space-y-6 text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/30 glass-card">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
              <span className="text-sm font-medium text-gold-500">{t("hero.badge")}</span>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3">
              <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.12]">
                <span className="block text-white/90 text-lg sm:text-xl font-semibold tracking-wide mb-3">
                  {t("hero.brandLine")}
                </span>
                <span className="block text-gold-gradient text-[1.65rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-balance max-w-4xl mx-auto lg:mx-0">
                  {t("hero.slogan")}
                </span>
              </motion.h1>
              {!reduceMotion && (
                <motion.div
                  className="mx-auto lg:mx-0 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-amber-400/70 to-transparent"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </motion.div>

            <motion.p variants={itemVariants} className="text-base md:text-lg lg:text-xl text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t("hero.subtitleBefore")}{" "}
              <span className="text-white font-semibold">{t("hero.subtitleHighlight")}</span>
              {t("hero.subtitleAfter")}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center lg:items-start lg:justify-start gap-4">
              <GoldButton href="/challenge" size="lg">
                {t("hero.ctaStart")}
                <ArrowRight className="w-5 h-5" />
              </GoldButton>
              <GoldButton href="/rules" variant="outline" size="lg">
                {t("hero.ctaRules")}
              </GoldButton>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <div className="w-6 h-10 rounded-full border-2 border-white/15 flex items-start justify-center pt-2">
          <div className="w-1 h-2.5 rounded-full bg-gold-500/50" />
        </div>
      </div>
    </section>
  );
}
