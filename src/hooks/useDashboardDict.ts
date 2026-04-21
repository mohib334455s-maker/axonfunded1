"use client";

import { useCallback, useMemo } from "react";
import { useTheme, type Language } from "@/contexts/ThemeContext";
import en from "@/locales/en/dashboard.json";
import fa from "@/locales/fa/dashboard.json";
import ar from "@/locales/ar/dashboard.json";

export type DashboardDict = typeof en;

const bundles: Record<Language, DashboardDict> = { en, fa, ar };

function getAt(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((cur, key) => {
    if (cur == null || typeof cur !== "object") return undefined;
    return (cur as Record<string, unknown>)[key];
  }, obj);
}

export function useDashboardDict() {
  const { language } = useTheme();
  const dict = useMemo(() => bundles[language] ?? en, [language]);

  const t = useCallback(
    (path: string) => {
      const v = getAt(dict as unknown, path);
      return typeof v === "string" ? v : path;
    },
    [dict]
  );

  return { t, dict, language };
}
