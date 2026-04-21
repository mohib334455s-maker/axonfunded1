"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/* ─── Types ──────────────────────────────────── */
export type Language = "en" | "fa" | "ar";
export type Direction = "ltr" | "rtl";

export interface ThemeContextValue {
  language: Language;
  direction: Direction;
  isRTL: boolean;
  /** No-op while the site is English-only. */
  setLanguage: (lang: Language) => void;
}

/* ─── Config ─────────────────────────────────── */
const LANG_DIR: Record<Language, Direction> = {
  en: "ltr",
  fa: "rtl",
  ar: "rtl",
};

export const LANG_LABELS: Record<Language, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇬🇧" },
  fa: { name: "فارسی", flag: "🇮🇷" },
  ar: { name: "العربية", flag: "🇸🇦" },
};

const SITE_LANGUAGE: Language = "en";

/* ─── Context ────────────────────────────────── */
const ThemeContext = createContext<ThemeContextValue>({
  language: "en",
  direction: "ltr",
  isRTL: false,
  setLanguage: () => {},
});

/* ─── Provider ───────────────────────────────── */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const language = SITE_LANGUAGE;
  const direction = LANG_DIR[language];
  const isRTL = direction === "rtl";

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = useCallback(() => {
    /* English-only: switching disabled */
  }, []);

  return (
    <ThemeContext.Provider value={{ language, direction, isRTL, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ─── Hooks ──────────────────────────────────── */
export function useTheme() {
  return useContext(ThemeContext);
}
export function useDirection() {
  return useContext(ThemeContext).direction;
}
export function useIsRTL() {
  return useContext(ThemeContext).isRTL;
}
