"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

interface GoldButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "gold" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

export default function GoldButton({
  children,
  href,
  onClick,
  variant = "gold",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  fullWidth = false,
}: GoldButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variantClasses = {
    gold: "btn-gold",
    outline: "btn-outline",
    ghost: "text-gold-500 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 font-medium",
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 min-h-[44px] ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`;

  const content = (
    <motion.span
      whileTap={disabled ? {} : { scale: 0.97 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      className={baseClasses}
      onClick={!href ? onClick : undefined}
    >
      {children}
    </motion.span>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className="inline-block">
      {content}
    </button>
  );
}
