import type { Language } from "@/contexts/ThemeContext";
import { AXON_RULES_SECTIONS, type AxonRulesSection } from "./axon-rules-content";
import faDoc from "@/locales/fa/rules-document.json";
import arDoc from "@/locales/ar/rules-document.json";

export function getAxonRulesSections(lang: Language): AxonRulesSection[] {
  if (lang === "fa") return faDoc as AxonRulesSection[];
  if (lang === "ar") return arDoc as AxonRulesSection[];
  return AXON_RULES_SECTIONS;
}
