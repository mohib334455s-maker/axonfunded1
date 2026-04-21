"use client";

import { useMemo } from "react";
import { useTheme, type Language } from "@/contexts/ThemeContext";
import en from "@/locales/en/profile-ui.json";
import fa from "@/locales/fa/profile-ui.json";
import ar from "@/locales/ar/profile-ui.json";

export type ProfileUIDict = typeof en;

const bundles: Record<Language, ProfileUIDict> = { en, fa, ar };

export function useProfileUIDict() {
  const { language } = useTheme();
  return useMemo(() => bundles[language] ?? en, [language]);
}
