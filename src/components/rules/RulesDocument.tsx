"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Scale } from "lucide-react";
import Link from "next/link";
import type { AxonRulesSection } from "@/lib/axon-rules-content";
import { getAxonRulesSections } from "@/lib/axon-rules-localized";
import { useTheme } from "@/contexts/ThemeContext";
import { useRulesUiDict } from "@/hooks/useRulesUiDict";

function SectionBody({ section }: { section: AxonRulesSection }) {
  return (
    <div className="space-y-5 text-sm text-neutral-300 leading-relaxed">
      {section.paragraphs?.map((p, idx) => (
        <p key={`${section.id}-p-${idx}`}>{p}</p>
      ))}
      {section.subsections?.map((sub, si) => (
        <div key={`${section.id}-sub-${si}`} className="space-y-3">
          <h3 className="text-sm font-bold text-white border-l-2 border-gold-500/50 pl-3">{sub.title}</h3>
          <div className="space-y-2.5 pl-1">
            {sub.paragraphs.map((p, pi) => (
              <p key={`${section.id}-sub-${si}-p-${pi}`} className="text-neutral-400">
                {p}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RulesDocumentFull() {
  const { language } = useTheme();
  const { dict } = useRulesUiDict();
  const sections = useMemo(() => getAxonRulesSections(language), [language]);

  return (
    <div className="max-w-3xl mx-auto space-y-14 pb-24">
      <p className="text-xs text-neutral-600 text-center -mt-4 mb-8 flex items-center justify-center gap-2">
        <Scale className="w-3.5 h-3.5 text-gold-500/70" />
        {dict.footnote}
      </p>
      {sections.map((section, i) => (
        <motion.section
          key={section.id}
          id={section.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: Math.min(i * 0.03, 0.2) }}
          className="scroll-mt-28"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 pb-3 border-b border-gold-500/15">
            {section.title}
          </h2>
          <SectionBody section={section} />
        </motion.section>
      ))}
    </div>
  );
}

export function RulesDocumentAccordion({ showOfficialLink }: { showOfficialLink?: boolean }) {
  const { language } = useTheme();
  const { dict: rulesUi } = useRulesUiDict();
  const sections = useMemo(() => getAxonRulesSections(language), [language]);
  const [open, setOpen] = useState<string[]>(["intro"]);

  const toggle = (id: string) => {
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-3">
      {showOfficialLink && (
        <p className="text-xs text-neutral-500 mb-4">
          {rulesUi.accordionOfficialBefore}{" "}
          <Link href="/rules" className="text-gold-500 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
            {rulesUi.accordionOfficialLink}
          </Link>
          .
        </p>
      )}
      {sections.map((section, i) => {
        const isOpen = open.includes(section.id);
        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.25) }}
            className="rounded-2xl border border-gold-500/15 bg-gradient-to-br from-[#15120a] to-[#0d0d0f] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(section.id)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-semibold text-white leading-snug">{section.title}</span>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-gold-400 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-0 border-t border-white/5">
                    <SectionBody section={section} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
