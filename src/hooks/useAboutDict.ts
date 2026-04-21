"use client";

import { useMemo } from "react";
import { useTheme, type Language } from "@/contexts/ThemeContext";
import en from "@/locales/en/about.json";
import fa from "@/locales/fa/about.json";
import ar from "@/locales/ar/about.json";

export type AboutDict = typeof en;

const bundles: Record<Language, AboutDict> = { en, fa, ar };

export function useAboutDict() {
  const { language } = useTheme();
  const dict = useMemo(() => bundles[language] ?? en, [language]);
  return { dict, language };
}
