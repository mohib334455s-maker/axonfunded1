"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLandingDict } from "@/hooks/useLandingDict";

export default function FAQSection() {
  const { dict } = useLandingDict();
  const items = dict.faq.items;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-3xl mx-auto w-full">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-white mb-4">
            {dict.faq.title}
          </h2>
          <p className="section-subtitle">
            {dict.faq.subtitle}
          </p>
        </motion.div>

        <div className="space-y-3">
          {items.map((faq, i) => (
            <motion.div
              key={i}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{
                duration: 0.28,
                delay: reduceMotion ? 0 : Math.min(i * 0.02, 0.12),
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-elevated ${
                openIndex === i
                  ? "border-gold-500/30 bg-gold-500/[0.04]"
                  : "border-white/8 hover:border-white/12"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-start"
              >
                <span
                  className={`font-medium text-sm md:text-base pe-4 ${
                    openIndex === i ? "text-gold-500" : "text-white"
                  }`}
                >
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown
                    className={`w-5 h-5 ${
                      openIndex === i ? "text-gold-500" : "text-neutral-500"
                    }`}
                  />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-6 pb-5 text-sm text-neutral-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
