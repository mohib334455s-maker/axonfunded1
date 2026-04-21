"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-end justify-between gap-4"
    >
      <div className="min-w-0">
        <h1 className="admin-page-title text-[1.65rem] sm:text-3xl leading-tight">{title}</h1>
        {description ? (
          <p className="admin-page-desc text-sm mt-1.5 max-w-2xl leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </motion.div>
  );
}

export function AdminPanel({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`admin-panel ${className}`.trim()}>{children}</div>;
}

export function AdminPanelHeader({
  title,
  aside,
  className = "",
}: {
  title: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-5 py-4 border-b border-[rgba(212,175,55,0.1)] ${className}`.trim()}
    >
      <h2 className="admin-section-title text-sm font-semibold tracking-wide text-[#ebe6dc]">{title}</h2>
      {aside}
    </div>
  );
}
