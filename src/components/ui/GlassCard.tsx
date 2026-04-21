"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = false,
  animate = false,
  delay = 0,
  onClick,
}: GlassCardProps) {
  const baseClasses = `glass-card p-6 ${glow ? "glow-gold" : ""} ${onClick ? "cursor-pointer" : ""} ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={
          hover
            ? {
                y: -4,
                transition: { duration: 0.2 },
              }
            : {}
        }
        className={baseClasses}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -4,
              transition: { duration: 0.2 },
            }
          : {}
      }
      className={baseClasses}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
