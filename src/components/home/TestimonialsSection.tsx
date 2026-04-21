"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star, TrendingUp, MessageSquareText } from "lucide-react";
import { useLandingDict } from "@/hooks/useLandingDict";

type TestimonialItem = {
  name: string;
  role: string;
  quote: string;
  profit: string;
  win: string;
};

export default function TestimonialsSection() {
  const { dict, t } = useLandingDict();
  const testimonials = dict.testimonials.items as TestimonialItem[];
  const [current, setCurrent] = useState(0);
  const reduceMotion = useReducedMotion();

  if (!testimonials.length) {
    return (
      <section className="py-24 px-4 sm:px-6 overflow-hidden bg-background">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title text-white mb-4">
              {dict.testimonials.title}
            </h2>
            <p className="section-subtitle mb-8">
              {dict.testimonials.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="rounded-2xl border border-dashed border-white/10 bg-elevated px-8 py-16 text-center"
          >
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/10 text-gold-500 mb-6">
              <MessageSquareText className="w-7 h-7" />
            </div>
            <p className="text-lg font-semibold text-white mb-2">{t("testimonials.emptyTitle")}</p>
            <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
              {t("testimonials.emptyBody")}
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  const prev = () =>
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const cur = testimonials[current];

  return (
    <section className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-white mb-4">
            {dict.testimonials.title}
          </h2>
          <p className="section-subtitle">
            {dict.testimonials.subtitle}
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={reduceMotion ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="rounded-2xl border border-white/[0.08] bg-elevated p-8 md:p-12 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.65)]"
            >
              <div>
                <Quote className="w-10 h-10 text-gold-500/30 mb-6" />
              </div>

              <p className="text-lg md:text-xl text-neutral-200 leading-relaxed mb-8">
                &ldquo;{cur.quote}&rdquo;
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700]/90 to-[#8A6A00] flex items-center justify-center text-black font-bold text-lg">
                    {cur.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {cur.name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {cur.role}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="font-mono font-bold text-success">
                        {cur.profit}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{dict.testimonials.profitLbl}</p>
                  </div>
                  <div className="text-center">
                    <span className="font-mono font-bold text-gold-500">
                      {cur.win}
                    </span>
                    <p className="text-xs text-neutral-500 mt-1">{dict.testimonials.winLbl}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={prev}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-gold-500/40 transition-all"
            >
              <ChevronLeft className="w-4.5 h-4.5 rtl:rotate-180" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-8 bg-gold-500" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-gold-500/40 transition-all"
            >
              <ChevronRight className="w-4.5 h-4.5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
