"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import GoldButton from "@/components/ui/GoldButton";
import { useLandingDict } from "@/hooks/useLandingDict";

export default function CTASection() {
  const { dict } = useLandingDict();
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative rounded-3xl overflow-hidden border border-gold-500/22 bg-elevated p-12 md:p-20 text-center"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-gradient mb-8 shadow-gold-lg">
              <Zap className="w-8 h-8 text-black fill-black" />
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              {dict.cta.line1}
            </h2>
            <p className="text-xl md:text-2xl font-semibold text-gold-gradient mb-6">
              {dict.cta.line2}
            </p>

            <p className="text-lg text-neutral-400 max-w-xl mx-auto mb-10">
              {dict.cta.body}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GoldButton href="/challenge" size="lg">
                {dict.cta.primary}
                <ArrowRight className="w-5 h-5" />
              </GoldButton>
              <GoldButton href="/rules" variant="outline" size="lg">
                {dict.cta.secondary}
              </GoldButton>
            </div>

            <p className="text-xs text-neutral-600 mt-6">
              {dict.cta.fine}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
