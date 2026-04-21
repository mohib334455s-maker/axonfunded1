"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Zap } from "lucide-react";
import Link from "next/link";
import { useCommonDict } from "@/hooks/useCommonDict";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useCommonDict();

  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-[#0A0A0A]">
      <div className="text-center max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#FFD700] to-[#DAA520]">
            <Zap className="w-4 h-4 text-black fill-black" />
          </div>
          <span className="font-bold text-gold-500">AXON FUNDED</span>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-danger/10 border border-danger/20"
        >
          <AlertTriangle className="w-10 h-10 text-danger" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-3 text-white">{t("errors.title")}</h1>
        <p className="mb-2 text-neutral-400 text-sm leading-relaxed">{t("errors.description")}</p>
        {error.digest ? (
          <p className="mb-8 font-mono text-xs text-neutral-600">
            {t("errors.errorId")}: {error.digest}
          </p>
        ) : (
          <div className="mb-8" />
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#DAA520] text-black font-semibold text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            {t("errors.tryAgain")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gold-500/30 text-gold-500 font-semibold text-sm hover:bg-white/5 transition-colors"
          >
            <Home className="w-4 h-4" />
            {t("errors.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
